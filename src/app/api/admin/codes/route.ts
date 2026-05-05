import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function isAdmin() {
  return cookies().get('admin_session')?.value === process.env.ADMIN_SECRET;
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const codes = await prisma.accessCode.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(codes);
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { label } = await req.json();

  // Generate a random 10-character alphanumeric code
  const code = Math.random().toString(36).slice(2, 7).toUpperCase() +
               Math.random().toString(36).slice(2, 7).toUpperCase();

  const created = await prisma.accessCode.create({ data: { code, label: label?.trim() || null } });
  return NextResponse.json(created, { status: 201 });
}
