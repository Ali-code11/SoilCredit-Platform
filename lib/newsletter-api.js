import { randomUUID, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ensureNewsletterIndexes, getDb } from '@/lib/mongodb';
import {
  NEWSLETTER_COLLECTIONS,
  buildConfirmationEmail,
  buildNewsletterEmail,
  createNewsletterToken,
  encryptNewsletterToken,
  hashNewsletterToken,
  hashNewsletterValue,
  normalizeNewsletterEmail,
} from '@/lib/newsletter.mjs';
import {
  buildCampaignPreview,
  createNewsletterCampaign,
  getArticleUrl,
  getNewsletterAdminOverview,
  handleNewsletterWebhook,
  retryNewsletterCampaign,
  sendNewsletterTest,
} from '@/lib/newsletter-server';

const CONFIRMATION_LIFETIME_MS = 48 * 60 * 60 * 1000;
const CONFIRMATION_RESEND_DELAY_MS = 15 * 60 * 1000;
const HOURLY_IP_LIMIT = 5;

function ok(data, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

function err(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function readJson(req) {
  try {
    const value = await req.json();
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

async function adminOnly(req, getCurrentUser) {
  const user = await getCurrentUser(req);
  if (!user) return { response: err('Unauthenticated', 401) };
  if (user.role !== 'admin') return { response: err('Forbidden', 403) };
  return { user };
}

function getClientIp(req) {
  const value = req.headers.get('x-vercel-forwarded-for')
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-forwarded-for');
  return value?.split(',')[0]?.trim() || null;
}

function getRequestOrigin(req) {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL)?.trim();
  if (!configured) return process.env.NODE_ENV === 'production' ? 'https://soilcredit.net' : new URL(req.url).origin;
  return /^https?:\/\//i.test(configured) ? configured.replace(/\/$/, '') : `https://${configured.replace(/\/$/, '')}`;
}

function safeCampaignArticle(article) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    coverImageUrl: article.coverImageUrl || '',
    publishedAt: article.publishedAt,
  };
}

async function getPublishedArticle(db, articleId) {
  return db.collection('newsArticles').findOne(
    { id: articleId, status: 'published' },
    { projection: { _id: 0, id: 1, title: 1, slug: 1, summary: 1, coverImageUrl: 1, publishedAt: 1 } },
  );
}

async function subscribe(req) {
  const body = await readJson(req);
  const email = normalizeNewsletterEmail(body.email);
  if (!email) return err('Enter a valid email address.', 400);

  const db = await getDb();
  await ensureNewsletterIndexes(db);
  const subscribers = db.collection(NEWSLETTER_COLLECTIONS.subscribers);

  const ip = getClientIp(req);
  if (ip) {
    const bucket = Math.floor(Date.now() / (60 * 60 * 1000));
    const key = `subscribe:${hashNewsletterValue(ip)}`;
    const bucketStart = new Date(bucket * 60 * 60 * 1000);
    await db.collection(NEWSLETTER_COLLECTIONS.rateLimits).insertOne({
      _id: randomUUID(),
      key,
      createdAt: new Date(),
      expiresAt: new Date((bucket + 2) * 60 * 60 * 1000),
    });
    const requestsThisHour = await db.collection(NEWSLETTER_COLLECTIONS.rateLimits).countDocuments({
      key,
      createdAt: { $gte: bucketStart },
    });
    if (requestsThisHour > HOURLY_IP_LIMIT) return err('Too many subscription requests. Please try again later.', 429);
  }

  const existing = await subscribers.findOne({ email });
  if (existing?.status === 'active') {
    return ok({ message: 'This email is already subscribed.' });
  }
  const now = Date.now();
  if (existing?.status === 'pending' && existing.confirmationSentAt
    && now - new Date(existing.confirmationSentAt).getTime() < CONFIRMATION_RESEND_DELAY_MS) {
    return ok({ message: 'If this address can be subscribed, a confirmation email will arrive shortly.' }, 202);
  }

  const emailBucket = Math.floor(now / (60 * 60 * 1000));
  const emailRateKey = `subscribe-email:${hashNewsletterValue(email)}`;
  const emailBucketStart = new Date(emailBucket * 60 * 60 * 1000);
  await db.collection(NEWSLETTER_COLLECTIONS.rateLimits).insertOne({
    _id: randomUUID(),
    key: emailRateKey,
    createdAt: new Date(),
    expiresAt: new Date((emailBucket + 2) * 60 * 60 * 1000),
  });
  const emailRequestsThisHour = await db.collection(NEWSLETTER_COLLECTIONS.rateLimits).countDocuments({
    key: emailRateKey,
    createdAt: { $gte: emailBucketStart },
  });
  if (emailRequestsThisHour > 3) return err('Too many confirmation requests for this address. Please try again later.', 429);

  const confirmationToken = createNewsletterToken();
  const unsubscribeToken = createNewsletterToken();
  const origin = getRequestOrigin(req);
  const confirmationUrl = `${origin}/newsletter/confirm?token=${encodeURIComponent(confirmationToken)}`;
  const emailContent = buildConfirmationEmail({ confirmationUrl, appOrigin: origin });
  const subscriberId = existing?.id || randomUUID();
  const createdAt = existing?.createdAt || new Date().toISOString();
  const update = {
    email,
    status: 'pending',
    confirmationTokenHash: hashNewsletterToken(confirmationToken),
    confirmationExpiresAt: new Date(now + CONFIRMATION_LIFETIME_MS),
    confirmationSentAt: new Date(now).toISOString(),
    unsubscribeTokenHash: hashNewsletterToken(unsubscribeToken),
    unsubscribeTokenEncrypted: encryptNewsletterToken(unsubscribeToken),
    updatedAt: new Date(now).toISOString(),
    ...(existing?.status === 'unsubscribed' ? { confirmedAt: null, unsubscribedAt: null } : {}),
    ...(!existing ? { createdAt } : {}),
  };

  if (existing) {
    await subscribers.updateOne({ email }, { $set: update });
  } else {
    try {
      await subscribers.insertOne({ id: subscriberId, ...update });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      return ok({ message: 'If this address can be subscribed, a confirmation email will arrive shortly.' }, 202);
    }
  }

  try {
    await sendConfirmationEmail(email, emailContent);
  } catch (error) {
    await subscribers.updateOne({ email, status: 'pending' }, {
      $set: { confirmationEmailStatus: 'failed', updatedAt: new Date().toISOString() },
    });
    throw error;
  }

  await subscribers.updateOne({ email }, {
    $set: { confirmationEmailStatus: 'accepted', updatedAt: new Date().toISOString() },
  });
  return ok({ message: 'Check your inbox and confirm your email to complete your subscription.' }, 202);
}

async function sendConfirmationEmail(email, content) {
  const { sendEmail } = await import('@/lib/email');
  return sendEmail({
    to: email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    idempotencyKey: `newsletter-confirm-${hashNewsletterToken(content.text)}`,
  });
}

async function confirmSubscription(req) {
  const { token } = await readJson(req);
  if (typeof token !== 'string' || token.length < 32) return err('This confirmation link is invalid or expired.', 400);
  const db = await getDb();
  await ensureNewsletterIndexes(db);
  const now = new Date();
  const result = await db.collection(NEWSLETTER_COLLECTIONS.subscribers).updateOne(
    {
      confirmationTokenHash: hashNewsletterToken(token),
      status: 'pending',
      confirmationExpiresAt: { $gt: now },
    },
    {
      $set: { status: 'active', confirmedAt: now.toISOString(), updatedAt: now.toISOString() },
      $unset: { confirmationTokenHash: '', confirmationExpiresAt: '' },
    },
  );
  if (!result.modifiedCount) return err('This confirmation link is invalid, expired, or already used.', 400);
  return ok({ message: 'Your SoilCredit newsletter subscription is confirmed.' });
}

async function unsubscribe(req) {
  let token = new URL(req.url).searchParams.get('token') || '';
  if (!token) {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = new URLSearchParams(await req.text());
      token = form.get('token') || '';
    } else {
      const body = await readJson(req);
      token = typeof body.token === 'string' ? body.token : '';
    }
  }
  if (token.length < 32) return err('This unsubscribe link is invalid.', 400);
  const db = await getDb();
  await ensureNewsletterIndexes(db);
  const now = new Date().toISOString();
  const result = await db.collection(NEWSLETTER_COLLECTIONS.subscribers).updateOne(
    { unsubscribeTokenHash: hashNewsletterToken(token), status: { $ne: 'unsubscribed' } },
    { $set: { status: 'unsubscribed', unsubscribedAt: now, updatedAt: now } },
  );
  if (!result.matchedCount) {
    const alreadyUnsubscribed = await db.collection(NEWSLETTER_COLLECTIONS.subscribers).findOne(
      { unsubscribeTokenHash: hashNewsletterToken(token), status: 'unsubscribed' },
      { projection: { _id: 1 } },
    );
    if (!alreadyUnsubscribed) return err('This unsubscribe link is invalid or has expired.', 400);
  }
  return ok({ message: 'Your email address has been unsubscribed.' });
}

