import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingArtists = await ctx.db.query("artists").take(1);
    if (existingArtists.length > 0) {
      return "Database already seeded";
    }

    // Create artists
    const artist1 = await ctx.db.insert("artists", {
      name: "The Midnight",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      bio: "Synthwave duo creating nostalgic electronic music",
      genres: ["Synthwave", "Electronic", "Retrowave"],
      verified: true,
    });

    const artist2 = await ctx.db.insert("artists", {
      name: "Neon Dreams",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
      bio: "Indie electronic artist with dreamy soundscapes",
      genres: ["Indie Electronic", "Dream Pop", "Ambient"],
      verified: true,
    });

    const artist3 = await ctx.db.insert("artists", {
      name: "Cyber Pulse",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      bio: "Futuristic beats and cyberpunk vibes",
      genres: ["Cyberpunk", "Electronic", "Techno"],
      verified: false,
    });

    // Create albums
    const album1 = await ctx.db.insert("albums", {
      title: "Endless Summer",
      artistId: artist1,
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      releaseDate: "2023-06-15",
      genres: ["Synthwave", "Electronic"],
      totalTracks: 10,
    });

    const album2 = await ctx.db.insert("albums", {
      title: "Digital Horizons",
      artistId: artist2,
      coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
      releaseDate: "2023-08-20",
      genres: ["Indie Electronic", "Dream Pop"],
      totalTracks: 8,
    });

    // Create songs
    const songs = [
      {
        title: "Sunset Drive",
        artistId: artist1,
        albumId: album1,
        duration: 245,
        coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        genres: ["Synthwave"],
        trackNumber: 1,
        playCount: 1250,
      },
      {
        title: "Neon Nights",
        artistId: artist1,
        albumId: album1,
        duration: 198,
        coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        genres: ["Synthwave"],
        trackNumber: 2,
        playCount: 980,
      },
      {
        title: "Electric Dreams",
        artistId: artist2,
        albumId: album2,
        duration: 267,
        coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
        genres: ["Indie Electronic"],
        trackNumber: 1,
        playCount: 2100,
      },
      {
        title: "Midnight City",
        artistId: artist2,
        albumId: album2,
        duration: 223,
        coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
        genres: ["Dream Pop"],
        trackNumber: 2,
        playCount: 1800,
      },
      {
        title: "Cyber Highway",
        artistId: artist3,
        duration: 189,
        coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        genres: ["Cyberpunk"],
        playCount: 750,
      },
      {
        title: "Digital Rain",
        artistId: artist3,
        duration: 301,
        coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        genres: ["Electronic"],
        playCount: 650,
      },
      {
        title: "Retro Future",
        artistId: artist1,
        duration: 234,
        coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        genres: ["Synthwave"],
        playCount: 1100,
      },
      {
        title: "Starlight",
        artistId: artist2,
        duration: 278,
        coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
        genres: ["Ambient"],
        playCount: 890,
      },
    ];

    for (const song of songs) {
      await ctx.db.insert("songs", song);
    }

    return "Database seeded successfully!";
  },
});
