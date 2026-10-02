import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';
import { sendLifetimeAccessConfirmedEmail, sendProviderSalesPitchEmail, SalesPitchStage } from '@/lib/email';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

const SAMPLE_PROVIDER = {
  id: 'sample-preview-id',
  fullName: 'Ukázkový Poskytovatel',
  serviceNameCz: 'Instalatér',
  cityNameCz: 'Praha',
  description: 'Rychlá a spolehlivá instalatérská firma s 10 lety zkušeností.',
  picturePath: null,
};

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { to, type } = await request.json();
  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'Missing "to" address' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, reason: 'RESEND_API_KEY not set in this environment' }, { status: 200 });
  }

  const stages: SalesPitchStage[] = ['intro', 'waiting', 'hidden', 'followup'];
  if (stages.includes(type)) {
    const result = await sendProviderSalesPitchEmail(
      { ...SAMPLE_PROVIDER, email: to },
      { stage: type as SalesPitchStage, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    );
    return NextResponse.json({ ok: result.ok, error: result.error });
  }

  const ok = await sendLifetimeAccessConfirmedEmail(to, SAMPLE_PROVIDER.fullName);
  return NextResponse.json({ ok });
}
