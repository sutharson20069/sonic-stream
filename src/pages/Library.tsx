import { SongCard } from "@/components/SongCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Heart, Library as LibraryIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { toast } from "sonner";

interface Song {
  _id: Id<"songs">;
  title: string;
  artist: string;
  albumCover?: string;
  duration: number;
}

interface OutletContext {
  handlePlaySong: (song: Song, playlist?: Song[]) => void;
  playlist: Song[];
}

export default function Library() {
  const { handlePlaySong } = useOutletContext<OutletContext>();
  const playlists = useQuery(api.playlists.getUserPlaylists);
  const likedSongs = useQuery(api.likes.getLikedSongs);
  const createPlaylist = useMutation(api.playlists.createPlaylist);
  const toggleLike = useMutation(api.likes.toggleLike);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    try {
      await createPlaylist({
        name: playlistName,
        description: playlistDescription || undefined,
        isPublic,
      });
      
      toast.success("Playlist created successfully!");
      setIsCreateDialogOpen(false);
      setPlaylistName("");
      setPlaylistDescription("");
      setIsPublic(false);
    } catch (error) {
      toast.error("Failed to create playlist");
    }
  };

  const handleLike = async (songId: Id<"songs">) => {
    try {
      const isLiked = await toggleLike({ songId });
      toast(isLiked ? "Added to Liked Songs" : "Removed from Liked Songs");
    } catch (error) {
      toast.error("Failed to update like status");
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
            <p className="text-muted-foreground">Manage your music collection</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Playlist Name</Label>
                  <Input
                    id="name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                    placeholder="Describe your playlist..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Make playlist public</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlaylist}>
                    Create Playlist
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Liked Songs */}
        {likedSongs && likedSongs.length > 0 && (() => {
          const validLikedSongs = likedSongs.filter(song => song !== null);
          return validLikedSongs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                    <span>Liked Songs</span>
                    <span className="text-sm text-muted-foreground">
                      ({validLikedSongs.length} songs)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {validLikedSongs.slice(0, 5).map((song) => (
                    <SongCard
                      key={song._id}
                      song={song}
                      onPlay={(song) => handlePlaySong(song, validLikedSongs)}
                      onLike={handleLike}
                      isLiked={true}
                    />
                  ))}
                  {validLikedSongs.length > 5 && (
                    <Button variant="ghost" className="w-full">
                      Show all {validLikedSongs.length} songs
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

        {/* Playlists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LibraryIcon className="h-5 w-5" />
                <span>Your Playlists</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playlists && playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.map((playlist) => (
                    <Card key={playlist._id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <LibraryIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{playlist.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {playlist.songIds.length} songs
                            </p>
                            {playlist.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {playlist.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LibraryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't created any playlists yet
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Playlist
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  );
}