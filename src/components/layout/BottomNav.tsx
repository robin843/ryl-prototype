import { Home, Film, User, Clapperboard, Bookmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProducerApplication } from "@/hooks/useProducerApplication";
import { useSheets } from "@/contexts/SheetContext";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { isProducer } = useProducerApplication();
  const { openProfile } = useSheets();

  // Don't show on auth, onboarding, watch, welcome pages
  const hiddenPaths = ["/auth", "/onboarding", "/welcome", "/producer-terms"];
  // Hide on episode player (/watch/:id) but show on /watch list
  const isWatchPlayer = location.pathname.startsWith("/watch/");
  if (isWatchPlayer || hiddenPaths.some(p => location.pathname.startsWith(p))) {
    return null;
  }

  const navItems = [
    { icon: Home, label: "Entdecken", path: "/" },
    { icon: Film, label: "Feed", path: "/feed" },
    { icon: Bookmark, label: "Gespeichert", path: user ? "/saved" : "/auth" },
    ...(isProducer ? [{ icon: Clapperboard, label: "Studio", path: "/studio" }] : []),
  ];

  const isProfileActive = location.pathname === "/profile";

  return (
    <nav className={cn(
      "fixed bottom-0 inset-x-0 z-40 bg-black",
      "safe-area-bottom"
    )}>
      <div className="flex items-center justify-evenly max-w-md mx-auto py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/" ? location.pathname === "/soaps" : location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                isActive 
                  ? "text-gold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative",
                isActive && "drop-shadow-[0_0_8px_hsl(var(--gold)/0.5)]"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-gold"
              )}>{item.label}</span>
            </Link>
          );
        })}
        
        {/* Profile button - opens sheet */}
        <button
          onClick={openProfile}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
            isProfileActive 
              ? "text-gold" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "relative",
            isProfileActive && "drop-shadow-[0_0_8px_hsl(var(--gold)/0.5)]"
          )}>
            <User className={cn(
              "w-5 h-5 transition-transform",
              isProfileActive && "scale-110"
            )} />
          </div>
          <span className={cn(
            "text-[10px] font-medium",
            isProfileActive && "text-gold"
          )}>Profil</span>
        </button>
      </div>
    </nav>
  );
}
