import { redirect } from 'next/navigation';
import { getCurrentServerUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const user = await getCurrentServerUser();
  if (!user) redirect('/login?returnTo=%2Fadmin%2Fnews');
  if (user.role !== 'admin') redirect('/');
  return children;
}
