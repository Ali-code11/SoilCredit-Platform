import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { getCurrentServerUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const user = await getCurrentServerUser();
  if (!user) redirect('/login?returnTo=%2Fadmin%2Fnews');
  if (user.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
        <section role="alert" className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Access denied</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">Administrator access required</h1>
          <p className="mt-4 leading-7 text-slate-600">
            You are signed in, but this account does not have the administrator role required to access news management.
            Ask your SoilCredit system operator to review your access.
          </p>
          <Link href="/dashboard" className="mt-7 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
            Return to your dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/admin/news" className="flex items-center gap-2 font-display font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-800 to-blue-600">
              <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
            <span>SoilCredit <span className="text-blue-700">Admin</span></span>
          </Link>
          <nav aria-label="Admin navigation" className="flex items-center gap-2 sm:gap-4">
            <Link href="/admin/news" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800">
              News
            </Link>
            <Link href="/admin/newsletter" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800">
              Newsletter
            </Link>
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              Public site
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
