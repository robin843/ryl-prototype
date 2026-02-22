/**
 * Shopable — Modular in-video commerce engine
 *
 * Core: ShopableEngine (frame-accurate hotspots + checkout + analytics)
 * Legacy: ShopableOverlay (manifest-based external API hotspots)
 */

export { ShopableEngine } from './ShopableEngine';
export type { ShopableEngineProps } from './ShopableEngine';
export { ShopableOverlay } from './ShopableOverlay';
export { ShopableHotspot } from './ShopableHotspot';
export { useFrameSync } from './useFrameSync';
export { useHotspotInterpolation } from './useHotspotInterpolation';
export { isHotspotVisible, getInterpolatedPosition } from './hotspotUtils';
export type { ManifestHotspot, ShopableManifest, ResolveResponse } from './types';
