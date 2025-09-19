import { SongCard } from "@/components/SongCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Search as SearchIcon, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { toast } from "sonner";

interface Song {
  _id: Id<"songs">;
  title: string;
  artist: string;
  albumCover?: string;
  duration: number;
  playCount?: number;
}

interface OutletContext {
  handlePlaySong: (song: Song, playlist?: Song[]) => void;
  playlist: Song[];
}

export default function Search() {
  const { handlePlaySong } = useOutletContext<OutletContext>();
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useQuery(api.songs.searchSongs, { query: searchQuery });
  const allSongs = useQuery(api.songs.getAllSongs);
  const toggleLike = useMutation(api.likes.toggleLike);

  const handleLike = async (songId: Id<"songs">) => {
    try {
      const isLiked = await toggleLike({ songId });
      toast(isLiked ? "Added to Liked Songs" : "Removed from Liked Songs");
    } catch (error) {
      toast.error("Failed to update like status");
    }
  };

  const popularSongs = allSongs?.slice().sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);

  const genres = [
    { name: "Synthwave", color: "from-purple-500 to-pink-500" },
    { name: "Electronic", color: "from-blue-500 to-cyan-500" },
    { name: "Indie", color: "from-green-500 to-teal-500" },
    { name: "Ambient", color: "from-orange-500 to-red-500" },
    { name: "Cyberpunk", color: "from-indigo-500 to-purple-500" },
    { name: "Dream Pop", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
          
          {/* Search Input */}
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </motion.div>

        {/* Search Results */}
        {searchQuery && searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((song) => (
                    <SongCard
                      key={song._id}
                      song={song}
                      onPlay={(song) => handlePlaySong(song, searchResults)}
                      onLike={handleLike}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No results found for "{searchQuery}"
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Browse by Genre */}
        {!searchQuery && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Browse all</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {genres.map((genre) => (
                  <Card
                    key={genre.name}
                    className={`bg-gradient-to-br ${genre.color} border-0 cursor-pointer hover:scale-105 transition-transform`}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white text-lg">{genre.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Popular Songs */}
            {popularSongs && popularSongs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Popular Right Now</span>
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        Show all
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {popularSongs.map((song, index) => (
                      <div key={song._id} className="flex items-center space-x-3">
                        <span className="text-muted-foreground font-mono text-sm w-6">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <SongCard
                            song={song}
                            onPlay={(song) => handlePlaySong(song, popularSongs)}
                            onLike={handleLike}
                            showPlayCount
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
