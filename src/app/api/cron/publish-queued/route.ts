import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendAutopilotReportEmail } from '@/lib/email';
import { submitToIndexNow } from '@/lib/indexNow';
import { postArticleToFacebook } from '@/lib/facebook';

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
  const take = Math.min(ARTICLES_PER_RUN, slotsLeft);

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
  };
  await sendReport(result);
  return NextResponse.json(result);
}
