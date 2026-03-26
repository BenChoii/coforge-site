import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/stripe/connect/callback?account_id=acct_...&venture_id=...
 *
 * Stripe redirects here after the founder completes (or exits) onboarding.
 * We verify the account exists, check its charges_enabled status,
 * then update the venture record in Convex via the HTTP API.
 *
 * The Convex mutation `ventures.setStripeAccount` stores:
 *   - stripeConnectedAccountId
 *   - stripeOnboardingCompletedAt (if charges are enabled)
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
    // Verify the account with Stripe
    const account = await stripe.accounts.retrieve(accountId);

    const onboardingComplete = account.charges_enabled && account.details_submitted;

    // Persist to Convex via its HTTP API
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      await fetch(`${convexUrl}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "ventures:setStripeAccount",
          args: {
            ventureId,
            stripeConnectedAccountId: accountId,
            onboardingComplete,
          },
        }),
      });
    }

    if (!onboardingComplete) {
      // Founder left onboarding early — redirect back to let them retry
      return NextResponse.redirect(
        `${appUrl}/ventures/new?stripe_incomplete=1&account_id=${accountId}&venture_id=${ventureId}`
      );
    }

    // Full success — venture is live
    return NextResponse.redirect(`${appUrl}/ventures?connected=1`);
  } catch (error) {
    console.error("Stripe callback error:", error);
    return NextResponse.redirect(`${appUrl}/ventures/new?error=stripe_callback`);
  }
}
