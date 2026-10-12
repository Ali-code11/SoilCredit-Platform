import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSession,
  findActiveSession,
  isSessionActive,
  SESSION_MAX_AGE_SECONDS,
} from '../lib/session.mjs';

test('new sessions expire after the configured cookie lifetime', () => {
  const now = Date.UTC(2026, 9, 12);
  const session = createSession('token', 'user', now);

  assert.equal(session.token, 'token');
  assert.equal(session.userId, 'user');
  assert.equal(session.expiresAt.getTime() - now, SESSION_MAX_AGE_SECONDS * 1000);
  assert.equal(isSessionActive(session, now), true);
  assert.equal(isSessionActive(session, session.expiresAt.getTime()), false);
});

test('legacy sessions use their creation time as an expiry fallback', () => {
  const now = Date.UTC(2026, 9, 12);
  const session = { token: 'legacy', userId: 'user', createdAt: new Date(now).toISOString() };

  assert.equal(isSessionActive(session, now + SESSION_MAX_AGE_SECONDS * 1000 - 1), true);
  assert.equal(isSessionActive(session, now + SESSION_MAX_AGE_SECONDS * 1000), false);
  assert.equal(isSessionActive({ token: 'invalid' }, now), false);
});

test('session lookup returns only an unexpired stored session', async () => {
  const stored = createSession('active', 'user');
  const db = {
    collection(name) {
      assert.equal(name, 'sessions');
      return { findOne: async ({ token }) => token === stored.token ? stored : null };
    },
  };

  assert.equal(await findActiveSession(db, null), null);
  assert.equal(await findActiveSession(db, 'missing'), null);
  assert.equal(await findActiveSession(db, 'active'), stored);
});
