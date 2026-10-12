'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, MailX } from 'lucide-react';

function UnsubscribeNewsletterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('');

  const unsubscribe = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Unsubscribe request could not be completed.');
      setStatus('success');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Unsubscribe request could not be completed.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {status === 'loading' ? <Loader2 className="h-6 w-6 animate-spin" /> : <MailX className="h-6 w-6" />}
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-slate-900">Newsletter preferences</h1>
        {message ? <p role={status === 'error' ? 'alert' : 'status'} className={`mt-4 text-sm ${status === 'error' ? 'text-rose-700' : 'text-slate-600'}`}>{message}</p> : (
          <p className="mt-4 text-sm text-slate-600">Confirm that you want to stop receiving SoilCredit newsletter emails.</p>
        )}
        {!token ? <p role="alert" className="mt-4 text-sm text-rose-700">This unsubscribe link is missing or invalid.</p> : null}
        {status === 'ready' && token ? (
          <button type="button" onClick={unsubscribe} className="mt-7 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Unsubscribe</button>
        ) : null}
        {status === 'success' ? <Link href="/" className="mt-7 inline-flex text-sm font-semibold text-blue-700">Return to SoilCredit</Link> : null}
      </section>
    </main>
  );
}

export default function UnsubscribeNewsletterPage() {
  return <Suspense fallback={<main className="min-h-screen bg-slate-50" />}><UnsubscribeNewsletterContent /></Suspense>;
}
