import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getIp } from '@/lib/rateLimit';
import { sendNewsletterWelcomeEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip = getIp(request);
  if (!checkRateLimit(`newsletter-subscribe:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const { email, consent, source } = body;
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }
  if (consent !== true) {
    return NextResponse.json({ error: 'Consent is required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.subscriber.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    if (existing.unsubscribedAt) {
      // Re-subscribing after a previous unsubscribe — reset it as a fresh, explicit consent.
      await prisma.subscriber.update({
        where: { id: existing.id },
        data: { unsubscribedAt: null, consentedAt: new Date() },
      });
    }
    return NextResponse.json({ ok: true, alreadySubscribed: !existing.unsubscribedAt });
  }

  const subscriber = await prisma.subscriber.create({
    data: {
      email: normalizedEmail,
      source: typeof source === 'string' ? source : 'footer',
    },
  });

  await sendNewsletterWelcomeEmail(normalizedEmail, subscriber.unsubscribeToken);

  return NextResponse.json({ ok: true });
}
