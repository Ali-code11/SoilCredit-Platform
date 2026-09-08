'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { T, tr } from '@/lib/i18n';

const LangCtx = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });
export function useLang() { return useContext(LangCtx); }

const AuthCtx = createContext({ user: null, token: null, loading: true });
export function useAuth() { return useContext(AuthCtx); }

function readStorage(key) {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {}
}

function removeStorage(key) {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  } catch {}
}

export function Providers({ children }) {
  const [lang, setLangState] = useState('en');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const l = readStorage('sc_lang');
    if (l && T[l]) setLangState(l);
    const t = readStorage('sc_token');
    if (t) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json()).then(d => { if (d.ok) { setUser(d.user); setToken(t); } else removeStorage('sc_token'); })
        .catch(() => removeStorage('sc_token'))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const setLang = useCallback((l) => { setLangState(l); writeStorage('sc_lang', l); }, []);
  const t = useCallback((path) => tr(lang, path), [lang]);

  const login = useCallback((tok, u) => {
    setToken(tok); setUser(u);
    writeStorage('sc_token', tok);
  }, []);
  const logout = useCallback(async () => {
    if (token) { try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {} }
    setToken(null); setUser(null);
    removeStorage('sc_token');
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
