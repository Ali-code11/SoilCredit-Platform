'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/lib/providers';

const emptyArticle = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImageUrl: '',
  status: 'draft',
};

function makeSlug(title) {
  return title.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ArticleEditor({ articleId }) {
  const { apiFetch } = useAuth();
  const router = useRouter();
  const [article, setArticle] = useState(emptyArticle);
  const [slugTouched, setSlugTouched] = useState(Boolean(articleId));
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!articleId) return;
    let active = true;
    apiFetch(`/api/admin/news/${encodeURIComponent(articleId)}`)
      .then((response) => {
        if (!response.ok) throw new Error(response.error || 'Could not load this article.');
        if (active) {
          const { title, slug, summary, content, coverImageUrl, status } = response.article;
          setArticle({ title, slug, summary, content, coverImageUrl, status });
        }
      })
      .catch((loadError) => { if (active) setError(loadError.message || 'Could not load this article.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [apiFetch, articleId]);

  const updateField = (field, value) => {
    setArticle((current) => ({
      ...current,
      [field]: value,
      ...(field === 'title' && !slugTouched ? { slug: makeSlug(value) } : {}),
    }));
  };

  const saveArticle = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const response = await apiFetch(articleId ? `/api/admin/news/${encodeURIComponent(articleId)}` : '/api/admin/news', {
        method: articleId ? 'PUT' : 'POST',
        body: JSON.stringify(article),
      });
      if (!response.ok) throw new Error(response.error || 'Article could not be saved.');
      router.push('/admin/news');
      router.refresh();
    } catch (saveError) {
      setError(saveError.message || 'Article could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50"><Loader2 className="h-7 w-7 animate-spin text-blue-700" /></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Link href="/admin/news" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to news</Link>
        <div className="mb-7 mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">News management</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">{articleId ? 'Edit article' : 'Create article'}</h1>
          </div>
          {articleId ? <Link href={`/admin/news/${encodeURIComponent(articleId)}/preview`} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><Eye className="h-4 w-4" /> Preview</Link> : null}
        </div>

        {error ? <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

        <form onSubmit={saveArticle} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div>
            <label htmlFor="article-title" className="mb-2 block text-sm font-semibold text-slate-800">Title</label>
            <input id="article-title" required maxLength={160} value={article.title} onChange={(event) => updateField('title', event.target.value)} className="field" />
          </div>
          <div>
            <label htmlFor="article-slug" className="mb-2 block text-sm font-semibold text-slate-800">Slug</label>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-slate-400 sm:block">/news/</span>
              <input id="article-slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={180} value={article.slug} onChange={(event) => { setSlugTouched(true); updateField('slug', event.target.value.toLowerCase()); }} className="field" />
            </div>
            <p className="mt-1 text-xs text-slate-500">Use lowercase letters, numbers, and hyphens.</p>
          </div>
          <div>
            <label htmlFor="article-summary" className="mb-2 block text-sm font-semibold text-slate-800">Summary</label>
            <textarea id="article-summary" required maxLength={500} rows={3} value={article.summary} onChange={(event) => updateField('summary', event.target.value)} className="field resize-y" />
            <p className="mt-1 text-right text-xs text-slate-500">{article.summary.length}/500</p>
          </div>
          <div>
            <label htmlFor="article-content" className="mb-2 block text-sm font-semibold text-slate-800">Full content</label>
            <textarea id="article-content" required maxLength={50000} rows={16} value={article.content} onChange={(event) => updateField('content', event.target.value)} className="field resize-y leading-7" />
            <p className="mt-1 text-xs text-slate-500">Plain text is supported; line breaks are preserved.</p>
          </div>
          <div>
            <label htmlFor="article-cover" className="mb-2 block text-sm font-semibold text-slate-800">Cover image URL</label>
            <input id="article-cover" type="url" placeholder="https://example.com/image.jpg" value={article.coverImageUrl} onChange={(event) => updateField('coverImageUrl', event.target.value)} className="field" />
          </div>
          <div>
            <label htmlFor="article-status" className="mb-2 block text-sm font-semibold text-slate-800">Publication status</label>
            <select id="article-status" value={article.status} onChange={(event) => updateField('status', event.target.value)} className="field">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            <Link href="/admin/news" className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save article'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
