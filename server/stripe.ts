import Stripe from "stripe";

// Lazy-init stripe instance
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key, { apiVersion: "2025-04-30.basil" as any });
  }
  return _stripe;
}

// Product definitions — centralized for consistency
export const PRODUCTS = {
  gold: {
    name: "BOTHUB GOLD",
    description: "Neomezení iBoti, neomezené konverzace, 66% affiliate provize, API přístup",
    priceAmountCzk: 990_00, // in hellers (990 Kč)
    priceAmountUsd: 39_00,  // in cents ($39)
    currency: "czk" as const,
    interval: "month" as const,
    plan: "gold" as const,
  },
  diamond: {
    name: "BOTHUB DIAMOND",
    description: "Vše z GOLD + White-label, Custom persony, 77% affiliate provize",
    priceAmountCzk: 2490_00, // in hellers (2490 Kč)
    priceAmountUsd: 99_00,   // in cents ($99)
    currency: "czk" as const,
    interval: "month" as const,
    plan: "diamond" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

/**
 * Create a Stripe Checkout Session for a subscription plan.
 */
export async function createCheckoutSession(opts: {
  plan: ProductKey;
  email: string;
  registrationId: number;
  name?: string;
  origin: string;
  affiliateCode?: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const product = PRODUCTS[opts.plan];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: opts.email,
    allow_promotion_codes: true,
    client_reference_id: opts.registrationId.toString(),
    metadata: {
      registration_id: opts.registrationId.toString(),
      plan: opts.plan,
      customer_email: opts.email,
      customer_name: opts.name || "",
      affiliate_code: opts.affiliateCode || "",
    },
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceAmountCzk,
          recurring: { interval: product.interval },
        },
        quantity: 1,
      },
    ],
    success_url: `${opts.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${opts.plan}`,
    cancel_url: `${opts.origin}/payment-cancel?plan=${opts.plan}`,
  });

  return { url: session.url!, sessionId: session.id };
}

/**
 * Verify webhook signature and construct event.
 */
export function constructWebhookEvent(
  body: Buffer,
  signature: string,
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
