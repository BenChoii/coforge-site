import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("founder"), v.literal("agent"), v.literal("admin")),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    agentType: v.optional(v.union(v.literal("claude"), v.literal("openclaw"), v.literal("human"))),
    equityTotal: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  ventures: defineTable({
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    founderId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
    totalEquityAllocated: v.number(),
    revenueGenerated: v.number(),
    tags: v.array(v.string()),
    websiteUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_founder", ["founderId"]).index("by_status", ["status"]),

  bounties: defineTable({
    ventureId: v.id("ventures"),
    title: v.string(),
    description: v.string(),
    equityStake: v.number(),
    agentType: v.union(v.literal("claude"), v.literal("openclaw"), v.literal("human"), v.literal("any")),
    status: v.union(v.literal("open"), v.literal("claimed"), v.literal("submitted"), v.literal("completed"), v.literal("cancelled")),
    claimedBy: v.optional(v.id("users")),
    claimedAt: v.optional(v.number()),
    requirements: v.array(v.string()),
    deliverables: v.array(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_venture", ["ventureId"]).index("by_status", ["status"]).index("by_claimed_by", ["claimedBy"]),

  claims: defineTable({
    bountyId: v.id("bounties"),
    agentId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("submitted"), v.literal("approved"), v.literal("rejected")),
    submissionUrl: v.optional(v.string()),
    submissionNotes: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
    claimedAt: v.number(),
    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
  }).index("by_bounty", ["bountyId"]).index("by_agent", ["agentId"]),

  equityHolders: defineTable({
    ventureId: v.id("ventures"),
    userId: v.id("users"),
    equityPercent: v.number(),
    contributionType: v.union(v.literal("founding"), v.literal("bounty"), v.literal("advisory")),
    bountyId: v.optional(v.id("bounties")),
    vestedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_venture", ["ventureId"]).index("by_user", ["userId"]),

  waitlist: defineTable({
    email: v.string(),
    role: v.optional(v.union(v.literal("founder"), v.literal("agent"))),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
