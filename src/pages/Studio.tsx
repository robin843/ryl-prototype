import { useState, useEffect } from "react";
import { ArrowLeft, Film, ShoppingBag, Layers, Plus, ChevronRight, Eye, BarChart3, Loader2, Building2 } from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProducerData, Series, Product } from "@/hooks/useProducerData";
import { CreateSeriesModal } from "@/components/studio/CreateSeriesModal";
import { ProducerGuard } from "@/components/studio/ProducerGuard";
import { StripeStatusCard } from "@/components/studio/StripeStatusCard";
import { ProducerSalesCard } from "@/components/studio/ProducerSalesCard";
import { StudioTutorial } from "@/components/studio/StudioTutorial";
import { ReferralCard } from "@/components/studio/ReferralCard";
import { PromoCodesCard } from "@/components/studio/PromoCodesCard";
import { TierProgressCard } from "@/components/studio/TierProgressCard";
import { useAuth } from "@/contexts/AuthContext";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { useCreatorTutorial } from "@/hooks/useCreatorTutorial";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Studio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchMySeries, createSeries, fetchMyProducts, loading } = useProducerData();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    loading: stripeLoading, 
    checkingStatus, 
    accountStatus, 
    checkAccountStatus, 
    startOnboarding 
  } = useStripeConnect();
  const { hasSeenTutorial, loading: tutorialLoading, completeTutorial } = useCreatorTutorial();
  
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showStudioTutorial, setShowStudioTutorial] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      const [seriesData, productsData] = await Promise.all([
        fetchMySeries(),
        fetchMyProducts(),
      ]);
      setSeries(seriesData);
      setProducts(productsData);
      setIsLoadingData(false);
    };
    loadData();
  }, [user, fetchMySeries, fetchMyProducts]);

  // Handle Stripe onboarding return
  useEffect(() => {
    const onboardingSuccess = searchParams.get('onboarding');
    const stripeRefresh = searchParams.get('stripe_refresh');

    if (onboardingSuccess === 'success') {
      toast.success('Stripe Onboarding abgeschlossen!');
      setSearchParams({});
    }

    if (stripeRefresh === 'true') {
      toast.info('Bitte starte das Onboarding erneut');
      setSearchParams({});
    }

    checkAccountStatus();
  }, [searchParams, setSearchParams, checkAccountStatus]);

  // Show Studio tutorial if not seen
  useEffect(() => {
    if (!tutorialLoading && hasSeenTutorial === false) {
      setShowStudioTutorial(true);
    }
  }, [tutorialLoading, hasSeenTutorial]);

  const handleTutorialComplete = () => {
    completeTutorial();
    setShowStudioTutorial(false);
  };

  const handleCreateSeries = async (title: string, description: string, genre: string) => {
    const newSeries = await createSeries(title, description, genre);
    if (newSeries) {
      setSeries(prev => [newSeries, ...prev]);
      setShowCreateModal(false);
      toast.success("Serie erstellt!");
      navigate(`/studio/series/${newSeries.id}`);
    }
  };

  const stats = {
    series: series.length,
    episodes: series.reduce((acc, s) => acc + (s.episode_count || 0), 0),
    products: products.length,
    views: series.reduce((acc, s) => acc + (s.total_views || 0), 0),
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Film className="w-16 h-16 text-gold mx-auto mb-4" />
          <h1 className="text-headline mb-2">Producer Studio</h1>
          <p className="text-muted-foreground mb-6">
            Melde dich an, um deine Serien und Produkte zu verwalten.
          </p>
          <Button onClick={() => navigate("/auth")} variant="premium">
            Anmelden
          </Button>
        </div>
      </div>
    );
  }

  if (tutorialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <ProducerGuard>
    <div className="min-h-screen bg-background safe-area-top pb-24">
      {/* Studio Tutorial Overlay */}
      {showStudioTutorial && (
        <StudioTutorial onComplete={handleTutorialComplete} />
      )}

      {/* Header */}
      <header className="px-6 pt-4 pb-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/feed")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-headline text-gold">Studio Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage deine Inhalte
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            data-studio-tutorial="studio-analytics-link"
          >
            <Link to="/studio/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="px-6 py-6">
        <h3 className="text-caption text-muted-foreground mb-4">ÜBERSICHT</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Serien", value: stats.series, icon: Film },
            { label: "Episoden", value: stats.episodes, icon: Layers },
            { label: "Produkte", value: stats.products, icon: ShoppingBag },
            { label: "Views", value: stats.views, icon: Eye },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-card border border-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-gold" />
                <span className="text-caption text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-serif">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* My Series - moved up for prominence */}
      <section className="px-6 pt-2 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline text-lg">Meine Serien</h3>
          <Button 
            variant="subtle" 
            size="sm" 
            onClick={() => setShowCreateModal(true)}
            data-studio-tutorial="studio-create-series"
          >
            <Plus className="w-4 h-4 mr-1" />
            Neue Serie
          </Button>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : series.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border text-center min-h-[200px] flex flex-col items-center justify-center">
            <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              Du hast noch keine Serien erstellt.
            </p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Erste Serie erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {series.map((s) => (
              <Link
                key={s.id}
                to={`/studio/series/${s.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/30 hover:border-border transition-colors group"
              >
                <div className="w-16 h-20 rounded-lg bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {s.cover_url ? (
                    <img src={s.cover_url} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <Film className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-title truncate">{s.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {s.episode_count || 0} Episoden • {s.genre || "Kein Genre"}
                  </p>
                  <span className={cn(
                    "inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium",
                    s.status === "published" 
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gold/10 text-gold"
                  )}>
                    {s.status === "published" ? "Veröffentlicht" : "Entwurf"}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="px-6 pb-6 grid grid-cols-2 gap-3">
        <Link 
          to="/studio/analytics"
          className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-gold/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Analytics</p>
            <p className="text-[10px] text-muted-foreground">Umsatz & CTR</p>
          </div>
        </Link>
        
        <Link 
          to="/studio/brands"
          className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-gold/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Brands</p>
            <p className="text-[10px] text-muted-foreground">Partnerschaften</p>
          </div>
        </Link>
      </section>

      {/* Stripe Status Card */}
      <section className="px-6 pb-4" data-studio-tutorial="studio-stripe-card">
        <StripeStatusCard 
          accountStatus={accountStatus}
          checkingStatus={checkingStatus}
          loading={stripeLoading}
          onStartOnboarding={startOnboarding}
        />
      </section>

      {/* Sales Overview (Read-only) */}
      <section className="px-6 pb-4">
        <ProducerSalesCard />
      </section>

      {/* Revenue Tier Progress */}
      <section className="px-6 pb-4">
        <TierProgressCard />
      </section>

      {/* Referral Program */}
      <section className="px-6 pb-4">
        <ReferralCard />
      </section>

      {/* Promo Codes */}
      <section className="px-6 pb-4">
        <PromoCodesCard />
      </section>


      {/* Create Series Modal */}
      <CreateSeriesModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSeries}
        isLoading={loading}
      />
    </div>
    </ProducerGuard>
  );
}
