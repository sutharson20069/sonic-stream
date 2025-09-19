import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, Library, Search, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: Search, label: "Search", path: "/app/search" },
    { icon: Library, label: "Library", path: "/app/library" },
    { icon: User, label: "Profile", path: "/app/profile" },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-20 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/50 p-2 z-40 md:hidden"
    >
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
}
