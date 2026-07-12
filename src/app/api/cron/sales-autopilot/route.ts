import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendProviderSalesPitchEmail, sendSalesAutopilotReportEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// How many new leads get their first pitch email per day. Kept small and
// fixed (like ARTICLES_PER_RUN in publish-queued) to avoid hitting Resend's
// rate limit and to keep a shared, low-reputation sender domain from getting
// flagged for a sudden burst of outbound email.
const PITCH_BATCH_SIZE = 60;
const DEADLINE_DAYS = 7;
const REMINDER_WINDOW_DAYS = 2;

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

async function sendReport(result: {
  pitched: { fullName: string; email: string }[];
  reminded: { fullName: string; email: string }[];
  removed: { fullName: string; email: string | null }[];
  remainingLeads: number;
}) {
  const to = process.env.AUTOPILOT_REPORT_EMAIL;
  if (!to) return;
  try {
    await sendSalesAutopilotReportEmail(to, result);
  } catch (err) {
    console.error('Sales autopilot report email failed:', err);
  }
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // 1. Deactivate providers whose 7-day deadline passed without a subscription.
  const overdue = await prisma.provider.findMany({
    where: { stripeSubscriptionId: null, active: true, salesExempt: false, removalDeadline: { lt: now } },
    select: { id: true, fullName: true, email: true },
  });
  if (overdue.length > 0) {
    await prisma.provider.updateMany({
      where: { id: { in: overdue.map(p => p.id) } },
      data: { active: false },
    });
  }

  // 2. Remind leads whose deadline is within REMINDER_WINDOW_DAYS and haven't been reminded yet.
  const reminderCandidates = await prisma.provider.findMany({
    where: {
      stripeSubscriptionId: null,
      active: true,
      salesExempt: false,
      email: { not: null },
      removalDeadline: { gte: now, lte: new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000) },
    },
    include: { salesContacts: { where: { type: 'reminder' }, take: 1 } },
  });
  const reminded: { fullName: string; email: string }[] = [];
  for (const p of reminderCandidates) {
    if (!p.email || p.salesContacts.length > 0 || !p.removalDeadline) continue;
    try {
      const sent = await sendProviderSalesPitchEmail(
        { id: p.id, fullName: p.fullName, email: p.email },
        { isReminder: true, deadline: p.removalDeadline },
      );
      if (sent) {
        await prisma.salesContact.create({ data: { providerId: p.id, type: 'reminder' } });
        reminded.push({ fullName: p.fullName, email: p.email });
      }
    } catch (err) {
      console.error('Sales autopilot reminder failed for', p.id, err);
    }
  }

  // 3. Pitch a fresh batch of never-contacted real leads.
  const newLeads = await prisma.provider.findMany({
    where: {
      stripeSubscriptionId: null,
      address: { not: null },
      email: { not: null },
      salesExempt: false,
      salesContacts: { none: {} },
    },
    orderBy: { createdAt: 'asc' },
    take: PITCH_BATCH_SIZE,
  });
  const pitched: { fullName: string; email: string }[] = [];
  for (const p of newLeads) {
    if (!p.email) continue;
    const deadline = new Date(now.getTime() + DEADLINE_DAYS * 24 * 60 * 60 * 1000);
    try {
      const sent = await sendProviderSalesPitchEmail(
        { id: p.id, fullName: p.fullName, email: p.email },
        { isReminder: false, deadline },
      );
      if (sent) {
        await prisma.$transaction([
          prisma.salesContact.create({ data: { providerId: p.id, type: 'pitch' } }),
          prisma.provider.update({ where: { id: p.id }, data: { removalDeadline: deadline } }),
        ]);
        pitched.push({ fullName: p.fullName, email: p.email });
      }
    } catch (err) {
      console.error('Sales autopilot pitch failed for', p.id, err);
    }
  }

  const remainingLeads = await prisma.provider.count({
    where: {
      stripeSubscriptionId: null,
      address: { not: null },
      email: { not: null },
      salesExempt: false,
      salesContacts: { none: {} },
    },
  });

  const result = {
    pitched,
    reminded,
    removed: overdue.map(p => ({ fullName: p.fullName, email: p.email })),
    remainingLeads,
  };

  await sendReport(result);
  return NextResponse.json(result);
}
