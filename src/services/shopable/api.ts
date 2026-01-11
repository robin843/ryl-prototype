/**
 * Shopable API Client
 * 
 * This service fetches hotspots and products from the Supabase database.
 * 
 * ARCHITECTURE:
 * - Ryl = Read-only playback (this file)
 * - Shopable = Authoring (separate service)
 * 
 * The frontend ONLY:
 * - Requests shopable data via this API
 * - Renders hotspots visually
 * - Opens product overlays on click
 * 
 * The frontend does NOT:
 * - Contain product logic
 * - Calculate prices
 * - Handle checkout logic
 */

import { supabase } from '@/integrations/supabase/client';
import {
  ShopableEpisodeData,
  ShopableProductDetail,
  ShopableApiResponse,
  ShopableHotspot,
} from './types';

/**
 * Format price in cents to display string
 */
function formatPrice(priceCents: number, currency: string = 'EUR'): string {
  const amount = priceCents / 100;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get the video URL for an episode via video_asset_id
 * Supports both legacy video_url and new video_asset_id
 */
export async function getEpisodeVideoUrl(episodeId: string): Promise<string | null> {
  const { data: episode, error } = await supabase
    .from('episodes')
    .select('video_url, video_asset_id')
    .eq('id', episodeId)
    .maybeSingle();

  if (error || !episode) {
    console.error('Failed to get episode:', error);
    return null;
  }

  // New path: video_asset_id -> video_assets -> storage_path
  if (episode.video_asset_id) {
    const { data: asset, error: assetError } = await supabase
      .from('video_assets')
      .select('storage_path, status')
      .eq('id', episode.video_asset_id)
      .maybeSingle();

    if (!assetError && asset && asset.status === 'ready') {
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(asset.storage_path);
      return urlData.publicUrl;
    }
  }

  // Legacy fallback: direct video_url
  return episode.video_url;
}

/**
 * Fetch shopable data for a specific episode from database
 */
export async function getShopableDataForEpisode(
  episodeId: string
): Promise<ShopableApiResponse<ShopableEpisodeData>> {
  const { data, error } = await supabase
    .from('episode_hotspots')
    .select(`
      id,
      product_id,
      position_x,
      position_y,
      start_time,
      end_time,
      shopable_products (
        id,
        name,
        brand_name,
        image_url,
        price_cents,
        currency,
        creator_id
      )
    `)
    .eq('episode_id', episodeId);

  if (error) {
    return {
      success: false,
      data: { episodeId, hotspots: [], productCount: 0 },
      error: error.message,
    };
  }

  // Collect producer ID from first product (all products should belong to same producer)
  let producerId: string | undefined;

  const hotspots: ShopableHotspot[] = (data || []).map((row) => {
    const product = row.shopable_products as {
      id: string;
      name: string;
      brand_name: string;
      image_url: string | null;
      price_cents: number;
      currency: string | null;
      creator_id: string;
    } | null;

    // Capture producer ID from first product
    if (product?.creator_id && !producerId) {
      producerId = product.creator_id;
    }

    return {
      id: row.id,
      productId: row.product_id,
      productName: product?.name || 'Unknown Product',
      brandName: product?.brand_name || 'Unknown Brand',
      thumbnailUrl: product?.image_url || '/placeholder.svg',
      position: {
        x: Number(row.position_x),
        y: Number(row.position_y),
      },
      startTime: row.start_time,
      endTime: row.end_time,
    };
  });

  return {
    success: true,
    data: {
      episodeId,
      hotspots,
      productCount: hotspots.length,
      producerId,
    },
  };
}

/**
 * Fetch product detail when user clicks a hotspot
 */
export async function getProductDetail(
  productId: string
): Promise<ShopableApiResponse<ShopableProductDetail | null>> {
  const { data, error } = await supabase
    .from('shopable_products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !data) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Product not found',
    };
  }

  return {
    success: true,
    data: {
      id: data.id,
      name: data.name,
      brandName: data.brand_name,
      description: data.description || '',
      thumbnailUrl: data.image_url || '/placeholder.svg',
      productUrl: data.product_url || '',
      priceDisplay: formatPrice(data.price_cents, data.currency || 'EUR'),
    },
  };
}

/**
 * Get all products for an episode (for the shop menu)
 */
export async function getEpisodeProducts(
  episodeId: string
): Promise<ShopableApiResponse<ShopableProductDetail[]>> {
  const { data, error } = await supabase
    .from('episode_hotspots')
    .select(`
      product_id,
      shopable_products (
        id,
        name,
        brand_name,
        description,
        image_url,
        product_url,
        price_cents,
        currency
      )
    `)
    .eq('episode_id', episodeId);

  if (error) {
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }

  // Get unique products
  const seenIds = new Set<string>();
  const products: ShopableProductDetail[] = [];

  for (const row of data || []) {
    const product = row.shopable_products as {
      id: string;
      name: string;
      brand_name: string;
      description: string | null;
      image_url: string | null;
      product_url: string | null;
      price_cents: number;
      currency: string | null;
    } | null;

    if (product && !seenIds.has(product.id)) {
      seenIds.add(product.id);
      products.push({
        id: product.id,
        name: product.name,
        brandName: product.brand_name,
        description: product.description || '',
        thumbnailUrl: product.image_url || '/placeholder.svg',
        productUrl: product.product_url || '',
        priceDisplay: formatPrice(product.price_cents, product.currency || 'EUR'),
      });
    }
  }

  return {
    success: true,
    data: products,
  };
}
