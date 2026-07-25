import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getPlayerBalance } from '@/lib/gameBalance';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = (session?.user as { id?: string } | undefined)?.id;
  if (!playerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { totalPoints, availablePoints, pendingPayout, submissions } = await getPlayerBalance(playerId);
    return NextResponse.json({ totalPoints, availablePoints, pendingPayout, submissions });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
