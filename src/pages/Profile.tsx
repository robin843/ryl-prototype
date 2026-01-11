import { User, Bookmark, Settings, ChevronRight, Crown, CreditCard, LogOut, Clapperboard, ArrowRight, Loader2, Shield } from "lucide-react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProducerApplication } from "@/hooks/useProducerApplication";
import { useSavedProducts } from "@/hooks/useSavedProducts";

export default function Profile() {
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
    checkAdminRole();
  }, [user]);

  const handleManageSubscription = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
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
    navigate("/auth");
  };

  return (
    <AppLayout>
      <div className="min-h-screen safe-area-top pb-32">
        <header className="px-6 pt-4 pb-6">
          <h1 className="text-headline">
            <span className="text-gold">Profil</span>
          </h1>
        </header>

        {/* User Info */}
        <section className="px-6 mb-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-gold/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
              <User className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1">
              {user ? (
                <>
                  <h2 className="text-title">{user.email}</h2>
                  <p className="text-sm text-muted-foreground">
                    Mitglied seit {new Date(user.created_at).toLocaleDateString("de-DE")}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-title">Gast</h2>
                  <p className="text-sm text-muted-foreground">
                    Melde dich an, um deine Watch-History zu synchronisieren
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Subscription Status */}
        <section className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-gold" />
            <h2 className="text-headline text-lg">Abo-Status</h2>
          </div>
          
          <div className="p-4 rounded-2xl bg-card border border-gold/10">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : subscription.subscribed ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {subscription.tier?.name || "Premium"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Aktives Abonnement
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                    Aktiv
                  </span>
                </div>
                
                {subscription.subscriptionEnd && (
                  <p className="text-sm text-muted-foreground">
                    Verlängert sich am {new Date(subscription.subscriptionEnd).toLocaleDateString("de-DE")}
                  </p>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Abo verwalten
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Crown className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Kein Abo</p>
                    <p className="text-sm text-muted-foreground">
                      {user ? "Du hast noch kein Premium-Abo" : "Melde dich an für Premium"}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={user ? handleSubscribe : () => navigate("/auth")}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {user ? "Premium abonnieren" : "Anmelden"}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Saved Products */}
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-gold" />
              <h2 className="text-headline text-lg">Gespeicherte Produkte</h2>
            </div>
            {savedProducts.length > 0 && (
              <Link to="/saved" className="text-xs text-gold hover:underline">
                Alle anzeigen
              </Link>
            )}
          </div>
          
          {savedProducts.length > 0 ? (
            <div className="space-y-3">
              {savedProducts.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.productId}`}
                  className="flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.brandName}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <Link 
              to="/feed"
              className="block p-6 rounded-xl border border-dashed border-border text-center hover:border-gold/30 transition-colors"
            >
              <Bookmark className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Speichere Produkte beim Schauen
              </p>
            </Link>
          )}
        </section>


        {/* Admin Section */}
        {isAdmin && (
          <section className="px-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-gold" />
              <h2 className="text-headline text-lg">Admin</h2>
            </div>
            
            <div className="p-4 rounded-2xl bg-card border border-gold/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Admin-Bereich</p>
                  <p className="text-sm text-muted-foreground">Bewerbungen verwalten</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                >
                  Öffnen
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Creator Studio Section */}
        {user && (
          <section className="px-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clapperboard className="w-4 h-4 text-gold" />
              <h2 className="text-headline text-lg">Creator Studio</h2>
            </div>
            
            <div className="p-4 rounded-2xl bg-card border border-gold/10">
              {producerLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : isProducer ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center">
                    <Clapperboard className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Verifizierter Producer</p>
                    <p className="text-sm text-muted-foreground">Erstelle Shopable-Videos</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/studio')}
                  >
                    Studio öffnen
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : application?.status === 'pending' ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Clapperboard className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Bewerbung wird geprüft</p>
                    <p className="text-sm text-muted-foreground">
                      Wir melden uns in Kürze bei dir
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                    Ausstehend
                  </span>
                </div>
              ) : application?.status === 'rejected' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Clapperboard className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Bewerbung abgelehnt</p>
                      {application.rejection_reason && (
                        <p className="text-sm text-muted-foreground">
                          {application.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/studio')}
                  >
                    Erneut bewerben
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Clapperboard className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Werde Producer</p>
                      <p className="text-sm text-muted-foreground">
                        Lade shopable Soaps auf Ryl hoch
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold"
                    onClick={() => navigate('/studio')}
                  >
                    <Clapperboard className="w-4 h-4 mr-2" />
                    Producer werden
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Settings */}
        <section className="px-6 mb-8">
          <h2 className="text-headline text-lg mb-4 text-gold/80">Einstellungen</h2>
          <div className="space-y-1">
            <button 
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gold/5 border border-transparent hover:border-gold/10 transition-all group"
            >
              <Settings className="w-5 h-5 text-gold/60" />
              <span className="flex-1 text-left text-sm">Account & Präferenzen</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
            </button>
            {user && (
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-500/10 transition-colors group text-red-400"
              >
                <LogOut className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">Abmelden</span>
              </button>
            )}
          </div>
        </section>

        {/* Legal Footer */}
        <section className="px-6 mb-8">
          <div className="pt-6 border-t border-gold/10">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <Link to="/impressum" className="hover:text-foreground transition-colors">
                Impressum
              </Link>
              <span>•</span>
              <Link to="/datenschutz" className="hover:text-foreground transition-colors">
                Datenschutz
              </Link>
              <span>•</span>
              <Link to="/agb" className="hover:text-foreground transition-colors">
                AGB
              </Link>
              <span>•</span>
              <Link to="/pricing" className="hover:text-foreground transition-colors">
                Preise
              </Link>
            </div>
            <p className="text-center text-xs text-muted-foreground/50 mt-4">
              © {new Date().getFullYear()} ryl.zone
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}