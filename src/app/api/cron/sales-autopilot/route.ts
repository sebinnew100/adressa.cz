import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendProviderSalesPitchEmail, sendSalesAutopilotReportEmail, SalesPitchStage } from '@/lib/email';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import { KNOWN_TEST_PROVIDER_IDS } from '@/lib/salesJunkIds';

export const dynamic = 'force-dynamic';

// Full automated cadence: intro -> waiting -> hidden -> followup, each 2 days
// apart. Once the 4-stage sequence completes, hidden/followup alternate
// every ~3.5 days forever (roughly "twice a week" combined) until the lead
// converts or an admin marks them salesExempt.
const INITIAL_STAGE_GAP_DAYS = 2;
const STEADY_STAGE_GAP_DAYS = 3.5;
const DEADLINE_DAYS = 7; // unrelated to send cadence — only controls the "will be removed by" date shown in copy.

// Conservative caps to protect a single sending domain from a rate-limit/
// spam flag now that all 4 stages can fire automatically instead of just 2.
// Adjust once real Resend plan limits are confirmed.
const NEW_INTRO_DAILY_CAP = 25;
const TOTAL_DAILY_CAP = 80;

const STAGE_ORDER: SalesPitchStage[] = ['intro', 'waiting', 'hidden', 'followup'];

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

function names(serviceId: string, cityId: string) {
  return {
    serviceNameCz: SERVICES.find(s => s.id === serviceId)?.nameCz ?? serviceId,
    cityNameCz: CITIES.find(c => c.id === cityId)?.nameCz ?? cityId,
  };
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// Given a provider's past pitch-stage contacts, figures out which stage is
// due next and when. Returns null for a never-contacted provider (caller
// handles that case separately as an 'intro' candidate).
function nextDueStage(contacts: { type: string; sentAt: Date }[]): { stage: SalesPitchStage; dueAt: Date } | null {
  const relevant = contacts.filter(c => STAGE_ORDER.includes(c.type as SalesPitchStage));
  if (relevant.length === 0) return null;
  const last = [...relevant].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())[0];
  const hasFollowup = relevant.some(c => c.type === 'followup');

  if (last.type === 'intro') return { stage: 'waiting', dueAt: addDays(last.sentAt, INITIAL_STAGE_GAP_DAYS) };
  if (last.type === 'waiting') return { stage: 'hidden', dueAt: addDays(last.sentAt, INITIAL_STAGE_GAP_DAYS) };
  if (last.type === 'hidden') {
    return { stage: 'followup', dueAt: addDays(last.sentAt, hasFollowup ? STEADY_STAGE_GAP_DAYS : INITIAL_STAGE_GAP_DAYS) };
  }
  // last.type === 'followup'
  return { stage: 'hidden', dueAt: addDays(last.sentAt, STEADY_STAGE_GAP_DAYS) };
}

