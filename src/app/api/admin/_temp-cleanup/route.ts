import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const playerId = '117190633293968315430';
  const payouts = await prisma.payoutRequest.deleteMany({ where: { playerId } });
  const fake = await prisma.gameSubmission.deleteMany({ where: { playerId, photoPath: 'https://placehold.co/10x10' } });
  const remaining = await prisma.gameSubmission.findMany({
    where: { playerId },
    select: { status: true, pointsAwarded: true, photoPath: true },
  });

  return NextResponse.json({ deletedPayouts: payouts.count, deletedFakeSubmissions: fake.count, remaining });
}
