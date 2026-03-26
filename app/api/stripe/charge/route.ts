import { NextResponse } from "next/server";
import { stripe, applicationFee } from "@/lib/stripe";

/**
 * POST /api/stripe/charge
 *
 * Called when a venture wants to charge a customer.
 * Creates a PaymentIntent that automatically splits the payment:
 *   - 5% application fee → CoForge's platform Stripe account (collected automatically)
 *   - 95% → venture's connected Stripe account (transfer_data.destination)
 *
 * Body: {
 *   amountCents: number,       // e.g. 5000 for $50.00
 *   currency: string,          // e.g. "usd"
 *   connectedAccountId: string, // venture's acct_... from Stripe
 *   description?: string,
 *   metadata?: Record<string, string>
 * }
 *
 * Returns: { clientSecret: string } — pass to Stripe.js on the frontend
 * to complete payment collection without ever touching card data.
 */
export async function POST(request: Request) {
  try {
    const { amountCents, currency = "usd", connectedAccountId, description, metadata } =
      await request.json();

    if (!amountCents || !connectedAccountId) {
      return NextResponse.json(
        { error: "amountCents and connectedAccountId are required." },
        { status: 400 }
      );
    }

    if (amountCents < 50) {
      return NextResponse.json({ error: "Minimum charge is $0.50." }, { status: 400 });
    }

    const fee = applicationFee(amountCents);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      // application_fee_amount: Stripe deducts this from the charge and
      // keeps it in the CoForge platform account before transferring the
      // remainder to the connected account. No code runs — Stripe handles
      // this atomically at the infrastructure layer.
      application_fee_amount: fee,
      transfer_data: {
        destination: connectedAccountId,
      },
      description,
      metadata: {
        ...metadata,
        platform_fee_pct: String(fee / amountCents * 100),
      },
    });

    // Return client_secret so the frontend can call stripe.confirmPayment()
    // The card data never touches your server — Stripe.js handles tokenization
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe charge error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create payment.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
