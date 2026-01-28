import { Home, Film, User, Clapperboard, Bookmark, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProducerApplication } from "@/hooks/useProducerApplication";
import { useSheets } from "@/contexts/SheetContext";
import { useActiveContext } from "@/hooks/useActiveContext";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { isProducer } = useProducerApplication();
  const { openProfile } = useSheets();
  const { activeContext, hasBrandAccount } = useActiveContext();

  // Don't show on auth, onboarding, watch, welcome pages
  const hiddenPaths = ["/auth", "/onboarding", "/watch", "/welcome", "/producer-terms"];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) {
    return null;
  }

  // Build nav items dynamically based on producer status
  // Profile is handled specially via sheet
  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Film, label: "Serien", path: "/soaps" },
    { icon: Bookmark, label: "Gespeichert", path: "/saved" },
    // Only show Studio for verified producers
    ...(isProducer ? [{ icon: Clapperboard, label: "Studio", path: "/studio" }] : []),
  ];

  // Check if profile would be "active" if it were a link
  const isProfileActive = location.pathname === "/profile";

  return (
    <nav className={cn(
      "fixed bottom-0 inset-x-0 z-40 bg-black",
      "safe-area-bottom"
    )}>
      <div className="flex items-center justify-evenly max-w-md mx-auto py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/feed" && location.pathname.startsWith(item.path));
          
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
        
        {/* Profile button - opens sheet instead of navigating */}
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
            {/* Gold ring indicator for Brand context */}
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all",
              activeContext === 'brand' && hasBrandAccount && "ring-2 ring-gold ring-offset-1 ring-offset-black"
            )}>
              {activeContext === 'brand' && hasBrandAccount ? (
                <Building2 className={cn(
                  "w-4 h-4 transition-transform",
                  isProfileActive && "scale-110"
                )} />
              ) : (
                <User className={cn(
                  "w-5 h-5 transition-transform",
                  isProfileActive && "scale-110"
                )} />
              )}
            </div>
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