function secureSecretEquals(provided, expected) {
  if (!provided || !expected) return false;
  const providedHash = Buffer.from(hashNewsletterValue(provided), 'hex');
  const expectedHash = Buffer.from(hashNewsletterValue(expected), 'hex');
  return timingSafeEqual(providedHash, expectedHash);
}

async function processWorker(req) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    || req.headers.get('x-cron-secret');
  if (!secureSecretEquals(provided, expected)) return err('Forbidden', 403);
  const db = await getDb();
  const { processNewsletterQueueBatch } = await import('@/lib/newsletter-server');
  const result = await processNewsletterQueueBatch(db);
  return ok(result);
}

async function processResendWebhook(req) {
  if (!process.env.RESEND_WEBHOOK_SECRET) return err('Webhook verification is not configured.', 503);
  const payload = await req.text();
  const headers = {
    id: req.headers.get('svix-id') || '',
    timestamp: req.headers.get('svix-timestamp') || '',
    signature: req.headers.get('svix-signature') || '',
  };
  let event;
  try {
    event = new Resend(process.env.RESEND_API_KEY || '').webhooks.verify({
      payload,
      headers,
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    });
  } catch {
    return err('Invalid webhook signature.', 400);
  }
  const db = await getDb();
  await ensureNewsletterIndexes(db);
  const result = await handleNewsletterWebhook(db, event, headers.id);
  return ok(result);
}

