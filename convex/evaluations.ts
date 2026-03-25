import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    bountyId: v.id("bounties"),
    claimId: v.id("claims"),
    evaluatorType: v.union(v.literal("ai"), v.literal("human"), v.literal("peer_agent")),
    score: v.number(),
    maxScore: v.number(),
    notes: v.string(),
    recommendation: v.union(v.literal("approve"), v.literal("request_changes"), v.literal("reject")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("evaluations", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getForBounty = query({
  args: { bountyId: v.id("bounties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("evaluations")
      .withIndex("by_bounty", (q) => q.eq("bountyId", args.bountyId))
      .collect();
  },
});
