import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBrandData, useBrandAnalytics, TimeRange } from '@/hooks/useBrandData';
import { BrandGuard } from '@/components/brand/BrandGuard';
import { ROIOverviewCards } from '@/components/brand/ROIOverviewCards';
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
import { 
  Building2, 
  LogOut, 
  Settings, 
  TrendingUp,
  Package,
  Users,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

function BrandDashboardContent() {
  const navigate = useNavigate();
  const { brandAccount } = useBrandData();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { analytics, products, creators, isLoading } = useBrandAnalytics(
    brandAccount?.id,
    timeRange
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/brand/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h1 className="font-bold text-gold">{brandAccount?.company_name}</h1>
                <p className="text-xs text-muted-foreground">Brand Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as TimeRange)}
              >
                <SelectTrigger className="w-[140px] border-gold/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Letzte 7 Tage</SelectItem>
                  <SelectItem value="30d">Letzte 30 Tage</SelectItem>
                  <SelectItem value="all">Gesamt</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" className="hover:bg-gold/10 hover:text-gold">
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-gold/10 hover:text-gold">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* ROI Overview */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            <span className="text-gold">ROI Übersicht</span>
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-gold/20">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ROIOverviewCards analytics={analytics} />
          )}
        </section>

        {/* Product & Creator Performance */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Product Performance */}
          <section>
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
          </section>

          {/* Creator Performance */}
          <section>
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
          </section>
        </div>

        {/* Quick Actions - Coming Soon */}
        <section>
          <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-gold">
                Schnellaktionen
                <span className="text-xs font-normal text-gold/70 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">Coming Soon</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 opacity-50 cursor-not-allowed border-gold/20" disabled>
                  <Package className="h-6 w-6 text-gold/50" />
                  <span>Produkt hinzufügen</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 opacity-50 cursor-not-allowed border-gold/20" disabled>
                  <Users className="h-6 w-6 text-gold/50" />
                  <span>Creator finden</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 opacity-50 cursor-not-allowed border-gold/20" disabled>
                  <TrendingUp className="h-6 w-6 text-gold/50" />
                  <span>Kampagne starten</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 opacity-50 cursor-not-allowed border-gold/20" disabled>
                  <Settings className="h-6 w-6 text-gold/50" />
                  <span>Einstellungen</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Diese Funktionen werden bald verfügbar sein.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
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
