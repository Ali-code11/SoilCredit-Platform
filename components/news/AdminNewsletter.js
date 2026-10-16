'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, Loader2, Mail, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '@/lib/providers';

const initialOverview = {
  subscribers: { active: 0, pending: 0, unsubscribed: 0, total: 0 },
  campaigns: [],
};

const campaignStatusStyles = {
  snapshotting: 'bg-blue-50 text-blue-800',
  queued: 'bg-amber-50 text-amber-800',
  processing: 'bg-blue-50 text-blue-800',
  sent: 'bg-emerald-50 text-emerald-800',
  partially_failed: 'bg-orange-50 text-orange-800',
  failed: 'bg-rose-50 text-rose-800',
};

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function AdminNewsletter() {
  const { apiFetch, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [overview, setOverview] = useState(initialOverview);
  const [articles, setArticles] = useState([]);
  const [articleId, setArticleId] = useState('');
  const [preview, setPreview] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewResponse, articleResponse] = await Promise.all([
        apiFetch('/api/admin/newsletter'),
        apiFetch('/api/admin/news'),
      ]);
      if (!overviewResponse.ok) throw new Error(overviewResponse.error || 'Could not load newsletter management.');
      if (!articleResponse.ok) throw new Error(articleResponse.error || 'Could not load articles.');
      setOverview({
        subscribers: overviewResponse.subscribers,
        campaigns: overviewResponse.campaigns,
      });
      setArticles(articleResponse.articles.filter((article) => article.status === 'published'));
      const requestedArticleId = searchParams.get('articleId') || '';
      if (requestedArticleId) setArticleId(requestedArticleId);
      else if (!articleId && articleResponse.articles.some((article) => article.status === 'published')) {
        setArticleId(articleResponse.articles.find((article) => article.status === 'published').id);
      }
    } catch (loadError) {
      setError(loadError.message || 'Could not load newsletter management.');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, articleId, searchParams]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const loadPreview = async () => {
    if (!articleId) return;
    setBusy('preview');
    setError('');
    setNotice('');
    try {
      const response = await apiFetch(`/api/admin/newsletter/preview?articleId=${encodeURIComponent(articleId)}`);
      if (!response.ok) throw new Error(response.error || 'Could not build the newsletter preview.');
      setPreview(response);
    } catch (previewError) {
      setError(previewError.message || 'Could not build the newsletter preview.');
    } finally {
      setBusy('');
    }
  };

  const sendTest = async (event) => {
    event.preventDefault();
    if (!articleId) return;
    setBusy('test');
    setError('');
    setNotice('');
    try {
      const response = await apiFetch('/api/admin/newsletter/test', {
        method: 'POST',
        body: JSON.stringify({ articleId, email: testEmail, requestId: crypto.randomUUID() }),
      });
      if (!response.ok) throw new Error(response.error || 'Test email could not be accepted.');
      setNotice('Resend accepted the test email. This does not confirm inbox delivery.');
    } catch (testError) {
      setError(testError.message || 'Test email could not be accepted.');
    } finally {
      setBusy('');
    }
  };

  const retryCampaign = async (campaign) => {
    setBusy(campaign.id);
    setError('');
    setNotice('');
    try {
      const response = await apiFetch(`/api/admin/newsletter/campaigns/${encodeURIComponent(campaign.id)}/retry`, { method: 'POST' });
      if (!response.ok) throw new Error(response.error || 'Failed deliveries could not be queued for retry.');
      setNotice(response.retryCount ? `${response.retryCount} failed ${response.retryCount === 1 ? 'delivery' : 'deliveries'} queued for retry.` : 'There are no safely retryable failed deliveries.');
      await load();
    } catch (retryError) {
      setError(retryError.message || 'Failed deliveries could not be queued for retry.');
    } finally {
      setBusy('');
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Admin dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Newsletter</h1>
          <p className="mt-2 text-sm text-slate-600">Manage confirmed subscribers and automatic, one-time article notifications.</p>
        </div>
        <Link href="/admin/news" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to news</Link>
      </div>

      {error ? <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
      {notice ? <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div> : null}

      <section aria-label="Subscriber totals" className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total', overview.subscribers.total],
          ['Confirmed active', overview.subscribers.active],
          ['Pending confirmation', overview.subscribers.pending],
          ['Unsubscribed', overview.subscribers.unsubscribed],
        ].map(([label, count]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Users className="h-4 w-4" />{label}</div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900">{count}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-700" />
          <h2 className="font-display text-xl font-bold text-slate-900">Preview a newsletter</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Publishing a news article automatically queues one notification. The scheduled worker sends it only to subscribers who confirmed before that article was published.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="sr-only" htmlFor="newsletter-article">Published article</label>
          <select id="newsletter-article" className="field" value={articleId} onChange={(event) => { setArticleId(event.target.value); setPreview(null); }}>
            <option value="">Select a published article</option>
            {articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
          </select>
          <button type="button" onClick={loadPreview} disabled={!articleId || Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
            {busy === 'preview' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Preview newsletter
          </button>
        </div>

        {preview ? (
          <div className="mt-6">
            <div className="flex flex-col justify-between gap-3 rounded-xl bg-blue-50 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-900">{preview.article.title}</p>
                <p className="mt-1 text-sm text-slate-600">{preview.recipientCount} confirmed active recipient{preview.recipientCount === 1 ? '' : 's'} · Subject: {preview.subject}</p>
              </div>
              <p className="text-sm font-semibold text-blue-800">New articles are queued automatically when published</p>
            </div>
            <iframe title="Newsletter email preview" srcDoc={preview.html} sandbox="" className="mt-4 h-[620px] w-full rounded-xl border border-slate-200 bg-slate-100" />
            <form onSubmit={sendTest} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-test-email">Test recipient email</label>
              <input id="newsletter-test-email" type="email" required maxLength={254} autoComplete="email" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="Admin-selected test recipient" className="field min-w-0 flex-1" />
              <button type="submit" disabled={!articleId || Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
                {busy === 'test' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send test email
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-500">Test delivery goes only to the address entered above. Resend acceptance is not proof of inbox delivery.</p>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Campaign history</h2>
          <button type="button" onClick={load} disabled={loading} aria-label="Refresh campaign history" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>
        {overview.campaigns.length ? (
          <div className="divide-y divide-slate-100">
            {overview.campaigns.map((campaign) => (
              <article key={campaign.id} className="flex flex-col justify-between gap-4 px-5 py-5 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{campaign.articleTitle}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${campaignStatusStyles[campaign.status] || 'bg-slate-100 text-slate-700'}`}>{campaign.status.replaceAll('_', ' ')}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">/{campaign.articleSlug} · Created {formatDate(campaign.createdAt)}</p>
                  <p className="mt-2 text-xs text-slate-600">
                    {campaign.recipientCount} recipients · {campaign.acceptedCount} accepted · {campaign.deliveredCount} delivered · {campaign.failedCount} failed · {campaign.uncertainCount} uncertain · {campaign.pendingCount} pending
                  </p>
                </div>
                {campaign.failedCount > 0 ? (
                  <button type="button" disabled={Boolean(busy)} onClick={() => retryCampaign(campaign)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">
                    {busy === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Retry failed only
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-slate-500">{loading ? 'Loading campaign history…' : 'No newsletter campaigns yet.'}</div>
        )}
      </section>
    </main>
  );
}
