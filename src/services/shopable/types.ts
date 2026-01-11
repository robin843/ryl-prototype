/**
 * Shopable API Types
 * 
 * These types represent the data structure returned by the external Shopable API.
 * The Shopable API provides commerce intelligence for video content:
 * - Which moments in a video are shopable
 * - Where hotspots appear in the video frame
 * - Which product is connected to each hotspot
 * 
 * All product logic, pricing, and checkout are handled by Shopable externally.
 */

// Position of a hotspot within the video frame (percentage-based)
export interface HotspotPosition {
  x: number; // 0-100, percentage from left
  y: number; // 0-100, percentage from top
}

// A single shopable moment/hotspot in a video
export interface ShopableHotspot {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  thumbnailUrl: string;
  position: HotspotPosition;
  // Timestamp in seconds when this hotspot appears
  startTime: number;
  // Timestamp in seconds when this hotspot disappears (optional)
  endTime?: number;
}

// Response from Shopable API for a specific episode/video
export interface ShopableEpisodeData {
  episodeId: string;
  hotspots: ShopableHotspot[];
  // Total count of shopable products in this episode
  productCount: number;
  // Producer/creator ID (for Stripe Connect guard)
  producerId?: string;
}

// Product detail returned when user clicks a hotspot
export interface ShopableProductDetail {
  id: string;
  name: string;
  brandName: string;
  description: string;
  thumbnailUrl: string;
  // External URL to product page (handled by Shopable)
  productUrl: string;
  // Price display string (formatted by Shopable)
  priceDisplay?: string;
}

// API response wrapper
export interface ShopableApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
