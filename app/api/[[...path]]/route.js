import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import crypto from 'crypto';

const DB_NAME = process.env.DB_NAME && process.env.DB_NAME !== 'soilcredit' ? process.env.DB_NAME : 'soilcredit';
let cached = null;
async function getDb() {
  if (!cached) { cached = new MongoClient(process.env.MONGO_URL); await cached.connect(); }
  return cached.db(DB_NAME);
}

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
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) return false;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'SoilCredit <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message || 'Email could not be sent');
  return true;
}
function appUrl(req) {
  const configuredUrl = process.env.APP_URL?.trim();
  if (!configuredUrl) return new URL(req.url).origin;
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
    return { year: 2025 + i, carbon, credits: carbon, income: +(carbon * CREDIT_PRICE_USD).toFixed(2) };
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
  const auth = getAuthHeader(req);
  const token = (typeof auth === 'string' && auth.startsWith('Bearer ')) ? auth.slice(7) : null;
  if (!token) return null;
  const db = await getDb();
  const session = await db.collection('sessions').findOne({ token });
  if (!session) return null;
  const user = await db.collection('users').findOne({ id: session.userId });
  if (!user) return null;
  const { hash, salt, _id, ...pub } = user; return pub;
}

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
      const body = await json(req); const result = estimate(body);
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
      const name = String(b.name || '').trim();
      const role = ['landowner', 'company'].includes(b.role) ? b.role : 'landowner';
      const company = String(b.company || '').trim();
      if (!email || !password || !name) return err('Missing fields');
      if (password.length < 6) return err('Password too short');
      const db = await getDb();
      const exists = await db.collection('users').findOne({ email });
      if (exists) return err('Email already registered');
      const { salt, hash } = hashPassword(password);
      const verificationToken = createToken();
      const user = {
        id: uuidv4(), email, name, role, company: role === 'company' ? company : null,
        salt, hash, emailVerified: false,
        emailVerificationToken: hashToken(verificationToken),
        emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      await db.collection('users').insertOne(user);
      const { hash: _h, salt: _s, emailVerificationToken: _vt, emailVerificationExpiresAt: _ve, _id, ...pub } = user;
      const verificationUrl = `${appUrl(req)}/api/auth/verify-email?token=${verificationToken}`;
      const emailSent = await sendEmail({
        to: email,
        subject: 'Verify your SoilCredit email',
        html: `<p>Hello ${name},</p><p>Verify your SoilCredit email by clicking the link below:</p><p><a href="${verificationUrl}">Verify email</a></p><p>This link expires in 24 hours.</p>`,
      });
      return ok({ user: pub, ...(emailSent ? { emailSent: true } : { verificationUrl, emailSent: false }) });
    }

    if (route === 'auth/login' && method === 'POST') {
      const b = await json(req);
      const email = String(b.email || '').toLowerCase().trim();
      const password = String(b.password || '');
      const db = await getDb();
      const u = await db.collection('users').findOne({ email });
      if (!u) return err('Invalid credentials', 401);
      if (!verifyPassword(password, u.salt, u.hash)) return err('Invalid credentials', 401);
      if (u.emailVerified === false) return err('Please verify your email before signing in', 403);
      const token = uuidv4();
      await db.collection('sessions').insertOne({ token, userId: u.id, createdAt: new Date().toISOString() });
      const { hash: _h, salt: _s, _id, ...pub } = u;
      return ok({ token, user: pub });
    }

    if (route === 'auth/verify-email' && (method === 'POST' || method === 'GET')) {
      const body = method === 'POST' ? await json(req) : {};
      const token = String(body.token || new URL(req.url).searchParams.get('token') || '');
      if (!token) return err('Verification token is required');
      const db = await getDb();
      const user = await db.collection('users').findOne({ emailVerificationToken: hashToken(token) });
      if (!user || !user.emailVerificationExpiresAt || new Date(user.emailVerificationExpiresAt) < new Date()) return err('Verification link is invalid or expired', 400);
      await db.collection('users').updateOne({ id: user.id }, { $set: { emailVerified: true }, $unset: { emailVerificationToken: '', emailVerificationExpiresAt: '' } });
      return ok({ message: 'Email verified successfully' });
    }

    if (route === 'auth/forgot-password' && method === 'POST') {
      const b = await json(req);
      const email = String(b.email || '').toLowerCase().trim();
      if (!email) return err('Email is required');
      const db = await getDb();
      const user = await db.collection('users').findOne({ email });
      if (!user) return ok({ message: 'If the email exists, a reset link has been created' });
      const resetToken = createToken();
      await db.collection('users').updateOne({ id: user.id }, { $set: { passwordResetToken: hashToken(resetToken), passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() } });
      const resetUrl = `${appUrl(req)}/?resetToken=${resetToken}`;
      const emailSent = await sendEmail({
        to: email,
        subject: 'Reset your SoilCredit password',
        html: `<p>We received a request to reset your SoilCredit password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 1 hour.</p>`,
      });
      return ok({ message: 'If the email exists, a reset link has been created', ...(emailSent ? { emailSent: true } : { resetUrl, emailSent: false }) });
    }

    if (route === 'auth/reset-password' && method === 'POST') {
      const b = await json(req);
      const token = String(b.token || '');
      const password = String(b.password || '');
      if (!token || !password) return err('Token and password are required');
      if (password.length < 6) return err('Password too short');
      const db = await getDb();
      const user = await db.collection('users').findOne({ passwordResetToken: hashToken(token) });
      if (!user || !user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt) < new Date()) return err('Reset link is invalid or expired', 400);
      const { salt, hash } = hashPassword(password);
      await db.collection('users').updateOne({ id: user.id }, { $set: { salt, hash }, $unset: { passwordResetToken: '', passwordResetExpiresAt: '' } });
      await db.collection('sessions').deleteMany({ userId: user.id });
      return ok({ message: 'Password reset successfully' });
    }

    if (route === 'auth/me' && method === 'GET') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      return ok({ user: u });
    }

    if (route === 'auth/logout' && method === 'POST') {
      const auth = getAuthHeader(req);
      const token = (typeof auth === 'string' && auth.startsWith('Bearer ')) ? auth.slice(7) : null;
      if (token) { const db = await getDb(); await db.collection('sessions').deleteOne({ token }); }
      return ok({});
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
      const est = estimate({ area: b.area, soil: b.soil, region: b.region, forestType: b.forestType, vegetation: b.vegetation });
      const land = {
        id: uuidv4(), ownerId: u.id, ownerName: u.name,
        name: b.name || 'Untitled Plot',
        location: b.location || '',
        area: Number(b.area) || 0,
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
        ['name','location','area','soil','region','forestType','vegetation','description','priceCredit','forSale','creditsAvailable'].forEach(k => { if (b[k] !== undefined) upd[k] = b[k]; });
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
      const entry = { id: uuidv4(), date: b.date || new Date().toISOString().slice(0,10), tCO2: Number(b.tCO2) || 0, note: b.note || '', method: b.method || 'satellite' };
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
      await db.collection('lands').updateOne({ id: land.id }, { $set: { carbonEntries: entries, creditsAvailable: total - (land.creditsSold || 0) } });
      return ok({ totalCredits: total });
    }

    /* ------ MARKETPLACE (public listings for sale) ------ */
    if (route === 'marketplace' && method === 'GET') {
      const db = await getDb();
      const lands = await db.collection('lands').find({ forSale: true }).sort({ createdAt: -1 }).toArray();
      return ok({ listings: lands });
    }

    /* ------ PURCHASE (company only) ------ */
    if (route === 'purchase' && method === 'POST') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      if (u.role !== 'company') return err('Only companies can purchase credits', 403);
      const b = await json(req);
      const landId = b.landId; const qty = Math.max(1, Number(b.quantity) || 1);
      const db = await getDb();
      const land = await db.collection('lands').findOne({ id: landId });
      if (!land || !land.forSale) return err('Not available', 404);
      const available = (land.creditsAvailable || 0);
      if (qty > available) return err('Not enough credits available');
      const total = qty * (land.priceCredit || CREDIT_PRICE_USD);
      const purchase = { id: uuidv4(), companyId: u.id, companyName: u.company || u.name, landId, landName: land.name, ownerId: land.ownerId, quantity: qty, pricePerCredit: land.priceCredit || CREDIT_PRICE_USD, totalUSD: +total.toFixed(2), createdAt: new Date().toISOString() };
      await db.collection('purchases').insertOne(purchase);
      await db.collection('lands').updateOne({ id: land.id }, { $set: { creditsSold: (land.creditsSold || 0) + qty, creditsAvailable: available - qty } });
      return ok({ purchase });
    }

    if (route === 'purchases' && method === 'GET') {
      const u = await currentUser(req); if (!u) return err('Unauthenticated', 401);
      const db = await getDb();
      const query = u.role === 'company' ? { companyId: u.id } : { ownerId: u.id };
      const purchases = await db.collection('purchases').find(query).sort({ createdAt: -1 }).toArray();
      return ok({ purchases });
    }

    return err('Not found: ' + route, 404);
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function GET(req, ctx) { return handle(req, ctx.params); }
export async function POST(req, ctx) { return handle(req, ctx.params); }
export async function PUT(req, ctx) { return handle(req, ctx.params); }
export async function DELETE(req, ctx) { return handle(req, ctx.params); }
export async function PATCH(req, ctx) { return handle(req, ctx.params); }
