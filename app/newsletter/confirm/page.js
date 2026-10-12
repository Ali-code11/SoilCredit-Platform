'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

function ConfirmNewsletterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('');

  const confirm = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/newsletter/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Subscription could not be confirmed.');
      setStatus('success');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Subscription could not be confirmed.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {status === 'loading' ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-slate-900">Confirm your subscription</h1>
        {message ? <p role={status === 'error' ? 'alert' : 'status'} className={`mt-4 text-sm ${status === 'error' ? 'text-rose-700' : 'text-slate-600'}`}>{message}</p> : (
          <p className="mt-4 text-sm text-slate-600">Confirm your email address to receive SoilCredit news and updates.</p>
        )}
        {!token ? <p role="alert" className="mt-4 text-sm text-rose-700">This confirmation link is missing or invalid.</p> : null}
        {status === 'ready' && token ? (
          <button type="button" onClick={confirm} className="btn-primary mt-7 rounded-xl px-5 py-3 text-sm font-semibold">Confirm subscription</button>
        ) : null}
        {status === 'success' ? <Link href="/" className="btn-primary mt-7 inline-flex rounded-xl px-5 py-3 text-sm font-semibold">Return to SoilCredit</Link> : null}
      </section>
    </main>
  );
}

export default function ConfirmNewsletterPage() {
  return <Suspense fallback={<main className="min-h-screen bg-slate-50" />}><ConfirmNewsletterContent /></Suspense>;
}
