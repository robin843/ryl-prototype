import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RylHotspotProps {
  position: { x: number; y: number };
  onClick: () => void;
  isNew?: boolean;
}

/**
 * Glaserner Ripple-Effekt Hotspot
 * Elegante, nicht-aufdringliche Shopping-Marker
 */
export function RylHotspot({ position, onClick, isNew = false }: RylHotspotProps) {
  const [showRipple, setShowRipple] = useState(false);

  useEffect(() => {
    if (isNew) {
      setShowRipple(true);
      // Keep ripple visible for the entire hotspot duration
    }
  }, [isNew]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute z-20 group",
        "w-12 h-12",
        "flex items-center justify-center",
        "transition-all duration-300",
        showRipple && "animate-fade-in"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Outer ripple rings */}
      <span className={cn(
        "absolute inset-0 rounded-full",
        "ryl-ripple-1"
      )} />
      <span className={cn(
        "absolute inset-0 rounded-full",
        "ryl-ripple-2"
      )} />
      <span className={cn(
        "absolute inset-0 rounded-full",
        "ryl-ripple-3"
      )} />
      
      {/* Core glass orb */}
      <span className={cn(
        "relative w-4 h-4 rounded-full",
        "bg-white/20 backdrop-blur-md",
        "border border-white/40",
        "shadow-[0_0_20px_rgba(255,255,255,0.3)]",
        "group-hover:bg-white/30 group-hover:scale-125",
        "group-hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]",
        "transition-all duration-300"
      )}>
        {/* Inner glow */}
        <span className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
      </span>
    </button>
  );
}
