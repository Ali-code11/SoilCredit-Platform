import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export const NEWSLETTER_COLLECTIONS = {
  subscribers: 'newsletterSubscribers',
  campaigns: 'newsletterCampaigns',
  deliveries: 'newsletterDeliveries',
  attempts: 'newsletterDeliveryAttempts',
  rateLimits: 'newsletterRateLimits',
  tests: 'newsletterTestEmails',
  webhookEvents: 'newsletterWebhookEvents',
};

export function normalizeNewsletterEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function createNewsletterToken() {
  return randomBytes(32).toString('base64url');
}

export function hashNewsletterToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function hashNewsletterValue(value) {
  return createHash('sha256').update(value).digest('hex');
}

function getNewsletterEncryptionKey(secret = process.env.NEWSLETTER_TOKEN_SECRET) {
  if (!secret || secret.length < 32) {
    throw new Error('Newsletter token encryption is not configured. Set NEWSLETTER_TOKEN_SECRET to at least 32 characters.');
  }
  return createHash('sha256').update(secret).digest();
}

export function encryptNewsletterToken(token, secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getNewsletterEncryptionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}

export function decryptNewsletterToken(value, secret) {
  const encrypted = Buffer.from(value, 'base64url');
  if (encrypted.length < 29) throw new Error('Stored newsletter token is invalid.');
  const decipher = createDecipheriv('aes-256-gcm', getNewsletterEncryptionKey(secret), encrypted.subarray(0, 12));
  decipher.setAuthTag(encrypted.subarray(12, 28));
  return Buffer.concat([decipher.update(encrypted.subarray(28)), decipher.final()]).toString('utf8');
}

export function escapeNewsletterHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function shell(content, previewText) {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="display:none;max-height:0;overflow:hidden">${escapeNewsletterHtml(previewText)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 12px"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden"><tr><td style="padding:24px 32px;background:#0b3b75;color:#fff"><div style="font-size:22px;font-weight:700">SoilCredit</div><div style="margin-top:5px;color:#dbeafe;font-size:13px">Land, soil and climate insights</div></td></tr><tr><td style="padding:32px">${content}</td></tr></table></td></tr></table></body></html>`;
}

export function buildConfirmationEmail({ confirmationUrl, appOrigin }) {
  const origin = escapeNewsletterHtml(appOrigin);
  const url = escapeNewsletterHtml(confirmationUrl);
  return {
    subject: 'Confirm your SoilCredit newsletter subscription',
    html: shell(
      `<h1 style="font-size:24px">Confirm your subscription</h1><p style="font-size:15px;line-height:1.7;color:#475569">Please confirm that you want to receive occasional SoilCredit news and climate updates.</p><p style="margin:28px 0"><a href="${url}" style="display:inline-block;border-radius:10px;background:#1763c7;padding:14px 22px;color:#fff;text-decoration:none;font-weight:700">Confirm subscription</a></p><p style="font-size:13px;line-height:1.6;color:#64748b">This link expires in 48 hours. If you did not request this subscription, you can ignore this message.</p><p style="font-size:12px;color:#94a3b8"><a href="${origin}" style="color:#64748b">${origin}</a></p>`,
      'Confirm your subscription to SoilCredit news.',
    ),
    text: `Confirm your SoilCredit newsletter subscription: ${confirmationUrl}\n\nThis link expires in 48 hours. If you did not request this subscription, ignore this message.`,
  };
}

export function buildNewsletterEmail({ article, articleUrl, unsubscribeUrl, preview = false, publishedAt }) {
  const title = escapeNewsletterHtml(article.title);
  const summary = escapeNewsletterHtml(article.summary);
  const url = escapeNewsletterHtml(articleUrl);
  const unsubscribe = escapeNewsletterHtml(unsubscribeUrl);
  const dateValue = publishedAt || article.publishedAt || new Date().toISOString();
  const date = escapeNewsletterHtml(new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(dateValue)));
  const image = article.coverImageUrl
    ? `<img src="${escapeNewsletterHtml(article.coverImageUrl)}" alt="${title}" width="536" style="display:block;width:100%;height:auto;border-radius:12px;margin:24px 0">`
    : '';
  const previewNote = preview ? '<p style="padding:10px 12px;background:#eff6ff;border-radius:8px;color:#1d4ed8;font-size:13px">Test preview — this message does not subscribe or unsubscribe the recipient.</p>' : '';
  const unsubscribeFooter = preview
    ? `<p style="font-size:12px;color:#64748b">This is a test preview. No subscription changes have been made.</p>`
    : `<p style="font-size:12px;line-height:1.6;color:#64748b">You received this email because you confirmed a SoilCredit newsletter subscription. <a href="${unsubscribe}" style="color:#1763c7">Unsubscribe</a> at any time.</p>`;
  return {
    subject: `${preview ? '[Test] ' : ''}SoilCredit: ${article.title}`,
    html: shell(
      `${previewNote}<p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#1763c7">SoilCredit News</p><p style="font-size:13px;color:#64748b">${date}</p><h1 style="font-size:28px;line-height:1.2">${title}</h1>${image}<p style="font-size:16px;line-height:1.7;color:#475569">${summary}</p><p style="margin:28px 0"><a href="${url}" style="display:inline-block;border-radius:10px;background:#1763c7;padding:14px 22px;color:#fff;text-decoration:none;font-weight:700">Read the full article</a></p>${unsubscribeFooter}`,
      article.summary,
    ),
    text: `${preview ? 'TEST PREVIEW — ' : ''}${article.title}\n${date}\n\n${article.summary}\n\nRead the full article: ${articleUrl}${preview ? '' : `\n\nUnsubscribe: ${unsubscribeUrl}`}`,
  };
}

export function getCampaignStatus({ snapshotComplete, pending, processing, accepted, delivered, failures }) {
  if (!snapshotComplete || pending > 0 || processing > 0) return processing > 0 ? 'processing' : 'queued';
  if (failures > 0) return accepted + delivered > 0 ? 'partially_failed' : 'failed';
  return 'sent';
}

export function getWebhookDeliveryStatus(eventType) {
  if (eventType === 'email.delivered') return 'delivered';
  if (eventType === 'email.bounced') return 'bounced';
  if (eventType === 'email.complained') return 'complained';
  if (eventType === 'email.failed' || eventType === 'email.suppressed') return 'failed';
  if (eventType === 'email.sent' || eventType === 'email.delivery_delayed') return 'accepted';
  return null;
}
