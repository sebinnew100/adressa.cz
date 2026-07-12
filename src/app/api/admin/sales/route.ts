import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

// A "real" lead has an address on file — bulk-imported real businesses all
// have one; the handful of leftover manual test rows from form-testing
// (gibberish names, no address) are excluded by this filter rather than
// deleted from the DB.
const LEAD_WHERE = { stripeSubscriptionId: null, address: { not: null } } as const;

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const now = new Date();
    const [leads, subscribedCount, totalCount, manuallyDeactivatedCount] = await Promise.all([
      prisma.provider.findMany({
        where: LEAD_WHERE,
        orderBy: [{ removalDeadline: 'asc' }, { createdAt: 'desc' }],
        include: { salesContacts: { orderBy: { sentAt: 'desc' } } },
      }),
      prisma.provider.count({ where: { stripeSubscriptionId: { not: null } } }),
      prisma.provider.count(),
      // The cron never auto-deactivates leads (deadline is messaging only,
      // not enforced) — this can only be non-zero from a manual admin toggle.
      prisma.provider.count({ where: { ...LEAD_WHERE, active: false, removalDeadline: { not: null } } }),
    ]);

    const withStats = leads.map(({ salesContacts, ...p }) => ({
      ...p,
      contactCount: salesContacts.length,
      lastContactedAt: salesContacts[0]?.sentAt ?? null,
      lastContactedType: salesContacts[0]?.type ?? null,
      daysLeft: p.removalDeadline
        ? Math.ceil((p.removalDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));

    const pastDeadline = withStats.filter(l => l.active && l.removalDeadline && l.removalDeadline < now).length;

    return NextResponse.json({
      leads: withStats,
      stats: {
        totalProviders: totalCount,
        subscribed: subscribedCount,
        leads: leads.length,
        contacted: withStats.filter(l => l.contactCount > 0).length,
        pastDeadline,
        manuallyDeactivated: manuallyDeactivatedCount,
        scheduled: withStats.filter(l => l.scheduledSendAt).length,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
