import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  return request.cookies.get(COOKIE_NAME)?.value === getExpectedToken();
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const updated = await prisma.serviceRequest.update({
    where: { id: params.id },
    data: {
      title: body.title?.trim(),
      description: body.description?.trim() || null,
      serviceId: body.serviceId || null,
      cityId: body.cityId || null,
      contactName: body.contactName?.trim(),
      contactEmail: body.contactEmail?.trim() || null,
      contactPhone: body.contactPhone?.trim() || null,
      budget: body.budget?.trim() || null,
      active: body.active,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.serviceRequest.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
