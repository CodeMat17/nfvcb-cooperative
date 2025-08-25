import { v } from "convex/values";
import dayjs from "dayjs";
import { mutation, query } from "./_generated/server";

export const applyQuickLoan = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = dayjs().format("YYYY-MM-DD");

    // Check if user has an active quick loan (processing or approved)
    const existingQuickLoan = await ctx.db
      .query("quickLoans")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "processing"),
          q.eq(q.field("status"), "approved")
        )
      )
      .first();

    if (existingQuickLoan) {
      throw new Error(
        "You already have an active quick loan. Please wait for approval or clear existing loan first."
      );
    }

    const interestRate = 0.05; // 5% interest rate
    const totalRepayment = args.amount + args.amount * interestRate;

    const loanId = await ctx.db.insert("quickLoans", {
      userId: args.userId,
      amount: args.amount,
      status: "processing",
      dateApplied: today,
      interestRate: interestRate,
      totalRepayment: totalRepayment,
    });

    // Add to activity history
    await ctx.db.insert("activityHistory", {
      userId: args.userId,
      loanType: "quick",
      loanId,
      action: "Quick loan application submitted",
      status: "processing",
      date: today,
      createdAt: now,
    });

    return loanId;
  },
});

export const applyCoreLoan = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = dayjs().format("YYYY-MM-DD");

    const loanId = await ctx.db.insert("coreLoans", {
      userId: args.userId,
      loanDate: args.loanDate,
      mobileNumber: args.mobileNumber,
      amountRequested: args.amountRequested,
      accountNumber: args.accountNumber,
      accountName: args.accountName,
      bank: args.bank,
      existingLoan: args.existingLoan,
      guarantor1Name: args.guarantor1Name,
      guarantor1Phone: args.guarantor1Phone,
      guarantor2Name: args.guarantor2Name,
      guarantor2Phone: args.guarantor2Phone,
      status: "processing",
      dateApplied: today,
    });

    // Add to activity history
    await ctx.db.insert("activityHistory", {
      userId: args.userId,
      loanType: "core",
      loanId,
      action: "Core loan application submitted",
      status: "processing",
      date: today,
      createdAt: now,
    });

    return loanId;
  },
});

export const approveQuickLoan = mutation({
  args: { loanId: v.id("quickLoans") },
  handler: async (ctx, args) => {
    const loan = await ctx.db.get(args.loanId);
    if (!loan) throw new Error("Loan not found");

    const now = Date.now();
    const today = dayjs().format("YYYY-MM-DD");
    const expiryDate = dayjs().add(6, "months").format("YYYY-MM-DD");

    await ctx.db.patch(args.loanId, {
      status: "approved",
      dateApproved: today,
      expiryDate,
    });

    // Add to activity history
    await ctx.db.insert("activityHistory", {
      userId: loan.userId,
      loanType: "quick",
      loanId: args.loanId,
      action: "Quick Loan Approved",
      status: "approved",
      date: today,
      createdAt: now,
    });
  },
});

export const approveCoreLoan = mutation({
  args: { loanId: v.id("coreLoans") },
  handler: async (ctx, args) => {
    const loan = await ctx.db.get(args.loanId);
    if (!loan) throw new Error("Loan not found");

    const now = Date.now();
    const today = dayjs().format("YYYY-MM-DD");
    const expiryDate = dayjs().add(2, "years").format("YYYY-MM-DD");

    await ctx.db.patch(args.loanId, {
      status: "approved",
      dateApproved: today,
      expiryDate,
    });

    // Add to activity history
    await ctx.db.insert("activityHistory", {
      userId: loan.userId,
      loanType: "core",
      loanId: args.loanId,
      action: "Core Loan Approved",
      status: "approved",
      date: today,
      createdAt: now,
    });
  },
});

