import { Home, Film, User, Clapperboard, Bookmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProducerApplication } from "@/hooks/useProducerApplication";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { isProducer } = useProducerApplication();

  // Don't show on auth, onboarding, watch, welcome, or landing pages
  const hiddenPaths = ["/auth", "/onboarding", "/watch", "/welcome"];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) {
    return null;
  }

  // Hide on landing page
  if (location.pathname === "/") {
    return null;
  }

  // Also hide on legal pages
  if (["/impressum", "/datenschutz", "/agb", "/producer-terms", "/why-shopable"].includes(location.pathname)) {
    return null;
  }

  // Build nav items dynamically based on producer status
  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Film, label: "Serien", path: "/soaps" },
    { icon: Bookmark, label: "Gespeichert", path: "/saved" },
    // Only show Studio for verified producers
    ...(isProducer ? [{ icon: Clapperboard, label: "Studio", path: "/studio" }] : []),
    { icon: User, label: "Profil", path: "/profile" },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 inset-x-0 z-40",
      "bg-card/95 backdrop-blur-xl border-t border-border/50",
      "safe-area-bottom"
    )}>
      <div className="flex items-center justify-around max-w-md mx-auto py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/feed" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                isActive 
                  ? "text-amber-400" 
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