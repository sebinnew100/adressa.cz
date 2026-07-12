import { NextRequest, NextResponse } from 'next/server';
import { getStripe, MONTHLY_PRICE_CZK, TRIAL_DAYS } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  try {
    const { providerId, testMode } = await request.json();
    if (!providerId) return NextResponse.json({ error: 'Missing providerId' }, { status: 400 });

    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adresarcz.vercel.app';

    // TEMPORARY: testMode lets us verify recurring billing on a fast 1-hour
    // cycle at 10 CZK instead of waiting 7 real days at 90 CZK. Not exposed
    // in the registration form UI. Remove this branch once verified.
    const unitAmount = testMode ? 1000 : MONTHLY_PRICE_CZK;
    const trialEnd = testMode ? Math.floor(Date.now() / 1000) + 60 * 60 : undefined;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'czk',
            unit_amount: unitAmount,
            recurring: { interval: 'month' },
            product_data: {
              name: 'adressa.cz — Měsíční inzerce profilu',
              description: `Profil: ${provider.fullName}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        ...(trialEnd ? { trial_end: trialEnd } : { trial_period_days: TRIAL_DAYS }),
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
