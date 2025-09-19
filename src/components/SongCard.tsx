import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Heart, MoreHorizontal, Pause, Play } from "lucide-react";

interface Song {
  _id: Id<"songs">;
  title: string;
  artist: string;
  albumCover?: string;
  duration: number;
  playCount?: number;
}

interface SongCardProps {
  song: Song;
  isPlaying?: boolean;
  onPlay: (song: Song) => void;
  onLike?: (songId: Id<"songs">) => void;
  isLiked?: boolean;
  showPlayCount?: boolean;
}

export function SongCard({ 
  song, 
  isPlaying = false, 
  onPlay, 
  onLike, 
  isLiked = false,
  showPlayCount = false 
}: SongCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlayCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
        <div className="flex items-center space-x-3">
          {/* Album Cover */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {song.albumCover ? (
              <img
                src={song.albumCover}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(song);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30"
              >
                {isPlaying ? (
                  <Pause className="h-3 w-3 text-white" />
                ) : (
                  <Play className="h-3 w-3 text-white ml-0.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{song.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
            {showPlayCount && song.playCount && (
              <p className="text-xs text-muted-foreground">
                {formatPlayCount(song.playCount)} plays
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="text-xs text-muted-foreground">
            {formatDuration(song.duration)}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onLike && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(song._id);
                }}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
