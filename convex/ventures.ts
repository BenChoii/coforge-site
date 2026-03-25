import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ventures", {
      ...args,
      status: "active",
      totalEquityAllocated: 0,
      revenueGenerated: 0,
      createdAt: Date.now(),
    });
  },
});
