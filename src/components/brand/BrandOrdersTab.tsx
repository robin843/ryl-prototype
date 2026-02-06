import { useState } from 'react';
import { 
  Package, Truck, CheckCircle2, RotateCcw, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BrandOrder } from '@/hooks/useBrandOrders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  });
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  unfulfilled: { label: 'Offen', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: <Package className="h-3 w-3" /> },
  fulfilled: { label: 'Versendet', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Zugestellt', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <CheckCircle2 className="h-3 w-3" /> },
};

interface Props {
  orders: BrandOrder[];
  stats: {
    totalOrders: number;
    fulfilledOrders: number;
    pendingOrders: number;
    refundedOrders: number;
    refundRatePct: number;
  };
  isLoading: boolean;
  onUpdateFulfillment: (orderId: string, status: string, tracking?: string, url?: string) => Promise<void>;
}

function OrderRow({ order, onUpdateFulfillment }: { order: BrandOrder; onUpdateFulfillment: Props['onUpdateFulfillment'] }) {
  const [expanded, setExpanded] = useState(false);
  const [trackingInput, setTrackingInput] = useState(order.trackingNumber || '');
  const [saving, setSaving] = useState(false);

  const status = statusConfig[order.fulfillmentStatus] || statusConfig.unfulfilled;
  const hasRefund = order.refunds.length > 0;

  const handleShip = async () => {
    setSaving(true);
    try {
      await onUpdateFulfillment(order.id, 'fulfilled', trackingInput || undefined);
      toast.success('Bestellung als versendet markiert');
    } catch {
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("border border-border/30 rounded-lg overflow-hidden", hasRefund && "border-red-500/20")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <Badge variant="outline" className={cn("text-[10px] gap-1", status.color)}>
          {status.icon}
          {status.label}
        </Badge>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">
            {formatDate(order.createdAt)} · {order.items.length} Artikel
          </p>
        </div>
        
        <span className="text-sm font-medium text-gold">{formatCurrency(order.totalCents)}</span>
        
        {hasRefund && <RotateCcw className="h-3 w-3 text-red-500" />}
        
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border/30 p-3 space-y-3">
          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-muted/50 overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-4 h-4 m-2 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.productName}</p>
                  <p className="text-[10px] text-muted-foreground">{item.quantity}× {formatCurrency(item.unitPriceCents)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Refunds */}
          {hasRefund && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2">
              <div className="flex items-center gap-1.5 text-red-500 mb-1">
                <RotateCcw className="h-3 w-3" />
                <span className="text-xs font-medium">Rückerstattung</span>
              </div>
              {order.refunds.map((r, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {formatCurrency(r.refundAmountCents)} · {r.reason || 'Kein Grund'} · {formatDate(r.createdAt)}
                </p>
              ))}
            </div>
          )}

          {/* Fulfillment Actions */}
          {order.fulfillmentStatus === 'unfulfilled' && (
            <div className="space-y-2">
              <Input
                placeholder="Tracking-Nummer (optional)"
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                size="sm"
                onClick={handleShip}
                disabled={saving}
                className="w-full h-8 text-xs bg-gold hover:bg-gold/90 text-black"
              >
                <Truck className="h-3 w-3 mr-1.5" />
                {saving ? 'Wird aktualisiert...' : 'Als versendet markieren'}
              </Button>
            </div>
          )}

          {order.trackingNumber && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              Tracking: {order.trackingNumber}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BrandOrdersTab({ orders, stats, isLoading, onUpdateFulfillment }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-gold/20">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-gold">{stats.totalOrders}</p>
            <p className="text-[10px] text-muted-foreground">Bestellungen</p>
          </CardContent>
        </Card>
        <Card className="border-gold/20">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-green-500">{stats.fulfilledOrders}</p>
            <p className="text-[10px] text-muted-foreground">Versendet</p>
          </CardContent>
        </Card>
        <Card className="border-gold/20">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-amber-500">{stats.pendingOrders}</p>
            <p className="text-[10px] text-muted-foreground">Offen</p>
          </CardContent>
        </Card>
        <Card className="border-gold/20">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-red-500">{stats.refundRatePct.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">Retourenquote</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="border-gold/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-gold" />
            Bestellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Noch keine Bestellungen</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <OrderRow key={order.id} order={order} onUpdateFulfillment={onUpdateFulfillment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
