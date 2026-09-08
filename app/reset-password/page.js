'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Leaf, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (!token) return setError('This reset link is missing or invalid.');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!data.ok) setError(data.error || 'Password reset failed');
      else setDone(true);
    } catch { setError('Unable to reach the server. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen hero-bg flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-7">
        <div className="flex items-center gap-2 mb-8"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center"><Leaf className="h-5 w-5 text-white" /></div><span className="font-display font-bold text-xl text-gradient-blue">SoilCredit</span></div>
        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><KeyRound className="h-6 w-6" /></div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Reset your password</h1>
        {done ? <><p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mt-5">Your password has been reset. You can now sign in with your new password.</p><a href="/" className="block text-center text-sm font-semibold text-blue-600 mt-5">Return to SoilCredit</a></> : <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required className="field mt-2" autoComplete="new-password" /></label>
          <label className="block text-sm font-medium text-slate-700">Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required className="field mt-2" autoComplete="new-password" /></label>
          {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</div>}
          <button type="submit" disabled={loading} className="w-full btn-primary rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Reset password</button>
        </form>}
      </section>
    </main>
  );
}