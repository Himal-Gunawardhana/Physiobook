import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { tokenStore } from '../lib/api';

const AuthContext = createContext(null);

// Role → dashboard route mapping (matches backend role enum exactly)
export const ROLE_ROUTES = {
  super_admin:  '/superadmin',
  clinic_admin: '/clinic',
  therapist:    '/therapist',
  patient:      '/book',
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true until we check session

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Try to get a new access token using the HttpOnly refresh cookie
        const refreshRes = await fetch('/api/v1/auth/refresh', {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
        });

        if (!refreshRes.ok) throw new Error('no session');
        const json = await refreshRes.json();
        const token = json.data?.accessToken;
        if (token) tokenStore.set(token);

        // Fetch user profile
        const userData = await api.get('/users/me');
        if (!cancelled) setUser(userData);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Listen for forced logout events ─────────────────────────────────────
  useEffect(() => {
    const handler = () => { setUser(null); tokenStore.clear(); };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  // ── Auth actions ─────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    // Backend sets HttpOnly refresh cookie automatically
    if (data.accessToken) tokenStore.set(data.accessToken);
    if (data.user) setUser(data.user);
    return data; // may include { requiresTwoFa, partialToken }
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.post('/auth/register', payload);
    if (data.accessToken) tokenStore.set(data.accessToken);
    if (data.user) setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    tokenStore.clear();
    setUser(null);
  }, []);

  const verify2fa = useCallback(async (partialToken, code) => {
    const data = await api.post('/auth/2fa/verify', { partialToken, code });
    if (data.accessToken) tokenStore.set(data.accessToken);
    if (data.user) setUser(data.user);
    return data;
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await api.get('/users/me');
    setUser(data);
    return data;
  }, []);

  const dashboardRoute = ROLE_ROUTES[user?.role] ?? '/';

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, verify2fa, refreshUser, dashboardRoute,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
