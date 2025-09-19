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

// Promote the current user to admin by transferring the role exclusively to them.
// Any existing admins (other than the current user) will be demoted.
export const makeMeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) {
      throw new Error("Must be authenticated");
    }

    // Demote all other admins to "user" to ensure a single-admin policy
    const allUsers = await ctx.db.query("users").collect();
    for (const u of allUsers) {
      if (u.role === "admin" && u._id !== me._id) {
        await ctx.db.patch(u._id, { role: "user" });
      }
    }

    // Ensure current user is admin
    await ctx.db.patch(me._id, { role: "admin" });
    return true;
  },
});