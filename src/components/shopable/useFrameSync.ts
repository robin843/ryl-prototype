import { useState, useEffect, useRef, useCallback } from 'react';

interface FrameSyncState {
  currentTime: number;
  currentFrame: number;
  isPlaying: boolean;
}

/**
 * useFrameSync — 60fps frame-accurate video synchronization.
 * 
 * Uses requestAnimationFrame instead of 'timeupdate' events (which fire at ~4fps).
 * Converts currentTime to frame number using the video's fps.
 */
export function useFrameSync(
  videoRef: React.RefObject<HTMLVideoElement>,
  fps: number = 30
): FrameSyncState {
  const [state, setState] = useState<FrameSyncState>({
    currentTime: 0,
    currentFrame: 0,
    isPlaying: false,
  });
  const rafIdRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(-1);

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    const frame = Math.floor(time * fps);

    // Only update state when frame changes (avoids unnecessary re-renders)
    if (frame !== lastFrameRef.current) {
      lastFrameRef.current = frame;
      setState({
        currentTime: time,
        currentFrame: frame,
        isPlaying: !video.paused,
      });
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [videoRef, fps]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const onPause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      cancelAnimationFrame(rafIdRef.current);
    };

    const onSeeked = () => {
      const time = video.currentTime;
      const frame = Math.floor(time * fps);
      lastFrameRef.current = frame;
      setState({ currentTime: time, currentFrame: frame, isPlaying: !video.paused });
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
  }, [videoRef, fps, tick]);

  return state;
}
