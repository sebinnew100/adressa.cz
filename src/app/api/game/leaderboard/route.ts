import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const submissions = await prisma.gameSubmission.findMany({
      where: { status: 'approved' },
      select: { deviceId: true, nickname: true, pointsAwarded: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const totals = new Map<string, { points: number; nickname: string | null }>();
    for (const s of submissions) {
      const entry = totals.get(s.deviceId) ?? { points: 0, nickname: null };
      entry.points += s.pointsAwarded ?? 0;
      if (s.nickname) entry.nickname = s.nickname;
      totals.set(s.deviceId, entry);
    }

    const leaderboard = Array.from(totals.entries())
      .map(([deviceId, v]) => ({ deviceId, nickname: v.nickname, points: v.points }))
      .filter(e => e.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);

    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
