import { BottomNavigation } from "@/components/BottomNavigation";
import { MusicPlayer } from "@/components/MusicPlayer";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";

interface Song {
  _id: Id<"songs">;
  title: string;
  artist: string;
  albumCover?: string;
  duration: number;
}

export default function App() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const songs = useQuery(api.songs.getAllSongs);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (songs && songs.length > 0 && !currentSong) {
      setPlaylist(songs);
    }
  }, [songs, currentSong]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handlePlaySong = (song: Song, newPlaylist?: Song[]) => {
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      const index = newPlaylist.findIndex(s => s._id === song._id);
      setCurrentIndex(index);
    } else {
      const index = playlist.findIndex(s => s._id === song._id);
      setCurrentIndex(index);
    }
    
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentSong(playlist[prevIndex]);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full pb-32 md:pb-24">
          <Outlet context={{ handlePlaySong, playlist }} />
        </div>
      </main>

      <BottomNavigation />
      
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        playlist={playlist}
        currentIndex={currentIndex}
      />
    </div>
  );
}
