import { useEffect, useState } from 'react';
import { ShoppingBag, Loader2, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface PurchaseHistoryItem {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  completedAt: string | null;
  items: {
    productId: string;
    productName: string;
    brandName: string;
    imageUrl: string | null;
    quantity: number;
    unitPriceCents: number;
  }[];
}

function formatCurrency(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  completed: { label: 'Abgeschlossen', icon: CheckCircle, className: 'text-green-400 bg-green-500/10' },
  confirmed: { label: 'Bestätigt', icon: CheckCircle, className: 'text-green-400 bg-green-500/10' },
  processing: { label: 'In Bearbeitung', icon: Clock, className: 'text-amber-400 bg-amber-500/10' },
  expired: { label: 'Abgelaufen', icon: XCircle, className: 'text-muted-foreground bg-muted' },
  failed: { label: 'Fehlgeschlagen', icon: XCircle, className: 'text-red-400 bg-red-500/10' },
  refunded: { label: 'Erstattet', icon: XCircle, className: 'text-muted-foreground bg-muted' },
};

export function PurchaseHistorySection() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        const { data: intents, error: intentsError } = await supabase
          .from('purchase_intents')
          .select('id, status, total_cents, currency, created_at, completed_at')
          .eq('user_id', user.id)
          .in('status', ['completed', 'confirmed', 'processing'])
          .order('created_at', { ascending: false })
          .limit(50);

        if (intentsError) throw intentsError;
        if (!intents || intents.length === 0) {
          setPurchases([]);
          setIsLoading(false);
          return;
        }

        const intentIds = intents.map(i => i.id);

        const { data: items, error: itemsError } = await supabase
          .from('purchase_items')
          .select(`
            purchase_intent_id,
            product_id,
            quantity,
            unit_price_cents,
            shopable_products(name, brand_name, image_url)
          `)
          .in('purchase_intent_id', intentIds);

        if (itemsError) throw itemsError;

        const itemsByIntent: Record<string, PurchaseHistoryItem['items']> = {};
        (items || []).forEach((item: any) => {
          const intentId = item.purchase_intent_id;
          if (!itemsByIntent[intentId]) itemsByIntent[intentId] = [];
          itemsByIntent[intentId].push({
            productId: item.product_id,
            productName: item.shopable_products?.name || 'Unbekanntes Produkt',
            brandName: item.shopable_products?.brand_name || '',
            imageUrl: item.shopable_products?.image_url || null,
            quantity: item.quantity,
            unitPriceCents: item.unit_price_cents,
          });
        });

        const mapped: PurchaseHistoryItem[] = intents.map(intent => ({
          id: intent.id,
          status: intent.status,
          totalCents: intent.total_cents,
          currency: intent.currency,
          createdAt: intent.created_at,
          completedAt: intent.completed_at,
          items: itemsByIntent[intent.id] || [],
        }));

        setPurchases(mapped);
      } catch (err) {
        console.error('Error fetching purchase history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  if (!user) return null;

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-4 h-4 text-gold" />
        <h2 className="text-headline text-lg">Kaufverlauf</h2>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-8 px-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Noch keine Käufe</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Entdecke Produkte in unseren Videos
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="p-4">
                {/* Purchase Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(purchase.createdAt)}
                    </span>
                    <StatusBadge status={purchase.status} />
                  </div>
                  <span className="text-sm font-medium text-gold">
                    {formatCurrency(purchase.totalCents, purchase.currency)}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {purchase.items.map((item, idx) => (
                    <Link
                      key={`${purchase.id}-${idx}`}
                      to={`/product/${item.productId}`}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.brandName}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {item.quantity > 1 && <span>{item.quantity}× </span>}
                        {formatCurrency(item.unitPriceCents)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
