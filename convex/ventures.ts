import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("ventures")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(50);
    }
    return await ctx.db.query("ventures").order("desc").take(50);
  },
});

export const get = query({
  args: { id: v.id("ventures") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    founderId: v.id("users"),
    tags: v.array(v.string()),
    websiteUrl: v.optional(v.string()),
    founderEquityPct: v.optional(v.number()),
    agentPoolPct: v.optional(v.number()),
    platformAgreementSignedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ventures", {
      ...args,
      status: "active",
      totalEquityAllocated: 0,
      revenueGenerated: 0,
      platformEquityPct: 5, // always 5 — CoForge's non-negotiable stake
      createdAt: Date.now(),
    });
  },
});

/**
 * Called by the Stripe Connect callback route after the founder
 * completes (or partially completes) Stripe Express onboarding.
 * Stores the connected account ID so every future charge can route
 * through this account with the 5% application fee applied.
 */
export const setStripeAccount = mutation({
  args: {
    ventureId: v.string(), // string from URL param; cast to Id below
    stripeConnectedAccountId: v.string(),
    onboardingComplete: v.boolean(),
  },
  handler: async (ctx, args) => {
    const ventureId = args.ventureId as Id<"ventures">;
    const venture = await ctx.db.get(ventureId);
    if (!venture) throw new Error(`Venture ${args.ventureId} not found`);

    await ctx.db.patch(ventureId, {
      stripeConnectedAccountId: args.stripeConnectedAccountId,
      stripeOnboardingCompletedAt: args.onboardingComplete ? Date.now() : undefined,
      // If onboarding is done, activate the venture
      status: args.onboardingComplete ? "active" : venture.status,
    });
  },
});

/**
 * Record a platform fee collection event.
 * Called server-side after a successful charge with application_fee_amount.
 */
export const recordFee = mutation({
  args: {
    ventureId: v.id("ventures"),
    amountCents: v.number(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const feeCents = Math.round(args.amountCents * 0.05);
    await ctx.db.insert("platformFees", {
      ventureId: args.ventureId,
      amount: feeCents / 100, // store as dollars
      feePercent: 5,
      txSignature: args.stripePaymentIntentId,
      collectedAt: Date.now(),
    });
    // Update venture's total revenue
    const venture = await ctx.db.get(args.ventureId);
    if (venture) {
      await ctx.db.patch(args.ventureId, {
        revenueGenerated: venture.revenueGenerated + args.amountCents / 100,
      });
    }
  },
});
