import { User, Clock, Bookmark, Settings, ChevronRight, Crown, CreditCard, LogOut, Clapperboard, ArrowRight, Loader2, Shield, X, Info } from "lucide-react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProducerApplication } from "@/hooks/useProducerApplication";
import { useSavedProducts } from "@/hooks/useSavedProducts";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSheet({ isOpen, onClose }: ProfileSheetProps) {
  const navigate = useNavigate();
  const { user, subscription, loading, signOut } = useAuth();
  const { application, isProducer, loading: producerLoading } = useProducerApplication();
  const { savedProducts } = useSavedProducts();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      setIsAdmin(!!data);
    };
    if (isOpen && user) {
      checkAdminRole();
    }
  }, [user, isOpen]);

  const handleManageSubscription = async () => {
    if (!user) {
      onClose();
      navigate("/auth");
      return;
    }
    const { data } = await supabase.functions.invoke("customer-portal");
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      onClose();
      navigate("/auth");
      return;
    }
    const { data } = await supabase.functions.invoke("create-checkout", {
      body: { priceId: "price_1SlYqPLHz2QNjBxKNTKe0tSb" },
    });
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Erfolgreich abgemeldet");
    onClose();
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh] bg-card/98 backdrop-blur-xl border-t border-border/50">
        <DrawerHeader className="relative pb-2">
          <DrawerClose className="absolute right-4 top-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <X className="w-4 h-4" />
          </DrawerClose>
          <DrawerTitle className="text-lg font-semibold text-gold">Profil</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-gold/10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
              <User className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              {user ? (
                <>
                  <h2 className="font-semibold">{user.email}</h2>
                  <p className="text-xs text-muted-foreground">
                    Mitglied seit {new Date(user.created_at).toLocaleDateString("de-DE")}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-semibold">Gast</h2>
                  <p className="text-xs text-muted-foreground">
                    Melde dich an für alle Features
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Subscription Status */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-gold/10">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium">Abo-Status</span>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : subscription.subscribed ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{subscription.tier?.name || "Premium"}</p>
                  <p className="text-xs text-muted-foreground">Aktiv</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  Verwalten
                </Button>
              </div>
            ) : (
              <Button
                onClick={user ? handleSubscribe : () => handleNavigate("/auth")}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                {user ? "Premium abonnieren" : "Anmelden"}
              </Button>
            )}
          </div>

          {/* Saved Products Preview */}
          {savedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium">Gespeicherte Produkte</span>
                </div>
                <button 
                  onClick={() => handleNavigate('/saved')}
                  className="text-xs text-gold"
                >
                  Alle ({savedProducts.length})
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {savedProducts.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(`/product/${item.productId}`)}
                    className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden"
                  >
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="space-y-1">
            {isAdmin && (
              <button 
                onClick={() => handleNavigate('/admin')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Shield className="w-5 h-5 text-red-400" />
                <span className="flex-1 text-left text-sm">Admin-Bereich</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            
            {user && (
              <button 
                onClick={() => handleNavigate('/studio')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Clapperboard className="w-5 h-5 text-gold" />
                <span className="flex-1 text-left text-sm">
                  {isProducer ? 'Creator Studio' : producerLoading ? '...' : 'Producer werden'}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )}

            <button 
              onClick={() => handleNavigate('/saved')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <Bookmark className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">Gespeicherte Produkte</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button 
              onClick={() => handleNavigate('/settings')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">Einstellungen</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {user && (
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400"
              >
                <LogOut className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">Abmelden</span>
              </button>
            )}
          </div>

          {/* Legal Footer */}
          <div className="pt-4 border-t border-border/30">
            <button 
              onClick={() => handleNavigate('/about')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors mb-2"
            >
              <Info className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">Über Ryl</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              <Link to="/impressum" onClick={onClose} className="hover:text-foreground">Impressum</Link>
              <span>•</span>
              <Link to="/datenschutz" onClick={onClose} className="hover:text-foreground">Datenschutz</Link>
              <span>•</span>
              <Link to="/agb" onClick={onClose} className="hover:text-foreground">AGB</Link>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
