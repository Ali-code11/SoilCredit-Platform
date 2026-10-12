'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, Eye, FilePlus2, Loader2, Pencil, Send, Trash2, Undo2 } from 'lucide-react';
import { useAuth } from '@/lib/providers';
import Navbar from '@/components/soilcredit/Navbar';

const statusStyles = {
  draft: 'bg-amber-50 text-amber-800',
  published: 'bg-emerald-50 text-emerald-800',
  unpublished: 'bg-slate-100 text-slate-700',
};

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

export default function AdminNewsDashboard() {
  const { apiFetch, loading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch('/api/admin/news');
      if (!response.ok) throw new Error(response.error || 'Could not load articles.');
      setArticles(response.articles);
    } catch (loadError) {
      setError(loadError.message || 'Could not load articles.');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (!authLoading) loadArticles();
  }, [authLoading, loadArticles]);

  const runAction = async (article, action) => {
    setError('');
    setBusyId(article.id);
    try {
      if (action === 'delete' && !window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
      const method = action === 'delete' ? 'DELETE' : 'POST';
      const response = await apiFetch(`/api/admin/news/${encodeURIComponent(article.id)}${action === 'delete' ? '' : `/${action}`}`, { method });
      if (!response.ok) throw new Error(response.error || 'The article could not be updated.');
      await loadArticles();
    } catch (actionError) {
      setError(actionError.message || 'The article could not be updated.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Admin dashboard</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">News</h1>
            <p className="mt-2 text-sm text-slate-600">Create and manage articles published on SoilCredit.</p>
          </div>
          <Link href="/admin/news/new" className="btn-primary inline-flex w-fit items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold">
            <FilePlus2 className="h-4 w-4" /> New article
          </Link>
        </div>

        {error ? <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">All articles <span className="ml-1 text-slate-400">({articles.length})</span></h2>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-blue-700" aria-label="Loading articles" /> : null}
          </div>
          {loading && !articles.length ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-700" /></div>
          ) : articles.length ? (
            <div className="divide-y divide-slate-100">
              {articles.map((article) => (
                <div key={article.id} className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-slate-900">{article.title}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[article.status] || statusStyles.draft}`}>{article.status}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-slate-500">{article.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>/{article.slug}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Updated {formatDate(article.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link href={`/admin/news/${encodeURIComponent(article.id)}/preview`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Link>
                    <Link href={`/admin/news/${encodeURIComponent(article.id)}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                    {article.status === 'published' ? (
                      <button type="button" disabled={busyId === article.id} onClick={() => runAction(article, 'unpublish')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50">
                        <Undo2 className="h-3.5 w-3.5" /> Unpublish
                      </button>
                    ) : (
                      <button type="button" disabled={busyId === article.id} onClick={() => runAction(article, 'publish')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                        <Send className="h-3.5 w-3.5" /> Publish
                      </button>
                    )}
                    <button type="button" disabled={busyId === article.id} onClick={() => runAction(article, 'delete')} aria-label={`Delete ${article.title}`} className="inline-flex items-center justify-center rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                      {busyId === article.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-16 text-center">
              <p className="font-medium text-slate-800">No articles yet</p>
              <p className="mt-1 text-sm text-slate-500">Create a first draft to start building the news section.</p>
              <button type="button" onClick={() => router.push('/admin/news/new')} className="mt-4 font-semibold text-blue-700 hover:text-blue-900">Create an article</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
