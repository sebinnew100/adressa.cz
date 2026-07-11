import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        source: true,
        views: true,
        ctaClicks: true,
        relatedServiceId: true,
        relatedCityId: true,
        createdAt: true,
      },
      orderBy: { views: 'desc' },
    });

    const totals = articles.reduce(
      (acc, a) => {
        const bucket = a.source === 'autopilot' ? acc.autopilot : acc.manual;
        bucket.views += a.views;
        bucket.ctaClicks += a.ctaClicks;
        bucket.count += 1;
        return acc;
      },
      {
        autopilot: { views: 0, ctaClicks: 0, count: 0 },
        manual: { views: 0, ctaClicks: 0, count: 0 },
      }
    );

    return NextResponse.json({ articles, totals });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
