/**
 * Pure functions for hotspot visibility and position interpolation.
 * Used imperatively in RAF loops — no React dependency.
 */

interface Keyframe {
  frame: number;
  x: number;
  y: number;
}

export interface RawHotspotData {
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

// ── Visibility ──────────────────────────────────────────────

export function isHotspotVisible(
  h: RawHotspotData,
  currentFrame: number,
  currentTime: number
): boolean {
  // Frame-based check (preferred)
  if (h.startFrame != null && h.endFrame != null) {
    return currentFrame >= h.startFrame && currentFrame <= h.endFrame;
  }
  // Time-based fallback
  return currentTime >= h.startTime && currentTime <= (h.endTime ?? h.startTime + 30);
}

// ── Interpolation ───────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Returns the interpolated x/y position (0-100 range) for a hotspot
 * at the given frame. Falls back to static position if no keyframes.
 */
export function getInterpolatedPosition(
  h: RawHotspotData,
  currentFrame: number
): { x: number; y: number } {
  const keyframes = h.keyframes;
  const animationType = h.animationType || 'static';

  // No keyframes or static → use base position
  if (!keyframes || keyframes.length === 0 || animationType === 'static') {
    return { x: h.position.x, y: h.position.y };
  }

  // Single keyframe → use it
  if (keyframes.length === 1) {
    return { x: keyframes[0].x, y: keyframes[0].y };
  }

  // Sort by frame
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  // Clamp: before first keyframe
  if (currentFrame <= sorted[0].frame) {
    return { x: sorted[0].x, y: sorted[0].y };
  }

  // Clamp: after last keyframe
  if (currentFrame >= sorted[sorted.length - 1].frame) {
    return { x: sorted[sorted.length - 1].x, y: sorted[sorted.length - 1].y };
  }

  // Find surrounding keyframes and interpolate
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

  // Fallback (should not reach)
  return { x: h.position.x, y: h.position.y };
}
