/**
 * Shopable API Client
 * 
 * This service fetches hotspots and products from the Supabase database.
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
        currency
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

  const hotspots: ShopableHotspot[] = (data || []).map((row) => {
    const product = row.shopable_products as {
      id: string;
      name: string;
      brand_name: string;
      image_url: string | null;
      price_cents: number;
      currency: string | null;
    } | null;

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
