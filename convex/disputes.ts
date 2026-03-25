import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const file = mutation({
  args: {
    bountyId: v.id("bounties"),
    claimId: v.id("claims"),
    filedBy: v.id("users"),
    reason: v.string(),
    evidenceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("disputes", {
      ...args,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const resolve = mutation({
  args: {
    disputeId: v.id("disputes"),
    status: v.union(v.literal("resolved_clawback"), v.literal("resolved_confirmed")),
    resolution: v.string(),
    clawbackPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.disputeId, {
      status: args.status,
      resolution: args.resolution,
      clawbackPercent: args.clawbackPercent,
      resolvedAt: Date.now(),
    });
  },
});

export const listByStatus = query({
  args: { status: v.union(v.literal("open"), v.literal("under_review"), v.literal("escalated"), v.literal("resolved_clawback"), v.literal("resolved_confirmed")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("disputes")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .take(50);
  },
});
