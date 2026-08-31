import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';
import { submitToIndexNow } from '@/lib/indexNow';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function savePictureLocally(pictureFile: File) {
  const ext = pictureFile.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(filePath, Buffer.from(await pictureFile.arrayBuffer()));

  return `/uploads/${fileName}`;
}

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const fullName = (formData.get('fullName') as string | null)?.trim() ?? '';
    const email = (formData.get('email') as string | null)?.trim() ?? '';
    const phone = (formData.get('phone') as string | null)?.trim() ?? '';
    const serviceId = (formData.get('serviceId') as string | null) ?? '';
    const cityId = (formData.get('cityId') as string | null) ?? '';
    const description = (formData.get('description') as string | null)?.trim() || null;
    const pictureFile = formData.get('picture') as File | null;

    const existing = await prisma.provider.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let picturePath = existing.picturePath;
    if (pictureFile && pictureFile.size > 0) {
      picturePath = await savePictureLocally(pictureFile);
    }

    const updated = await prisma.provider.update({
      where: { id: params.id },
      data: { fullName, email, phone, serviceId, cityId, description, picturePath },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if ('featured' in body) data.featured = Boolean(body.featured);
    if ('salesExempt' in body) data.salesExempt = Boolean(body.salesExempt);
    if ('scheduledSendAt' in body) data.scheduledSendAt = body.scheduledSendAt ? new Date(body.scheduledSendAt) : null;
    if ('active' in body) {
      data.active = Boolean(body.active);
      if (data.active) {
        const paidUntil = new Date();
        paidUntil.setDate(paidUntil.getDate() + 30);
        data.paidUntil = paidUntil;
      }
    }
    const updated = await prisma.provider.update({
      where: { id: params.id },
      data,
    });

    if (data.active) {
      await submitToIndexNow([
        `https://www.adressa.cz/providers/${updated.id}`,
        `https://www.adressa.cz/${updated.serviceId}/${updated.cityId}`,
      ]);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.provider.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
