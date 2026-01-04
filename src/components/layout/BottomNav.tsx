import { Home, Film, User, Clapperboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Film, label: "Serien", path: "/soaps" },
  { icon: Clapperboard, label: "Studio", path: "/studio" },
  { icon: User, label: "Profil", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show on auth, onboarding, or watch pages
  const hiddenPaths = ["/auth", "/onboarding", "/watch"];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) {
    return null;
  }

  // Also hide on legal pages
  if (["/impressum", "/datenschutz", "/agb"].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className={cn(
      "fixed bottom-0 inset-x-0 z-40",
      "bg-card/95 backdrop-blur-xl border-t border-border/50",
      "safe-area-bottom"
    )}>
      <div className="flex items-center justify-around max-w-md mx-auto py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
                isActive 
                  ? "text-gold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
