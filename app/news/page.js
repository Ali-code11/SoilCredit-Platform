import Link from 'next/link';
import Navbar from '@/components/soilcredit/Navbar';
import Footer from '@/components/soilcredit/Footer';
import { getPublishedArticles } from '@/lib/news';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'News',
  description: 'The latest news, updates, and stories from SoilCredit.',
  alternates: { canonical: '/news' },
};

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">SoilCredit journal</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 sm:text-5xl">News &amp; insights</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">Updates and perspectives on land, soil health, and carbon markets.</p>
          </div>
          {articles.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <article key={article.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {article.coverImageUrl ? (
                    <img src={article.coverImageUrl} alt="" className="h-52 w-full object-cover" />
                  ) : (
                    <div className="h-52 bg-gradient-to-br from-blue-100 via-slate-50 to-emerald-100" aria-hidden="true" />
                  )}
                  <div className="p-6">
                    <time className="text-xs font-medium text-slate-500" dateTime={article.publishedAt || undefined}>{formatDate(article.publishedAt)}</time>
                    <h2 className="mt-2 font-display text-xl font-bold leading-snug text-slate-900">{article.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{article.summary}</p>
                    <Link href={`/news/${encodeURIComponent(article.slug)}`} className="mt-5 inline-flex font-semibold text-blue-700 hover:text-blue-900">
                      Read article <span className="ml-1" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-600">
              New stories are on the way.
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
