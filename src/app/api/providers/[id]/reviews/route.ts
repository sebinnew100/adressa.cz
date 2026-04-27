import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { providerId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorName, rating, comment } = await request.json();

    if (!authorName?.trim() || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const provider = await prisma.provider.findUnique({ where: { id: params.id } });
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    const review = await prisma.review.create({
      data: {
        providerId: params.id,
        authorName: authorName.trim().slice(0, 80),
        rating: Number(rating),
        comment: comment?.trim().slice(0, 500) || null,
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
