import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { tokenStore } from '../lib/api';
import cacheManager from '../lib/cache';

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
    let retryCount = 0;
    const maxRetries = 2;

    const attemptSessionRestore = async () => {
      try {
        console.log('[Auth] Attempting to restore session...');
        
        // Try to get a new access token using the HttpOnly refresh cookie
        const refreshRes = await fetch('/api/v1/auth/refresh', {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          timeout:     8000,
        });

        if (!refreshRes.ok) {
          console.log(`[Auth] Refresh failed with status ${refreshRes.status}`);
          throw new Error(`refresh_failed_${refreshRes.status}`);
        }

        const json = await refreshRes.json();
        const token = json.data?.accessToken || json.accessToken;
        
        if (!token) {
          console.log('[Auth] No token in refresh response');
          throw new Error('no_token_in_response');
        }

        console.log('[Auth] Token refreshed successfully');
        tokenStore.set(token);

        // Fetch user profile
        console.log('[Auth] Fetching user profile...');
        const userData = await api.get('/users/me');
        
        if (!cancelled) {
          console.log('[Auth] User restored successfully:', userData?.email);
          setUser(userData);
          setLoading(false); // Success - stop loading
        }
      } catch (err) {
        console.error('[Auth] Session restore error:', err.message);
        
        // Retry up to maxRetries times with exponential backoff
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 500; // 1s, 2s
          console.log(`[Auth] Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
          
          if (!cancelled) {
            setTimeout(attemptSessionRestore, delay);
            return; // Don't set loading to false yet
          }
        } else {
          // All retries exhausted - give up
          if (!cancelled) {
            console.log('[Auth] Session restore failed after all retries');
            setUser(null);
            setLoading(false); // Stop loading - user is logged out
          }
        }
      }
    };

    attemptSessionRestore();
    
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
    console.log('Login response:', data);
    // Backend sets HttpOnly refresh cookie automatically
    if (data.accessToken) tokenStore.set(data.accessToken);
    if (data.user) {
      console.log('Setting user:', data.user);
      setUser(data.user);
    }
    return data; // may include { requiresTwoFa, partialToken }
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.post('/auth/register', payload);
    console.log('Register response data:', data);
    // DO NOT store token or set user after registration
    // User must verify email and login separately to access the app
    // Token and user will be set only after successful login
    // Return full response so component can access user.role and isEmailVerified
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    tokenStore.clear();
    cacheManager.clearSessionData();
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
