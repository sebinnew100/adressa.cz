import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { fetchArticleCoverImage } from '@/lib/unsplash';
import { checkRateLimit } from '@/lib/rateLimit';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export const dynamic = 'force-dynamic';

// Hard cap: this automation is authorized to publish at most this many total
// published articles on the site (19 pre-existing + 100 new autopilot ones).
// The server enforces this independently of whatever the calling agent thinks
// the count is, so a bug or runaway loop on the caller side cannot exceed it.
const AUTOPILOT_TARGET_TOTAL = 119;

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const key = process.env.AUTOMATION_API_KEY;
  if (!key) return false;
  return auth === `Bearer ${key}`;
}

function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const total = await prisma.article.count({ where: { published: true } });
  const existing = await prisma.article.findMany({
    where: { published: true },
    select: { title: true, slug: true, relatedServiceId: true, relatedCityId: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    totalPublished: total,
    target: AUTOPILOT_TARGET_TOTAL,
    remaining: Math.max(0, AUTOPILOT_TARGET_TOTAL - total),
    done: total >= AUTOPILOT_TARGET_TOTAL,
    existingArticles: existing,
    validServiceIds: SERVICES.map(s => s.id),
    validCityIds: CITIES.map(c => c.id),
  });
}

export async function POST(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = 'automation'; // shared bucket, bearer-token-gated already
  if (!checkRateLimit(ip, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const currentTotal = await prisma.article.count({ where: { published: true } });
  if (currentTotal >= AUTOPILOT_TARGET_TOTAL) {
    return NextResponse.json(
      { error: 'Autopilot target reached', totalPublished: currentTotal, target: AUTOPILOT_TARGET_TOTAL },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, excerpt, content, relatedServiceId, relatedCityId } = body;

  if (typeof title !== 'string' || title.trim().length < 10) {
    return NextResponse.json({ error: 'title is required (min 10 chars)' }, { status: 400 });
  }
  if (typeof content !== 'string' || content.trim().length < 500) {
    return NextResponse.json({ error: 'content is required (min 500 chars)' }, { status: 400 });
  }
  if (typeof relatedServiceId !== 'string' || !SERVICES.some(s => s.id === relatedServiceId)) {
    return NextResponse.json({ error: 'relatedServiceId must be a valid service id' }, { status: 400 });
  }
  if (relatedCityId !== null && relatedCityId !== undefined && !CITIES.some(c => c.id === relatedCityId)) {
    return NextResponse.json({ error: 'relatedCityId must be a valid city id or null' }, { status: 400 });
  }

  const slug = slugify(title);
  const existingSlug = await prisma.article.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json({ error: `Slug already exists: ${slug}` }, { status: 409 });
  }

  const article = await prisma.article.create({
    data: {
      title: title.trim(),
      slug,
      excerpt: typeof excerpt === 'string' ? excerpt.trim() : null,
      content: content.trim(),
      relatedServiceId,
      relatedCityId: relatedCityId ?? null,
      published: true,
    },
  });

  const image = await fetchArticleCoverImage(relatedServiceId, (filename, bytes) =>
    put(filename, bytes, { access: 'public' })
  );

  if (image) {
    await prisma.article.update({
      where: { id: article.id },
      data: {
        coverImagePath: image.coverImagePath,
        coverImageCredit: image.coverImageCredit,
        coverImageCreditUrl: image.coverImageCreditUrl,
      },
    });
  }

  const newTotal = await prisma.article.count({ where: { published: true } });

  return NextResponse.json(
    {
      id: article.id,
      slug: article.slug,
      title: article.title,
      hasCoverImage: !!image,
      totalPublished: newTotal,
      target: AUTOPILOT_TARGET_TOTAL,
      remaining: Math.max(0, AUTOPILOT_TARGET_TOTAL - newTotal),
      done: newTotal >= AUTOPILOT_TARGET_TOTAL,
    },
    { status: 201 }
  );
}
