import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getAllSongs = query({
  args: {},
  handler: async (ctx) => {
    const songs = await ctx.db.query("songs").collect();
    
    // Get artist and album info for each song
    const songsWithDetails = await Promise.all(
      songs.map(async (song) => {
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
    
    return songsWithDetails;
  },
});

export const getSongById = query({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.songId);
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
  },
});

export const searchSongs = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];
    
    const songs = await ctx.db.query("songs").collect();
    const artists = await ctx.db.query("artists").collect();
    const albums = await ctx.db.query("albums").collect();
    
    const searchTerm = args.query.toLowerCase();
    
    // Filter songs by title
    const matchingSongs = songs.filter(song => 
      song.title.toLowerCase().includes(searchTerm)
    );
    
    // Filter by artist name
    const matchingArtists = artists.filter(artist => 
      artist.name.toLowerCase().includes(searchTerm)
    );
    const songsByArtist = songs.filter(song => 
      matchingArtists.some(artist => artist._id === song.artistId)
    );
    
    // Filter by album title
    const matchingAlbums = albums.filter(album => 
      album.title.toLowerCase().includes(searchTerm)
    );
    const songsByAlbum = songs.filter(song => 
      matchingAlbums.some(album => album._id === song.albumId)
    );
    
    // Combine and deduplicate
    const allMatchingSongs = [...matchingSongs, ...songsByArtist, ...songsByAlbum];
    const uniqueSongs = allMatchingSongs.filter((song, index, self) => 
      index === self.findIndex(s => s._id === song._id)
    );
    
    // Add artist and album details
    const songsWithDetails = await Promise.all(
      uniqueSongs.map(async (song) => {
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
    
    return songsWithDetails;
  },
});

export const incrementPlayCount = mutation({
  args: { songId: v.id("songs") },
  handler: async (ctx, args) => {
    const song = await ctx.db.get(args.songId);
    if (!song) return;
    
    await ctx.db.patch(args.songId, {
      playCount: (song.playCount || 0) + 1,
    });
    
    // Add to play history if user is authenticated
    const user = await getCurrentUser(ctx);
    if (user) {
      await ctx.db.insert("playHistory", {
        userId: user._id,
        songId: args.songId,
        playedAt: Date.now(),
      });
    }
  },
});

export const getRecentlyPlayed = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const recentPlays = await ctx.db
      .query("playHistory")
      .withIndex("by_user_and_played_at", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
    
    const songsWithDetails = await Promise.all(
      recentPlays.map(async (play) => {
        const song = await ctx.db.get(play.songId);
        if (!song) return null;
        
        const artist = await ctx.db.get(song.artistId);
        const album = song.albumId ? await ctx.db.get(song.albumId) : null;
        
        return {
          ...song,
          artist: artist?.name || "Unknown Artist",
          artistImage: artist?.image,
          album: album?.title || "Single",
          albumCover: album?.coverImage || song.coverImage,
          playedAt: play.playedAt,
        };
      })
    );
    
    return songsWithDetails.filter(Boolean);
  },
});
