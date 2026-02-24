import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdPlaceholderProps {
  type: 'preroll' | 'midroll' | 'banner';
  duration?: number; // in seconds
  onComplete?: () => void;
  onSkip?: () => void;
}

export const AdPlaceholder = ({ 
  type, 
  duration = 5, 
  onComplete, 
  onSkip 
}: AdPlaceholderProps) => {
  const [countdown, setCountdown] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (type === 'banner') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Allow skip after 3 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(skipTimer);
    };
  }, [type, onComplete]);

  const handleSkip = () => {
    onSkip?.();
    onComplete?.();
  };

  if (type === 'banner') {
    return (
      <div className="w-full bg-muted/50 border border-border rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Werbung</p>
        <div className="h-16 flex items-center justify-center bg-muted rounded">
          <span className="text-muted-foreground text-sm">
            [Werbebanner Platzhalter]
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Ad Content Placeholder */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-2">Werbung</p>
          <div className="w-64 h-48 bg-muted/20 rounded-lg flex items-center justify-center border border-white/10">
            <span className="text-white/40 text-sm">
              {type === 'preroll' ? 'Pre-Roll Werbung' : 'Mid-Roll Werbung'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        {countdown > 0 && (
          <span className="text-white/60 text-sm">
            Werbung endet in {countdown}s
          </span>
        )}
        {canSkip && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSkip}
            className="gap-1"
          >
            <X className="w-3 h-3" />
            Überspringen
          </Button>
        )}
      </div>

    </div>
  );
};
