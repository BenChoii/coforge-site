import Stripe from "stripe";

// Server-side Stripe client — never import this in client components
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

export const PLATFORM_FEE_PCT = Number(process.env.STRIPE_PLATFORM_FEE_PCT ?? 5);

/** Calculate application fee in cents for a given charge amount */
export function applicationFee(amountCents: number): number {
  return Math.round(amountCents * (PLATFORM_FEE_PCT / 100));
}
