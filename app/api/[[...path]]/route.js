import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = process.env.DB_NAME && process.env.DB_NAME !== 'your_database_name' ? process.env.DB_NAME : 'soilcredit';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(DB_NAME);
}

/* ---------- Carbon estimation formula (IPCC Tier‑1 approximation) ---------- */
const FACTORS = {
  soil: { sandy: 0.6, loamy: 1.0, clay: 1.2, peat: 1.8, silty: 0.9 },
  region: { tropical: 1.4, temperate: 1.0, boreal: 0.7, arid: 0.5, mediterranean: 0.9 },
  forestType: { primary: 1.5, secondary: 1.1, plantation: 0.8, agroforestry: 1.0, grassland: 0.6, wetland: 1.6 },
  vegetation: { sparse: 0.5, moderate: 0.9, dense: 1.3, veryDense: 1.55 },
};
const BASE_RATE = 4.5; // tCO2/ha/year baseline
const CREDIT_PRICE_USD = 42.8;

function estimate({ area, soil, region, forestType, vegetation }) {
  const a = Number(area) || 0;
  const s = FACTORS.soil[soil] ?? 1;
  const r = FACTORS.region[region] ?? 1;
  const f = FACTORS.forestType[forestType] ?? 1;
  const v = FACTORS.vegetation[vegetation] ?? 1;
  const perYear = a * BASE_RATE * s * r * f * v;
  const credits = perYear;
  const income = credits * CREDIT_PRICE_USD;
  // 10 year projection
  const projection = Array.from({ length: 10 }, (_, i) => {
    const yr = i + 1;
    const maturity = 1 - Math.exp(-yr / 4);
    return {
      year: 2025 + i,
      carbon: +(perYear * yr * (0.6 + 0.4 * maturity)).toFixed(2),
      credits: +(perYear * yr * (0.6 + 0.4 * maturity)).toFixed(2),
      income: +(perYear * yr * (0.6 + 0.4 * maturity) * CREDIT_PRICE_USD).toFixed(2),
    };
  });
  return {
    estimatedCarbonPerYear: +perYear.toFixed(2),
    tenYearCarbon: +projection[9].carbon.toFixed(2),
    creditsPerYear: +credits.toFixed(2),
    annualIncomeUSD: +income.toFixed(2),
    tenYearIncomeUSD: +projection[9].income.toFixed(2),
    creditPrice: CREDIT_PRICE_USD,
    projection,
  };
}

/* ---------- Seed data ---------- */
const MARKETPLACE_SEED = [
  { id: 'SC-4821', title: 'Amazonian Rainforest Corridor', owner: 'Sitio Verde Cooperative', location: 'Pará, Brazil', area: 2840, price: 42.8, esg: 96, credits: 12800, status: 'verified', category: 'Primary Forest', tag: 'Gold', flag: '🇧🇷' },
  { id: 'SC-3392', title: 'Serengeti Grassland Restoration', owner: 'Maasai Conservancy Trust', location: 'Arusha, Tanzania', area: 5100, price: 38.5, esg: 92, credits: 9400, status: 'verified', category: 'Grassland', tag: 'Verra', flag: '🇹🇿' },
  { id: 'SC-2110', title: 'Boreal Peatland Sanctuary', owner: 'North Karelia Estate', location: 'Karelia, Finland', area: 1780, price: 55.2, esg: 98, credits: 15200, status: 'trending', category: 'Peatland', tag: 'Gold', flag: '🇫🇮' },
  { id: 'SC-5620', title: 'Andean Cloud Forest', owner: 'Fundación Nublado', location: 'Cusco, Peru', area: 940, price: 48.9, esg: 94, credits: 6100, status: 'verified', category: 'Cloud Forest', tag: 'CCB', flag: '🇵🇪' },
  { id: 'SC-7710', title: 'Mangrove Blue Carbon', owner: 'Sundarbans Collective', location: 'Khulna, Bangladesh', area: 620, price: 61.4, esg: 99, credits: 4200, status: 'hot', category: 'Mangrove', tag: 'Verra', flag: '🇧🇩' },
  { id: 'SC-8834', title: 'Regenerative Agroforestry Farm', owner: 'Kikuyu Farmers Union', location: 'Nyeri, Kenya', area: 3400, price: 35.7, esg: 89, credits: 7800, status: 'new', category: 'Agroforestry', tag: 'Plan Vivo', flag: '🇰🇪' },
];

/* ---------- Router ---------- */
async function json(req) { try { return await req.json(); } catch { return {}; } }

async function handle(req, params) {
  const segs = (await params)?.path || [];
  const route = segs.join('/');
  const method = req.method;

  try {
    if (route === '' || route === 'health') {
      return NextResponse.json({ ok: true, service: 'soilcredit', ts: Date.now() });
    }

    if (route === 'stats' && method === 'GET') {
      const db = await getDb();
      const [calcs, contacts, lands] = await Promise.all([
        db.collection('calculations').countDocuments(),
        db.collection('contacts').countDocuments(),
        db.collection('lands').countDocuments(),
      ]);
      return NextResponse.json({
        treesProtected: 1284000 + lands * 47,
        carbonCapturedT: 92000 + calcs * 12,
        registeredLands: 7420 + lands,
        activeInvestors: 430 + Math.floor(contacts / 3),
        countries: 42,
        creditPrice: CREDIT_PRICE_USD,
      });
    }

    if (route === 'marketplace' && method === 'GET') {
      return NextResponse.json({ listings: MARKETPLACE_SEED });
    }

    if (route === 'calculator' && method === 'POST') {
      const body = await json(req);
      const result = estimate(body);
      const db = await getDb();
      const doc = { id: uuidv4(), inputs: body, result, createdAt: new Date().toISOString() };
      await db.collection('calculations').insertOne(doc);
      return NextResponse.json({ ok: true, id: doc.id, ...result });
    }

    if (route === 'contact' && method === 'POST') {
      const body = await json(req);
      const db = await getDb();
      const doc = { id: uuidv4(), ...body, createdAt: new Date().toISOString() };
      await db.collection('contacts').insertOne(doc);
      return NextResponse.json({ ok: true, id: doc.id });
    }

    if (route === 'land' && method === 'POST') {
      const body = await json(req);
      const db = await getDb();
      const doc = { id: uuidv4(), ...body, status: 'pending', createdAt: new Date().toISOString() };
      await db.collection('lands').insertOne(doc);
      return NextResponse.json({ ok: true, id: doc.id });
    }

    if (route === 'newsletter' && method === 'POST') {
      const body = await json(req);
      const db = await getDb();
      const doc = { id: uuidv4(), email: body.email, createdAt: new Date().toISOString() };
      await db.collection('newsletter').insertOne(doc);
      return NextResponse.json({ ok: true, id: doc.id });
    }

    return NextResponse.json({ ok: false, error: 'Not found', route }, { status: 404 });
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function GET(req, ctx) { return handle(req, ctx.params); }
export async function POST(req, ctx) { return handle(req, ctx.params); }
export async function PUT(req, ctx) { return handle(req, ctx.params); }
export async function DELETE(req, ctx) { return handle(req, ctx.params); }
