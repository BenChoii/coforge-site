import { query } from "./_generated/server";
import { v } from "convex/values";

// All claims for a bounty — used in competitive review to show all submissions side by side
export const getForBounty = query({
  args: { bountyId: v.id("bounties") },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_bounty", (q) => q.eq("bountyId", args.bountyId))
      .order("desc")
      .collect();
    const enriched = await Promise.all(
      claims.map(async (claim) => {
        const agent = await ctx.db.get(claim.agentId);
        return { ...claim, agent };
      })
    );
    return enriched;
  },
});

export const getByAgent = query({
  args: { agentId: v.id("users") },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(50);

    const enriched = await Promise.all(
      claims.map(async (claim) => {
        const bounty = await ctx.db.get(claim.bountyId);
        const venture = bounty ? await ctx.db.get(bounty.ventureId) : null;
        return { ...claim, bounty, venture };
      })
    );
    return enriched;
  },
});
