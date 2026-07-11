import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Same cap as /api/automation/articles — kept in sync manually since this
// is a small, fixed, one-time target (19 pre-existing + 100 autopilot).
const AUTOPILOT_TARGET_TOTAL = 119;
const ARTICLES_PER_RUN = 2;

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentTotal = await prisma.article.count({ where: { published: true } });
  if (currentTotal >= AUTOPILOT_TARGET_TOTAL) {
    return NextResponse.json({ published: [], totalPublished: currentTotal, done: true, reason: 'target reached' });
  }

  const slotsLeft = AUTOPILOT_TARGET_TOTAL - currentTotal;
  const take = Math.min(ARTICLES_PER_RUN, slotsLeft);

  const queued = await prisma.article.findMany({
    where: { published: false },
    orderBy: { createdAt: 'asc' },
    take,
  });

  if (queued.length === 0) {
    return NextResponse.json({
      published: [],
      totalPublished: currentTotal,
      done: false,
      reason: 'queue is empty — no articles ready to release',
    });
  }

  const published: { id: string; slug: string; title: string }[] = [];
  for (const article of queued) {
    await prisma.article.update({
      where: { id: article.id },
      data: { published: true, createdAt: new Date() },
    });
    published.push({ id: article.id, slug: article.slug, title: article.title });
  }

  const newTotal = await prisma.article.count({ where: { published: true } });

  return NextResponse.json({
    published,
    totalPublished: newTotal,
    target: AUTOPILOT_TARGET_TOTAL,
    done: newTotal >= AUTOPILOT_TARGET_TOTAL,
  });
}
