import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

interface HLSVideoPlayerProps {
  hlsUrl?: string;
  fallbackUrl?: string;
  poster?: string;
  muted?: boolean;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onCanPlay?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function HLSVideoPlayer({
  hlsUrl,
  fallbackUrl,
  poster,
  muted = true,
  autoPlay = false,
  onTimeUpdate,
  onEnded,
  onCanPlay,
  onError,
  className = "",
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");

  // Determine the video source
  const videoSrc = hlsUrl || fallbackUrl;

  // Initialize HLS.js or native HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if it's an HLS stream
    const isHlsStream = videoSrc.includes(".m3u8") || videoSrc.includes("manifest");

    if (isHlsStream) {
      // Safari/iOS have native HLS support
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSrc;
        video.addEventListener("loadedmetadata", () => {
          setIsReady(true);
          if (autoPlay) video.play().catch(() => {});
        });
      } 
      // Use HLS.js for Chrome, Firefox, etc.
      else if (Hls.isSupported()) {
        const hls = new Hls({
          // Performance optimizations for instant playback
          startLevel: 2, // Start at 720p (index 2 typically)
          capLevelToPlayerSize: true,
          maxBufferLength: 10, // 10 seconds buffer
          maxMaxBufferLength: 30,
          // Preload only first segments for fast start
          maxBufferSize: 10 * 1000 * 1000, // 10MB
          maxBufferHole: 0.5,
          // Low latency settings
          lowLatencyMode: false,
          backBufferLength: 30,
          // Start loading immediately
          autoStartLoad: true,
          // Quality switching
          abrEwmaDefaultEstimate: 5000000, // 5 Mbps default estimate
          abrBandWidthFactor: 0.95,
          abrBandWidthUpFactor: 0.7,
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          console.log("[HLS] Manifest parsed, quality levels:", data.levels.length);
          setIsReady(true);
          
          // Log available qualities
          data.levels.forEach((level, index) => {
            console.log(`[HLS] Level ${index}: ${level.width}x${level.height} @ ${level.bitrate}bps`);
          });

          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          const level = hls.levels[data.level];
          if (level) {
            const quality = `${level.height}p`;
            setCurrentQuality(quality);
            console.log(`[HLS] Switched to ${quality}`);
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error("[HLS] Fatal error:", data.type, data.details);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Try to recover
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                // Fallback to direct URL if available
                if (fallbackUrl) {
                  console.log("[HLS] Falling back to direct URL");
                  hls.destroy();
                  video.src = fallbackUrl;
                } else {
                  onError?.("Video playback failed");
                }
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else {
        // No HLS support at all, try direct URL
        if (fallbackUrl) {
          video.src = fallbackUrl;
        } else {
          onError?.("HLS not supported on this device");
        }
      }
    } else {
      // Regular video file
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => setIsReady(true));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSrc, fallbackUrl, autoPlay, onError]);

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

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Public methods via ref
  const play = useCallback(() => {
    return videoRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  return (
    <video
      ref={videoRef}
      poster={poster}
      muted={muted}
      playsInline
      preload="auto"
      className={className}
      data-quality={currentQuality}
      data-ready={isReady}
    />
  );
}

// Export hook for controlling the player
export function useHLSPlayer(ref: React.RefObject<HTMLVideoElement>) {
  const play = useCallback(() => ref.current?.play(), [ref]);
  const pause = useCallback(() => ref.current?.pause(), [ref]);
  const seek = useCallback((time: number) => {
    if (ref.current) ref.current.currentTime = time;
  }, [ref]);
  const setMuted = useCallback((muted: boolean) => {
    if (ref.current) ref.current.muted = muted;
  }, [ref]);

  return { play, pause, seek, setMuted };
}
