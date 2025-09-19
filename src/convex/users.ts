import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

// Promote the current user to admin. If there is already at least one admin, do nothing unless it's the same user.
export const makeMeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) {
      throw new Error("Must be authenticated");
    }

    // Check if an admin exists already
    const allUsers = await ctx.db.query("users").collect();
    const existingAdmin = allUsers.find((u) => u.role === "admin");

    if (existingAdmin && existingAdmin._id !== me._id) {
      throw new Error("An admin already exists");
    }

    await ctx.db.patch(me._id, { role: "admin" });
    return true;
  },
});