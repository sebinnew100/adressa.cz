import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, MONTHLY_PRICE_CZK, TRIAL_DAYS } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const providerId = session.metadata?.providerId;
      if (!providerId || session.mode !== 'payment' || !session.customer || !session.payment_intent) break;

      // The 10 CZK activation fee just charged for real. Now pull the
      // payment method it used and start the actual trialing subscription
      // server-side — no second checkout/redirect needed.
      const customerId = session.customer as string;
      const paymentIntent = await getStripe().paymentIntents.retrieve(session.payment_intent as string);
      const paymentMethodId = paymentIntent.payment_method as string | null;
      if (!paymentMethodId) break;

      const price = await getStripe().prices.create({
        currency: 'czk',
        unit_amount: MONTHLY_PRICE_CZK,
        recurring: { interval: 'week', interval_count: 4 },
        product_data: { name: 'adressa.cz — Inzerce profilu (každých 28 dní)' },
      });

      const subscription = await getStripe().subscriptions.create({
        customer: customerId,
        items: [{ price: price.id, quantity: 1 }],
        trial_period_days: TRIAL_DAYS,
        default_payment_method: paymentMethodId,
        metadata: { providerId },
      });

      await prisma.provider.update({
        where: { id: providerId },
        data: {
          active: true,
          subscriptionStatus: subscription.status,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
        },
      });
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.subscription_details;
      const subscriptionId = (typeof subDetails?.subscription === 'string' ? subDetails.subscription : subDetails?.subscription?.id) ?? null;
      if (subscriptionId) {
        // The invoice may bundle a same-day one-time fee alongside the
        // subscription's billing period line — take the furthest-out period
        // end so a same-day one-time item never gets mistaken for it.
        const periodEndUnix = invoice.lines.data.reduce<number | null>((latest, line) => {
          const end = line.period?.end;
          return end && (!latest || end > latest) ? end : latest;
        }, null);
        const paidUntil = periodEndUnix ? new Date(periodEndUnix * 1000) : undefined;
        // Don't touch subscriptionStatus here — this fires for the immediate
        // one-time activation fee too, while the subscription itself may
        // still genuinely be 'trialing'. customer.subscription.updated is
        // the source of truth for status; this handler only tracks payment.
        await prisma.provider.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            active: true,
            ...(paidUntil && { paidUntil }),
          },
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.subscription_details;
      const subscriptionId = (typeof subDetails?.subscription === 'string' ? subDetails.subscription : subDetails?.subscription?.id) ?? null;
      if (subscriptionId) {
        await prisma.provider.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { subscriptionStatus: 'past_due' },
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.provider.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          subscriptionStatus: subscription.status,
          active: ['trialing', 'active'].includes(subscription.status),
        },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.provider.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { active: false, subscriptionStatus: 'canceled' },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
