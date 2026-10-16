import { getPublishedArticles } from '@/lib/news';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const articles = await getPublishedArticles();
  return [
    {
      url: 'https://soilcredit.net/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://soilcredit.net/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://soilcredit.net/news',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...articles.map((article) => ({
      url: `https://soilcredit.net/news/${encodeURIComponent(article.slug)}`,
      lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ];
}