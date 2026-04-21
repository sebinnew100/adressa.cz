import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function uploadToCloudinary(buffer: Buffer, originalName: string): Promise<string> {
  const base64 = buffer.toString('base64');
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const dataUri = `data:image/${ext};base64,${base64}`;

  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('upload_preset', 'unsigned_preset');
  formData.append('folder', 'adresar-cz');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const signaturePayload = `folder=adresar-cz&timestamp=${timestamp}`;
  const crypto = await import('crypto');
  const signature = crypto
    .createHash('sha256')
    .update(signaturePayload + apiSecret)
    .digest('hex');

  const uploadForm = new FormData();
  uploadForm.append('file', dataUri);
  uploadForm.append('folder', 'adresar-cz');
  uploadForm.append('timestamp', timestamp);
  uploadForm.append('api_key', apiKey);
  uploadForm.append('signature', signature);
  uploadForm.append('transformation', 'w_400,h_400,c_fill,g_face');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: uploadForm }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}

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
      const buffer = Buffer.from(await pictureFile.arrayBuffer());
      picturePath = await uploadToCloudinary(buffer, pictureFile.name);
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
