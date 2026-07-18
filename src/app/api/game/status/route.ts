import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const playerId = (session?.user as { id?: string } | undefined)?.id;
  if (!playerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const submissions = await prisma.gameSubmission.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, missionId: true, status: true, pointsAwarded: true, createdAt: true },
    });

    const totalPoints = submissions
      .filter(s => s.status === 'approved')
      .reduce((sum, s) => sum + (s.pointsAwarded ?? 0), 0);

    return NextResponse.json({ totalPoints, submissions });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
