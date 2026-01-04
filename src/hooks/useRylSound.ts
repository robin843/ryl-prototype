import { useRef, useCallback } from 'react';

/**
 * Hook for playing the iconic Ryl-Ping sound
 * Handles AudioContext and autoplay restrictions
 */
export function useRylSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedRef = useRef<Set<string>>(new Set());

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playPing = useCallback(async (hotspotId: string) => {
    // Prevent duplicate plays for the same hotspot
    if (hasPlayedRef.current.has(hotspotId)) return;
    hasPlayedRef.current.add(hotspotId);

    try {
      const ctx = getAudioContext();
      
      // Resume context if suspended (autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Create a refined, luxurious ping sound
      const now = ctx.currentTime;
      
      // Main tone - crystal clear, high-end feel
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      // Harmonic overtone for richness
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      
      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(2400, now);
      harmonic.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
      
      harmonicGain.gain.setValueAtTime(0, now);
      harmonicGain.gain.linearRampToValueAtTime(0.05, now + 0.01);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      harmonic.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);
      
      // Play
      oscillator.start(now);
      harmonic.start(now);
      oscillator.stop(now + 0.4);
      harmonic.stop(now + 0.25);
      
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }, [getAudioContext]);

  const resetPlayed = useCallback(() => {
    hasPlayedRef.current.clear();
  }, []);

  return { playPing, resetPlayed };
}
