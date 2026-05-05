import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function isAdmin() {
  return cookies().get('admin_session')?.value === process.env.ADMIN_SECRET;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { active } = await req.json();
  const updated = await prisma.accessCode.update({
    where: { id: params.id },
    data: { active },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.accessCode.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
