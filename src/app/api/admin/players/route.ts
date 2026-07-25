import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const players = await prisma.player.findMany({
    orderBy: { createdAt: 'desc' },
    include: { submissions: { select: { status: true, pointsAwarded: true } } },
  });

  const result = players.map(p => {
    const totalPoints = p.submissions
      .filter(s => s.status === 'approved')
      .reduce((sum, s) => sum + (s.pointsAwarded ?? 0), 0);
    return {
      id: p.id,
      email: p.email,
      name: p.name,
      nickname: p.nickname,
      picture: p.picture,
      totalPoints,
      submissionCount: p.submissions.length,
      createdAt: p.createdAt,
    };
  });

  return NextResponse.json(result);
}
