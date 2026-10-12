import AdminNewsletter from '@/components/news/AdminNewsletter';
import { Suspense } from 'react';

export const metadata = { title: 'Newsletter management' };

export default function AdminNewsletterPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50" />}><AdminNewsletter /></Suspense>;
}
