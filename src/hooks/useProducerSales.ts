import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductSale {
  productId: string;
  productName: string;
  imageUrl: string | null;
  salesCount: number;
  revenueCents: number;
}

interface ProducerSalesData {
  products: ProductSale[];
  totalSales: number;
  totalRevenueCents: number;
  isLoading: boolean;
  error: string | null;
}

export function useProducerSales() {
  const [data, setData] = useState<ProducerSalesData>({
    products: [],
    totalSales: 0,
    totalRevenueCents: 0,
    isLoading: false,
    error: null,
  });

  const fetchSales = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setData(prev => ({ ...prev, isLoading: false, error: 'Not authenticated' }));
        return;
      }

      const userId = session.user.id;

      // Fetch all products for this producer
      const { data: products, error: productsError } = await supabase
        .from('shopable_products')
        .select('id, name, image_url')
        .eq('creator_id', userId);

      if (productsError) throw productsError;

      if (!products || products.length === 0) {
        setData({
          products: [],
          totalSales: 0,
          totalRevenueCents: 0,
          isLoading: false,
          error: null,
        });
        return;
      }

      const productIds = products.map(p => p.id);

      // Fetch completed purchase items for these products
      const { data: purchaseItems, error: itemsError } = await supabase
        .from('purchase_items')
        .select(`
          product_id,
          quantity,
          unit_price_cents,
          purchase_intents!inner(status)
        `)
        .in('product_id', productIds)
        .eq('purchase_intents.status', 'completed');

      if (itemsError) throw itemsError;

      // Aggregate sales per product
      const salesByProduct: Record<string, { count: number; revenue: number }> = {};
      
      (purchaseItems || []).forEach(item => {
        const productId = item.product_id;
        if (!salesByProduct[productId]) {
          salesByProduct[productId] = { count: 0, revenue: 0 };
        }
        salesByProduct[productId].count += item.quantity;
        salesByProduct[productId].revenue += item.unit_price_cents * item.quantity;
      });

      // Build product sales array
      const productSales: ProductSale[] = products.map(p => ({
        productId: p.id,
        productName: p.name,
        imageUrl: p.image_url,
        salesCount: salesByProduct[p.id]?.count || 0,
        revenueCents: salesByProduct[p.id]?.revenue || 0,
      })).filter(p => p.salesCount > 0);

      // Sort by revenue descending
      productSales.sort((a, b) => b.revenueCents - a.revenueCents);

      const totalSales = productSales.reduce((sum, p) => sum + p.salesCount, 0);
      const totalRevenueCents = productSales.reduce((sum, p) => sum + p.revenueCents, 0);

      setData({
        products: productSales,
        totalSales,
        totalRevenueCents,
        isLoading: false,
        error: null,
      });

    } catch (err) {
      console.error('Error fetching producer sales:', err);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  return {
    ...data,
    fetchSales,
  };
}
