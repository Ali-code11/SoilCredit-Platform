import assert from 'node:assert/strict';
import test from 'node:test';
import { getSafeReturnPath } from '../lib/auth-redirect.mjs';

test('return paths accept internal admin destinations and preserve queries', () => {
  assert.equal(getSafeReturnPath('/admin/news?filter=draft'), '/admin/news?filter=draft');
});

test('return paths reject external, protocol-relative, and login-loop destinations', () => {
  assert.equal(getSafeReturnPath('https://example.com'), '/dashboard');
  assert.equal(getSafeReturnPath('//example.com'), '/dashboard');
  assert.equal(getSafeReturnPath('/\\example.com'), '/dashboard');
  assert.equal(getSafeReturnPath('/login?returnTo=/admin'), '/dashboard');
});
