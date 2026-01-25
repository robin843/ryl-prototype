import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  src: string;
  alt: string;
  websiteUrl?: string | null;
  className?: string;
};

const PLACEHOLDER_SRC = "/placeholder.svg";

function faviconFallback(websiteUrl: string) {
  // Very reliable fallback that returns a site favicon.
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(websiteUrl)}`;
}

export function BrandLogo({ src, alt, websiteUrl, className }: BrandLogoProps) {
  const faviconSrc = useMemo(
    () => (websiteUrl ? faviconFallback(websiteUrl) : null),
    [websiteUrl]
  );

  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackStep, setFallbackStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    setCurrentSrc(src);
    setFallbackStep(0);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn(
        "w-14 h-14 rounded-xl border border-border object-contain bg-logo-surface",
        className
      )}
      onError={() => {
        // 0: original src (e.g. Clearbit)
        // 1: favicon fallback
        // 2: placeholder
        if (fallbackStep === 0 && faviconSrc) {
          setFallbackStep(1);
          setCurrentSrc(faviconSrc);
          return;
        }
        if (fallbackStep !== 2) {
          setFallbackStep(2);
          setCurrentSrc(PLACEHOLDER_SRC);
        }
      }}
    />
  );
}
