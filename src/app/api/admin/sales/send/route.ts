import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';
import { sendProviderSalesPitchEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const DEADLINE_DAYS = 7;

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { providerIds } = await request.json();
  if (!Array.isArray(providerIds) || providerIds.length === 0) {
    return NextResponse.json({ error: 'Missing providerIds' }, { status: 400 });
  }

  const providers = await prisma.provider.findMany({
    where: { id: { in: providerIds }, stripeSubscriptionId: null },
    include: { salesContacts: { select: { id: true }, take: 1 } },
  });

  const results: { providerId: string; status: 'sent' | 'skipped_no_email' | 'failed'; error?: string }[] = [];

  for (const provider of providers) {
    if (!provider.email) {
      results.push({ providerId: provider.id, status: 'skipped_no_email' });
      continue;
    }
    const isReminder = provider.salesContacts.length > 0;
    const deadline = provider.removalDeadline ?? new Date(Date.now() + DEADLINE_DAYS * 24 * 60 * 60 * 1000);
    try {
      const result = await sendProviderSalesPitchEmail(
        { id: provider.id, fullName: provider.fullName, email: provider.email },
        { isReminder, deadline },
      );
      if (!result.ok) {
        results.push({ providerId: provider.id, status: 'failed', error: result.error });
        continue;
      }
      await prisma.$transaction([
        prisma.salesContact.create({
          data: { providerId: provider.id, type: isReminder ? 'reminder' : 'pitch' },
        }),
        ...(provider.removalDeadline ? [] : [
          prisma.provider.update({ where: { id: provider.id }, data: { removalDeadline: deadline } }),
        ]),
      ]);
      results.push({ providerId: provider.id, status: 'sent' });
    } catch (err) {
      results.push({ providerId: provider.id, status: 'failed', error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ results });
}
