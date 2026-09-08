'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Leaf, Loader2, MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get('email') || '');
  }, []);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const verify = async (event) => {
    event.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      const data = await response.json();
      if (!data.ok) setError(data.error || 'Verification failed');
      else { setVerified(true); setMessage('Email verified successfully. You can now sign in.'); }
    } catch { setError('Unable to reach the server. Please try again.'); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    if (cooldown || !email) return;
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/auth/resend-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!data.ok) setError(data.error || 'Unable to resend the code');
      else { setMessage(data.message); setCooldown(60); setCode(''); }
    } catch { setError('Unable to reach the server. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen hero-bg flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-7">
        <div className="flex items-center gap-2 mb-8"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center"><Leaf className="h-5 w-5 text-white" /></div><span className="font-display font-bold text-xl text-gradient-blue">SoilCredit</span></div>
        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4"><MailCheck className="h-6 w-6" /></div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Check your email</h1>
        <p className="text-sm text-slate-500 mt-2">We sent a 6-digit verification code to <strong className="text-slate-700 break-all">{email || 'your email address'}</strong>.</p>
        <form onSubmit={verify} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">Verification code
            <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required className="field mt-2 text-center text-2xl tracking-[0.55em]" placeholder="000000" />
          </label>
          {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</div>}
          {message && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{message}</div>}
          <button type="submit" disabled={loading || verified} className="w-full btn-primary rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Verify email</button>
        </form>
        <div className="mt-5 text-center text-sm text-slate-500">Didn't receive the code? <button type="button" onClick={resend} disabled={loading || cooldown > 0 || !email || verified} className="font-semibold text-blue-600 disabled:text-slate-400">{cooldown ? `Resend in ${cooldown}s` : 'Resend code'}</button></div>
        {verified && <a href="/" className="block text-center text-sm font-semibold text-blue-600 mt-5">Return to SoilCredit</a>}
      </section>
    </main>
  );
}