import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getPlayerBalance } from '@/lib/gameBalance';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = (session?.user as { id?: string } | undefined)?.id;
  console.log('[DEBUG status] session:', JSON.stringify(session), 'playerId:', playerId);
  if (!playerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { totalPoints, availablePoints, pendingPayout, submissions } = await getPlayerBalance(playerId);
    console.log('[DEBUG status] result:', { playerId, totalPoints, availablePoints, pendingPayout });
    return NextResponse.json({ totalPoints, availablePoints, pendingPayout, submissions });
  } catch (err) {
    console.error('[DEBUG status] error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
