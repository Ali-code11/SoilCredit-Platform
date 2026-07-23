'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { T, tr } from '@/lib/i18n';

const LangCtx = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });
export function useLang() { return useContext(LangCtx); }

const AuthCtx = createContext({ user: null, token: null, loading: true });
export function useAuth() { return useContext(AuthCtx); }

export function Providers({ children }) {
  const [lang, setLangState] = useState('en');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const l = typeof window !== 'undefined' ? localStorage.getItem('sc_lang') : null;
    if (l && T[l]) setLangState(l);
    const t = typeof window !== 'undefined' ? localStorage.getItem('sc_token') : null;
    if (t) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json()).then(d => { if (d.ok) { setUser(d.user); setToken(t); } else { localStorage.removeItem('sc_token'); } })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const setLang = useCallback((l) => { setLangState(l); if (typeof window !== 'undefined') localStorage.setItem('sc_lang', l); }, []);
  const t = useCallback((path) => tr(lang, path), [lang]);

  const login = useCallback((tok, u) => {
    setToken(tok); setUser(u);
    if (typeof window !== 'undefined') localStorage.setItem('sc_token', tok);
  }, []);
  const logout = useCallback(async () => {
    if (token) { try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {} }
    setToken(null); setUser(null);
    if (typeof window !== 'undefined') localStorage.removeItem('sc_token');
  }, [token]);

  const apiFetch = useCallback(async (url, opts = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const r = await fetch(url, { ...opts, headers });
    return r.json();
  }, [token]);

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <AuthCtx.Provider value={{ user, token, loading, login, logout, setUser, apiFetch }}>
        {children}
      </AuthCtx.Provider>
    </LangCtx.Provider>
  );
}
