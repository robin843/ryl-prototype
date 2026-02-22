import { useRef, useEffect } from 'react';
import { ShopableProvider, useShopableContext } from './ShopableContext';
import { useFrameSync } from './useFrameSync';
import { useHotspotInterpolation, type InterpolatedHotspot } from './useHotspotInterpolation';
import { useVideoDimensions } from './useVideoDimensions';
import { useShopableData } from '@/hooks/useShopableData';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import { useRylSound } from '@/hooks/useRylSound';
import { RylHotspot } from '@/components/player/RylHotspot';
import { ProductPanel } from '@/components/player/ProductPanel';
import type { ShopableHotspot } from '@/services/shopable/types';

// ─── Public Props ───────────────────────────────────────────────
export interface ShopableEngineProps {
  episodeId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  wrapperRef: React.RefObject<HTMLDivElement>;
  mode?: 'player' | 'studio' | 'embed';
  fps?: number;
  isMuted?: boolean;
  onHotspotClick?: (hotspot: ShopableHotspot) => void;
}

/**
 * <ShopableEngine /> — modular, reusable shopable overlay.
 *
 * Encapsulates:
 * - Frame-accurate hotspot overlay
 * - Keyframe animation interpolation
 * - Product panel + checkout
 * - Analytics tracking (impressions, clicks)
 * - Ryl-Ping sound on hotspot appearance
 *
 * Usage:
 *   <ShopableEngine episodeId="..." videoRef={ref} wrapperRef={ref} />
 */
export function ShopableEngine(props: ShopableEngineProps) {
  const { episodeId, mode = 'player' } = props;
  const { data: shopableData } = useShopableData(episodeId);

  return (
    <ShopableProvider
      episodeId={episodeId}
      producerId={shopableData?.producerId}
      mode={mode}
    >
      <ShopableEngineInner {...props} shopableData={shopableData} />
    </ShopableProvider>
  );
}

// ─── Inner (has context access) ─────────────────────────────────
interface InnerProps extends ShopableEngineProps {
  shopableData: ReturnType<typeof useShopableData>['data'];
}

function ShopableEngineInner({
  videoRef,
  wrapperRef,
  fps = 30,
  isMuted = true,
  onHotspotClick,
  shopableData,
}: InnerProps) {
  const { episodeId, producerId, selectHotspot, closePanel, selectedHotspot } =
    useShopableContext();

  const { currentFrame, currentTime } = useFrameSync(videoRef, fps);
  const dimensions = useVideoDimensions(wrapperRef);
  const { playPing } = useRylSound();
  const { trackHotspotImpression, trackHotspotClick } = useTrackEvent();

  const allHotspots = shopableData?.hotspots ?? [];

  // Enrich hotspots with frame-based fields from DB (when available)
  const enrichedHotspots = allHotspots.map((h) => ({
    ...h,
    startFrame: null as number | null, // Will come from DB once populated
    endFrame: null as number | null,
    width: 0.08,
    height: 0.08,
    keyframes: [] as { frame: number; x: number; y: number }[],
    animationType: 'static' as string,
  }));

  const activeHotspots = useHotspotInterpolation(
    enrichedHotspots,
    currentFrame,
    currentTime,
    fps
  );

  // ── Impression tracking ──
  const trackedImpressions = useRef<Set<string>>(new Set());
  const prevVisibleIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(activeHotspots.map((h) => h.id));

    activeHotspots.forEach((h) => {
      // New appearance → play ping + track impression
      if (!prevVisibleIds.current.has(h.id)) {
        if (!isMuted) playPing(h.id);
        if (!trackedImpressions.current.has(h.id)) {
          trackedImpressions.current.add(h.id);
          trackHotspotImpression(h.id, episodeId, producerId || '', h.productId, { x: h.x, y: h.y });
        }
      }
    });

    prevVisibleIds.current = currentIds;
  }, [activeHotspots, isMuted, playPing, trackHotspotImpression, episodeId, producerId]);

  // ── Hotspot click handler ──
  const handleClick = (hotspot: InterpolatedHotspot) => {
    const original = allHotspots.find((h) => h.id === hotspot.id);
    if (!original) return;

    selectHotspot(original);
    trackHotspotClick(hotspot.id, episodeId, producerId || '', hotspot.productId);
    onHotspotClick?.(original);
  };

  if (activeHotspots.length === 0 && !selectedHotspot) return null;
  if (dimensions.width === 0 || dimensions.height === 0) return null;

  return (
    <>
      {/* Hotspot overlay layer */}
      <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
        {activeHotspots.map((h) => (
          <RylHotspot
            key={h.id}
            position={{ x: h.x, y: h.y }}
            onClick={() => handleClick(h)}
            isNew={!prevVisibleIds.current.has(h.id)}
          />
        ))}
      </div>

      {/* Product Panel */}
      <ProductPanel
        hotspot={selectedHotspot}
        episodeId={episodeId}
        producerId={producerId}
        onClose={closePanel}
      />
    </>
  );
}
