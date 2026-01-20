/**
 * ShopableOverlay Types
 * 
 * Types for the external Shopable API manifest and hotspots.
 */

export interface ManifestHotspot {
  id: string;
  x: number;          // 0-1 (percentage from left)
  y: number;          // 0-1 (percentage from top)
  t_start: number;    // seconds
  t_end: number;      // seconds
  type: "link" | "product";
  payload: {
    url?: string;
    [key: string]: unknown;
  };
}

export interface ShopableManifest {
  hotspots: ManifestHotspot[];
}

export interface ResolveResponse {
  public_manifest_url: string | null;
}
