import { SongCard } from "@/components/SongCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Clock, Play, TrendingUp } from "lucide-react";
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

export default function Home() {
  const { handlePlaySong } = useOutletContext<OutletContext>();
  const songs = useQuery(api.songs.getAllSongs);
  const recentlyPlayed = useQuery(api.songs.getRecentlyPlayed);
  const toggleLike = useMutation(api.likes.toggleLike);

  const handleLike = async (songId: Id<"songs">) => {
    try {
      const isLiked = await toggleLike({ songId });
      toast(isLiked ? "Added to Liked Songs" : "Removed from Liked Songs");
    } catch (error) {
      toast.error("Failed to update like status");
    }
  };

  const topSongs = songs?.slice().sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 6);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">Good evening</h1>
          <p className="text-muted-foreground">Discover new music and enjoy your favorites</p>
        </motion.div>

        {/* Quick Play Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Liked Songs</h3>
                  <p className="text-sm text-muted-foreground">Your favorite tracks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/20 hover:from-green-500/30 hover:to-blue-500/30 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Discover Weekly</h3>
                  <p className="text-sm text-muted-foreground">Fresh recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/20 hover:from-orange-500/30 hover:to-red-500/30 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Recently Played</h3>
                  <p className="text-sm text-muted-foreground">Jump back in</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recently Played */}
        {recentlyPlayed && recentlyPlayed.length > 0 && (() => {
          const validRecentlyPlayed = recentlyPlayed.filter(song => song !== null);
          return validRecentlyPlayed.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recently Played</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {validRecentlyPlayed.slice(0, 5).map((song, index) => (
                    <SongCard
                      key={`${song._id}-${index}`}
                      song={song}
                      onPlay={(song) => handlePlaySong(song, validRecentlyPlayed)}
                      onLike={handleLike}
                    />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

        {/* Popular This Week */}
        {topSongs && topSongs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Popular This Week</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    Show all
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {topSongs.map((song, index) => (
                  <SongCard
                    key={song._id}
                    song={song}
                    onPlay={(song) => handlePlaySong(song, topSongs)}
                    onLike={handleLike}
                    showPlayCount
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Songs */}
        {songs && songs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>All Songs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {songs.map((song) => (
                  <SongCard
                    key={song._id}
                    song={song}
                    onPlay={(song) => handlePlaySong(song, songs)}
                    onLike={handleLike}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
}