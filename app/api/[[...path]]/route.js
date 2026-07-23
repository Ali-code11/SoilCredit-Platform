import { NextResponse } from 'next/server';

export async function GET(_req, { params }) {
  const path = (await params)?.path || [];
  return NextResponse.json({ ok: true, service: 'soilcredit', path });
}

export async function POST(_req, { params }) {
  const path = (await params)?.path || [];
  return NextResponse.json({ ok: true, service: 'soilcredit', path });
}
