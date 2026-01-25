import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Package, Users, Crown, TrendingUp } from 'lucide-react';
import type { ProductPerformance, CreatorPerformance } from '@/hooks/useBrandData';
import { cn } from '@/lib/utils';

interface TopPerformersCardProps {
  products: ProductPerformance[];
  creators: CreatorPerformance[];
}

export function TopPerformersCard({ products, creators }: TopPerformersCardProps) {
  const formatCurrency = (cents: number) => {
    if (cents >= 100000) return `€${(cents / 100000).toFixed(1)}k`;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const topProducts = products.slice(0, 3);
  const topCreators = creators.slice(0, 3);

  const calculateROAS = (revenue: number, spent: number) => {
    // For creators, we estimate based on revenue (simplified)
    if (spent === 0) return revenue > 0 ? Infinity : 0;
    return revenue / spent;
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Top Products */}
      <Card className="border-gold/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-gold" />
            <span>Top Produkte</span>
            <Badge variant="outline" className="ml-auto text-xs border-gold/30 text-gold/80">
              by Revenue
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {topProducts.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Keine Produkte
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                    index === 0 && "bg-gold/20 text-gold",
                    index === 1 && "bg-muted text-muted-foreground",
                    index === 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index === 0 ? <Crown className="h-3 w-3" /> : index + 1}
                  </div>
                  
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{product.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.conversions} Sales · {product.conversionRate.toFixed(1)}% CVR
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-500">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Creators */}
      <Card className="border-gold/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-gold" />
            <span>Top Creators</span>
            <Badge variant="outline" className="ml-auto text-xs border-gold/30 text-gold/80">
              by Revenue
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {topCreators.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Keine Creator-Partner
            </div>
          ) : (
            <div className="space-y-3">
              {topCreators.map((creator, index) => (
                <div
                  key={creator.creatorId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                    index === 0 && "bg-gold/20 text-gold",
                    index === 1 && "bg-muted text-muted-foreground",
                    index === 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index === 0 ? <Crown className="h-3 w-3" /> : index + 1}
                  </div>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={creator.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {creator.displayName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{creator.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {creator.conversions} Sales · {creator.conversionRate.toFixed(1)}% CVR
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-500">
                      {formatCurrency(creator.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
