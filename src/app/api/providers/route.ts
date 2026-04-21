import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('city') || undefined;
  const serviceId = searchParams.get('service') || undefined;
  const sort = searchParams.get('sort') || 'name';

  const where = {
    ...(cityId && { cityId }),
    ...(serviceId && { serviceId }),
  };

  const orderBy =
    sort === 'city' ? { cityId: 'asc' as const }
    : sort === 'service' ? { serviceId: 'asc' as const }
    : { fullName: 'asc' as const };

  try {
    const providers = await prisma.provider.findMany({ where, orderBy });
    return NextResponse.json(providers);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fullName = (formData.get('fullName') as string | null)?.trim() ?? '';
    const email = (formData.get('email') as string | null)?.trim() ?? '';
    const phone = (formData.get('phone') as string | null)?.trim() ?? '';
    const serviceId = (formData.get('serviceId') as string | null) ?? '';
    const cityId = (formData.get('cityId') as string | null) ?? '';
    const description = (formData.get('description') as string | null)?.trim() || null;
    const pictureFile = formData.get('picture') as File | null;

    if (!fullName || !email || !phone || !serviceId || !cityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let picturePath: string | null = null;

    if (pictureFile && pictureFile.size > 0) {
      const ext = pictureFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `profiles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const blob = await put(filename, pictureFile, { access: 'public' });
      picturePath = blob.url;
    }

    const provider = await prisma.provider.create({
      data: { fullName, email, phone, serviceId, cityId, description, picturePath },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique constraint') || msg.includes('unique')) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
