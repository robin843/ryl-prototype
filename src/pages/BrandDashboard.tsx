import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
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
  Settings, 
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  UserPlus,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CreatorRequestsTab } from '@/components/brand/CreatorRequestsTab';
import { useNavigate } from 'react-router-dom';

function BrandDashboardContent() {
  const navigate = useNavigate();
  const { brandAccount } = useBrandData();
  const { shouldShowTutorial, completeTutorial, loading: tutorialLoading } = useBrandTutorial();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState('products');
  const { analytics, products, creators, isLoading } = useBrandAnalytics(
    brandAccount?.id,
    timeRange
  );

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
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      
      // Simulate data based on totals
      const dailySpend = analytics.totalSpent / days * (0.7 + Math.random() * 0.6);
      const dailyRevenue = analytics.totalRevenue / days * (0.5 + Math.random() * 1.0);
      
      data.push({
        date: dateStr,
        spend: Math.round(dailySpend / 100), // Convert to euros
        revenue: Math.round(dailyRevenue / 100),
      });
    }
    return data;
  }, [analytics, timeRange]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/brand/login');
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

              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gold/10 hover:text-gold">
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-7 w-7 hover:bg-gold/10 hover:text-gold">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 pb-24 space-y-4">
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
            <HeroKPICards analytics={analytics} />
          )}
        </div>

        {/* Secondary Metrics Bar */}
        {!isLoading && (
          <div className="hidden md:block">
            <SecondaryMetrics analytics={analytics} />
          </div>
        )}

        {/* Trend Chart + Top Performers */}
        <div className="grid lg:grid-cols-3 gap-4">
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
          
          <div className="lg:col-span-2">
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
              <TopPerformersCard products={products} creators={creators} />
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
              <ProductPerformanceTable products={products} />
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
              <CreatorPerformanceCard creators={creators} />
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
