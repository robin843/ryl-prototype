import { useState, useEffect } from 'react';
import { useShopableManifest } from './useShopableManifest';
import { useVideoDimensions } from './useVideoDimensions';
import { ShopableHotspot } from './ShopableHotspot';

interface ShopableOverlayProps {
  partnerVideoId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  wrapperRef: React.RefObject<HTMLDivElement>;
  episodeId: string;
}

export function ShopableOverlay({ 
  partnerVideoId, 
  videoRef, 
  wrapperRef,
  episodeId,
}: ShopableOverlayProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const { hotspots, isLoading } = useShopableManifest(partnerVideoId);
  const dimensions = useVideoDimensions(wrapperRef);

  // TimeSync inline - listen to video timeupdate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    
    // Also sync on initial load
    setCurrentTime(video.currentTime);
    
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeking', onTimeUpdate);
    video.addEventListener('seeked', onTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeking', onTimeUpdate);
      video.removeEventListener('seeked', onTimeUpdate);
    };
  }, [videoRef]);

  // Filter hotspots by active time window
  const activeHotspots = hotspots.filter(
    h => h.t_start <= currentTime && currentTime <= h.t_end
  );

  if (isLoading || hotspots.length === 0) return null;
  if (dimensions.width === 0 || dimensions.height === 0) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      aria-hidden="true"
    >
      {activeHotspots.map((hotspot) => (
        <ShopableHotspot
          key={hotspot.id}
          hotspot={hotspot}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
          episodeId={episodeId}
        />
      ))}
    </div>
  );
}
