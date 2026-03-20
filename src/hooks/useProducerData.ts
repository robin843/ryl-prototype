import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Series {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  cover_url: string | null;
  status: "draft" | "published" | "archived";
  episode_count: number;
  total_views: number;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  series_id: string;
  creator_id: string;
  episode_number: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  thumbnail_position: string;
  video_url: string | null;
  video_asset_id: string | null;
  source_video_asset_id: string | null;
  start_time_seconds: number | null;
  end_time_seconds: number | null;
  duration: string | null;
  is_premium: boolean;
  status: "draft" | "published" | "archived";
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  creator_id: string;
  series_id: string | null;
  name: string;
  brand_name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  product_url: string | null;
  image_url: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useProducerData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Series CRUD
  const fetchMySeries = useCallback(async (): Promise<Series[]> => {
    if (!user) return [];
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await supabase
      .from("series")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return [];
    }
    return (data as Series[]) || [];
  }, [user]);

  const createSeries = useCallback(async (title: string, description?: string, genre?: string): Promise<Series | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await supabase
      .from("series")
      .insert({
        creator_id: user.id,
        title,
        description,
        genre,
      })
      .select()
      .single();
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return null;
    }
    return data as Series;
  }, [user]);

  const updateSeries = useCallback(async (id: string, updates: Partial<Series>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    const { error: err } = await supabase
      .from("series")
      .update(updates)
      .eq("id", id);
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  }, []);

  const deleteSeries = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    const { error: err } = await supabase
      .from("series")
      .delete()
      .eq("id", id);
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  }, []);

  // Episodes CRUD
  const fetchEpisodes = useCallback(async (seriesId: string): Promise<Episode[]> => {
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await supabase
      .from("episodes")
      .select("*")
      .eq("series_id", seriesId)
      .order("episode_number", { ascending: true });
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return [];
    }
    return (data as Episode[]) || [];
  }, []);

  const createEpisode = useCallback(async (
    seriesId: string, 
    title: string, 
    episodeNumber: number,
    description?: string
  ): Promise<Episode | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await supabase
      .from("episodes")
      .insert({
        series_id: seriesId,
        creator_id: user.id,
        title,
        episode_number: episodeNumber,
        description,
      })
      .select()
      .single();
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return null;
    }
    return data as Episode;
  }, [user]);

  const updateEpisode = useCallback(async (id: string, updates: Partial<Episode>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    const { error: err } = await supabase
      .from("episodes")
      .update(updates)
      .eq("id", id);
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  }, []);

  // Products CRUD
  const fetchMyProducts = useCallback(async (): Promise<Product[]> => {
    if (!user) return [];
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await supabase
      .from("shopable_products")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return [];
    }
    return (data as Product[]) || [];
  }, [user]);

  const fetchSeriesProducts = useCallback(async (seriesId: string): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await supabase
      .from("shopable_products")
      .select("*")
      .eq("series_id", seriesId)
      .order("created_at", { ascending: false });
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return [];
    }
    return (data as Product[]) || [];
  }, []);

  const createProduct = useCallback(async (
    seriesId: string,
    name: string,
    brandName: string,
    priceCents: number,
    description?: string,
    productUrl?: string,
    imageUrl?: string
  ): Promise<Product | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await supabase
      .from("shopable_products")
      .insert({
        creator_id: user.id,
        series_id: seriesId,
        name,
        brand_name: brandName,
        price_cents: priceCents,
        description,
        product_url: productUrl,
        image_url: imageUrl,
      })
      .select()
      .single();
    
    setLoading(false);
    if (err) {
      setError(err.message);
      return null;
    }
    return data as Product;
  }, [user]);

  // File upload
  const uploadMedia = useCallback(async (file: File, path: string): Promise<string | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    
    const filePath = `${user.id}/${path}`;
    const { error: err } = await supabase.storage
      .from("media")
      .upload(filePath, file, { upsert: true });
    
    if (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);
    
    setLoading(false);
    return urlData.publicUrl;
  }, [user]);

  return {
    loading,
    error,
    fetchMySeries,
    createSeries,
    updateSeries,
    deleteSeries,
    fetchEpisodes,
    createEpisode,
    updateEpisode,
    fetchMyProducts,
    fetchSeriesProducts,
    createProduct,
    uploadMedia,
  };
}
