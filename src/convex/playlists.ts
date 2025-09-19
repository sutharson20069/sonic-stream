import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getUserPlaylists = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const playlists = await ctx.db
      .query("playlists")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    return playlists;
  },
});

export const getPlaylistById = query({
  args: { playlistId: v.id("playlists") },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist) return null;
    
    // Get songs with details
    const songsWithDetails = await Promise.all(
      playlist.songIds.map(async (songId) => {
        const song = await ctx.db.get(songId);
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
    
    return {
      ...playlist,
      songs: songsWithDetails.filter(Boolean),
    };
  },
});

export const createPlaylist = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Must be authenticated to create playlist");
    
    const playlistId = await ctx.db.insert("playlists", {
      name: args.name,
      description: args.description,
      userId: user._id,
      isPublic: args.isPublic,
      songIds: [],
    });
    
    return playlistId;
  },
});

export const addSongToPlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    songId: v.id("songs"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Must be authenticated");
    
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist || playlist.userId !== user._id) {
      throw new Error("Playlist not found or access denied");
    }
    
    if (!playlist.songIds.includes(args.songId)) {
      await ctx.db.patch(args.playlistId, {
        songIds: [...playlist.songIds, args.songId],
      });
    }
  },
});

export const removeSongFromPlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    songId: v.id("songs"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Must be authenticated");
    
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist || playlist.userId !== user._id) {
      throw new Error("Playlist not found or access denied");
    }
    
    await ctx.db.patch(args.playlistId, {
      songIds: playlist.songIds.filter(id => id !== args.songId),
    });
  },
});
