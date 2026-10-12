'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/soilcredit/AuthModal';
import { getSafeReturnPath } from '@/lib/auth-redirect.mjs';
import { useAuth } from '@/lib/providers';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [returnTo, setReturnTo] = useState('/dashboard');

  useEffect(() => {
    setReturnTo(getSafeReturnPath(new URLSearchParams(window.location.search).get('returnTo')));
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace(returnTo);
  }, [loading, returnTo, router, user]);

  if (loading || user) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-7 w-7 animate-spin text-blue-700" /></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 pt-20 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">Sign in to SoilCredit</h1>
        <p className="mt-2 text-sm text-slate-600">Use your verified account to continue.</p>
      </div>
      <AuthModal
        open
        mode="login"
        allowSignup={false}
        onClose={() => router.replace('/')}
      />
    </main>
  );
}
