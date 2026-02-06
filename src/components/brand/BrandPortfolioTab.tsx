import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Tag,
  ShoppingCart,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductPerformance } from '@/hooks/useBrandData';

interface StockAlert {
  productId: string;
  productName: string;
  stockLevel: number;
  threshold: number;
  isCritical: boolean;
  inViralContent: boolean;
}

interface BrandPortfolioTabProps {
  products: ProductPerformance[];
  stockAlerts: StockAlert[];
  onManageStock?: (productId: string) => void;
  onSetExclusivePrice?: (productId: string) => void;
}

export function BrandPortfolioTab({
  products,
  stockAlerts,
  onManageStock,
  onSetExclusivePrice,
}: BrandPortfolioTabProps) {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);

  const formatNumber = (n: number) => new Intl.NumberFormat('de-DE').format(n);

  const criticalAlerts = stockAlerts.filter(a => a.isCritical);
  const warningAlerts = stockAlerts.filter(a => !a.isCritical);

  return (
    <div className="space-y-4">
      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <Card className={cn(
          'border-2',
          criticalAlerts.length > 0 ? 'border-red-500/40 bg-red-500/5' : 'border-yellow-500/30 bg-yellow-500/5'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className={cn(
                'h-4 w-4',
                criticalAlerts.length > 0 ? 'text-red-500' : 'text-yellow-500'
              )} />
              Lagerbestand-Warnungen
              <Badge variant="outline" className={cn(
                'text-[10px]',
                criticalAlerts.length > 0 ? 'border-red-500/30 text-red-500' : 'border-yellow-500/30 text-yellow-500'
              )}>
                {stockAlerts.length} {stockAlerts.length === 1 ? 'Warnung' : 'Warnungen'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockAlerts.map(alert => (
                <div
                  key={alert.productId}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    alert.isCritical ? 'border-red-500/30 bg-red-500/10' : 'border-yellow-500/20 bg-yellow-500/5'
                  )}
                >
                  <AlertTriangle className={cn(
                    'h-4 w-4 shrink-0',
                    alert.isCritical ? 'text-red-500' : 'text-yellow-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        'text-xs font-bold',
                        alert.isCritical ? 'text-red-500' : 'text-yellow-500'
                      )}>
                        {alert.stockLevel} Stück
                      </span>
                      {alert.inViralContent && (
                        <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px] px-1.5">
                          <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                          Viral
                        </Badge>
                      )}
                    </div>
                    <Progress
                      value={Math.min(100, (alert.stockLevel / alert.threshold) * 100)}
                      className="h-1.5 mt-2"
                    />
                  </div>
                  {onManageStock && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageStock(alert.productId)}
                      className="text-xs shrink-0 border-gold/20"
                    >
                      Verwalten
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Portfolio Table */}
      <Card className="border-gold/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-gold" />
            Produkt-Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Noch keine Produkte verknüpft
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Umsatz</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-sm">{product.productName}</span>
                            {stockAlerts.some(a => a.productId === product.productId) && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                <span className="text-[10px] text-yellow-500">Niedriger Bestand</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatNumber(product.impressions)}</TableCell>
                      <TableCell className="text-right text-sm">{product.ctr.toFixed(1)}%</TableCell>
                      <TableCell className="text-right text-sm">
                        <div className="flex items-center justify-end gap-1">
                          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                          {formatNumber(product.conversions)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-green-500">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onSetExclusivePrice && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSetExclusivePrice(product.productId)}
                              className="h-7 text-[10px] text-gold hover:text-gold hover:bg-gold/10"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              Exklusiv-Preis
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Pricing Info */}
      <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
        <CardContent className="p-4 flex items-start gap-3">
          <Tag className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gold mb-1">Dynamic Pricing</p>
            <p className="text-xs text-muted-foreground">
              Setze exklusive Ryl-Preise für deine Produkte, um die Conversion zu steigern.
              Ryl-User sehen den Sonderpreis direkt im Video – ein starker Kaufanreiz,
              der nur über die Storytelling-Integration verfügbar ist.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] border-gold/30 text-gold">
                <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                +23% Conversion im Durchschnitt
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
