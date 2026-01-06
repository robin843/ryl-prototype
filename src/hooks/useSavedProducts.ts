import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SavedProduct {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  priceCents: number;
  currency: string;
  productImageUrl: string | null;
  productUrl: string | null;
  episodeId: string | null;
  seriesTitle: string | null;
  createdAt: string;
}

export function useSavedProducts() {
  const { user } = useAuth();
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchSavedProducts = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_products')
        .select(`
          id,
          product_id,
          episode_id,
          created_at,
          shopable_products!inner (
            id,
            name,
            brand_name,
            price_cents,
            currency,
            image_url,
            product_url,
            series_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products: SavedProduct[] = (data || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.shopable_products.name,
        brandName: item.shopable_products.brand_name,
        priceCents: item.shopable_products.price_cents,
        currency: item.shopable_products.currency || 'EUR',
        productImageUrl: item.shopable_products.image_url,
        productUrl: item.shopable_products.product_url,
        episodeId: item.episode_id,
        seriesTitle: null, // Could join with series if needed
        createdAt: item.created_at,
      }));

      setSavedProducts(products);
      setSavedIds(new Set(products.map(p => p.productId)));
    } catch (err) {
      console.error('Error fetching saved products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedProducts();
  }, [fetchSavedProducts]);

  const saveProduct = async (productId: string, episodeId?: string) => {
    if (!user) {
      toast.error('Bitte melde dich an');
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_products')
        .insert({
          user_id: user.id,
          product_id: productId,
          episode_id: episodeId || null,
        });

      if (error) throw error;
      
      setSavedIds(prev => new Set([...prev, productId]));
      toast.success('Produkt gespeichert');
      fetchSavedProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Fehler beim Speichern');
    }
  };

  const unsaveProduct = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_products')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      
      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setSavedProducts(prev => prev.filter(p => p.productId !== productId));
      toast.success('Produkt entfernt');
    } catch (err) {
      console.error('Error removing product:', err);
      toast.error('Fehler beim Entfernen');
    }
  };

  const isProductSaved = (productId: string) => savedIds.has(productId);

  return {
    savedProducts,
    isLoading,
    saveProduct,
    unsaveProduct,
    isProductSaved,
    refetch: fetchSavedProducts,
  };
}