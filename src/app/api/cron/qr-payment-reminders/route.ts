import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendQrPaymentReminderEmail, sendQrPaymentDeactivatedEmail, sendQrReminderCronReportEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEDUP_WINDOW_MS = 2 * DAY_MS;
const GRACE_DAYS = 5;

function requireAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let reminded = 0;
  let dueToday = 0;
  let deactivated = 0;

  try {
    const now = new Date();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adresarcz.vercel.app';

    // Reminder pass: still active, within a week either side of the due date.
    const oneWeekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const oneWeekAhead = new Date(now.getTime() + 7 * DAY_MS);
    const candidates = await prisma.provider.findMany({
      where: {
        paymentMethod: 'qr_bank_transfer',
        active: true,
        paidUntil: { gte: oneWeekAgo, lte: oneWeekAhead },
      },
      include: {
        salesContacts: {
          where: { type: { in: ['qr_reminder', 'qr_due_today'] } },
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    });

    for (const provider of candidates) {
      if (!provider.paidUntil || !provider.email) continue;

      const daysOverdue = Math.floor((now.getTime() - provider.paidUntil.getTime()) / DAY_MS);
      const lastContact = provider.salesContacts[0];
      const recentlyContacted = !!lastContact && now.getTime() - lastContact.sentAt.getTime() < DEDUP_WINDOW_MS;
      if (recentlyContacted) continue;

      const aktivovatUrl = `${baseUrl}/aktivovat/${provider.id}`;

      if (daysOverdue >= -3 && daysOverdue < 0) {
        // 1-3 days before the due date.
        const ok = await sendQrPaymentReminderEmail(provider.email, provider.fullName, {
          dueToday: false,
          dueDate: provider.paidUntil,
          aktivovatUrl,
        });
        if (ok) {
          await prisma.salesContact.create({ data: { providerId: provider.id, type: 'qr_reminder' } });
          reminded++;
        }
      } else if (daysOverdue >= 0 && daysOverdue < GRACE_DAYS) {
        // Due today through the grace period.
        const ok = await sendQrPaymentReminderEmail(provider.email, provider.fullName, {
          dueToday: true,
          dueDate: provider.paidUntil,
          aktivovatUrl,
        });
        if (ok) {
          await prisma.salesContact.create({ data: { providerId: provider.id, type: 'qr_due_today' } });
          dueToday++;
        }
      }
    }

    // Deactivation pass: grace period fully expired, still marked active.
    const graceExpired = new Date(now.getTime() - GRACE_DAYS * DAY_MS);
    const overdue = await prisma.provider.findMany({
      where: {
        paymentMethod: 'qr_bank_transfer',
        active: true,
        paidUntil: { lt: graceExpired },
      },
    });

    for (const provider of overdue) {
      await prisma.provider.update({ where: { id: provider.id }, data: { active: false } });
      await prisma.salesContact.create({ data: { providerId: provider.id, type: 'qr_deactivated' } });
      deactivated++;
      if (provider.email) {
        await sendQrPaymentDeactivatedEmail(provider.email, provider.fullName, `${baseUrl}/aktivovat/${provider.id}`);
      }
    }

    const result = { reminded, dueToday, deactivated };
    await sendReport(result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[qr-payment-reminders] failed:', err);
    const result = { reminded, dueToday, deactivated, reason: String(err) };
    await sendReport(result);
    return NextResponse.json(result);
  }
}

async function sendReport(result: { reminded: number; dueToday: number; deactivated: number; reason?: string }) {
  const to = process.env.AUTOPILOT_REPORT_EMAIL;
  if (!to) return;
  try {
    await sendQrReminderCronReportEmail(to, result);
  } catch (err) {
    console.error('QR reminder cron report email failed:', err);
  }
}
