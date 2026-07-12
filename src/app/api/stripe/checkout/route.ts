import { NextRequest, NextResponse } from 'next/server';
import { getStripe, MONTHLY_PRICE_CZK, TRIAL_ACTIVATION_FEE_CZK, TRIAL_DAYS } from '@/lib/stripe';
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

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          // One-time activation fee, charged immediately at checkout.
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
        {
          // Recurring subscription, trial delays the first charge by TRIAL_DAYS.
          // Fixed 28-day cycle (4 weeks), not calendar-month billing.
          price_data: {
            currency: 'czk',
            unit_amount: MONTHLY_PRICE_CZK,
            recurring: { interval: 'week', interval_count: 4 },
            product_data: {
              name: 'adressa.cz — Inzerce profilu (každých 28 dní)',
              description: `Profil: ${provider.fullName}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { providerId },
      },
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
