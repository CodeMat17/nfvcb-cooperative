import { query } from "./_generated/server";

export const backupAllData = query({
  handler: async (ctx) => {
    // Fetch all data from all tables
    const users = await ctx.db.query("users").collect();
    const quickLoans = await ctx.db.query("quickLoans").collect();
    const coreLoans = await ctx.db.query("coreLoans").collect();
    const activityHistory = await ctx.db.query("activityHistory").collect();

    return {
      users,
      quickLoans,
      coreLoans,
      activityHistory,
      backupDate: new Date().toISOString(),
      totalRecords: {
        users: users.length,
        quickLoans: quickLoans.length,
        coreLoans: coreLoans.length,
        activityHistory: activityHistory.length,
      },
    };
  },
});

export const backupUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return {
      users,
      backupDate: new Date().toISOString(),
      count: users.length,
    };
  },
});

export const backupLoans = query({
  handler: async (ctx) => {
    const quickLoans = await ctx.db.query("quickLoans").collect();
    const coreLoans = await ctx.db.query("coreLoans").collect();

    return {
      quickLoans,
      coreLoans,
      backupDate: new Date().toISOString(),
      counts: {
        quickLoans: quickLoans.length,
        coreLoans: coreLoans.length,
      },
    };
  },
});












