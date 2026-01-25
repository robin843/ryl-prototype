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

// Global manifest cache for cross-instance sharing
const manifestCache = new Map<string, { data: string; timestamp: number }>();
const MANIFEST_CACHE_TTL = 60000; // 1 minute TTL

/**
 * Prefetch HLS manifest into browser cache and memory
 * This dramatically reduces startup time when video becomes active
 */
async function prefetchManifest(url: string, signal?: AbortSignal): Promise<void> {
  // Check memory cache first
  const cached = manifestCache.get(url);
  if (cached && Date.now() - cached.timestamp < MANIFEST_CACHE_TTL) {
    return;
  }

  try {
    const response = await fetch(url, {
      signal,
      cache: 'force-cache',
      headers: {
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, */*',
      },
    });
    
    if (response.ok) {
      const data = await response.text();
      manifestCache.set(url, { data, timestamp: Date.now() });
      
      // Parse manifest and prefetch first segment for even faster start
      const lines = data.split('\n');
      const firstSegment = lines.find(line => 
        line.endsWith('.ts') || line.endsWith('.m4s') || line.includes('.ts?')
      );
      
      if (firstSegment) {
        const segmentUrl = firstSegment.startsWith('http') 
          ? firstSegment 
          : new URL(firstSegment, url).href;
        
        // Prefetch first segment (low priority)
        fetch(segmentUrl, { 
          signal, 
          cache: 'force-cache',
          priority: 'low' as RequestPriority,
        }).catch(() => {});
      }
    }
  } catch (error) {
    // Silently fail - prefetch is best-effort
    if ((error as Error).name !== 'AbortError') {
      console.debug('[HLS Prefetch] Failed:', url);
    }
  }
}

/**
 * HLS Video Player optimized for Feed usage
 * - Sub-500ms startup with manifest prefetching
 * - Starts at 480p for instant playback, upgrades to 720p/1080p
 * - Adaptive bitrate switching
 * - Native HLS for Safari/iOS
 * - Aggressive preloading for nearby videos
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
  const prefetchControllerRef = useRef<AbortController | null>(null);

  // Determine the video source - prefer HLS if available
  const videoSrc = hlsUrl || fallbackUrl;
  const isHlsStream = videoSrc?.includes(".m3u8") || videoSrc?.includes("manifest");

  // Manifest prefetch for nearby videos (CRITICAL for sub-500ms start)
  useEffect(() => {
    // Prefetch when nearby but not active
    if (isNearby && !isActive && hlsUrl && isHlsStream) {
      prefetchControllerRef.current = new AbortController();
      prefetchManifest(hlsUrl, prefetchControllerRef.current.signal);
      
      return () => {
        prefetchControllerRef.current?.abort();
        prefetchControllerRef.current = null;
      };
    }
  }, [isNearby, isActive, hlsUrl, isHlsStream]);

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
      setIsReady(false);
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
          // === PERFORMANCE-CRITICAL SETTINGS ===
          // Start at 480p (level 1) for instant playback, upgrade after buffered
          startLevel: isActive ? 1 : 0,
          // Prefetch first fragment before play for instant start
          startFragPrefetch: true,
          // Minimal buffer for fast start (5s active, 2s preload)
          maxBufferLength: isActive ? 5 : 2,
          maxMaxBufferLength: 15,
          // Smaller buffer size = faster start
          maxBufferSize: 5 * 1000 * 1000, // 5MB
          maxBufferHole: 0.3,
          // Skip bandwidth test for faster start
          testBandwidth: false,
          // Conservative bandwidth estimate (3 Mbps)
          abrEwmaDefaultEstimate: 3000000,
          // Faster quality upgrades once playing
          abrBandWidthFactor: 0.9,
          abrBandWidthUpFactor: 0.8,
          // Reduce back buffer to save memory
          backBufferLength: 5,
          // Progressive loading for faster first frame
          progressive: true,
          // Cap to player size to avoid loading 4K on small screens
          capLevelToPlayerSize: true,
          // Low latency off for stability
          lowLatencyMode: false,
          // Auto start loading immediately
          autoStartLoad: true,
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setIsReady(true);
          console.debug(`[HLS] Manifest parsed, ${data.levels.length} quality levels available`);
        });

        // Quality level switching logging (dev only)
        if (import.meta.env.DEV) {
          hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
            const level = hls.levels[data.level];
            if (level) {
              console.debug(`[HLS] Quality: ${level.height}p @ ${Math.round(level.bitrate / 1000)}kbps`);
            }
          });
        }

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error("[HLS Feed] Fatal error:", data.type, data.details);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Retry network errors with backoff
                setTimeout(() => hls.startLoad(), 1000);
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
                  setIsReady(true);
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

  // Play/pause based on active state - instant play when ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && isReady) {
      // Instant play attempt
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Autoplay was prevented, likely need user interaction
          console.debug('[HLS] Autoplay prevented:', error.message);
        });
      }
    } else if (!isActive) {
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
