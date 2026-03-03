import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { ShopableProvider, useShopableContext } from './ShopableContext';
import { useFrameSync } from './useFrameSync';
import { isHotspotVisible, getInterpolatedPosition, type RawHotspotData } from './hotspotUtils';
import { useVideoDimensions } from './useVideoDimensions';
import { useShopableData } from '@/hooks/useShopableData';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import { useRylSound } from '@/hooks/useRylSound';
import { RylHotspot } from '@/components/player/RylHotspot';
import { ProductPanel } from '@/components/player/ProductPanel';
import type { ShopableHotspot } from '@/services/shopable/types';

// ── Engine version for analytics attribution ────────────────
const ENGINE_VERSION = '1.0.0';

// ── Impression debounce (ms) ────────────────────────────────
const IMPRESSION_DELAY_MS = 300;

// ─── Public Props ───────────────────────────────────────────
export interface ShopableEngineProps {
  episodeId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  wrapperRef: React.RefObject<HTMLDivElement>;
  mode?: 'player' | 'studio' | 'embed';
  fps?: number;
  isMuted?: boolean;
  /** Override: provide hotspots externally (white-label) */
  hotspots?: ShopableHotspot[];
  /** Override: custom click handler instead of built-in panel */
  onHotspotClick?: (hotspot: ShopableHotspot) => void;
  /** Override: custom tracking callback (white-label isolation) */
  onTrack?: (event: string, payload: Record<string, unknown>) => void;
  /** Override: custom purchase handler (white-label isolation) */
  onPurchase?: (productId: string, hotspotId: string) => void;
}

/**
 * <ShopableEngine /> — modular, reusable shopable overlay.
 *
 * Performance architecture:
 * - Frame position stored in REF (no React re-renders per frame)
 * - Hotspot DOM positions updated IMPERATIVELY via style manipulation
 * - React state only changes on hotspot ENTER/LEAVE (visibility set change)
 * - Impressions require 300ms continuous visibility before tracking
 */
export function ShopableEngine(props: ShopableEngineProps) {
  const { episodeId, mode = 'player', hotspots: externalHotspots } = props;

  // Only fetch from Supabase if no external hotspots provided (engine isolation)
  const { data: shopableData } = useShopableData(
    externalHotspots ? '' : episodeId
  );

  return (
    <ShopableProvider
      episodeId={episodeId}
      producerId={shopableData?.producerId}
      mode={mode}
    >
      <ShopableEngineInner
        {...props}
        shopableData={shopableData}
      />
    </ShopableProvider>
  );
}

// ─── Inner (has context access) ─────────────────────────────
interface InnerProps extends ShopableEngineProps {
  shopableData: ReturnType<typeof useShopableData>['data'];
}

