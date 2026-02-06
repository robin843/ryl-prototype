import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BrandOrder {
  id: string;
  totalCents: number;
  currency: string;
  status: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  items: {
    productId: string;
    productName: string;
    imageUrl: string | null;
    quantity: number;
    unitPriceCents: number;
  }[];
  refunds: {
    refundAmountCents: number;
    reason: string | null;
    createdAt: string;
  }[];
}

export function useBrandOrders(brandId: string | undefined, brandName: string | undefined) {
  const [orders, setOrders] = useState<BrandOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    fulfilledOrders: 0,
    pendingOrders: 0,
    refundedOrders: 0,
    refundRatePct: 0,
  });

  const fetchOrders = useCallback(async () => {
    if (!brandId || !brandName) {
      setIsLoading(false);
      return;
    }

    try {
      // Get all brand products by brand_name
      const { data: products } = await supabase
        .from('shopable_products')
        .select('id, name, image_url')
        .ilike('brand_name', brandName);

      const productIds = products?.map(p => p.id) || [];
      if (productIds.length === 0) {
        setIsLoading(false);
        return;
      }

      const productMap = new Map(products?.map(p => [p.id, p]) || []);

      // Get purchase items for these products with their intents
      const { data: purchaseItems } = await supabase
        .from('purchase_items')
        .select(`
          product_id,
          quantity,
          unit_price_cents,
          purchase_intent_id,
          purchase_intents!inner(
            id, total_cents, currency, status, 
            fulfillment_status, tracking_number, tracking_url,
            shipped_at, completed_at, created_at
          )
        `)
        .in('product_id', productIds)
        .eq('purchase_intents.status', 'completed')
        .order('purchase_intents(created_at)', { ascending: false });

      // Get refunds
      const { data: refunds } = await supabase
        .from('purchase_returns')
        .select('purchase_intent_id, refund_amount_cents, reason, created_at')
        .in('product_id', productIds);

      const refundMap = new Map<string, typeof refunds>();
      (refunds || []).forEach(r => {
        const key = r.purchase_intent_id || '';
        if (!refundMap.has(key)) refundMap.set(key, []);
        refundMap.get(key)!.push(r);
      });

      // Group by purchase_intent
      const orderMap = new Map<string, BrandOrder>();
      (purchaseItems || []).forEach((item: any) => {
        const intent = item.purchase_intents;
        const orderId = intent.id;

        if (!orderMap.has(orderId)) {
          orderMap.set(orderId, {
            id: orderId,
            totalCents: intent.total_cents,
            currency: intent.currency,
            status: intent.status,
            fulfillmentStatus: intent.fulfillment_status || 'unfulfilled',
            trackingNumber: intent.tracking_number,
            trackingUrl: intent.tracking_url,
            shippedAt: intent.shipped_at,
            completedAt: intent.completed_at,
            createdAt: intent.created_at,
            items: [],
            refunds: [],
          });
        }

        const product = productMap.get(item.product_id);
        orderMap.get(orderId)!.items.push({
          productId: item.product_id,
          productName: product?.name || 'Unbekannt',
          imageUrl: product?.image_url || null,
          quantity: item.quantity,
          unitPriceCents: item.unit_price_cents,
        });

        // Attach refunds
        const orderRefunds = refundMap.get(orderId) || [];
        orderMap.get(orderId)!.refunds = orderRefunds.map(r => ({
          refundAmountCents: r.refund_amount_cents || 0,
          reason: r.reason,
          createdAt: r.created_at || '',
        }));
      });

      const orderList = Array.from(orderMap.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalOrders = orderList.length;
      const fulfilledOrders = orderList.filter(o => o.fulfillmentStatus === 'fulfilled').length;
      const pendingOrders = orderList.filter(o => o.fulfillmentStatus === 'unfulfilled').length;
      const refundedOrders = orderList.filter(o => o.refunds.length > 0).length;

      setOrders(orderList);
      setStats({
        totalOrders,
        fulfilledOrders,
        pendingOrders,
        refundedOrders,
        refundRatePct: totalOrders > 0 ? (refundedOrders / totalOrders) * 100 : 0,
      });
    } catch (err) {
      console.error('Error fetching brand orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [brandId, brandName]);

  const updateFulfillment = useCallback(async (
    orderId: string,
    fulfillmentStatus: string,
    trackingNumber?: string,
    trackingUrl?: string
  ) => {
    const updateData: Record<string, unknown> = {
      fulfillment_status: fulfillmentStatus,
    };
    if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
    if (trackingUrl !== undefined) updateData.tracking_url = trackingUrl;
    if (fulfillmentStatus === 'fulfilled') updateData.shipped_at = new Date().toISOString();

    const { error } = await supabase
      .from('purchase_intents')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;

    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              fulfillmentStatus,
              trackingNumber: trackingNumber ?? o.trackingNumber,
              trackingUrl: trackingUrl ?? o.trackingUrl,
              shippedAt: fulfillmentStatus === 'fulfilled' ? new Date().toISOString() : o.shippedAt,
            }
          : o
      )
    );
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, stats, isLoading, updateFulfillment, refetch: fetchOrders };
}
