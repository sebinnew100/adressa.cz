import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

function csvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

const COLUMNS = ['email', 'name', 'nickname', 'totalPoints', 'submissions', 'createdAt'] as const;

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const players = await prisma.player.findMany({
    orderBy: { createdAt: 'desc' },
    include: { submissions: { select: { status: true, pointsAwarded: true } } },
  });

  const rows = players.map(p => {
    const totalPoints = p.submissions
      .filter(s => s.status === 'approved')
      .reduce((sum, s) => sum + (s.pointsAwarded ?? 0), 0);
    return [
      p.email ?? '',
      p.name ?? '',
      p.nickname ?? '',
      totalPoints,
      p.submissions.length,
      p.createdAt.toISOString().slice(0, 10),
    ];
  });

  const csv = [COLUMNS.join(','), ...rows.map(r => r.map(csvCell).join(','))].join('\n');
  const bom = '﻿';

  return new Response(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="game-mode-hraci-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
