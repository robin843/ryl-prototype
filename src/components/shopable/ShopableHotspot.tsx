import { useState } from 'react';
import type { ManifestHotspot } from './types';
import { trackHotspotClick } from '@/services/shopable/trackClick';

interface ShopableHotspotProps {
  hotspot: ManifestHotspot;
  containerWidth: number;
  containerHeight: number;
  episodeId: string;
}

export function ShopableHotspot({ 
  hotspot, 
  containerWidth, 
  containerHeight,
  episodeId,
}: ShopableHotspotProps) {
  const [isTracking, setIsTracking] = useState(false);

  // Calculate pixel position from 0-1 coordinates
  const left = hotspot.x * containerWidth;
  const top = hotspot.y * containerHeight;

  const handleClick = async () => {
    if (isTracking) return;
    setIsTracking(true);

    try {
      // Log click server-side and get UTM-enriched redirect URL
      const result = await trackHotspotClick({
        hotspotId: hotspot.id,
        episodeId,
      });

      if (result?.redirect_url) {
        window.open(result.redirect_url, "_blank", "noopener,noreferrer");
      } else {
        // Fallback: direct URL without tracking
        if (hotspot.payload?.url) {
          window.open(hotspot.payload.url, "_blank", "noopener,noreferrer");
        }
      }
    } catch {
      // Fallback on error
      if (hotspot.payload?.url) {
        window.open(hotspot.payload.url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isTracking}
      className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
      style={{ left, top }}
      aria-label={hotspot.type === 'product' ? 'View product' : 'Open link'}
    >
      {/* Outer ripple animation */}
      <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
      
      {/* Middle pulse ring */}
      <span className="absolute inset-1 rounded-full bg-white/30 animate-pulse" />
      
      {/* Inner solid dot */}
      <span className="absolute inset-2 rounded-full bg-white shadow-lg group-hover:scale-110 transition-transform" />
      
      {/* Center icon indicator */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-primary" />
      </span>
    </button>
  );
}
