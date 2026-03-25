import { query } from "./_generated/server";
import { v } from "convex/values";

export const getForVenture = query({
  args: { ventureId: v.id("ventures") },
  handler: async (ctx, args) => {
    const holders = await ctx.db
      .query("equityHolders")
      .withIndex("by_venture", (q) => q.eq("ventureId", args.ventureId))
      .collect();

    // Enrich with user data
    const enriched = await Promise.all(
      holders.map(async (h) => {
        const user = await ctx.db.get(h.userId);
        return { ...h, user };
      })
    );

    return enriched;
  },
});

export const getForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const holdings = await ctx.db
      .query("equityHolders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const enriched = await Promise.all(
      holdings.map(async (h) => {
        const venture = await ctx.db.get(h.ventureId);
        return { ...h, venture };
      })
    );

    return enriched;
  },
});
