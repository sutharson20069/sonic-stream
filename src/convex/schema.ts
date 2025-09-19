import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Music streaming tables
    artists: defineTable({
      name: v.string(),
      image: v.optional(v.string()),
      bio: v.optional(v.string()),
      genres: v.array(v.string()),
      verified: v.optional(v.boolean()),
    }).index("by_name", ["name"]),

    albums: defineTable({
      title: v.string(),
      artistId: v.id("artists"),
      coverImage: v.optional(v.string()),
      releaseDate: v.string(),
      genres: v.array(v.string()),
      totalTracks: v.number(),
    }).index("by_artist", ["artistId"])
     .index("by_release_date", ["releaseDate"]),

    songs: defineTable({
      title: v.string(),
      artistId: v.id("artists"),
      albumId: v.optional(v.id("albums")),
      duration: v.number(), // in seconds
      audioUrl: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      genres: v.array(v.string()),
      trackNumber: v.optional(v.number()),
      playCount: v.optional(v.number()),
    }).index("by_artist", ["artistId"])
     .index("by_album", ["albumId"])
     .index("by_title", ["title"]),

    playlists: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      userId: v.id("users"),
      coverImage: v.optional(v.string()),
      isPublic: v.boolean(),
      songIds: v.array(v.id("songs")),
    }).index("by_user", ["userId"])
     .index("by_public", ["isPublic"]),

    likedSongs: defineTable({
      userId: v.id("users"),
      songId: v.id("songs"),
    }).index("by_user", ["userId"])
     .index("by_song", ["songId"])
     .index("by_user_and_song", ["userId", "songId"]),

    playHistory: defineTable({
      userId: v.id("users"),
      songId: v.id("songs"),
      playedAt: v.number(),
    }).index("by_user", ["userId"])
     .index("by_user_and_played_at", ["userId", "playedAt"]),

    followedArtists: defineTable({
      userId: v.id("users"),
      artistId: v.id("artists"),
    }).index("by_user", ["userId"])
     .index("by_artist", ["artistId"])
     .index("by_user_and_artist", ["userId", "artistId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;