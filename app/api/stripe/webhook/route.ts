import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * POST /api/stripe/webhook
 *
 * Receives signed events from Stripe and updates Convex accordingly.
 *
 * IMPORTANT: this route must read the raw request body — do NOT call
 * request.json(). Stripe's signature verification requires the exact bytes
 * that were sent; parsing first invalidates the signature check.
 *
 * Events handled:
 *   payment_intent.succeeded  → recordFee in Convex (logs fee + updates revenue)
 *   account.updated            → marks Stripe onboarding complete when charges_enabled flips true
 */

// Disable Next.js body parsing — we need the raw bytes for stripe.webhooks.constructEvent
export const config = { api: { bodyParser: false } };

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  // Verify the event came from Stripe — throws if signature is invalid or replayed
  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const ventureId = pi.metadata?.ventureId;

        if (!ventureId) {
          // Payment not created through CoForge charge route — skip silently
          break;
        }

        if (convex) {
          await convex.mutation(api.ventures.recordFee, {
            ventureId: ventureId as Id<"ventures">,
            amountCents: pi.amount,
            stripePaymentIntentId: pi.id,
          });
        }

        console.log(`Fee recorded for venture ${ventureId} — payment ${pi.id} ($${pi.amount / 100})`);
        break;
      }

      case "account.updated": {
        const account = event.data.object;
        // Only act when charges_enabled just became true (onboarding newly complete)
        const previousAttributes = event.data.previous_attributes as Record<string, unknown> | undefined;
        const wasJustEnabled =
          account.charges_enabled &&
          previousAttributes?.charges_enabled === false;

        if (wasJustEnabled && convex) {
          // Find the venture by stripeConnectedAccountId and mark onboarding complete.
          // We store the accountId in Stripe metadata on account creation, so we can
          // look it up here via the account.metadata.ventureId field.
          const ventureId = (account.metadata as Record<string, string> | undefined)?.ventureId;
          if (ventureId) {
            await convex.mutation(api.ventures.setStripeAccount, {
              ventureId: ventureId as Id<"ventures">,
              stripeConnectedAccountId: account.id,
              onboardingComplete: true,
            });
            console.log(`Stripe onboarding complete for venture ${ventureId} (account ${account.id})`);
          }
        }
        break;
      }

      default:
        // Unhandled event type — Stripe still expects a 200
        break;
    }
  } catch (err) {
    // Log but don't return 4xx/5xx — Stripe would retry endlessly
    console.error(`Error processing Stripe event ${event.type}:`, err);
  }

  // Always return 200 promptly so Stripe marks the delivery as successful
  return NextResponse.json({ received: true });
}
