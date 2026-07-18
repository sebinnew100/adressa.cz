import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const submissions = await prisma.gameSubmission.findMany({
      where: { status: 'approved', playerId: { not: null } },
      select: {
        playerId: true,
        pointsAwarded: true,
        player: { select: { name: true, nickname: true, picture: true } },
      },
    });

    const totals = new Map<string, { points: number; nickname: string | null; picture: string | null }>();
    for (const s of submissions) {
      if (!s.playerId) continue;
      const entry = totals.get(s.playerId) ?? {
        points: 0,
        nickname: s.player?.nickname ?? s.player?.name ?? null,
        picture: s.player?.picture ?? null,
      };
      entry.points += s.pointsAwarded ?? 0;
      totals.set(s.playerId, entry);
    }

    const leaderboard = Array.from(totals.entries())
      .map(([playerId, v]) => ({ playerId, nickname: v.nickname, picture: v.picture, points: v.points }))
      .filter(e => e.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);

    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
