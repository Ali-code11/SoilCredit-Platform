import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';
import { findActiveSession } from '@/lib/session.mjs';

export async function getCurrentServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sc_session')?.value;
  if (!token) return null;

  const db = await getDb();
  const session = await findActiveSession(db, token);
  if (!session) return null;

  return db.collection('users').findOne(
    { id: session.userId },
    { projection: { _id: 0, id: 1, role: 1 } },
  );
}

export async function isCurrentUserAdmin() {
  const user = await getCurrentServerUser();
  return user?.role === 'admin';
}
