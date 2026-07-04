import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';
import { fetchArticleCoverImage } from '@/lib/unsplash';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
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
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const title = (formData.get('title') as string | null)?.trim() ?? '';
    const excerpt = (formData.get('excerpt') as string | null)?.trim() || null;
    const content = (formData.get('content') as string | null)?.trim() ?? '';
    const published = formData.get('published') === 'on';
    const relatedServiceId = (formData.get('relatedServiceId') as string | null) || null;
    const relatedCityId = (formData.get('relatedCityId') as string | null) || null;
    let slug = (formData.get('slug') as string | null)?.trim() || slugify(title);
    slug = slugify(slug);
    const coverImageFile = formData.get('coverImage') as File | null;

    if (!title || !content || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let coverImagePath: string | null = null;
    let coverImageCredit: string | null = null;
    let coverImageCreditUrl: string | null = null;

    if (coverImageFile && coverImageFile.size > 0) {
      const ext = coverImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `articles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const blob = await put(filename, coverImageFile, { access: 'public' });
      coverImagePath = blob.url;
    } else {
      const fetched = await fetchArticleCoverImage(relatedServiceId, (filename, bytes) =>
        put(filename, bytes, { access: 'public' })
      );
      if (fetched) {
        coverImagePath = fetched.coverImagePath;
        coverImageCredit = fetched.coverImageCredit;
        coverImageCreditUrl = fetched.coverImageCreditUrl;
      }
    }

    const article = await prisma.article.create({
      data: { title, slug, excerpt, content, coverImagePath, coverImageCredit, coverImageCreditUrl, published, relatedServiceId, relatedCityId },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
