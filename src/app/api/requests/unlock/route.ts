import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || code !== process.env.CONTACT_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: 'Invalid access code.' }, { status: 401 });
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ ok: true, requests });
}
