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

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  let pageCheck: unknown = null;
  if (pageId && accessToken) {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=id,name&access_token=${encodeURIComponent(accessToken)}`
    );
    pageCheck = { status: res.status, body: await res.text() };
  }

  const article = await prisma.article.findFirst({
    where: { published: true, coverImagePath: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { title: true, slug: true, coverImagePath: true },
  });

  if (!article) {
    return NextResponse.json({ error: 'no published article with a cover image found', pageCheck }, { status: 404 });
  }

  const result = await postArticleToFacebook(article, '[TEST — safe to delete] ');
  return NextResponse.json({ pageCheck, article, result });
}
