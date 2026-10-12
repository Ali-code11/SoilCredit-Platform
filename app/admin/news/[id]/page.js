import ArticleEditor from '@/components/news/ArticleEditor';

export const metadata = { title: 'Edit article' };

export default async function EditArticlePage({ params }) {
  const { id } = await params;
  return <ArticleEditor articleId={id} />;
}
