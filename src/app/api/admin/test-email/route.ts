import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

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

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: 'adressa.cz <onboarding@resend.dev>',
    to,
    subject: 'Testovací e-mail — adressa.cz',
    html: '<p>Toto je testovací e-mail z /admin/sales pro ověření doručování přes Resend.</p>',
  });

  return NextResponse.json({ ok: !error, data, error });
}