export async function handleNewsletterRoute(req, route, method, getCurrentUser) {
  if (route === 'newsletter' && method === 'POST') return subscribe(req);
  if (route === 'newsletter/confirm' && method === 'POST') return confirmSubscription(req);
  if (route === 'newsletter/unsubscribe' && method === 'POST') return unsubscribe(req);
  if (route === 'newsletter/worker' && method === 'POST') return processWorker(req);
  if (route === 'newsletter/webhook' && method === 'POST') return processResendWebhook(req);

  if (route === 'admin/newsletter' && method === 'GET') {
    const access = await adminOnly(req, getCurrentUser);
    if (access.response) return access.response;
    const db = await getDb();
    await ensureNewsletterIndexes(db);
    return ok(await getNewsletterAdminOverview(db));
  }

  if (route === 'admin/newsletter/preview' && method === 'GET') {
    const access = await adminOnly(req, getCurrentUser);
    if (access.response) return access.response;
    const articleId = new URL(req.url).searchParams.get('articleId');
    if (!articleId) return err('An article ID is required.', 400);
    const db = await getDb();
    const article = await getPublishedArticle(db, articleId);
    if (!article) return err('Only a published article can be previewed for a newsletter.', 404);
    const recipientCount = await db.collection(NEWSLETTER_COLLECTIONS.subscribers).countDocuments({ status: 'active' });
    const message = buildCampaignPreview(article);
    return ok({ article: safeCampaignArticle(article), recipientCount, subject: message.subject, html: message.html, text: message.text });
  }

  if (route === 'admin/newsletter/campaigns' && method === 'POST') {
    const access = await adminOnly(req, getCurrentUser);
    if (access.response) return access.response;
    const { articleId } = await readJson(req);
    if (typeof articleId !== 'string' || !articleId) return err('An article ID is required.', 400);
    const db = await getDb();
    await ensureNewsletterIndexes(db);
    const article = await getPublishedArticle(db, articleId);
    if (!article) return err('Only a published article can be sent to newsletter subscribers.', 409);
    try {
      const result = await createNewsletterCampaign(db, article);
      return ok({ ...result, campaign: result.campaign }, result.created ? 202 : 200);
    } catch (error) {
      if (error.message.includes('no confirmed active subscribers')) return err(error.message, 409);
      throw error;
    }
  }

  const retryMatch = route.match(/^admin\/newsletter\/campaigns\/([^/]+)\/retry$/);
  if (retryMatch && method === 'POST') {
    const access = await adminOnly(req, getCurrentUser);
    if (access.response) return access.response;
    const db = await getDb();
    await ensureNewsletterIndexes(db);
    const result = await retryNewsletterCampaign(db, retryMatch[1]);
    if (!result) return err('Campaign not found.', 404);
    return ok(result);
  }

  if (route === 'admin/newsletter/test' && method === 'POST') {
    const access = await adminOnly(req, getCurrentUser);
    if (access.response) return access.response;
    const body = await readJson(req);
    const email = normalizeNewsletterEmail(body.email);
    if (!email) return err('Enter a valid test recipient email address.', 400);
    if (typeof body.requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.requestId)) {
      return err('A valid test request ID is required.', 400);
    }
    const db = await getDb();
    const article = await getPublishedArticle(db, body.articleId);
    if (!article) return err('Only a published article can be sent as a test email.', 404);
    const result = await sendNewsletterTest({ article, email, requestId: body.requestId });
    return ok(result, result.duplicate ? 200 : 202);
  }

  if (route === 'newsletter/webhook' && method === 'GET') return err('Method not allowed.', 405);

  return null;
}

export { getArticleUrl };
