import { useRef } from 'react';
import { ShopableOverlay } from '@/components/shopable';

/**
 * Demo page showing ShopableOverlay usage with a video element.
 * 
 * Usage:
 * 1. Wrap video in a position:relative container
 * 2. Pass refs for both video and wrapper
 * 3. ShopableOverlay fetches and renders hotspots automatically
 */
export default function ShopableDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Demo video ID - replace with actual partner video ID
  const partnerVideoId = "demo-video-123";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          ShopableOverlay Demo
        </h1>
        
        <p className="text-muted-foreground text-sm">
          This demo shows how the ShopableOverlay component integrates with an HTML5 video.
          Hotspots appear based on the video's current time and are clickable.
        </p>

        {/* Video container with relative positioning */}
        <div 
          ref={wrapperRef}
          className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
        >
          {/* HTML5 Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            playsInline
            poster="/placeholder.svg"
          >
            {/* Add video source here */}
            <source src="" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* ShopableOverlay positioned over video */}
          <ShopableOverlay
            partnerVideoId={partnerVideoId}
            videoRef={videoRef}
            wrapperRef={wrapperRef}
            episodeId="demo"
          />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Partner Video ID:</strong> {partnerVideoId}</p>
          <p><strong>API Base URL:</strong> {import.meta.env.VITE_SHOPABLE_API_BASE_URL || '(not configured)'}</p>
        </div>

        {/* Usage code example */}
        <details className="text-sm">
          <summary className="cursor-pointer text-primary hover:underline">
            View usage code
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">
{`const videoRef = useRef<HTMLVideoElement>(null);
const wrapperRef = useRef<HTMLDivElement>(null);

<div ref={wrapperRef} className="relative">
  <video ref={videoRef} controls>
    <source src="video.mp4" />
  </video>
  
  <ShopableOverlay
    partnerVideoId="your-video-id"
    videoRef={videoRef}
    wrapperRef={wrapperRef}
  />
</div>`}
          </pre>
        </details>
      </div>
    </div>
  );
}
