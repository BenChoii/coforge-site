import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * GET /api/stripe/connect/callback?account_id=acct_...&venture_id=...
 *
 * Stripe redirects here after the founder completes (or exits) Express onboarding.
 * We verify the account, then persist the connected account ID to Convex.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");
  const ventureId = searchParams.get("venture_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!accountId || !ventureId) {
    return NextResponse.redirect(`${appUrl}/ventures/new?error=missing_params`);
  }

  try {
    // Verify the account status with Stripe
    const account = await stripe.accounts.retrieve(accountId);
    const onboardingComplete = account.charges_enabled && account.details_submitted;

    // Update the venture record in Convex
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const convex = new ConvexHttpClient(convexUrl);
      await convex.mutation(api.ventures.setStripeAccount, {
        ventureId: ventureId as Id<"ventures">,
        stripeConnectedAccountId: accountId,
        onboardingComplete: !!onboardingComplete,
      });
    }

    if (!onboardingComplete) {
      // Founder exited early — let them resume
      return NextResponse.redirect(
        `${appUrl}/ventures/new?stripe_incomplete=1&account_id=${accountId}&venture_id=${ventureId}`
      );
    }

    return NextResponse.redirect(`${appUrl}/ventures?connected=1`);
  } catch (error) {
    console.error("Stripe callback error:", error);
    return NextResponse.redirect(`${appUrl}/ventures/new?error=stripe_callback`);
  }
}
