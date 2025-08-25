import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByPin = query({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_pin", (q) => q.eq("pin", args.pin))
      .first();

    return user;
  },
});

export const verifyUserByPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    // Only search for user with exact PIN match
    const user = await ctx.db
      .query("users")
      .withIndex("by_pin", (q) => q.eq("pin", args.pin))
      .first();

    if (user) {
      return { success: true, user, message: "User verified successfully" };
    } else {
      return {
        success: false,
        user: null,
        message: "Invalid PIN or user does not exist",
      };
    }
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    dateJoined: v.string(),
    ippis: v.string(),
    pin: v.string(),
    monthlyContribution: v.number(),
    totalContribution: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", args);
    return userId;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    ippis: v.optional(v.string()),
    pin: v.optional(v.string()),
    monthlyContribution: v.optional(v.number()),
    totalContribution: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.sort((a, b) => b._creationTime - a._creationTime);
  },
});
