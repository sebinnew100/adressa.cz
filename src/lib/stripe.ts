import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    });
  }
  return _stripe;
}

export const MONTHLY_PRICE_CZK = 29900; // 299.00 CZK in haléře
export const TRIAL_ACTIVATION_FEE_CZK = 1000; // 10.00 CZK in haléře, one-time, charged immediately
export const TRIAL_DAYS = 7;
