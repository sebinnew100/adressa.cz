import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendAutopilotReportEmail } from '@/lib/email';
import { submitToIndexNow } from '@/lib/indexNow';
import { postArticleToFacebook } from '@/lib/facebook';

export const dynamic = 'force-dynamic';

// Same cap as /api/automation/articles — kept in sync manually since this
// is a small, fixed, one-time target (19 pre-existing + 100 autopilot).
const AUTOPILOT_TARGET_TOTAL = 119;
const ARTICLES_PER_DAY = 2;
// If a scheduled run gets skipped (e.g. Vercel Cron dropping a run during a
// burst of production redeploys), the next run catches up instead of just
// silently falling behind — capped so a long gap doesn't dump too much at
// once (3 days' worth max per run).
const MAX_CATCHUP_DAYS = 3;

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

async function sendReport(result: {
  published: { title: string; slug: string }[];
  totalPublished: number;
  target: number;
  reason?: string;
}) {
  const to = process.env.AUTOPILOT_REPORT_EMAIL;
  if (!to) return;
  try {
    await sendAutopilotReportEmail(to, result);
  } catch (err) {
    console.error('Autopilot report email failed:', err);
  }
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentTotal = await prisma.article.count({ where: { published: true } });
  if (currentTotal >= AUTOPILOT_TARGET_TOTAL) {
    const result = { published: [], totalPublished: currentTotal, target: AUTOPILOT_TARGET_TOTAL, done: true, reason: 'target reached' };
    await sendReport(result);
    return NextResponse.json(result);
  }

  const slotsLeft = AUTOPILOT_TARGET_TOTAL - currentTotal;

  // Figure out how many days' worth are due: normally 1 day (= ARTICLES_PER_DAY),
  // but if the last publish was more than ~1 day ago, catch up proportionally.
  const lastPublished = await prisma.article.findFirst({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  const hoursSinceLastPublish = lastPublished
    ? (Date.now() - lastPublished.createdAt.getTime()) / (1000 * 60 * 60)
    : 24;
  const daysDue = Math.min(MAX_CATCHUP_DAYS, Math.max(1, Math.round(hoursSinceLastPublish / 24)));
  const take = Math.min(ARTICLES_PER_DAY * daysDue, slotsLeft);

  const queued = await prisma.article.findMany({
    where: { published: false },
    orderBy: { createdAt: 'asc' },
    take,
  });

  if (queued.length === 0) {
    const result = {
      published: [],
      totalPublished: currentTotal,
      target: AUTOPILOT_TARGET_TOTAL,
      done: false,
      reason: 'queue is empty — no articles ready to release',
    };
    await sendReport(result);
    return NextResponse.json(result);
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

  await submitToIndexNow(published.map(a => `https://www.adressa.cz/clanky/${a.slug}`));
  for (const article of published) {
    await postArticleToFacebook(article);
  }

  const result = {
    published,
    totalPublished: newTotal,
    target: AUTOPILOT_TARGET_TOTAL,
    done: newTotal >= AUTOPILOT_TARGET_TOTAL,
    ...(daysDue > 1 ? { reason: `⚠️ Catch-up run: last publish was ~${Math.round(hoursSinceLastPublish)}h ago (a scheduled run was likely skipped) — published ${daysDue} days' worth instead of 1.` } : {}),
  };
  await sendReport(result);
  return NextResponse.json(result);
}
