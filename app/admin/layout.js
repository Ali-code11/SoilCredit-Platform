import { redirect } from 'next/navigation';
import { isCurrentUserAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  if (!await isCurrentUserAdmin()) redirect('/');
  return children;
}
