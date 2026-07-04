import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');
  if (!deviceId) {
    return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
  }

  try {
    const submissions = await prisma.gameSubmission.findMany({
      where: { deviceId },
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
