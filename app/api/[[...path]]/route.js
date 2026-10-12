import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import crypto from 'crypto';
import { ensureNewsIndexes, getDb } from '@/lib/mongodb';
import { createSession, findActiveSession, SESSION_MAX_AGE_SECONDS } from '@/lib/session.mjs';
import { SUPPORTED_LAND_COUNTRIES } from '@/lib/constants/locations';
import { z } from 'zod';

/* ---------- crypto helpers ---------- */
function hashPassword(pw, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.pbkdf2Sync(pw, s, 60000, 32, 'sha256').toString('hex');
  return { salt: s, hash: h };
}
function verifyPassword(pw, salt, hash) {
  const { hash: h2 } = hashPassword(pw, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(h2, 'hex'));
}
function createToken() {
  return crypto.randomBytes(32).toString('hex');
}
function createVerificationCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function sameHash(left, right) {
  if (!left || !right) return false;
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) throw new Error('Email service is not configured. Set RESEND_API_KEY and restart the server.');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'SoilCredit <no-reply@soilcredit.net>',
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message || 'Email could not be sent');
  return true;
}
function appUrl(req) {
  const configuredUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL)?.trim();
  if (!configuredUrl) return process.env.NODE_ENV === 'production' ? 'https://soilcredit.net' : new URL(req.url).origin;
  return /^https?:\/\//i.test(configuredUrl) ? configuredUrl.replace(/\/$/, '') : `https://${configuredUrl.replace(/\/$/, '')}`;
}

/* ---------- carbon estimation ---------- */
const FACTORS = {
  soil: { sandy: 0.6, loamy: 1.0, clay: 1.2, peat: 1.8, silty: 0.9 },
  region: { tropical: 1.4, temperate: 1.0, boreal: 0.7, arid: 0.5, mediterranean: 0.9, caspian: 1.1 },
  forestType: { primary: 1.5, secondary: 1.1, plantation: 0.8, agroforestry: 1.0, grassland: 0.6, wetland: 1.6 },
  vegetation: { sparse: 0.5, moderate: 0.9, dense: 1.3, veryDense: 1.55 },
};
const BASE_RATE = 4.5;
const CREDIT_PRICE_USD = 42.8;

function estimate({ area, soil, region, forestType, vegetation }) {
  const a = Number(area) || 0;
  const s = FACTORS.soil[soil] ?? 1;
  const r = FACTORS.region[region] ?? 1;
  const f = FACTORS.forestType[forestType] ?? 1;
  const v = FACTORS.vegetation[vegetation] ?? 1;
  const perYear = a * BASE_RATE * s * r * f * v;
  const projection = Array.from({ length: 10 }, (_, i) => {
    const yr = i + 1; const maturity = 1 - Math.exp(-yr / 4);
    const carbon = +(perYear * yr * (0.6 + 0.4 * maturity)).toFixed(2);
    return { year: new Date().getFullYear() + i, carbon, credits: carbon, income: +(carbon * CREDIT_PRICE_USD).toFixed(2) };
  });
  return {
    estimatedCarbonPerYear: +perYear.toFixed(2),
    tenYearCarbon: +projection[9].carbon.toFixed(2),
    creditsPerYear: +perYear.toFixed(2),
    annualIncomeUSD: +(perYear * CREDIT_PRICE_USD).toFixed(2),
    tenYearIncomeUSD: +projection[9].income.toFixed(2),
    creditPrice: CREDIT_PRICE_USD,
    projection,
  };
}

/* ---------- auth helpers ---------- */
async function currentUser(req) {
  const token = getSessionToken(req);
  if (!token) return null;
  const db = await getDb();
  const session = await findActiveSession(db, token);
  if (!session) return null;
  const user = await db.collection('users').findOne({ id: session.userId });
  if (!user) return null;
  return publicUser(user);
}

function getSessionToken(req) {
  const auth = getAuthHeader(req);
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
  return req.cookies?.get?.('sc_session')?.value || null;
}

