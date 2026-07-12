import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';
import { sendProviderSalesPitchEmail, SalesPitchStage } from '@/lib/email';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export const dynamic = 'force-dynamic';

const DEADLINE_DAYS = 7;
const VALID_STAGES: SalesPitchStage[] = ['intro', 'waiting', 'hidden', 'followup'];

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { providerIds, stage } = await request.json();
  if (!Array.isArray(providerIds) || providerIds.length === 0) {
    return NextResponse.json({ error: 'Missing providerIds' }, { status: 400 });
  }
  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }

  const providers = await prisma.provider.findMany({
    where: { id: { in: providerIds }, stripeSubscriptionId: null },
  });

  const results: { providerId: string; status: 'sent' | 'skipped_no_email' | 'failed'; error?: string }[] = [];

  for (const provider of providers) {
    if (!provider.email) {
      results.push({ providerId: provider.id, status: 'skipped_no_email' });
      continue;
    }
    const service = SERVICES.find(s => s.id === provider.serviceId)?.nameCz ?? provider.serviceId;
    const city = CITIES.find(c => c.id === provider.cityId)?.nameCz ?? provider.cityId;
    const deadline = provider.removalDeadline ?? new Date(Date.now() + DEADLINE_DAYS * 24 * 60 * 60 * 1000);
    try {
      const result = await sendProviderSalesPitchEmail(
        { id: provider.id, fullName: provider.fullName, email: provider.email, serviceNameCz: service, cityNameCz: city },
        { stage, deadline },
      );
      if (!result.ok) {
        results.push({ providerId: provider.id, status: 'failed', error: result.error });
        continue;
      }
      await prisma.$transaction([
        prisma.salesContact.create({
          data: { providerId: provider.id, type: stage },
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
