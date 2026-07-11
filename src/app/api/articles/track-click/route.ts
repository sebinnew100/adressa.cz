import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ip = getIp(request);
  if (!checkRateLimit(`article-click:${ip}`, 30, 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug;
  if (typeof slug !== 'string' || !slug) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await prisma.article.updateMany({
    where: { slug },
    data: { ctaClicks: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
