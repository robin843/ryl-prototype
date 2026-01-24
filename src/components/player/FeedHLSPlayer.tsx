import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

interface FeedHLSPlayerProps {
  hlsUrl?: string | null;
  fallbackUrl?: string | null;
  poster?: string | null;
  muted?: boolean;
  isActive: boolean;
  isNearby: boolean;
  loop?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onCanPlay?: () => void;
  className?: string;
}

/**
 * HLS Video Player optimized for Feed usage
 * - Instant playback with 720p start
 * - Adaptive bitrate switching
 * - Native HLS for Safari/iOS
 * - Preloading for nearby videos
 */
export function FeedHLSPlayer({
  hlsUrl,
  fallbackUrl,
  poster,
  muted = true,
  isActive,
  isNearby,
  loop = true,
  onTimeUpdate,
  onEnded,
  onCanPlay,
  className = "",
}: FeedHLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Determine the video source - prefer HLS if available
  const videoSrc = hlsUrl || fallbackUrl;
  const isHlsStream = videoSrc?.includes(".m3u8") || videoSrc?.includes("manifest");

  // Initialize HLS.js or native HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only load source when active or nearby
    if (!isActive && !isNearby) {
      // Cleanup when not nearby
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute('src');
      video.load();
      return;
    }

    if (!videoSrc) return;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsStream) {
      // Safari/iOS have native HLS support
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSrc;
        setIsReady(true);
      } 
      // Use HLS.js for Chrome, Firefox, etc.
      else if (Hls.isSupported()) {
        const hls = new Hls({
          // Performance optimizations for instant playback
          startLevel: isActive ? 2 : 0, // 720p for active, lowest for preload
          capLevelToPlayerSize: true,
          maxBufferLength: isActive ? 10 : 2, // Less buffer for preload
          maxMaxBufferLength: 30,
          maxBufferSize: 10 * 1000 * 1000, // 10MB
          maxBufferHole: 0.5,
          lowLatencyMode: false,
          backBufferLength: 10,
          autoStartLoad: true,
          // Quality switching
          abrEwmaDefaultEstimate: 5000000, // 5 Mbps default estimate
          abrBandWidthFactor: 0.95,
          abrBandWidthUpFactor: 0.7,
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsReady(true);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error("[HLS Feed] Fatal error:", data.type, data.details);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                // Fallback to direct URL
                if (fallbackUrl) {
                  console.log("[HLS Feed] Falling back to direct URL");
                  hls.destroy();
                  video.src = fallbackUrl;
                }
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (fallbackUrl) {
        // No HLS support, use fallback
        video.src = fallbackUrl;
        setIsReady(true);
      }
    } else if (videoSrc) {
      // Regular video file
      video.src = videoSrc;
      setIsReady(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSrc, isActive, isNearby, isHlsStream, fallbackUrl]);

  // Play/pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && isReady) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isActive, isReady]);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime, video.duration || 0);
    };

    const handleEnded = () => {
      onEnded?.();
    };

    const handleCanPlay = () => {
      onCanPlay?.();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [onTimeUpdate, onEnded, onCanPlay]);

  // Expose video ref for external control
  const play = useCallback(() => videoRef.current?.play(), []);
  const pause = useCallback(() => videoRef.current?.pause(), []);

  return (
    <video
      ref={videoRef}
      poster={poster || undefined}
      muted={muted}
      loop={loop}
      playsInline
      preload={isActive ? "auto" : isNearby ? "metadata" : "none"}
      className={className}
      data-ready={isReady}
    />
  );
}
