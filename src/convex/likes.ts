import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getLikedSongs = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const likedSongs = await ctx.db
      .query("likedSongs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const songsWithDetails = await Promise.all(
      likedSongs.map(async (like) => {
        const song = await ctx.db.get(like.songId);
        if (!song) return null;
        
        const artist = await ctx.db.get(song.artistId);
        const album = song.albumId ? await ctx.db.get(song.albumId) : null;
        
        return {
          ...song,
          artist: artist?.name || "Unknown Artist",
          artistImage: artist?.image,
          album: album?.title || "Single",
          albumCover: album?.coverImage || song.coverImage,
        };
      })
    );
    
    return songsWithDetails.filter(Boolean);
  },
});

export const isLiked = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;
    
    const like = await ctx.db
      .query("likedSongs")
      .withIndex("by_user_and_song", (q) => 
        q.eq("userId", user._id).eq("songId", args.songId)
      )
      .unique();
    
    return !!like;
  },
});

export const toggleLike = mutation({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Must be authenticated to like songs");
    
    const existingLike = await ctx.db
      .query("likedSongs")
      .withIndex("by_user_and_song", (q) => 
        q.eq("userId", user._id).eq("songId", args.songId)
      )
      .unique();
    
    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      return false;
    } else {
      await ctx.db.insert("likedSongs", {
        userId: user._id,
        songId: args.songId,
      });
      return true;
    }
  },
});
