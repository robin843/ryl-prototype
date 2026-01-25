import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp, MousePointer, ShoppingCart } from 'lucide-react';
import type { CreatorPerformance } from '@/hooks/useBrandData';

interface CreatorPerformanceCardProps {
  creators: CreatorPerformance[];
}

export function CreatorPerformanceCard({ creators }: CreatorPerformanceCardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (creators.length === 0) {
    return (
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Creator-Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Noch keine Creator-Partnerschaften
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-gold" />
          Creator-Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {creators.map((creator, index) => (
            <div
              key={creator.creatorId}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                {index + 1}
              </div>
              
              <Avatar className="h-10 w-10">
                <AvatarImage src={creator.avatarUrl || undefined} />
                <AvatarFallback>
                  {creator.displayName?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{creator.displayName}</div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <MousePointer className="h-3 w-3" />
                    {formatNumber(creator.clicks)} Clicks
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {formatNumber(creator.conversions)} Sales
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {formatPercent(creator.conversionRate)} CR
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-green-500">
                  {formatCurrency(creator.revenue)}
                </div>
                <div className="text-xs text-muted-foreground">Umsatz</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