async function sendReport(result: {
  scheduled: { fullName: string; email: string; stage: string }[];
  sent: { fullName: string; email: string; stage: string }[];
  pastDeadline: { fullName: string; email: string | null }[];
  remainingNeverContacted: number;
  gapWarning?: string;
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

  try {
    return await runSalesAutopilot();
  } catch (err) {
    console.error('[sales-autopilot] unhandled failure:', err);
    const result = { scheduled: [], sent: [], pastDeadline: [], remainingNeverContacted: -1, gapWarning: `⚠️ Unhandled error: ${String(err)}` };
    await sendReport(result);
    return NextResponse.json(result, { status: 500 });
  }
}

async function runSalesAutopilot() {
  const now = new Date();

  // Detect a skipped scheduled run (e.g. Vercel Cron dropping a run during a
  // burst of production redeploys) so it's visible in the report instead of
  // only being noticed if someone happens to check manually.
  const lastContact = await prisma.salesContact.findFirst({ orderBy: { sentAt: 'desc' }, select: { sentAt: true } });
  const hoursSinceLastContact = lastContact ? (now.getTime() - lastContact.sentAt.getTime()) / (1000 * 60 * 60) : 0;
  const gapWarning = hoursSinceLastContact > 30
    ? `⚠️ Poslední oslovení proběhlo před ~${Math.round(hoursSinceLastContact)}h — pravděpodobně byl vynechán jeden naplánovaný běh.`
    : undefined;

  // 0. Strategic sends the admin scheduled a specific time for — these jump
  // the queue ahead of everything else and are NOT counted against the daily
  // caps below (admin picked them deliberately). Cron only runs once a day,
  // so "schedule a time" really means "schedule a date": anything due gets
  // sent on the next daily run at/after that time, not at the exact minute.
  const scheduledDue = await prisma.provider.findMany({
    where: {
      stripeSubscriptionId: null,
      salesExempt: false,
      email: { not: null },
      scheduledSendAt: { lte: now },
      id: { notIn: [...KNOWN_TEST_PROVIDER_IDS] },
    },
    include: { salesContacts: { select: { type: true, sentAt: true } } },
  });
  const scheduled: { fullName: string; email: string; stage: string; cityNameCz: string }[] = [];
  for (const p of scheduledDue) {
    if (!p.email) continue;
    const stage: SalesPitchStage = nextDueStage(p.salesContacts)?.stage ?? 'intro';
    const deadline = p.removalDeadline ?? new Date(now.getTime() + DEADLINE_DAYS * 24 * 60 * 60 * 1000);
    const { serviceNameCz, cityNameCz } = names(p.serviceId, p.cityId);
    try {
      const result = await sendProviderSalesPitchEmail(
        { id: p.id, fullName: p.fullName, email: p.email, description: p.description, picturePath: p.picturePath, serviceNameCz, cityNameCz },
        { stage, deadline },
      );
      if (result.ok) {
        await prisma.$transaction([
          prisma.salesContact.create({ data: { providerId: p.id, type: stage } }),
          prisma.provider.update({
            where: { id: p.id },
            data: { scheduledSendAt: null, removalDeadline: p.removalDeadline ?? deadline },
          }),
        ]);
        scheduled.push({ fullName: p.fullName, email: p.email, stage, cityNameCz });
      }
    } catch (err) {
      console.error('Sales autopilot scheduled send failed for', p.id, err);
    }
  }

  // 1. Report-only: providers whose 7-day "will be removed" deadline passed.
  // The email tells them the listing "will be removed", but deliberately
  // does NOT actually deactivate anyone — informational for the admin only.
  const pastDeadlineRaw = await prisma.provider.findMany({
    where: { stripeSubscriptionId: null, active: true, salesExempt: false, removalDeadline: { lt: now } },
    select: { id: true, fullName: true, email: true, serviceId: true, cityId: true },
  });
  const pastDeadline = pastDeadlineRaw.map(p => ({
    fullName: p.fullName,
    email: p.email,
    cityNameCz: names(p.serviceId, p.cityId).cityNameCz,
  }));

  // 2. Everyone else: figure out who's due for their next stage today, and
  // who's never been contacted at all (eligible for 'intro'). Deliberately
  // NOT filtering on `address` here — it's optional on the real registration
  // form, so requiring it would silently exclude genuine future signups.
  // Only the known confirmed test/dev rows are excluded, by ID.
  const allLeads = await prisma.provider.findMany({
    where: {
      stripeSubscriptionId: null,
      email: { not: null },
      salesExempt: false,
      id: { notIn: [...KNOWN_TEST_PROVIDER_IDS] },
    },
    select: {
      id: true, fullName: true, email: true, serviceId: true, cityId: true,
      description: true, picturePath: true, removalDeadline: true, createdAt: true,
      salesContacts: { where: { type: { in: STAGE_ORDER } }, select: { type: true, sentAt: true } },
    },
  });

  const neverContacted = allLeads
    .filter(p => p.salesContacts.length === 0)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const dueAdvances: { provider: typeof allLeads[number]; stage: SalesPitchStage; dueAt: Date }[] = [];
  for (const p of allLeads) {
    if (p.salesContacts.length === 0) continue;
    const next = nextDueStage(p.salesContacts);
    if (next && next.dueAt <= now) dueAdvances.push({ provider: p, stage: next.stage, dueAt: next.dueAt });
  }
  dueAdvances.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime()); // most-overdue first

  const sent: { fullName: string; email: string; stage: string; cityNameCz: string }[] = [];
  let sentCount = 0;

  for (const { provider: p, stage } of dueAdvances) {
    if (sentCount >= TOTAL_DAILY_CAP || !p.email) continue;
    const deadline = p.removalDeadline ?? new Date(now.getTime() + DEADLINE_DAYS * 24 * 60 * 60 * 1000);
    const { serviceNameCz, cityNameCz } = names(p.serviceId, p.cityId);
    try {
      const result = await sendProviderSalesPitchEmail(
        { id: p.id, fullName: p.fullName, email: p.email, description: p.description, picturePath: p.picturePath, serviceNameCz, cityNameCz },
        { stage, deadline },
      );
      if (result.ok) {
        await prisma.$transaction([
          prisma.salesContact.create({ data: { providerId: p.id, type: stage } }),
          ...(p.removalDeadline ? [] : [prisma.provider.update({ where: { id: p.id }, data: { removalDeadline: deadline } })]),
        ]);
        sent.push({ fullName: p.fullName, email: p.email, stage, cityNameCz });
        sentCount++;
      }
    } catch (err) {
      console.error('Sales autopilot stage-advance send failed for', p.id, err);
    }
  }

  const introBudget = Math.max(0, Math.min(NEW_INTRO_DAILY_CAP, TOTAL_DAILY_CAP - sentCount));
  for (const p of neverContacted.slice(0, introBudget)) {
    if (!p.email) continue;
    const deadline = new Date(now.getTime() + DEADLINE_DAYS * 24 * 60 * 60 * 1000);
    const { serviceNameCz, cityNameCz } = names(p.serviceId, p.cityId);
    try {
      const result = await sendProviderSalesPitchEmail(
        { id: p.id, fullName: p.fullName, email: p.email, description: p.description, picturePath: p.picturePath, serviceNameCz, cityNameCz },
        { stage: 'intro', deadline },
      );
      if (result.ok) {
        await prisma.$transaction([
          prisma.salesContact.create({ data: { providerId: p.id, type: 'intro' } }),
          prisma.provider.update({ where: { id: p.id }, data: { removalDeadline: deadline } }),
        ]);
        sent.push({ fullName: p.fullName, email: p.email, stage: 'intro', cityNameCz });
        sentCount++;
      }
    } catch (err) {
      console.error('Sales autopilot intro send failed for', p.id, err);
    }
  }

  const result = {
    scheduled,
    sent,
    pastDeadline,
    remainingNeverContacted: neverContacted.length,
    ...(gapWarning ? { gapWarning } : {}),
  };

  await sendReport(result);
  return NextResponse.json(result);
}
