import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code?.trim()) {
    return NextResponse.json({ ok: false, error: 'Code is required.' }, { status: 400 });
  }

  const accessCode = await prisma.accessCode.findFirst({
    where: { code: code.trim().toUpperCase(), active: true },
  });

  if (!accessCode) {
    return NextResponse.json({ ok: false, error: 'Invalid or inactive access code.' }, { status: 401 });
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ ok: true, requests });
}
