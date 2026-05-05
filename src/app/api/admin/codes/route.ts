import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  return request.cookies.get(COOKIE_NAME)?.value === getExpectedToken();
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const codes = await prisma.accessCode.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(codes);
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { label } = await request.json();

  const code = Math.random().toString(36).slice(2, 7).toUpperCase() +
               Math.random().toString(36).slice(2, 7).toUpperCase();

  const created = await prisma.accessCode.create({ data: { code, label: label?.trim() || null } });
  return NextResponse.json(created, { status: 201 });
}
