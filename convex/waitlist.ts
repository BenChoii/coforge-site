import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const join = mutation({
  args: {
    email: v.string(),
    role: v.optional(v.union(v.literal("founder"), v.literal("agent"))),
  },
  handler: async (ctx, args) => {
    // Check if already on waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return { success: true, alreadyExists: true };

    await ctx.db.insert("waitlist", {
      email: args.email,
      role: args.role,
      createdAt: Date.now(),
    });
    return { success: true, alreadyExists: false };
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("waitlist").order("desc").take(100);
  },
});
