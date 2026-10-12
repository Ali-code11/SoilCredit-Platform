export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

export function createSession(token, userId, now = Date.now()) {
  return {
    token,
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_MAX_AGE_MS),
  };
}

export function isSessionActive(session, now = Date.now()) {
  const expiresAt = session.expiresAt
    ? new Date(session.expiresAt).getTime()
    : new Date(session.createdAt).getTime() + SESSION_MAX_AGE_MS;
  return Number.isFinite(expiresAt) && expiresAt > now;
}

export async function findActiveSession(db, token, now = Date.now()) {
  if (!token) return null;
  const session = await db.collection('sessions').findOne({ token });
  return session && isSessionActive(session, now) ? session : null;
}
