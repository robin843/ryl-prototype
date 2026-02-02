import { useEffect, useMemo, useState } from 'react';
import { useBrandData, useBrandAnalytics, TimeRange } from '@/hooks/useBrandData';
import { useBrandTutorial } from '@/hooks/useBrandTutorial';
import { BrandGuard } from '@/components/brand/BrandGuard';
import { BrandDashboardTutorial } from '@/components/brand/BrandDashboardTutorial';
import { HeroKPICards } from '@/components/brand/HeroKPICards';
import { SecondaryMetrics } from '@/components/brand/SecondaryMetrics';
import { PerformanceTrendChart } from '@/components/brand/PerformanceTrendChart';
import { TopPerformersCard } from '@/components/brand/TopPerformersCard';
import { ProductPerformanceTable } from '@/components/brand/ProductPerformanceTable';
import { CreatorPerformanceCard } from '@/components/brand/CreatorPerformanceCard';
import { BudgetCard } from '@/components/brand/BudgetCard';
import { AddBudgetSheet } from '@/components/brand/AddBudgetSheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  LogOut, 
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  UserPlus,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CreatorRequestsTab } from '@/components/brand/CreatorRequestsTab';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getBrandDashboardDemoData } from '@/components/brand/demo/brandDashboardDemo';

function BrandDashboardContent() {
  const navigate = useNavigate();
  const { brandAccount } = useBrandData();
  const { shouldShowTutorial, completeTutorial, loading: tutorialLoading } = useBrandTutorial();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState('products');
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [didInitDemo, setDidInitDemo] = useState(false);
  const { analytics, products, creators, isLoading } = useBrandAnalytics(
    brandAccount?.id,
    timeRange
  );

  const commissionRate = brandAccount?.commission_rate_percent ?? 15;

  const isEmptyDashboard =
    !isLoading &&
    analytics.totalImpressions === 0 &&
    analytics.totalClicks === 0 &&
    analytics.totalConversions === 0 &&
    analytics.totalRevenue === 0 &&
    analytics.totalSpent === 0 &&
    products.length === 0 &&
    creators.length === 0;

  useEffect(() => {
    if (!didInitDemo && isEmptyDashboard) {
      setShowDemo(true);
      setDidInitDemo(true);
    }
    if (!isEmptyDashboard) {
      setShowDemo(false);
    }
  }, [didInitDemo, isEmptyDashboard]);

  const demoData = useMemo(() => {
    if (!showDemo) return null;
    return getBrandDashboardDemoData(commissionRate);
  }, [commissionRate, showDemo]);

  const displayAnalytics = demoData?.analytics ?? analytics;
  const displayProducts = demoData?.products ?? products;
  const displayCreators = demoData?.creators ?? creators;

  // Handle tutorial tab clicks
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Trigger tutorial advancement
    if ((window as any).__brandTutorialClick) {
      (window as any).__brandTutorialClick(`brand-tab-${value}`);
    }
  };

  // Generate mock trend data (in real app, this comes from backend)
  const trendData = useMemo(() => {
    if (demoData) return demoData.trendData;

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [] as Array<{ date: string; spend: number; revenue: number }>;
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
      });

      // Simulate data based on totals
      const dailySpend =
        (displayAnalytics.totalSpent / days) * (0.7 + Math.random() * 0.6);
      const dailyRevenue =
        (displayAnalytics.totalRevenue / days) * (0.5 + Math.random() * 1.0);

      data.push({
        date: dateStr,
        spend: Math.round(dailySpend / 100), // Convert to euros
        revenue: Math.round(dailyRevenue / 100),
      });
    }
    return data;
  }, [demoData, displayAnalytics, timeRange]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/brand/login');
  };

  const handleAddBudget = async (amountCents: number) => {
    if (!brandAccount) return;
    
    // In production, this would create a Stripe checkout session
    // For MVP, we just show a toast
    toast.info('Stripe Checkout wird implementiert', {
      description: 'Budget-Aufladung über Stripe kommt in Kürze.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-gold/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-gold" />
              </div>
              <div>
                <h1 className="font-bold text-gold text-sm">{brandAccount?.company_name}</h1>
                <p className="text-[10px] text-muted-foreground">Performance Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as TimeRange)}
              >
                <SelectTrigger className="h-7 w-[90px] text-xs border-gold/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d" className="text-xs">7 Tage</SelectItem>
                  <SelectItem value="30d" className="text-xs">30 Tage</SelectItem>
                  <SelectItem value="all" className="text-xs">Gesamt</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-7 w-7 hover:bg-gold/10 hover:text-gold">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 pb-24 space-y-4">
        {/* Demo toggle (only when no real data exists yet) */}
        {!isLoading && isEmptyDashboard && (
          <Card className="border-gold/20 bg-card/50">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gold">Beispielzahlen</div>
                <p className="text-[10px] text-muted-foreground">
                  So könnte deine Performance aussehen, sobald Verkäufe stattfinden.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">Aus</span>
                <Switch checked={showDemo} onCheckedChange={setShowDemo} />
                <span className="text-xs text-muted-foreground">An</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero KPIs */}
        <div 
          data-brand-tutorial="brand-hero-kpis"
          onClick={() => {
            if ((window as any).__brandTutorialClick) {
              (window as any).__brandTutorialClick('brand-hero-kpis');
            }
          }}
        >
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-gold/20">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-16 mb-3" />
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <HeroKPICards analytics={displayAnalytics} commissionRate={commissionRate} />
          )}
        </div>

        {/* Secondary Metrics Bar */}
        {!isLoading && (
          <div className="hidden md:block">
            <SecondaryMetrics analytics={displayAnalytics} />
          </div>
        )}

        {/* Budget Card + Trend Chart */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Budget Card */}
          <div className="lg:col-span-1">
            {isLoading ? (
              <Card className="border-gold/20">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[180px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <BudgetCard
                budgetCents={showDemo && demoData ? demoData.budgetCents : (brandAccount?.budget_cents ?? 0)}
                spentCents={displayAnalytics.totalSpent}
                revenueCents={displayAnalytics.totalRevenue}
                commissionRate={commissionRate}
                onAddBudget={() => setShowAddBudget(true)}
              />
            )}
          </div>

          {/* Trend Chart */}
          <div className="lg:col-span-1">
            {isLoading ? (
              <Card className="border-gold/20">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <PerformanceTrendChart data={trendData} />
            )}
          </div>
          
          <div className="lg:col-span-1">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="border-gold/20">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <Skeleton key={j} className="h-12 w-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <TopPerformersCard products={displayProducts} creators={displayCreators} />
            )}
          </div>
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-gold/20">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
            >
              <LayoutDashboard className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              data-brand-tutorial="brand-tab-products"
              className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
            >
              <Package className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Produkte</span>
            </TabsTrigger>
            <TabsTrigger 
              value="creators"
              data-brand-tutorial="brand-tab-creators"
              className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
            >
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Creators</span>
            </TabsTrigger>
            <TabsTrigger 
              value="requests"
              data-brand-tutorial="brand-tab-requests"
              className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
            >
              <UserPlus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Anfragen</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-gold">
                  <BarChart3 className="h-5 w-5" />
                  Funnel & Attribution
                  <span className="text-xs font-normal text-gold/70 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full ml-2">
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Hier siehst du bald den kompletten Funnel von Impression bis Conversion 
                    mit Multi-Touch Attribution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            {isLoading ? (
              <Card className="border-gold/20">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ProductPerformanceTable products={displayProducts} />
            )}
          </TabsContent>

          <TabsContent value="creators" className="mt-4">
            {isLoading ? (
              <Card className="border-gold/20">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CreatorPerformanceCard creators={displayCreators} />
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <CreatorRequestsTab brandId={brandAccount?.id} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Tutorial Overlay */}
      {shouldShowTutorial && !tutorialLoading && (
        <BrandDashboardTutorial onComplete={completeTutorial} />
      )}

      {/* Add Budget Sheet */}
      <AddBudgetSheet
        open={showAddBudget}
        onOpenChange={setShowAddBudget}
        onConfirm={handleAddBudget}
      />
    </div>
  );
}

export default function BrandDashboard() {
  return (
    <BrandGuard>
      <BrandDashboardContent />
    </BrandGuard>
  );
}
