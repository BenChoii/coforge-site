import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/connect
 *
 * Called when a founder clicks "Connect Stripe & launch venture".
 * Creates a Stripe Express connected account + an Account Link URL
 * that the founder completes on Stripe's hosted onboarding page.
 *
 * Body: { ventureId: string, ventureName: string, founderEmail?: string }
 * Returns: { url: string } — redirect the browser here
 */
export async function POST(request: Request) {
  try {
    const { ventureId, ventureName, founderEmail } = await request.json();

    if (!ventureId || !ventureName) {
      return NextResponse.json({ error: "ventureId and ventureName are required." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // 1. Create an Express connected account for this venture
    const account = await stripe.accounts.create({
      type: "express",
      email: founderEmail ?? undefined,
      metadata: {
        ventureId, // used by account.updated webhook to find venture in Convex
        ventureName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: ventureName,
      },
    });

    // 2. Create a single-use Account Link — Stripe hosts the KYC/bank onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${appUrl}/ventures/new?stripe_refresh=1&venture=${ventureId}`,
      return_url: `${appUrl}/api/stripe/connect/callback?account_id=${account.id}&venture_id=${ventureId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url, accountId: account.id });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create Stripe Connect link.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
