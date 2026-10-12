import { ensureNewsIndexes, getDb } from '@/lib/mongodb';

export async function getPublishedArticles() {
  const db = await getDb();
  const articles = db.collection('newsArticles');
  await ensureNewsIndexes(articles);
  return articles.find({ status: 'published' })
    .project({ _id: 0, id: 1, title: 1, slug: 1, summary: 1, coverImageUrl: 1, publishedAt: 1 })
    .sort({ publishedAt: -1 })
    .toArray();
}

export async function getPublishedArticleBySlug(slug) {
  const db = await getDb();
  const articles = db.collection('newsArticles');
  await ensureNewsIndexes(articles);
  return articles.findOne({ slug, status: 'published' }, { projection: { _id: 0 } });
}
