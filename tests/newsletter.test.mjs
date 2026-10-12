import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildConfirmationEmail,
  buildNewsletterEmail,
  createNewsletterToken,
  decryptNewsletterToken,
  encryptNewsletterToken,
  getCampaignStatus,
  getWebhookDeliveryStatus,
  hashNewsletterToken,
  normalizeNewsletterEmail,
} from '../lib/newsletter.mjs';

test('newsletter email addresses are normalized and validated', () => {
  assert.equal(normalizeNewsletterEmail('  Person+News@Example.COM '), 'person+news@example.com');
  assert.equal(normalizeNewsletterEmail('not-an-email'), null);
  assert.equal(normalizeNewsletterEmail(`a@${'b'.repeat(250)}.com`), null);
  assert.equal(normalizeNewsletterEmail(null), null);
});

test('newsletter tokens are random, hashable, and encrypted at rest', () => {
  const first = createNewsletterToken();
  const second = createNewsletterToken();
  const secret = 'test-newsletter-token-secret-0123456789';

  assert.notEqual(first, second);
  assert.equal(hashNewsletterToken(first).length, 64);
  assert.notEqual(hashNewsletterToken(first), first);
  assert.equal(decryptNewsletterToken(encryptNewsletterToken(first, secret), secret), first);
  assert.throws(() => decryptNewsletterToken(encryptNewsletterToken(first, secret), 'wrong-newsletter-secret-value-123'));
});

test('newsletter messages contain the correct article, confirmation, and unsubscribe links safely', () => {
  const confirmation = buildConfirmationEmail({
    confirmationUrl: 'https://soilcredit.net/newsletter/confirm?token=secret',
    appOrigin: 'https://soilcredit.net',
  });
  const newsletter = buildNewsletterEmail({
    article: {
      title: '<Climate update>',
      slug: 'climate-update',
      summary: 'A & B',
      coverImageUrl: 'https://soilcredit.net/cover.jpg',
    },
    articleUrl: 'https://soilcredit.net/news/climate-update',
    unsubscribeUrl: 'https://soilcredit.net/newsletter/unsubscribe?token=secret',
    publishedAt: '2026-10-12T00:00:00.000Z',
  });

  assert.match(confirmation.html, /newsletter\/confirm\?token=secret/);
  assert.match(newsletter.html, /Climate update/);
  assert.match(newsletter.html, /&lt;Climate update&gt;/);
  assert.match(newsletter.html, /A &amp; B/);
  assert.match(newsletter.html, /https:\/\/soilcredit\.net\/news\/climate-update/);
  assert.match(newsletter.html, /newsletter\/unsubscribe\?token=secret/);
  assert.match(newsletter.text, /Unsubscribe: https:\/\/soilcredit\.net\/newsletter\/unsubscribe\?token=secret/);
});

test('campaign statuses distinguish queueing, provider acceptance, and failures', () => {
  assert.equal(getCampaignStatus({ snapshotComplete: false, pending: 0, processing: 0, accepted: 0, delivered: 0, failures: 0 }), 'queued');
  assert.equal(getCampaignStatus({ snapshotComplete: true, pending: 1, processing: 0, accepted: 2, delivered: 0, failures: 0 }), 'queued');
  assert.equal(getCampaignStatus({ snapshotComplete: true, pending: 0, processing: 1, accepted: 2, delivered: 0, failures: 0 }), 'processing');
  assert.equal(getCampaignStatus({ snapshotComplete: true, pending: 0, processing: 0, accepted: 2, delivered: 0, failures: 0 }), 'sent');
  assert.equal(getCampaignStatus({ snapshotComplete: true, pending: 0, processing: 0, accepted: 1, delivered: 0, failures: 1 }), 'partially_failed');
  assert.equal(getCampaignStatus({ snapshotComplete: true, pending: 0, processing: 0, accepted: 0, delivered: 0, failures: 1 }), 'failed');
});

test('Resend delivery webhook events map only to supported delivery states', () => {
  assert.equal(getWebhookDeliveryStatus('email.delivered'), 'delivered');
  assert.equal(getWebhookDeliveryStatus('email.bounced'), 'bounced');
  assert.equal(getWebhookDeliveryStatus('email.complained'), 'complained');
  assert.equal(getWebhookDeliveryStatus('email.sent'), 'accepted');
  assert.equal(getWebhookDeliveryStatus('email.delivery_delayed'), 'accepted');
  assert.equal(getWebhookDeliveryStatus('contact.updated'), null);
});
