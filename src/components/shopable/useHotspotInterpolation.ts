import { useMemo } from 'react';

interface Keyframe {
  frame: number;
  x: number;
  y: number;
}

export interface InterpolatedHotspot {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  thumbnailUrl: string;
  x: number;       // 0-100 interpolated
  y: number;       // 0-100 interpolated
  width: number;   // 0-1 normalized
  height: number;  // 0-1 normalized
  startTime: number;
  endTime?: number;
  startFrame?: number;
  endFrame?: number;
  animationType: string;
}

interface RawHotspot {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  thumbnailUrl: string;
  position: { x: number; y: number };
  startTime: number;
  endTime?: number;
  startFrame?: number | null;
  endFrame?: number | null;
  width?: number;
  height?: number;
  keyframes?: Keyframe[];
  animationType?: string;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function interpolatePosition(
  keyframes: Keyframe[],
  currentFrame: number,
  animationType: string
): { x: number; y: number } | null {
  if (!keyframes || keyframes.length === 0) return null;
  if (keyframes.length === 1) return { x: keyframes[0].x, y: keyframes[0].y };

  // Sort by frame
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  // Before first keyframe
  if (currentFrame <= sorted[0].frame) return { x: sorted[0].x, y: sorted[0].y };
  // After last keyframe
  if (currentFrame >= sorted[sorted.length - 1].frame) {
    return { x: sorted[sorted.length - 1].x, y: sorted[sorted.length - 1].y };
  }

  // Find surrounding keyframes
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (currentFrame >= a.frame && currentFrame <= b.frame) {
      let t = (currentFrame - a.frame) / (b.frame - a.frame);
      if (animationType === 'ease') t = easeInOut(t);
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
      };
    }
  }

  return null;
}

/**
 * useHotspotInterpolation — filters and interpolates hotspot positions per frame.
 * 
 * Supports:
 * - Frame-based filtering (start_frame/end_frame) with time-based fallback
 * - Keyframe animation interpolation (linear / ease)
 * - Static positioning (default)
 */
export function useHotspotInterpolation(
  hotspots: RawHotspot[],
  currentFrame: number,
  currentTime: number,
  fps: number = 30
): InterpolatedHotspot[] {
  return useMemo(() => {
    return hotspots
      .filter((h) => {
        // Frame-based check (preferred)
        if (h.startFrame != null && h.endFrame != null) {
          return currentFrame >= h.startFrame && currentFrame <= h.endFrame;
        }
        // Time-based fallback
        return currentTime >= h.startTime && currentTime <= (h.endTime ?? h.startTime + 30);
      })
      .map((h) => {
        let x = h.position.x;
        let y = h.position.y;

        // Apply keyframe interpolation if available
        if (h.keyframes && h.keyframes.length > 0 && h.animationType !== 'static') {
          const pos = interpolatePosition(h.keyframes, currentFrame, h.animationType || 'linear');
          if (pos) {
            x = pos.x;
            y = pos.y;
          }
        }

        return {
          id: h.id,
          productId: h.productId,
          productName: h.productName,
          brandName: h.brandName,
          thumbnailUrl: h.thumbnailUrl,
          x,
          y,
          width: h.width ?? 0.08,
          height: h.height ?? 0.08,
          startTime: h.startTime,
          endTime: h.endTime,
          startFrame: h.startFrame ?? undefined,
          endFrame: h.endFrame ?? undefined,
          animationType: h.animationType || 'static',
        };
      });
  }, [hotspots, currentFrame, currentTime, fps]);
}
