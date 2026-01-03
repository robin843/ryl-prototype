import { User, Clock, Bookmark, Settings, ChevronRight, Crown, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { mockWatchHistory } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const navigate = useNavigate();
  const { user, subscription, loading } = useAuth();

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

  return (
    <AppLayout>
      <div className="min-h-screen safe-area-top">
        <header className="px-6 pt-4 pb-6">
          <h1 className="text-headline">Profil</h1>
        </header>

        {/* User Info */}
        <section className="px-6 mb-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
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
          
          <div className="p-4 rounded-2xl bg-card border border-border">
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

        {/* Watch History */}
        <section className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gold" />
            <h2 className="text-headline text-lg">Watch History</h2>
          </div>
          
          {mockWatchHistory.length > 0 ? (
            <div className="space-y-3">
              {mockWatchHistory.map((item, index) => (
                <div
                  key={item.episodeId}
                  className="flex items-center gap-4 p-3 rounded-xl bg-card/50"
                >
                  <div className="w-12 h-16 rounded-lg bg-secondary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.seriesTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Episode {item.episodeNumber}
                    </p>
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.watchedAt}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-border text-center">
              <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Your watch history will appear here
              </p>
            </div>
          )}
        </section>

        {/* Saved */}
        <section className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="w-4 h-4 text-gold" />
            <h2 className="text-headline text-lg">Saved Episodes</h2>
          </div>
          <div className="p-6 rounded-xl border border-dashed border-border text-center">
            <Bookmark className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Save episodes to watch later
            </p>
          </div>
        </section>

        {/* Settings */}
        <section className="px-6 mb-8">
          <h2 className="text-headline text-lg mb-4">Settings</h2>
          <div className="space-y-1">
            {[
              { label: "Account", icon: User },
              { label: "Preferences", icon: Settings },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors group"
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
