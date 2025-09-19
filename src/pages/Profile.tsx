import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { LogOut, Moon, Sun, User, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", !isDarkMode);
    toast(`Switched to ${newTheme} mode`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      toast("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Admin helpers
  const makeMeAdmin = useMutation(api.users.makeMeAdmin);
  const isAdmin = user?.role === "admin";

  const artists = useQuery(api.songs.getAllArtists);
  // album select will be rendered by a child component once artist is chosen

  // Admin form state
  const [songTitle, setSongTitle] = useState("");
  const [songDuration, setSongDuration] = useState<number>(0);
  const [songCover, setSongCover] = useState("");
  const [songGenres, setSongGenres] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<Id<"artists"> | "">("");
  const [selectedAlbum, setSelectedAlbum] = useState<Id<"albums"> | "">("");

  const adminAddSong = useMutation(api.songs.adminAddSong);

  const handleBecomeAdmin = async () => {
    try {
      await makeMeAdmin({});
      toast("You are now an admin");
    } catch (e: any) {
      toast.error(e?.message || "Failed to become admin");
    }
  };

  const handleAddSong = async () => {
    if (!isAdmin) {
      toast.error("Admin only");
      return;
    }
    if (!songTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!selectedArtist) {
      toast.error("Select an artist");
      return;
    }
    if (!songDuration || songDuration <= 0) {
      toast.error("Duration must be > 0 seconds");
      return;
    }
    const genresArr = songGenres
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    try {
      await adminAddSong({
        title: songTitle.trim(),
        artistId: selectedArtist as Id<"artists">,
        albumId: selectedAlbum ? (selectedAlbum as Id<"albums">) : undefined,
        duration: Number(songDuration),
        coverImage: songCover.trim() || undefined,
        genres: genresArr,
      });
      toast("Song added");
      setSongTitle("");
      setSongDuration(0);
      setSongCover("");
      setSongGenres("");
      setSelectedArtist("");
      setSelectedAlbum("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to add song");
    }
  };

  // Child component for album selection to safely use a hook when artist is chosen
  function AlbumSelect({ artistId, value, onChange }: {
    artistId: Id<"artists">;
    value: Id<"albums"> | "";
    onChange: (v: Id<"albums"> | "") => void;
  }) {
    const albums = useQuery(api.songs.getAlbumsByArtist, { artistId });
    return (
      <div className="space-y-2">
        <Label>Album (optional)</Label>
        <select
          value={value || ""}
          onChange={(e) => onChange((e.target.value as any) || "")}
          className="w-full rounded-md border border-border bg-background p-2"
        >
          <option value="">No album</option>
          {albums?.map((a) => (
            <option key={a._id} value={a._id as any}>
              {a.title}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Profile"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.name || user?.email || "Music Lover"}
            </h1>
            {user?.email && (
              <p className="text-muted-foreground">{user.email}</p>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm text-muted-foreground">Playlists</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">1.2K</div>
              <div className="text-sm text-muted-foreground">Liked Songs</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-muted-foreground">
                      {isDarkMode ? "Dark mode" : "Light mode"}
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={toggleTheme}>
                  {isDarkMode ? "Light" : "Dark"}
                </Button>
              </div>

              <Separator />

              {/* Audio Quality */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Audio Quality</div>
                    <div className="text-sm text-muted-foreground">
                      High quality streaming
                    </div>
                  </div>
                </div>
                <Button variant="outline">
                  High
                </Button>
              </div>

              <Separator />

              {/* Sign Out */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <LogOut className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-sm text-muted-foreground">
                      Sign out of your account
                    </div>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>About SoundWave</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                SoundWave is a modern music streaming platform that brings you the best 
                listening experience with high-quality audio and personalized recommendations.
              </p>
              <div className="text-sm text-muted-foreground">
                Version 1.0.0 • Built with ❤️ by vly.ai
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isAdmin ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Become Admin</div>
                    <div className="text-sm text-muted-foreground">
                      Promote your account to admin to manage content
                    </div>
                  </div>
                  <Button variant="default" onClick={handleBecomeAdmin}>
                    Become Admin
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="font-medium">Add New Song</div>
                    <div className="text-sm text-muted-foreground">
                      Only admins can add songs
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="Song title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (seconds)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={songDuration || ""}
                        onChange={(e) => setSongDuration(Number(e.target.value))}
                        placeholder="e.g. 240"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cover Image URL (optional)</Label>
                      <Input
                        value={songCover}
                        onChange={(e) => setSongCover(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Genres (comma-separated)</Label>
                      <Input
                        value={songGenres}
                        onChange={(e) => setSongGenres(e.target.value)}
                        placeholder="Synthwave, Electronic"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Artist</Label>
                      <select
                        value={selectedArtist || ""}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setSelectedArtist(val);
                          setSelectedAlbum("");
                        }}
                        className="w-full rounded-md border border-border bg-background p-2"
                      >
                        <option value="">Select an artist</option>
                        {artists?.map((ar) => (
                          <option key={ar._id} value={ar._id as any}>
                            {ar.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      {selectedArtist ? (
                        <AlbumSelect
                          artistId={selectedArtist as Id<"artists">}
                          value={selectedAlbum}
                          onChange={setSelectedAlbum}
                        />
                      ) : (
                        <div className="space-y-2 opacity-60">
                          <Label>Album (optional)</Label>
                          <select className="w-full rounded-md border border-border bg-background p-2" disabled>
                            <option>Select an artist first</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleAddSong}>Add Song</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  );
}