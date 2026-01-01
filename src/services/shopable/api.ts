/**
 * Shopable API Client
 * 
 * This service handles all communication with the external Shopable API.
 * Currently uses mock data for prototyping - will be replaced with real API calls.
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

import {
  ShopableEpisodeData,
  ShopableProductDetail,
  ShopableApiResponse,
  ShopableHotspot,
} from './types';

// Mock data for prototyping
const mockHotspotsData: Record<string, ShopableHotspot[]> = {
  'ep-1-1': [
    {
      id: 'hs-1',
      productId: 'prod-1',
      productName: 'Vintage Leica Camera',
      brandName: 'Leica',
      thumbnailUrl: '/placeholder.svg',
      position: { x: 65, y: 40 },
      startTime: 15,
      endTime: 45,
    },
    {
      id: 'hs-2',
      productId: 'prod-2',
      productName: 'Leather Camera Strap',
      brandName: 'Artisan Goods',
      thumbnailUrl: '/placeholder.svg',
      position: { x: 30, y: 55 },
      startTime: 30,
      endTime: 90,
    },
  ],
  'ep-1-2': [
    {
      id: 'hs-3',
      productId: 'prod-3',
      productName: 'Photo Journal',
      brandName: 'Moleskine',
      thumbnailUrl: '/placeholder.svg',
      position: { x: 45, y: 60 },
      startTime: 20,
      endTime: 60,
    },
  ],
  'ep-2-1': [
    {
      id: 'hs-4',
      productId: 'prod-4',
      productName: 'Silk Scarf — Nocturne',
      brandName: 'Maison Verne',
      thumbnailUrl: '/placeholder.svg',
      position: { x: 50, y: 35 },
      startTime: 10,
      endTime: 50,
    },
    {
      id: 'hs-5',
      productId: 'prod-5',
      productName: 'Designer Dress Form',
      brandName: 'Atelier Pro',
      thumbnailUrl: '/placeholder.svg',
      position: { x: 70, y: 50 },
      startTime: 40,
      endTime: 100,
    },
  ],
  'ep-3-1': [
    {
      id: 'hs-6',
      productId: 'prod-6',
      productName: 'Artisan Coffee Set',
      brandName: 'Atelier Noir',
      thumbnailUrl: '/placeholder.svg',
      position: { x: 55, y: 45 },
      startTime: 25,
      endTime: 70,
    },
  ],
};

const mockProductDetails: Record<string, ShopableProductDetail> = {
  'prod-1': {
    id: 'prod-1',
    name: 'Vintage Leica Camera',
    brandName: 'Leica',
    description: 'A timeless classic for capturing life\'s moments.',
    thumbnailUrl: '/placeholder.svg',
    productUrl: 'https://shopable.example/products/leica-camera',
    priceDisplay: '€2,450',
  },
  'prod-2': {
    id: 'prod-2',
    name: 'Leather Camera Strap',
    brandName: 'Artisan Goods',
    description: 'Handcrafted leather strap for your favorite camera.',
    thumbnailUrl: '/placeholder.svg',
    productUrl: 'https://shopable.example/products/leather-strap',
    priceDisplay: '€89',
  },
  'prod-3': {
    id: 'prod-3',
    name: 'Photo Journal',
    brandName: 'Moleskine',
    description: 'Document your creative journey.',
    thumbnailUrl: '/placeholder.svg',
    productUrl: 'https://shopable.example/products/photo-journal',
    priceDisplay: '€35',
  },
  'prod-4': {
    id: 'prod-4',
    name: 'Silk Scarf — Nocturne',
    brandName: 'Maison Verne',
    description: 'Luxurious silk scarf with an exclusive print.',
    thumbnailUrl: '/placeholder.svg',
    productUrl: 'https://shopable.example/products/silk-scarf',
    priceDisplay: '€320',
  },
  'prod-5': {
    id: 'prod-5',
    name: 'Designer Dress Form',
    brandName: 'Atelier Pro',
    description: 'Professional dress form for fashion designers.',
    thumbnailUrl: '/placeholder.svg',
    productUrl: 'https://shopable.example/products/dress-form',
    priceDisplay: '€890',
  },
  'prod-6': {
    id: 'prod-6',
    name: 'Artisan Coffee Set',
    brandName: 'Atelier Noir',
    description: 'Premium pour-over coffee set for connoisseurs.',
    thumbnailUrl: '/placeholder.svg',
    productUrl: 'https://shopable.example/products/coffee-set',
    priceDisplay: '€180',
  },
};

// Simulated API delay for realistic prototyping
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch shopable data for a specific episode
 */
export async function getShopableDataForEpisode(
  episodeId: string
): Promise<ShopableApiResponse<ShopableEpisodeData>> {
  await simulateDelay();

  const hotspots = mockHotspotsData[episodeId] || [];

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
  await simulateDelay(200);

  const product = mockProductDetails[productId];

  if (!product) {
    return {
      success: false,
      data: null,
      error: 'Product not found',
    };
  }

  return {
    success: true,
    data: product,
  };
}

/**
 * Get all products for an episode (for the shop menu)
 */
export async function getEpisodeProducts(
  episodeId: string
): Promise<ShopableApiResponse<ShopableProductDetail[]>> {
  await simulateDelay();

  const hotspots = mockHotspotsData[episodeId] || [];
  const products = hotspots
    .map(h => mockProductDetails[h.productId])
    .filter(Boolean);

  return {
    success: true,
    data: products,
  };
}