function withSessionCookie(response, token) {
  response.cookies.set('sc_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

function publicUser(user) {
  const publicFields = ['id', 'email', 'name', 'role', 'company', 'emailVerified', 'createdAt'];
  return Object.fromEntries(publicFields.filter((key) => user[key] !== undefined).map((key) => [key, user[key]]));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function clearSessionCookie(response) {
  response.cookies.set('sc_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}

const articleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160, 'Title must be 160 characters or fewer'),
  slug: z.string().trim().toLowerCase().min(1, 'Slug is required').max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers, and hyphens'),
  summary: z.string().trim().min(1, 'Summary is required').max(500, 'Summary must be 500 characters or fewer'),
  content: z.string().trim().min(1, 'Content is required').max(50000, 'Content must be 50,000 characters or fewer'),
  coverImageUrl: z.string().trim().max(2048).refine((value) => {
    if (!value) return true;
    try { return new URL(value).protocol === 'https:'; } catch { return false; }
  }, 'Cover image must be a valid HTTPS URL'),
  status: z.enum(['draft', 'published', 'unpublished']),
}).strict();

async function json(req) { try { return await req.json(); } catch { return {}; } }
function ok(data) { return NextResponse.json({ ok: true, ...data }); }
function err(msg, code=400) { return NextResponse.json({ ok: false, error: msg }, { status: code }); }

function getAuthHeader(req) {
  if (!req) return '';
  try {
    if (req.headers) {
      if (typeof req.headers.get === 'function') return req.headers.get('authorization') || '';
      // Node's IncomingMessage headers may be a plain object
      if (typeof req.headers === 'object') return req.headers.authorization || req.headers.Authorization || req.headers['authorization'] || '';
    }
    return '';
  } catch (e) {
    return '';
  }
}

/* ---------- router ---------- */
async function handle(req, params) {
  const segs = (await params)?.path || [];
  const route = segs.join('/');
  const method = req.method;

  try {
    /* Public */
    if (route === '' || route === 'health') return NextResponse.json({ ok: true, service: 'soilcredit', ts: Date.now() });

    if (route === 'news' && method === 'GET') {
      const db = await getDb();
      const articles = db.collection('newsArticles');
      await ensureNewsIndexes(articles);
      const published = await articles.find({ status: 'published' })
        .project({ _id: 0, id: 1, title: 1, slug: 1, summary: 1, coverImageUrl: 1, publishedAt: 1 })
        .sort({ publishedAt: -1 })
        .toArray();
      return ok({ articles: published });
    }

    const publicArticleMatch = route.match(/^news\/([^/]+)$/);
    if (publicArticleMatch && method === 'GET') {
      const db = await getDb();
      const articles = db.collection('newsArticles');
      await ensureNewsIndexes(articles);
      const article = await articles.findOne(
        { slug: publicArticleMatch[1], status: 'published' },
        { projection: { _id: 0, id: 1, title: 1, slug: 1, summary: 1, content: 1, coverImageUrl: 1, publishedAt: 1 } },
      );
      if (!article) return err('Article not found', 404);
      return ok({ article });
    }

    if (route === 'stats' && method === 'GET') {
      const db = await getDb();
      const [users, lands, purchases] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('lands').countDocuments(),
        db.collection('purchases').countDocuments(),
      ]);
      return ok({ users, lands, purchases, treesProtected: 1284000 + lands * 47, carbonCapturedT: 92000 + lands * 12, activeInvestors: 430 + users, countries: 42, creditPrice: CREDIT_PRICE_USD });
    }

    if (route === 'calculator' && method === 'POST') {
      const body = await json(req);
      const validOptions = {
        soil: Object.keys(FACTORS.soil),
        region: Object.keys(FACTORS.region),
        forestType: Object.keys(FACTORS.forestType),
        vegetation: Object.keys(FACTORS.vegetation),
      };
      const area = Number(body?.area);
      if (!Number.isFinite(area) || area <= 0 || area > 10000) return err('Land area must be between 0 and 10,000 hectares.', 400);
      for (const [field, allowed] of Object.entries(validOptions)) {
        if (!allowed.includes(body[field])) return err(`Unsupported ${field} value.`, 400);
      }
      const result = estimate({ ...body, area });
      const db = await getDb();
      await db.collection('calculations').insertOne({ id: uuidv4(), inputs: body, result, createdAt: new Date().toISOString() });
      return ok(result);
    }

    if (route === 'contact' && method === 'POST') {
      const body = await json(req); const db = await getDb();
      const doc = { id: uuidv4(), ...body, createdAt: new Date().toISOString() };
      await db.collection('contacts').insertOne(doc); return ok({ id: doc.id });
    }

    if (route === 'newsletter' && method === 'POST') {
      const body = await json(req); const db = await getDb();
      const doc = { id: uuidv4(), email: body.email, createdAt: new Date().toISOString() };
      await db.collection('newsletter').insertOne(doc); return ok({ id: doc.id });
    }

    /* ------ AUTH ------ */
    if (route === 'auth/signup' && method === 'POST') {
      const b = await json(req);
      const email = String(b.email || '').toLowerCase().trim();
      const password = String(b.password || '');
      const confirmPassword = String(b.confirmPassword || '');
      const name = String(b.name || '').trim();
      const role = ['landowner', 'company'].includes(b.role) ? b.role : 'landowner';
      const company = String(b.company || '').trim();
      if (!email || !password || !name) return err('Missing fields');
      if (!isValidEmail(email)) return err('Invalid email address');
      if (password.length < 8) return err('Password must be at least 8 characters');
      if (password !== confirmPassword) return err('Passwords do not match');
      const db = await getDb();
      const exists = await db.collection('users').findOne({ email });
      if (exists) return err('Email already registered');
      const { salt, hash } = hashPassword(password);
      const verificationCode = createVerificationCode();
      const user = {
        id: uuidv4(), email, name, role, company: role === 'company' ? company : null,
        salt, hash, emailVerified: false,
        emailVerificationCodeHash: hashToken(verificationCode),
        emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        emailVerificationLastSentAt: new Date().toISOString(),
        emailVerificationAttempts: 0,
        createdAt: new Date().toISOString(),
      };
      await sendEmail({
        to: email,
        subject: 'SoilCredit account verification',
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2 style="color:#2563eb">SoilCredit account verification</h2><p>Hello ${escapeHtml(name)},</p><p>Your verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#059669">${verificationCode}</p><p>Enter this 6-digit code in SoilCredit to verify your email address.</p><p style="color:#64748b">This code expires in 10 minutes. If you did not create this account, you can ignore this email.</p></div>`,
      });
      await db.collection('users').insertOne(user);
      return ok({ user: publicUser(user), emailSent: true });
    }

    if (route === 'auth/login' && method === 'POST') {
      const b = await json(req);
      const email = String(b.email || '').toLowerCase().trim();
      const password = String(b.password || '');
      const db = await getDb();
      const u = await db.collection('users').findOne({ email });
      if (!u) return err('Invalid credentials', 401);
      if (!verifyPassword(password, u.salt, u.hash)) return err('Invalid credentials', 401);
      if (u.emailVerified === false) return NextResponse.json({ ok: false, error: 'Please verify your email before signing in', code: 'EMAIL_NOT_VERIFIED', email: u.email }, { status: 403 });
      const token = uuidv4();
      await db.collection('sessions').insertOne(createSession(token, u.id));
      return withSessionCookie(ok({ token, user: publicUser(u) }), token);
    }

    if (route === 'auth/verify-email' && (method === 'POST' || method === 'GET')) {
      const body = method === 'POST' ? await json(req) : {};
      const query = new URL(req.url).searchParams;
      const email = String(body.email || query.get('email') || '').toLowerCase().trim();
      const code = String(body.code || '').trim();
      const legacyToken = String(body.token || query.get('token') || '');
      if (!email && !legacyToken) return err('Email is required');
      const db = await getDb();
      const user = legacyToken
        ? await db.collection('users').findOne({ emailVerificationToken: hashToken(legacyToken) })
        : await db.collection('users').findOne({ email });
      if (!user || user.emailVerified) return err('Invalid or expired verification code', 400);
      if (user.emailVerificationAttempts >= 5) return err('Too many incorrect attempts. Request a new code.', 429);
      const validLegacyToken = legacyToken && sameHash(user.emailVerificationToken, hashToken(legacyToken));
      const validCode = code.length === 6 && /^\d{6}$/.test(code) && sameHash(user.emailVerificationCodeHash, hashToken(code));
      if (!validLegacyToken && !validCode) {
        await db.collection('users').updateOne({ id: user.id }, { $inc: { emailVerificationAttempts: 1 } });
        return err('Invalid or expired verification code', 400);
      }
      if (!user.emailVerificationExpiresAt || new Date(user.emailVerificationExpiresAt) < new Date()) return err('Invalid or expired verification code', 400);
      await db.collection('users').updateOne({ id: user.id }, { $set: { emailVerified: true }, $unset: { emailVerificationCodeHash: '', emailVerificationToken: '', emailVerificationExpiresAt: '', emailVerificationLastSentAt: '', emailVerificationAttempts: '' } });
      const token = uuidv4();
      await db.collection('sessions').insertOne(createSession(token, user.id));
      return withSessionCookie(ok({ message: 'Email verified successfully', token, user: { ...publicUser(user), emailVerified: true } }), token);
    }

    if (route === 'auth/resend-verification' && method === 'POST') {
      const b = await json(req);
      const email = String(b.email || '').toLowerCase().trim();
      if (!isValidEmail(email)) return ok({ message: 'If an account requires verification, a new code has been sent.' });
      const db = await getDb();
      const user = await db.collection('users').findOne({ email });
      if (!user || user.emailVerified) return ok({ message: 'If an account requires verification, a new code has been sent.' });
      const lastSent = user.emailVerificationLastSentAt ? new Date(user.emailVerificationLastSentAt).getTime() : 0;
      if (Date.now() - lastSent < 60 * 1000) return err('Please wait before requesting another code.', 429);
      const code = createVerificationCode();
      await db.collection('users').updateOne({ id: user.id }, { $set: { emailVerificationCodeHash: hashToken(code), emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), emailVerificationLastSentAt: new Date().toISOString(), emailVerificationAttempts: 0 }, $unset: { emailVerificationToken: '' } });
      await sendEmail({
        to: email,
        subject: 'Your new SoilCredit verification code',
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2 style="color:#2563eb">SoilCredit account verification</h2><p>Your new verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#059669">${code}</p><p>Enter this 6-digit code in SoilCredit. It expires in 10 minutes.</p></div>`,
      });
      return ok({ message: 'If an account requires verification, a new code has been sent.' });
    }

    if (route === 'auth/forgot-password' && method === 'POST') {
      const b = await json(req);
      const email = String(b.email || '').toLowerCase().trim();
      if (!email) return err('Email is required');
      const db = await getDb();
      const user = await db.collection('users').findOne({ email });
      if (!user) return ok({ message: "If an account exists for this email, we've sent a password reset link." });
      const resetToken = createToken();
      const lastResetSent = user.passwordResetLastSentAt ? new Date(user.passwordResetLastSentAt).getTime() : 0;
      if (Date.now() - lastResetSent < 60 * 1000) return ok({ message: "If an account exists for this email, we've sent a password reset link." });
      await db.collection('users').updateOne({ id: user.id }, { $set: { passwordResetToken: hashToken(resetToken), passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), passwordResetLastSentAt: new Date().toISOString() } });
      const resetUrl = `${appUrl(req)}/reset-password?token=${encodeURIComponent(resetToken)}`;
      await sendEmail({
        to: email,
        subject: 'Reset your SoilCredit password',
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2 style="color:#2563eb">Reset your SoilCredit password</h2><p>We received a request to reset your password.</p><p><a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Reset password</a></p><p style="color:#64748b">This link expires in 30 minutes and can only be used once. If you did not request this, you can ignore this email.</p></div>`,
      });
      return ok({ message: "If an account exists for this email, we've sent a password reset link." });
    }

    if (route === 'auth/reset-password' && method === 'POST') {
      const b = await json(req);
      const token = String(b.token || '');
      const password = String(b.password || '');
      if (!token || !password) return err('Token and password are required');
      if (password.length < 8) return err('Password must be at least 8 characters');
      const db = await getDb();
      const user = await db.collection('users').findOne({ passwordResetToken: hashToken(token) });
      if (!user || !user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt) < new Date()) return err('Reset link is invalid or expired', 400);
      const { salt, hash } = hashPassword(password);
      await db.collection('users').updateOne({ id: user.id }, { $set: { salt, hash }, $unset: { passwordResetToken: '', passwordResetExpiresAt: '' } });
      await db.collection('sessions').deleteMany({ userId: user.id });
      return clearSessionCookie(ok({ message: 'Password reset successfully' }));
    }

    if (route === 'auth/me' && method === 'GET') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      return withSessionCookie(ok({ user: u }), getSessionToken(req));
    }

    if (route === 'auth/logout' && method === 'POST') {
      const token = getSessionToken(req);
      if (token) { const db = await getDb(); await db.collection('sessions').deleteOne({ token }); }
      return clearSessionCookie(ok({}));
    }

    const adminNewsMatch = route.match(/^admin\/news(?:\/([^/]+)(?:\/(publish|unpublish))?)?$/);
    if (adminNewsMatch) {
      const user = await currentUser(req);
      if (!user) return err('Unauthenticated', 401);
      if (user.role !== 'admin') return err('Forbidden', 403);

      const db = await getDb();
      const articles = db.collection('newsArticles');
      await ensureNewsIndexes(articles);
      const id = adminNewsMatch[1];
      const action = adminNewsMatch[2];

      if (!id && method === 'GET') {
        const allArticles = await articles.find({})
          .project({ _id: 0 })
          .sort({ updatedAt: -1 })
          .toArray();
        return ok({ articles: allArticles });
      }

      if (!id && method === 'POST') {
        const parsed = articleSchema.safeParse(await json(req));
        if (!parsed.success) return err(parsed.error.issues[0].message, 400);
        const now = new Date().toISOString();
        const article = {
          id: uuidv4(),
          ...parsed.data,
          publishedAt: parsed.data.status === 'published' ? now : null,
          createdAt: now,
          updatedAt: now,
        };
        await articles.insertOne(article);
        const { _id, ...savedArticle } = article;
        return ok({ article: savedArticle });
      }

      if (id && !action && method === 'GET') {
        const article = await articles.findOne({ id }, { projection: { _id: 0 } });
        if (!article) return err('Article not found', 404);
        return ok({ article });
      }

      if (id && !action && method === 'PUT') {
        const parsed = articleSchema.safeParse(await json(req));
        if (!parsed.success) return err(parsed.error.issues[0].message, 400);
        const existing = await articles.findOne({ id });
        if (!existing) return err('Article not found', 404);
        const now = new Date().toISOString();
        const publishedAt = parsed.data.status === 'published'
          ? (existing.status === 'published' ? existing.publishedAt : now)
          : (existing.publishedAt || null);
        await articles.updateOne({ id }, { $set: { ...parsed.data, publishedAt, updatedAt: now } });
        const updated = await articles.findOne({ id }, { projection: { _id: 0 } });
        return ok({ article: updated });
      }

      if (id && action && method === 'POST') {
        const now = new Date().toISOString();
        const status = action === 'publish' ? 'published' : 'unpublished';
        const update = {
          status,
          updatedAt: now,
          ...(status === 'published' ? { publishedAt: now } : {}),
        };
        const result = await articles.updateOne({ id }, { $set: update });
        if (!result.matchedCount) return err('Article not found', 404);
        const updated = await articles.findOne({ id }, { projection: { _id: 0 } });
        return ok({ article: updated });
      }

      if (id && !action && method === 'DELETE') {
        const result = await articles.deleteOne({ id });
        if (!result.deletedCount) return err('Article not found', 404);
        return ok({});
      }

      return err('Not found', 404);
    }

    /* ------ LANDS (landowner-scoped CRUD) ------ */
    if (route === 'lands' && method === 'GET') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      const db = await getDb();
      const lands = await db.collection('lands').find({ ownerId: u.id }).sort({ createdAt: -1 }).toArray();
      return ok({ lands });
    }

    if (route === 'lands' && method === 'POST') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      if (u.role !== 'landowner') return err('Only landowners can add land', 403);
      const b = await json(req);
      const coordinatesProvided = b.locationCoordinates !== undefined || b.locationDetails !== undefined;
      const locationCoordinates = b.locationCoordinates || b.locationDetails || null;
      if (!locationCoordinates || !Number.isFinite(Number(locationCoordinates.latitude)) || !Number.isFinite(Number(locationCoordinates.longitude))) {
        return err('Please select the location of your land on the map.', 400);
      }
      const area = Number(b.area);
      if (!Number.isFinite(area) || area <= 0) return err('Land area must be a positive number.', 400);
      if (b.name !== undefined && (typeof b.name !== 'string' || !b.name.trim())) return err('Land name is required.', 400);
      if (b.country && !SUPPORTED_LAND_COUNTRIES.includes(b.country)) return err('Unsupported land country.', 400);
      if (Number(locationCoordinates.latitude) < -90 || Number(locationCoordinates.latitude) > 90 || Number(locationCoordinates.longitude) < -180 || Number(locationCoordinates.longitude) > 180) {
        return err('Land coordinates are outside the valid range.', 400);
      }
      if (b.soil && !['sandy', 'loamy', 'clay', 'peat', 'silty'].includes(b.soil)) return err('Unsupported soil type.', 400);
      if (b.region && !['caspian', 'temperate', 'tropical', 'arid', 'mediterranean', 'boreal'].includes(b.region)) return err('Unsupported region.', 400);
      if (b.forestType && !['primary', 'secondary', 'plantation', 'agroforestry', 'grassland', 'wetland'].includes(b.forestType)) return err('Unsupported vegetation type.', 400);
      if (b.vegetation && !['sparse', 'moderate', 'dense', 'veryDense'].includes(b.vegetation)) return err('Unsupported vegetation density.', 400);
      if (Array.isArray(b.images) && b.images.length > 3) return err('You can upload a maximum of 3 images.', 400);
      const locationText = b.location || [b.city, b.country].filter(Boolean).join(', ') || '';
      const safeImages = Array.isArray(b.images) ? b.images.slice(0, 3).map((img, index) => ({
        id: img?.id || `img-${index}`,
        name: img?.name || `land-image-${index + 1}`,
        type: img?.type || 'image/jpeg',
        size: Number(img?.size) || 0,
        dataUrl: img?.dataUrl || img?.url || '',
      })).filter((img) => img.dataUrl) : [];
      const est = estimate({ area: b.area, soil: b.soil, region: b.region, forestType: b.forestType, vegetation: b.vegetation });
      const land = {
        id: uuidv4(), ownerId: u.id, ownerName: u.name,
        name: typeof b.name === 'string' ? b.name.trim() : 'Untitled Plot',
        country: b.country || 'Azerbaijan',
        city: b.city || 'Baku',
        location: locationText,
        locationCoordinates: {
          latitude: Number(locationCoordinates.latitude),
          longitude: Number(locationCoordinates.longitude),
        },
        locationDetails: {
          country: b.country || 'Azerbaijan',
          city: b.city || 'Baku',
          latitude: Number(locationCoordinates.latitude),
          longitude: Number(locationCoordinates.longitude),
        },
        images: safeImages,
        area,
        soil: b.soil || 'loamy',
        region: b.region || 'temperate',
        forestType: b.forestType || 'primary',
        vegetation: b.vegetation || 'moderate',
        description: b.description || '',
        estimate: est,
        carbonEntries: [],
        forSale: false,
        priceCredit: CREDIT_PRICE_USD,
        creditsAvailable: 0,
        creditsSold: 0,
        createdAt: new Date().toISOString(),
      };
      const db = await getDb();
      await db.collection('lands').insertOne(land);
      return ok({ land });
    }

    const landIdMatch = route.match(/^lands\/([^/]+)$/);
    if (landIdMatch) {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      const id = landIdMatch[1]; const db = await getDb();
      const land = await db.collection('lands').findOne({ id });
      if (!land) return err('Land not found', 404);
      if (land.ownerId !== u.id) return err('Forbidden', 403);
      if (method === 'PUT') {
        const b = await json(req);
        const upd = {};
        const safeImages = Array.isArray(b.images) ? b.images.slice(0, 3).map((img, index) => ({
          id: img?.id || `img-${index}`,
          name: img?.name || `land-image-${index + 1}`,
          type: img?.type || 'image/jpeg',
          size: Number(img?.size) || 0,
          dataUrl: img?.dataUrl || img?.url || '',
        })).filter((img) => img.dataUrl) : undefined;
        if (Array.isArray(b.images) && b.images.length > 3) return err('You can upload a maximum of 3 images.', 400);
        const locationCoordinates = b.locationCoordinates || b.locationDetails || null;
        const locationText = b.location || [b.city, b.country].filter(Boolean).join(', ') || '';
        if (b.name !== undefined && (typeof b.name !== 'string' || !b.name.trim())) return err('Land name is required.', 400);
        if (b.area !== undefined && (!Number.isFinite(Number(b.area)) || Number(b.area) <= 0)) return err('Land area must be a positive number.', 400);
        if (b.country !== undefined && !SUPPORTED_LAND_COUNTRIES.includes(b.country)) return err('Unsupported land country.', 400);
        if (b.priceCredit !== undefined && (!Number.isFinite(Number(b.priceCredit)) || Number(b.priceCredit) <= 0)) return err('Credit price must be a positive number.', 400);
        if (b.forSale !== undefined && typeof b.forSale !== 'boolean') return err('forSale must be a boolean.', 400);
        if (b.soil !== undefined && !['sandy', 'loamy', 'clay', 'peat', 'silty'].includes(b.soil)) return err('Unsupported soil type.', 400);
        if (b.region !== undefined && !['caspian', 'temperate', 'tropical', 'arid', 'mediterranean', 'boreal'].includes(b.region)) return err('Unsupported region.', 400);
        if (b.forestType !== undefined && !['primary', 'secondary', 'plantation', 'agroforestry', 'grassland', 'wetland'].includes(b.forestType)) return err('Unsupported vegetation type.', 400);
        if (b.vegetation !== undefined && !['sparse', 'moderate', 'dense', 'veryDense'].includes(b.vegetation)) return err('Unsupported vegetation density.', 400);
        ['name','country','city','location','area','soil','region','forestType','vegetation','description','priceCredit','forSale'].forEach(k => {
          if (b[k] !== undefined) upd[k] = k === 'area' || k === 'priceCredit' ? Number(b[k]) : k === 'name' ? b[k].trim() : b[k];
        });
        if (coordinatesProvided && (!locationCoordinates || !Number.isFinite(Number(locationCoordinates.latitude)) || !Number.isFinite(Number(locationCoordinates.longitude)))) {
          return err('Please select the location of your land on the map.', 400);
        }
        if (locationCoordinates) {
          if (Number(locationCoordinates.latitude) < -90 || Number(locationCoordinates.latitude) > 90 || Number(locationCoordinates.longitude) < -180 || Number(locationCoordinates.longitude) > 180) {
            return err('Land coordinates are outside the valid range.', 400);
          }
          upd.locationCoordinates = { latitude: Number(locationCoordinates.latitude), longitude: Number(locationCoordinates.longitude) };
          upd.locationDetails = {
            country: b.country || land.country || 'Azerbaijan',
            city: b.city || land.city || 'Baku',
            latitude: Number(locationCoordinates.latitude),
            longitude: Number(locationCoordinates.longitude),
          };
        } else if (land.locationCoordinates) {
          upd.locationCoordinates = land.locationCoordinates;
          upd.locationDetails = land.locationDetails || { country: land.country || 'Azerbaijan', city: land.city || 'Baku', latitude: land.locationCoordinates.latitude, longitude: land.locationCoordinates.longitude };
        } else if (b.locationCoordinates !== undefined || b.locationDetails !== undefined) {
          return err('Please select the location of your land on the map.', 400);
        }
        if (locationText) upd.location = locationText;
        if (safeImages) upd.images = safeImages;
        if (['area','soil','region','forestType','vegetation'].some(k => k in upd)) {
          const merged = { ...land, ...upd };
          upd.estimate = estimate(merged);
        }
        upd.updatedAt = new Date().toISOString();
        await db.collection('lands').updateOne({ id }, { $set: upd });
        const updated = await db.collection('lands').findOne({ id });
        return ok({ land: updated });
      }
      if (method === 'DELETE') {
        await db.collection('lands').deleteOne({ id });
        return ok({});
      }
      if (method === 'GET') return ok({ land });
    }

    /* ------ CARBON entries (nested under land) ------ */
    const carbonAdd = route.match(/^lands\/([^/]+)\/carbon$/);
    if (carbonAdd && method === 'POST') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      const db = await getDb(); const land = await db.collection('lands').findOne({ id: carbonAdd[1] });
      if (!land) return err('Not found', 404); if (land.ownerId !== u.id) return err('Forbidden', 403);
      const b = await json(req);
      const tCO2 = Number(b.tCO2);
      const entryDate = b.date || new Date().toISOString().slice(0, 10);
      const method = b.method || 'satellite';
      if (!Number.isFinite(tCO2) || tCO2 <= 0) return err('Carbon amount must be a positive number.', 400);
      const parsedEntryDate = new Date(`${entryDate}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate) || Number.isNaN(parsedEntryDate.getTime()) || parsedEntryDate.toISOString().slice(0, 10) !== entryDate) return err('Carbon entry date must use YYYY-MM-DD.', 400);
      if (typeof method !== 'string' || !['satellite', 'in-situ', 'lidar', 'drone'].includes(method)) return err('Unsupported carbon measurement method.', 400);
      if (b.note !== undefined && (typeof b.note !== 'string' || b.note.length > 1000)) return err('Carbon entry note must be 1,000 characters or fewer.', 400);
      const entry = { id: uuidv4(), date: entryDate, tCO2, note: b.note || '', method };
      const entries = [...(land.carbonEntries || []), entry];
      const total = entries.reduce((a, e) => a + (e.tCO2 || 0), 0);
      await db.collection('lands').updateOne({ id: land.id }, { $set: { carbonEntries: entries, creditsAvailable: total - (land.creditsSold || 0) } });
      return ok({ entry, totalCredits: total });
    }

    const carbonDel = route.match(/^lands\/([^/]+)\/carbon\/([^/]+)$/);
    if (carbonDel && method === 'DELETE') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      const db = await getDb(); const land = await db.collection('lands').findOne({ id: carbonDel[1] });
      if (!land) return err('Not found', 404); if (land.ownerId !== u.id) return err('Forbidden', 403);
      const entries = (land.carbonEntries || []).filter(e => e.id !== carbonDel[2]);
      const total = entries.reduce((a, e) => a + (e.tCO2 || 0), 0);
      if (total < (land.creditsSold || 0)) return err('This entry cannot be removed because some credits have already been purchased.', 409);
      await db.collection('lands').updateOne({ id: land.id }, { $set: { carbonEntries: entries, creditsAvailable: total - (land.creditsSold || 0) } });
      return ok({ totalCredits: total });
    }

    /* ------ MARKETPLACE (public listings for sale) ------ */
    if (route === 'marketplace' && method === 'GET') {
      const db = await getDb();
      const lands = await db.collection('lands').find({ forSale: true })
        .project({
          _id: 0,
          id: 1,
          name: 1,
          ownerName: 1,
          country: 1,
          city: 1,
          location: 1,
          locationCoordinates: 1,
          images: 1,
          area: 1,
          soil: 1,
          region: 1,
          forestType: 1,
          vegetation: 1,
          description: 1,
          estimate: 1,
          forSale: 1,
          priceCredit: 1,
          creditsAvailable: 1,
          creditsSold: 1,
          createdAt: 1,
        })
        .sort({ createdAt: -1 })
        .toArray();
      return ok({ listings: lands });
    }

    /* ------ PURCHASE (company only) ------ */
    if (route === 'purchase' && method === 'POST') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      if (u.role !== 'company') return err('Only companies can purchase credits', 403);
      const b = await json(req);
      const landId = typeof b.landId === 'string' ? b.landId : '';
      const qty = Number(b.quantity);
      if (!landId || !Number.isSafeInteger(qty) || qty < 1) return err('A land ID and a positive whole-number quantity are required.', 400);
      const db = await getDb();
      const land = await db.collection('lands').findOne({ id: landId });
      if (!land || !land.forSale) return err('Not available', 404);
      const available = (land.creditsAvailable || 0);
      if (qty > available) return err('Not enough credits available');
      const pricePerCredit = Number(land.priceCredit || CREDIT_PRICE_USD);
      if (!Number.isFinite(pricePerCredit) || pricePerCredit <= 0) return err('This listing has an invalid credit price.', 409);
      const total = qty * pricePerCredit;
      if (!Number.isFinite(total)) return err('Purchase total is outside the supported range.', 400);
      const purchase = { id: uuidv4(), companyId: u.id, companyName: u.company || u.name, landId, landName: land.name, ownerId: land.ownerId, quantity: qty, pricePerCredit, totalUSD: +total.toFixed(2), createdAt: new Date().toISOString() };
      const reservation = await db.collection('lands').updateOne(
        { id: landId, forSale: true, creditsAvailable: { $gte: qty } },
        { $inc: { creditsAvailable: -qty, creditsSold: qty } },
      );
      if (!reservation.matchedCount) return err('Not enough credits available.', 409);
      try {
        await db.collection('purchases').insertOne(purchase);
      } catch (purchaseError) {
        try {
          await db.collection('lands').updateOne({ id: landId }, { $inc: { creditsAvailable: qty, creditsSold: -qty } });
        } catch (rollbackError) {
          console.error('Purchase inventory rollback failed:', { landId, message: rollbackError.message });
        }
        throw purchaseError;
      }
      return ok({ purchase });
    }

    if (route === 'purchases' && method === 'GET') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      const db = await getDb();
      const query = u.role === 'company' ? { companyId: u.id } : { ownerId: u.id };
      const purchases = await db.collection('purchases').find(query).sort({ createdAt: -1 }).toArray();
      return ok({ purchases });
    }

    return err('Not found', 404);
  } catch (e) {
    if (e?.code === 11000 && route.startsWith('admin/news')) return err('An article with this slug already exists.', 409);
    console.error('API error:', { route, method, message: e.message });
    return NextResponse.json({ ok: false, error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}

export async function GET(req, ctx) { return handle(req, ctx.params); }
export async function POST(req, ctx) { return handle(req, ctx.params); }
export async function PUT(req, ctx) { return handle(req, ctx.params); }
export async function DELETE(req, ctx) { return handle(req, ctx.params); }
export async function PATCH(req, ctx) { return handle(req, ctx.params); }
