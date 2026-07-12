import { NextRequest, NextResponse } from 'next/server';
import { getStripe, TRIAL_ACTIVATION_FEE_CZK } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  try {
    const { providerId } = await request.json();
    if (!providerId) return NextResponse.json({ error: 'Missing providerId' }, { status: 400 });

    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adresarcz.vercel.app';

    // One-time payment mode: this genuinely charges the 10 CZK activation
    // fee immediately (a trialing subscription would defer any bundled
    // one-time item to its first real invoice instead of charging now).
    // The card is saved (setup_future_usage) so the webhook can create the
    // actual trialing subscription server-side once this payment confirms.
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'czk',
            unit_amount: TRIAL_ACTIVATION_FEE_CZK,
            product_data: {
              name: 'adressa.cz — Aktivační poplatek (7denní zkušební období)',
              description: `Profil: ${provider.fullName}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        setup_future_usage: 'off_session',
        metadata: { providerId },
      },
      customer_creation: 'always',
      metadata: { providerId },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel?providerId=${providerId}`,
      customer_email: provider.email ?? undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
