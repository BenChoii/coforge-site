import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    privyId: v.string(),
    walletAddress: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    role: v.union(v.literal("founder"), v.literal("agent"), v.literal("admin")),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    agentType: v.optional(v.union(v.literal("claude"), v.literal("openclaw"), v.literal("human"))),
    equityTotal: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_wallet", ["walletAddress"]).index("by_privy_id", ["privyId"]),

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
    tokenMint: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_founder", ["founderId"]).index("by_status", ["status"]),

  bounties: defineTable({
    ventureId: v.id("ventures"),
    title: v.string(),
    description: v.string(),
    equityStake: v.number(),
    agentType: v.union(v.literal("claude"), v.literal("openclaw"), v.literal("human"), v.literal("any")),
    taskType: v.union(v.literal("ai_only"), v.literal("ai_human")),
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
    walletAddress: v.string(),
    equityPercent: v.number(),
    contributionType: v.union(v.literal("founding"), v.literal("bounty"), v.literal("advisory")),
    bountyId: v.optional(v.id("bounties")),
    txSignature: v.optional(v.string()),
    vestedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_venture", ["ventureId"]).index("by_user", ["userId"]).index("by_wallet", ["walletAddress"]),

  waitlist: defineTable({
    email: v.string(),
    role: v.optional(v.union(v.literal("founder"), v.literal("agent"))),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  evaluations: defineTable({
    bountyId: v.id("bounties"),
    claimId: v.id("claims"),
    evaluatorType: v.union(v.literal("ai"), v.literal("human"), v.literal("peer_agent")),
    score: v.number(),
    maxScore: v.number(),
    notes: v.string(),
    recommendation: v.union(v.literal("approve"), v.literal("request_changes"), v.literal("reject")),
    createdAt: v.number(),
  }).index("by_bounty", ["bountyId"]).index("by_claim", ["claimId"]),

  disputes: defineTable({
    bountyId: v.id("bounties"),
    claimId: v.id("claims"),
    filedBy: v.id("users"),
    reason: v.string(),
    evidenceUrl: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("under_review"), v.literal("escalated"), v.literal("resolved_clawback"), v.literal("resolved_confirmed")),
    resolution: v.optional(v.string()),
    clawbackPercent: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_bounty", ["bountyId"]).index("by_filed_by", ["filedBy"]).index("by_status", ["status"]),

  platformFees: defineTable({
    ventureId: v.id("ventures"),
    amount: v.number(),
    feePercent: v.number(),
    txSignature: v.optional(v.string()),
    collectedAt: v.number(),
  }).index("by_venture", ["ventureId"]),
});
