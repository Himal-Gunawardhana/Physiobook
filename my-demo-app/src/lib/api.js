/**
 * Physiobook API Client
 * Centralized fetch wrapper that talks to the live Render backend.
 * - Refresh token lives in HttpOnly cookie (set by backend automatically)
 * - Access token stored in memory (not localStorage — more secure)
 * - Auto-retries on 401 using the HttpOnly refresh cookie
 */

// In production Vercel proxy forwards /api/* to Render, so relative paths work.
// In dev Vite proxy does the same thing.
const BASE = '/api/v1';

// ── In-memory token store ─────────────────────────────────────────────────
let _accessToken = null;

export const tokenStore = {
  get:   ()      => _accessToken,
  set:   (t)     => { _accessToken = t; },
  clear: ()      => { _accessToken = null; },
};

// ── Core fetch ────────────────────────────────────────────────────────────
const TIMEOUT_MS = 12000; // 12 s — enough for Render cold-start
const REFRESH_TIMEOUT_MS = 8000; // Shorter timeout for refresh endpoint

async function apiFetch(endpoint, options = {}, retry = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = tokenStore.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Abort after TIMEOUT_MS so pages never hang indefinitely
  const timeoutDuration = endpoint.includes('refresh') ? REFRESH_TIMEOUT_MS : TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutDuration);

  let res;
  try {
    console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
    res = await fetch(`${BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    console.error(`[API] Fetch error on ${endpoint}:`, err.message);
    if (err.name === 'AbortError') {
      throw { success: false, error: 'TIMEOUT', message: 'Request timed out. The server may be waking up — please try again.' };
    }
    throw err;
  }
  clearTimeout(timer);

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    console.log('[API] Got 401, attempting refresh...');
    let refreshRes;
    try {
      const refreshController = new AbortController();
      const refreshTimer = setTimeout(() => refreshController.abort(), REFRESH_TIMEOUT_MS);
      
      refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        signal:      refreshController.signal,
      });
      
      clearTimeout(refreshTimer);
    } catch (refreshErr) {
      console.error('[API] Refresh fetch failed:', refreshErr.message);
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:logout'));
      throw { success: false, error: 'SESSION_EXPIRED', message: 'Session expired. Please log in again.' };
    }

    if (refreshRes.ok) {
      const json = await refreshRes.json();
      // Backend returns { success:true, data: { accessToken } }
      const newToken = json.data?.accessToken || json.accessToken;
      if (newToken) {
        console.log('[API] Token refreshed, retrying original request');
        tokenStore.set(newToken);
        return apiFetch(endpoint, options, false); // retry once
      } else {
        console.error('[API] No token in refresh response:', json);
        tokenStore.clear();
        window.dispatchEvent(new Event('auth:logout'));
        throw { success: false, error: 'SESSION_EXPIRED', message: 'Session expired. Please log in again.' };
      }
    } else {
      console.error(`[API] Refresh failed with status ${refreshRes.status}`);
      // Refresh failed — force logout
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:logout'));
      throw { success: false, error: 'SESSION_EXPIRED', message: 'Session expired. Please log in again.' };
    }
  }

  const json = await res.json();
  if (!res.ok) {
    console.error(`[API] ${endpoint} returned ${res.status}:`, json);
    // Throw the backend error object so callers can inspect it
    // Enhance error with a message property for easier access
    const error = json.error || json;
    const message = error?.message || json?.message || `Request failed with status ${res.status}`;
    throw { ...json, message };
  }

  // Backend wraps all success in { success:true, data: ... }
  console.log(`[API] ${endpoint} success`);
  return json.data ?? json;
}

// ── Convenience methods ───────────────────────────────────────────────────
export const api = {
  get:    (url)         => apiFetch(url,  { method: 'GET' }),
  post:   (url, body)   => apiFetch(url,  { method: 'POST',   body: JSON.stringify(body) }),
  put:    (url, body)   => apiFetch(url,  { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (url, body)   => apiFetch(url,  { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (url)         => apiFetch(url,  { method: 'DELETE' }),
};

export default api;
