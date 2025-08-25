import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    dateJoined: v.string(),
    ippis: v.string(),
    pin: v.string(),
    monthlyContribution: v.number(),
    totalContribution: v.number(),
  }).index("by_pin", ["pin"]),

  quickLoans: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    status: v.union(
      v.literal("processing"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cleared")
    ),
    dateApplied: v.string(),
    dateApproved: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    clearedDate: v.optional(v.string()),
    interestRate: v.number(),
    totalRepayment: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  coreLoans: defineTable({
    userId: v.id("users"),
    loanDate: v.string(),
    mobileNumber: v.string(),
    amountRequested: v.number(),
    accountNumber: v.string(),
    accountName: v.string(),
    bank: v.string(),
    existingLoan: v.string(),
    guarantor1Name: v.string(),
    guarantor1Phone: v.string(),
    guarantor2Name: v.string(),
    guarantor2Phone: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cleared")
    ),
    dateApplied: v.string(),
    dateApproved: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    clearedDate: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  activityHistory: defineTable({
    userId: v.id("users"),
    loanType: v.union(v.literal("quick"), v.literal("core")),
    loanId: v.union(v.id("quickLoans"), v.id("coreLoans")),
    action: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cleared")
    ),
    date: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_loan_type", ["loanType"]),

  // remove later
  loans: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    dateApplied: v.string(),
    approvedDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.union(
      v.literal("cleared"),
      v.literal("processing"),
      v.literal("approved")
    ),
    approvedBy: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"]),
});