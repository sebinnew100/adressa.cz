import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';
import { sendLifetimeAccessConfirmedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { to } = await request.json();
  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'Missing "to" address' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, reason: 'RESEND_API_KEY not set in this environment' }, { status: 200 });
  }

  const ok = await sendLifetimeAccessConfirmedEmail(to, 'Ukázkový Poskytovatel');
  return NextResponse.json({ ok });
}
