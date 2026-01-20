import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMoneyAnalytics } from "@/hooks/useMoneyAnalytics";
import { useAudienceInsights } from "@/hooks/useAudienceInsights";
import { useEpisodePerformance } from "@/hooks/useEpisodePerformance";
import { useProductPerformance } from "@/hooks/useProductPerformance";
import { ProducerGuard } from "@/components/studio/ProducerGuard";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  determineDashboardPhase,
  getSetupSteps,
  SetupStateHero,
} from "@/components/studio/analytics/DashboardStates";
import { RevenueTab } from "@/components/studio/analytics/RevenueTab";
import { AudienceTab } from "@/components/studio/analytics/AudienceTab";
import { EpisodesTab } from "@/components/studio/analytics/EpisodesTab";
import { ProductsTab } from "@/components/studio/analytics/ProductsTab";

type TimeRange = '7d' | '30d' | 'all';

export default function StudioAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState('revenue');
  
  const { moneyStats, seriesRevenue, productRevenue, funnel, recommendations, setupState, isLoading } = 
    useMoneyAnalytics(user?.id, timeRange);
  
  const audienceData = useAudienceInsights(user?.id, timeRange);
  const episodeData = useEpisodePerformance(user?.id, timeRange);
  const productData = useProductPerformance(user?.id, timeRange);

  const timeRangeLabel = timeRange === '7d' ? 'Letzte 7 Tage' : timeRange === '30d' ? 'Letzte 30 Tage' : 'Gesamt';

  const dashboardPhase = determineDashboardPhase({
    ...setupState,
    totalSales: moneyStats.totalSales,
    totalRevenueCents: moneyStats.totalRevenueCents,
  });

  const setupSteps = getSetupSteps({
    ...setupState,
    totalSales: moneyStats.totalSales,
    totalRevenueCents: moneyStats.totalRevenueCents,
  });

  // Show setup hero if in setup phase
  if (dashboardPhase === 'setup' && !isLoading) {
    return (
      <ProducerGuard>
        <div className="min-h-screen bg-background pb-24">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
            <div className="px-6 py-4 flex items-center gap-4">
              <Link to="/studio" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-title">Dein Business</h1>
            </div>
          </div>
          
          <SetupStateHero steps={setupSteps} />
        </div>
      </ProducerGuard>
    );
  }

  return (
    <ProducerGuard>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/studio" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-title">Analytics</h1>
            </div>
            
            {/* Time Range Toggle */}
            <div className="flex gap-1 bg-muted/30 rounded-full p-1">
              {(['7d', '30d', 'all'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    timeRange === range
                      ? "bg-gold text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range === '7d' ? '7T' : range === '30d' ? '30T' : 'Alle'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-[73px] z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
            <TabsList className="w-full h-12 p-0 bg-transparent rounded-none justify-start gap-0">
              <TabsTrigger 
                value="revenue" 
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm"
              >
                Revenue
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm"
              >
                Audience
              </TabsTrigger>
              <TabsTrigger 
                value="episodes" 
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm"
              >
                Episodes
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm"
              >
                Products
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="revenue" className="mt-0">
            <RevenueTab
              moneyStats={moneyStats}
              seriesRevenue={seriesRevenue}
              productRevenue={productRevenue}
              funnel={funnel}
              recommendations={recommendations}
              timeRangeLabel={timeRangeLabel}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="audience" className="mt-0">
            <AudienceTab data={audienceData} />
          </TabsContent>

          <TabsContent value="episodes" className="mt-0">
            <EpisodesTab data={episodeData} />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ProductsTab data={productData} />
          </TabsContent>
        </Tabs>
      </div>
    </ProducerGuard>
  );
}
