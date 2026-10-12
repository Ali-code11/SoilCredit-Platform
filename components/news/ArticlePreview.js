'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/providers';
import Navbar from '@/components/soilcredit/Navbar';

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value));
}

export default function ArticlePreview({ articleId }) {
  const { apiFetch } = useAuth();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch(`/api/admin/news/${encodeURIComponent(articleId)}`)
      .then((response) => {
        if (!response.ok) throw new Error(response.error || 'Could not load this article.');
        if (active) setArticle(response.article);
      })
      .catch((loadError) => { if (active) setError(loadError.message || 'Could not load this article.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [apiFetch, articleId]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <Link href={`/admin/news/${encodeURIComponent(articleId)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to editor</Link>
        {loading ? <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-blue-700" /></div> : null}
        {error ? <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
        {article ? (
          <article className="mt-8">
            <div className="mb-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-800">{article.status} preview</div>
            <header>
              <time className="text-sm text-slate-500" dateTime={article.publishedAt || undefined}>{formatDate(article.publishedAt)}</time>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{article.title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{article.summary}</p>
            </header>
            {article.coverImageUrl ? <img src={article.coverImageUrl} alt={article.title} className="mt-9 max-h-[520px] w-full rounded-3xl object-cover" /> : null}
            <div className="mt-9 whitespace-pre-wrap break-words text-base leading-8 text-slate-700">{article.content}</div>
          </article>
        ) : null}
      </main>
    </div>
  );
}
