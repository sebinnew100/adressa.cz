import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/authOptions';
import { getPlayerBalance, PAYOUT_POINTS_THRESHOLD, PAYOUT_AMOUNT_CZK } from '@/lib/gameBalance';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const playerId = (session?.user as { id?: string } | undefined)?.id;
  if (!playerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const accountName = typeof body?.accountName === 'string' ? body.accountName.trim().slice(0, 100) : '';
  const accountDetails = typeof body?.accountDetails === 'string' ? body.accountDetails.trim().slice(0, 100) : '';
  if (!accountName || !accountDetails) {
    return NextResponse.json({ error: 'Missing account details' }, { status: 400 });
  }

  const { availablePoints, pendingPayout } = await getPlayerBalance(playerId);
  if (pendingPayout) {
    return NextResponse.json({ error: 'A payout request is already pending' }, { status: 400 });
  }
  if (availablePoints < PAYOUT_POINTS_THRESHOLD) {
    return NextResponse.json({ error: 'Not enough points yet' }, { status: 400 });
  }

  await prisma.payoutRequest.create({
    data: {
      playerId,
      pointsSpent: PAYOUT_POINTS_THRESHOLD,
      amountCzk: PAYOUT_AMOUNT_CZK,
      accountName,
      accountDetails,
    },
  });

  const updated = await getPlayerBalance(playerId);
  return NextResponse.json({ totalPoints: updated.totalPoints, availablePoints: updated.availablePoints, pendingPayout: updated.pendingPayout });
}
