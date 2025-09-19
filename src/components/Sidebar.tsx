import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Heart, Home, Library, Plus, Search, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const mainNavItems = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: Search, label: "Search", path: "/app/search" },
    { icon: Library, label: "Your Library", path: "/app/library" },
  ];

  const libraryItems = [
    { icon: Heart, label: "Liked Songs", path: "/app/liked" },
  ];

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex flex-col w-64 bg-background border-r border-border/50 h-screen"
    >
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <img
            src="/logo.svg"
            alt="Music App"
            className="w-8 h-8"
            onClick={() => navigate("/")}
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            SoundWave
          </h1>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Main Navigation */}
        <div className="space-y-1 mb-6">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Library Section */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-medium text-muted-foreground">Library</h3>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {libraryItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* User Playlists */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground px-3 py-2">
            Made for You
          </h3>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <div className="w-4 h-4 mr-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-sm" />
            Discover Weekly
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <div className="w-4 h-4 mr-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-sm" />
            Release Radar
          </Button>
        </div>
      </ScrollArea>

      {/* User Profile */}
      {user && (
        <div className="p-3 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/app/profile")}
          >
            <User className="mr-3 h-4 w-4" />
            {user.name || user.email || "Profile"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
