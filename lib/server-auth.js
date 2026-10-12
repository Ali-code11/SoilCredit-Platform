import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

export async function isCurrentUserAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sc_session')?.value;
  if (!token) return false;

  const db = await getDb();
  const session = await db.collection('sessions').findOne({ token });
  if (!session) return false;

  const user = await db.collection('users').findOne({ id: session.userId }, { projection: { role: 1 } });
  return user?.role === 'admin';
}
