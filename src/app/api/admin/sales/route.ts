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
  try {
    const [leads, activeCount, totalCount] = await Promise.all([
      prisma.provider.findMany({
        where: { active: false },
        orderBy: { createdAt: 'desc' },
        include: { salesContacts: { orderBy: { sentAt: 'desc' } } },
      }),
      prisma.provider.count({ where: { active: true } }),
      prisma.provider.count(),
    ]);

    const withStats = leads.map(({ salesContacts, ...p }) => ({
      ...p,
      contactCount: salesContacts.length,
      lastContactedAt: salesContacts[0]?.sentAt ?? null,
    }));

    return NextResponse.json({
      leads: withStats,
      stats: {
        totalProviders: totalCount,
        subscribed: activeCount,
        leads: leads.length,
        contacted: withStats.filter(l => l.contactCount > 0).length,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