export const rejectLoan = mutation({
  args: {
    loanId: v.union(v.id("quickLoans"), v.id("coreLoans")),
    loanType: v.union(v.literal("quick"), v.literal("core")),
  },
  handler: async (ctx, args) => {
    const loan = await ctx.db.get(args.loanId);
    if (!loan) throw new Error("Loan not found");

    const now = Date.now();
    const today = dayjs().format("YYYY-MM-DD");

    await ctx.db.patch(args.loanId, {
      status: "rejected",
    });

    // Add to activity history
    await ctx.db.insert("activityHistory", {
      userId: loan.userId,
      loanType: args.loanType,
      loanId: args.loanId,
      action: `${args.loanType === "quick" ? "Quick" : "Core"} Loan Rejected`,
      status: "rejected",
      date: today,
      createdAt: now,
    });
  },
});

export const clearLoan = mutation({
  args: {
    loanId: v.union(v.id("quickLoans"), v.id("coreLoans")),
    loanType: v.union(v.literal("quick"), v.literal("core")),
  },
  handler: async (ctx, args) => {
    const loan = await ctx.db.get(args.loanId);
    if (!loan) throw new Error("Loan not found");

    const now = Date.now();
    const today = dayjs().format("YYYY-MM-DD");

    await ctx.db.patch(args.loanId, {
      status: "cleared",
      clearedDate: today,
    });

    // Add to activity history
    await ctx.db.insert("activityHistory", {
      userId: loan.userId,
      loanType: args.loanType,
      loanId: args.loanId,
      action: `${args.loanType === "quick" ? "Quick" : "Core"} Loan Cleared`,
      status: "cleared",
      date: today,
      createdAt: now,
    });
  },
});

export const getUserLoans = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const quickLoans = await ctx.db
      .query("quickLoans")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const coreLoans = await ctx.db
      .query("coreLoans")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      quickLoans: quickLoans.sort((a, b) => b._creationTime - a._creationTime),
      coreLoans: coreLoans.sort((a, b) => b._creationTime - a._creationTime),
    };
  },
});

export const getAllQuickLoans = query({
  handler: async (ctx) => {
    const loans = await ctx.db.query("quickLoans").collect();
    return loans.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getAllCoreLoans = query({
  handler: async (ctx) => {
    const loans = await ctx.db.query("coreLoans").collect();
    return loans.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getQuickLoansByStatus = query({
  args: {
    status: v.union(
      v.literal("processing"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cleared")
    ),
  },
  handler: async (ctx, args) => {
    const loans = await ctx.db
      .query("quickLoans")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    if (args.status === "approved") {
      // For approved loans, sort by approval date (most recent first) and put expired loans at bottom
      return loans.sort((a, b) => {
        const aIsExpired = dayjs(a.expiryDate).isBefore(dayjs(), "day");
        const bIsExpired = dayjs(b.expiryDate).isBefore(dayjs(), "day");

        // Put expired loans at the bottom
        if (aIsExpired && !bIsExpired) return 1;
        if (!aIsExpired && bIsExpired) return -1;

        // For non-expired loans, sort by approval date (most recent first)
        if (!aIsExpired && !bIsExpired) {
          const aDateApproved = a.dateApproved || a.dateApplied;
          const bDateApproved = b.dateApproved || b.dateApplied;
          return (
            dayjs(bDateApproved).valueOf() - dayjs(aDateApproved).valueOf()
          );
        }

        // For expired loans, sort by approval date (most recent first)
        const aDateApproved = a.dateApproved || a.dateApplied;
        const bDateApproved = b.dateApproved || b.dateApplied;
        return dayjs(bDateApproved).valueOf() - dayjs(aDateApproved).valueOf();
      });
    }

    // For other statuses, sort by creation time (most recent first)
    return loans.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getCoreLoansByStatus = query({
  args: {
    status: v.union(
      v.literal("processing"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cleared")
    ),
  },
  handler: async (ctx, args) => {
    const loans = await ctx.db
      .query("coreLoans")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return loans.sort((a, b) => b._creationTime - a._creationTime);
  },
});
