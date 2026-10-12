import ArticlePreview from '@/components/news/ArticlePreview';

export const metadata = { title: 'Article preview' };

export default async function ArticlePreviewPage({ params }) {
  const { id } = await params;
  return <ArticlePreview articleId={id} />;
}
