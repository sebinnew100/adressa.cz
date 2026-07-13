import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { postArticleToFacebook } from '@/lib/facebook';

// Temporary, one-off verification endpoint for the Facebook auto-posting
// integration — not part of the autopilot flow. Delete after confirming.
export const dynamic = 'force-dynamic';

// Disposable key for this one-off manual verification only — this whole
// route gets deleted once the integration is confirmed working.
const DISPOSABLE_TEST_KEY = '607dcbcae9c112e24c48c463e144b7ca259198ae5d44dc4b';

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${DISPOSABLE_TEST_KEY}`;
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const article = await prisma.article.findFirst({
    where: { published: true, coverImagePath: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { title: true, slug: true, coverImagePath: true },
  });

  if (!article) {
    return NextResponse.json({ error: 'no published article with a cover image found' }, { status: 404 });
  }

  const result = await postArticleToFacebook(article, '[TEST — safe to delete] ');
  return NextResponse.json({ article, result });
}
