import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const playerId = (session?.user as { id?: string } | undefined)?.id;
  if (!playerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const nickname = typeof body?.nickname === 'string' ? body.nickname.trim().slice(0, 20) || null : undefined;
  if (nickname === undefined) {
    return NextResponse.json({ error: 'Missing nickname' }, { status: 400 });
  }

  const player = await prisma.player.update({ where: { id: playerId }, data: { nickname } });
  return NextResponse.json({ nickname: player.nickname });
}
