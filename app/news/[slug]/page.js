import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/soilcredit/Navbar';
import Footer from '@/components/soilcredit/Footer';
import { getPublishedArticleBySlug } from '@/lib/news';

export const dynamic = 'force-dynamic';

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: 'Article not found' };
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/news/${encodeURIComponent(article.slug)}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.summary,
      publishedTime: article.publishedAt || undefined,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <article className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <Link href="/news" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← All news</Link>
        <header className="mt-7">
          <time className="text-sm text-slate-500" dateTime={article.publishedAt || undefined}>{formatDate(article.publishedAt)}</time>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{article.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{article.summary}</p>
        </header>
        {article.coverImageUrl ? <img src={article.coverImageUrl} alt="" className="mt-9 max-h-[520px] w-full rounded-3xl object-cover" /> : null}
        <div className="mt-9 whitespace-pre-wrap break-words text-base leading-8 text-slate-700">{article.content}</div>
      </article>
      <Footer />
    </main>
  );
}
