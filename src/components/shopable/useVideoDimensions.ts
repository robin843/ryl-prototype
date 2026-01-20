import { useState, useEffect } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Track dimensions of a wrapper element using ResizeObserver.
 * Uses wrapper instead of video element to avoid Mobile Safari bugs.
 */
export function useVideoDimensions(
  wrapperRef: React.RefObject<HTMLElement>
): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Get initial dimensions
    const rect = wrapper.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });

    // Observe resize changes
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [wrapperRef]);

  return dimensions;
}
