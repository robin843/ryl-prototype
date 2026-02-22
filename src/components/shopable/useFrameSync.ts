import { useEffect, useRef, useCallback } from 'react';

export interface FrameState {
  currentTime: number;
  currentFrame: number;
  isPlaying: boolean;
}

type FrameListener = (state: FrameState) => void;

/**
 * useFrameSync — 60fps frame-accurate video synchronization.
 *
 * REF-BASED: Does NOT use React state. Frame position is stored in a ref
 * and communicated via a subscribe pattern. This avoids 30-60 React
 * re-renders per second.
 *
 * Consumers should:
 * - Use `stateRef.current` for imperative reads
 * - Use `subscribe(cb)` for RAF-driven updates (e.g. DOM style updates)
 * - Only call React setState when visibility set changes (hotspot enter/leave)
 */
export function useFrameSync(
  videoRef: React.RefObject<HTMLVideoElement>,
  fps: number = 30
) {
  const stateRef = useRef<FrameState>({
    currentTime: 0,
    currentFrame: 0,
    isPlaying: false,
  });
  const listenersRef = useRef<Set<FrameListener>>(new Set());
  const rafIdRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(-1);

  const subscribe = useCallback((listener: FrameListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const notify = () => {
      const s = stateRef.current;
      listenersRef.current.forEach((l) => l(s));
    };

    const tick = () => {
      const time = video.currentTime;
      const frame = Math.floor(time * fps);

      if (frame !== lastFrameRef.current) {
        lastFrameRef.current = frame;
        stateRef.current = {
          currentTime: time,
          currentFrame: frame,
          isPlaying: !video.paused,
        };
        notify();
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    const onPlay = () => {
      stateRef.current = { ...stateRef.current, isPlaying: true };
      notify();
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const onPause = () => {
      stateRef.current = { ...stateRef.current, isPlaying: false };
      notify();
      cancelAnimationFrame(rafIdRef.current);
    };

    const onSeeked = () => {
      const time = video.currentTime;
      const frame = Math.floor(time * fps);
      lastFrameRef.current = frame;
      stateRef.current = {
        currentTime: time,
        currentFrame: frame,
        isPlaying: !video.paused,
      };
      notify();
    };

    // Initial sync
    onSeeked();

    // Start RAF loop if already playing
    if (!video.paused) {
      rafIdRef.current = requestAnimationFrame(tick);
    }

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('ended', onPause);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('ended', onPause);
    };
  }, [videoRef, fps]);

  return { stateRef, subscribe };
}
