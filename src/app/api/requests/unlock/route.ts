import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 10 attempts per 10 minutes per IP
  const ip = getIp(req);
  if (!checkRateLimit(`unlock:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Try again in 10 minutes.' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { code } = body;

  if (!code?.trim()) {
    return NextResponse.json({ ok: false, error: 'Code is required.' }, { status: 400 });
  }

  // Reject codes that are clearly invalid (too long = probing attack)
  if (code.trim().length > 20) {
    return NextResponse.json({ ok: false, error: 'Invalid access code.' }, { status: 400 });
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
