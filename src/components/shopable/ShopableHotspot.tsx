import type { ManifestHotspot } from './types';

interface ShopableHotspotProps {
  hotspot: ManifestHotspot;
  containerWidth: number;
  containerHeight: number;
}

export function ShopableHotspot({ 
  hotspot, 
  containerWidth, 
  containerHeight 
}: ShopableHotspotProps) {
  // Calculate pixel position from 0-1 coordinates
  const left = hotspot.x * containerWidth;
  const top = hotspot.y * containerHeight;

  const handleClick = () => {
    // Both "link" and "product" types open URL for MVP
    if (hotspot.payload?.url) {
      window.open(hotspot.payload.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      onClick={handleClick}
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