function ShopableEngineInner({
  videoRef,
  wrapperRef,
  fps = 30,
  isMuted = true,
  hotspots: externalHotspots,
  onHotspotClick,
  onTrack,
  onPurchase,
  shopableData,
}: InnerProps) {
  const { episodeId, producerId, selectHotspot, closePanel, selectedHotspot, mode } =
    useShopableContext();

  // Ref-based frame sync — NO React state updates per frame
  const { stateRef, subscribe } = useFrameSync(videoRef, fps);
  const dimensions = useVideoDimensions(wrapperRef);
  const { playPing } = useRylSound();
  const { trackHotspotImpression, trackHotspotClick, trackEvent } = useTrackEvent();

  const allHotspots = externalHotspots ?? shopableData?.hotspots ?? [];

  // Enrich hotspots with frame-based fields
  const enrichedHotspots: RawHotspotData[] = useMemo(
    () =>
      allHotspots.map((h) => ({
        id: h.id,
        productId: h.productId,
        productName: h.productName,
        brandName: h.brandName,
        thumbnailUrl: h.thumbnailUrl,
        position: { x: h.position.x, y: h.position.y },
        startTime: h.startTime,
        endTime: h.endTime,
        startFrame: null as number | null,
        endFrame: null as number | null,
        width: 0.08,
        height: 0.08,
        keyframes: [] as { frame: number; x: number; y: number }[],
        animationType: 'static' as string,
      })),
    [allHotspots]
  );

  // ── React state: ONLY the set of currently visible hotspot IDs ──
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  // Refs for imperative DOM manipulation
  const hotspotElsRef = useRef<Map<string, HTMLElement>>(new Map());
  const prevVisibleKeyRef = useRef('');
  const impressionTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const trackedImpressions = useRef<Set<string>>(new Set());

  // Analytics helper with versioning
  const track = useCallback(
    (eventType: string, payload: Record<string, unknown>) => {
      const enriched = {
        ...payload,
        engine_version: ENGINE_VERSION,
        fps,
        mode,
      };
      if (onTrack) {
        onTrack(eventType, enriched);
      } else {
        trackEvent({
          eventType: eventType as any,
          episodeId: payload.episodeId as string,
          productId: payload.productId as string,
          hotspotId: payload.hotspotId as string,
          creatorId: payload.creatorId as string,
          metadata: enriched,
        });
      }
    },
    [onTrack, trackEvent, fps, mode]
  );

  // ── Subscribe to frame changes (imperative, no React state per frame) ──
  useEffect(() => {
    const unsubscribe = subscribe((state) => {
      const { currentFrame, currentTime } = state;

      // 1. Compute visibility
      const visible = enrichedHotspots.filter((h) =>
        isHotspotVisible(h, currentFrame, currentTime)
      );
      const visibleKey = visible
        .map((h) => h.id)
        .sort()
        .join(',');

      // 2. If visibility SET changed → update React state (add/remove DOM nodes)
      if (visibleKey !== prevVisibleKeyRef.current) {
        const prevIds = new Set(
          prevVisibleKeyRef.current.split(',').filter(Boolean)
        );
        const currentIds = new Set(visible.map((h) => h.id));

        // New hotspots entering
        visible.forEach((h) => {
          if (!prevIds.has(h.id)) {
            // Play ping + vibrate
            if (!isMuted) playPing(h.id);
            if (navigator.vibrate) navigator.vibrate(50);
            // Start 300ms impression timer
            if (!trackedImpressions.current.has(h.id)) {
              const timer = setTimeout(() => {
                if (!trackedImpressions.current.has(h.id)) {
                  trackedImpressions.current.add(h.id);
                  track('hotspot_impression', {
                    hotspotId: h.id,
                    episodeId,
                    creatorId: producerId || '',
                    productId: h.productId,
                    hotspotPosition: { x: h.position.x, y: h.position.y },
                    animation_type: h.animationType,
                  });
                }
                impressionTimersRef.current.delete(h.id);
              }, IMPRESSION_DELAY_MS);
              impressionTimersRef.current.set(h.id, timer);
            }
          }
        });

        // Hotspots leaving — cancel impression timers if <300ms
        prevIds.forEach((id) => {
          if (!currentIds.has(id)) {
            const timer = impressionTimersRef.current.get(id);
            if (timer) {
              clearTimeout(timer);
              impressionTimersRef.current.delete(id);
            }
          }
        });

        prevVisibleKeyRef.current = visibleKey;
        setVisibleIds(visible.map((h) => h.id));
      }

      // 3. Imperatively update positions (no React re-render)
      visible.forEach((h) => {
        const el = hotspotElsRef.current.get(h.id);
        if (!el) return;
        const pos = getInterpolatedPosition(h, currentFrame);
        el.style.left = `${pos.x}%`;
        el.style.top = `${pos.y}%`;
      });
    });

    return () => {
      unsubscribe();
      // Clear all pending impression timers
      impressionTimersRef.current.forEach((t) => clearTimeout(t));
      impressionTimersRef.current.clear();
    };
  }, [subscribe, enrichedHotspots, isMuted, playPing, track, episodeId, producerId]);

  // ── Hotspot click handler ──
  const handleClick = useCallback(
    (hotspotId: string) => {
      const original = allHotspots.find((h) => h.id === hotspotId);
      if (!original) return;

      // Pause video when user taps a hotspot
      videoRef.current?.pause();

      const enriched = enrichedHotspots.find((h) => h.id === hotspotId);

      selectHotspot(original);
      track('hotspot_click', {
        hotspotId,
        episodeId,
        creatorId: producerId || '',
        productId: original.productId,
        animation_type: enriched?.animationType,
      });
      onHotspotClick?.(original);
    },
    [allHotspots, enrichedHotspots, selectHotspot, track, episodeId, producerId, onHotspotClick, videoRef]
  );

  // ── Ref callback for hotspot DOM elements ──
  const setHotspotRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        hotspotElsRef.current.set(id, el);
      } else {
        hotspotElsRef.current.delete(id);
      }
    },
    []
  );

  // Resolve visible hotspot data for rendering
  const visibleHotspots = useMemo(
    () => enrichedHotspots.filter((h) => visibleIds.includes(h.id)),
    [enrichedHotspots, visibleIds]
  );

  if (visibleHotspots.length === 0 && !selectedHotspot) return null;
  if (dimensions.width === 0 || dimensions.height === 0) return null;

  return (
    <>
      {/* Hotspot overlay layer */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        aria-hidden="true"
      >
        {visibleHotspots.map((h) => (
          <div
            key={h.id}
            ref={setHotspotRef(h.id)}
            className="absolute"
            style={{
              left: `${h.position.x}%`,
              top: `${h.position.y}%`,
              // Will be updated imperatively by RAF loop
            }}
          >
            <RylHotspot
              position={{ x: 0, y: 0 }}
              onClick={() => handleClick(h.id)}
              isNew={true}
            />
          </div>
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
