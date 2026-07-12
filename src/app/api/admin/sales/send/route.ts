import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';
import { sendProviderSalesPitchEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

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
    where: { id: { in: providerIds }, active: false },
    include: { salesContacts: { select: { id: true }, take: 1 } },
  });

  const results: { providerId: string; status: 'sent' | 'skipped_no_email' | 'failed' }[] = [];

  for (const provider of providers) {
    if (!provider.email) {
      results.push({ providerId: provider.id, status: 'skipped_no_email' });
      continue;
    }
    const isReminder = provider.salesContacts.length > 0;
    try {
      const sent = await sendProviderSalesPitchEmail(
        { id: provider.id, fullName: provider.fullName, email: provider.email },
        { isReminder },
      );
      if (!sent) {
        results.push({ providerId: provider.id, status: 'failed' });
        continue;
      }
      await prisma.salesContact.create({
        data: { providerId: provider.id, type: isReminder ? 'reminder' : 'pitch' },
      });
      results.push({ providerId: provider.id, status: 'sent' });
    } catch {
      results.push({ providerId: provider.id, status: 'failed' });
    }
  }

  return NextResponse.json({ results });
}
