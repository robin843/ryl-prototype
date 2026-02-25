import { useEffect, useState } from "react";
import { Home, Film, User, Clapperboard, Bookmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProducerApplication } from "@/hooks/useProducerApplication";
import { useSheets } from "@/contexts/SheetContext";
import { supabase } from "@/integrations/supabase/client";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { isProducer } = useProducerApplication();
  const { openProfile } = useSheets();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkOnboarding = async () => {
      if (!user) {
        if (isMounted) {
          setIsOnboardingComplete(true);
          setIsCheckingOnboarding(false);
        }
        return;
      }

      setIsCheckingOnboarding(true);
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed_at')
        .eq('user_id', user.id)
        .single();

      if (isMounted) {
        setIsOnboardingComplete(Boolean(data?.onboarding_completed_at));
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Don't show on auth, onboarding, watch, welcome pages
  const hiddenPaths = ["/auth", "/onboarding", "/watch", "/welcome", "/producer-terms"];
  if (hiddenPaths.some(p => location.pathname.startsWith(p)) || isCheckingOnboarding || !isOnboardingComplete) {
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
