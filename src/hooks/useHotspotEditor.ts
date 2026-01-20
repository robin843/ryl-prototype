import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './useProducerData';

export interface Hotspot {
  id: string;
  episode_id: string;
  product_id: string;
  position_x: number;
  position_y: number;
  start_time: number;
  end_time: number;
  created_at: string;
  product?: Product;
}

export interface HotspotInput {
  product_id: string;
  position_x: number;
  position_y: number;
  start_time: number;
  end_time: number;
}

export function useHotspotEditor(episodeId: string | undefined) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch hotspots for episode
  const fetchHotspots = useCallback(async () => {
    if (!episodeId) return;
    
    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('episode_hotspots')
      .select(`
        *,
        shopable_products (
          id,
          name,
          brand_name,
          price_cents,
          currency,
          image_url,
          product_url
        )
      `)
      .eq('episode_id', episodeId)
      .order('start_time', { ascending: true });

    setIsLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    // Transform data to match Hotspot interface
    const transformed = (data || []).map((h: any) => ({
      id: h.id,
      episode_id: h.episode_id,
      product_id: h.product_id,
      position_x: h.position_x,
      position_y: h.position_y,
      start_time: h.start_time,
      end_time: h.end_time,
      created_at: h.created_at,
      product: h.shopable_products ? {
        id: h.shopable_products.id,
        name: h.shopable_products.name,
        brand_name: h.shopable_products.brand_name,
        price_cents: h.shopable_products.price_cents,
        currency: h.shopable_products.currency || 'EUR',
        image_url: h.shopable_products.image_url,
        product_url: h.shopable_products.product_url,
      } as Product : undefined,
    }));

    setHotspots(transformed);
  }, [episodeId]);

  // Create hotspot
  const createHotspot = useCallback(async (input: HotspotInput): Promise<Hotspot | null> => {
    if (!episodeId) return null;

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('episode_hotspots')
      .insert({
        episode_id: episodeId,
        product_id: input.product_id,
        position_x: input.position_x,
        position_y: input.position_y,
        start_time: input.start_time,
        end_time: input.end_time,
      })
      .select()
      .single();

    setIsLoading(false);

    if (err) {
      setError(err.message);
      return null;
    }

    // Refetch to get product data
    await fetchHotspots();
    return data as Hotspot;
  }, [episodeId, fetchHotspots]);

  // Update hotspot
  const updateHotspot = useCallback(async (
    hotspotId: string, 
    updates: Partial<HotspotInput>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const { error: err } = await supabase
      .from('episode_hotspots')
      .update(updates)
      .eq('id', hotspotId);

    setIsLoading(false);

    if (err) {
      setError(err.message);
      return false;
    }

    // Refetch
    await fetchHotspots();
    return true;
  }, [fetchHotspots]);

  // Delete hotspot
  const deleteHotspot = useCallback(async (hotspotId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const { error: err } = await supabase
      .from('episode_hotspots')
      .delete()
      .eq('id', hotspotId);

    setIsLoading(false);

    if (err) {
      setError(err.message);
      return false;
    }

    // Remove from local state
    setHotspots(prev => prev.filter(h => h.id !== hotspotId));
    return true;
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchHotspots();
  }, [fetchHotspots]);

  return {
    hotspots,
    isLoading,
    error,
    fetchHotspots,
    createHotspot,
    updateHotspot,
    deleteHotspot,
  };
}
