import { NextRequest, NextResponse } from 'next/server';
import { getStripe, LISTING_DAYS } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const providerId = session.metadata?.providerId;
    if (providerId) {
      const paidUntil = new Date();
      paidUntil.setDate(paidUntil.getDate() + LISTING_DAYS);
      await prisma.provider.update({
        where: { id: providerId },
        data: { active: true, paidUntil },
      });
    }
  }

  return NextResponse.json({ received: true });
}
