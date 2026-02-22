import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Studio Write-Safety Hook
 *
 * Manages hotspot editing in local state only.
 * Changes are persisted ONLY when save() is called.
 * No 60fps DB writes — all edits are in-memory.
 */

interface HotspotKeyframe {
  frame: number;
  x: number;
  y: number;
}

export interface StudioHotspot {
  id: string;
  episodeId: string;
  productId: string;
  positionX: number;
  positionY: number;
  startTime: number;
  endTime: number;
  startFrame: number | null;
  endFrame: number | null;
  width: number;
  height: number;
  keyframes: HotspotKeyframe[];
  animationType: string;
}

interface StudioHotspotEditorOptions {
  episodeId: string;
}

export function useStudioHotspotEditor({ episodeId }: StudioHotspotEditorOptions) {
  const [hotspots, setHotspots] = useState<StudioHotspot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const originalRef = useRef<StudioHotspot[]>([]);

  // Load hotspots from DB once
  const loadHotspots = useCallback(async () => {
    if (!episodeId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('episode_hotspots')
        .select('*')
        .eq('episode_id', episodeId);

      if (error) throw error;

      const mapped: StudioHotspot[] = (data || []).map((h) => ({
        id: h.id,
        episodeId: h.episode_id,
        productId: h.product_id,
        positionX: Number(h.position_x),
        positionY: Number(h.position_y),
        startTime: h.start_time,
        endTime: h.end_time,
        startFrame: h.start_frame,
        endFrame: h.end_frame,
        width: Number(h.width),
        height: Number(h.height),
        keyframes: (h.keyframes as unknown as HotspotKeyframe[]) || [],
        animationType: h.animation_type || 'static',
      }));

      setHotspots(mapped);
      originalRef.current = JSON.parse(JSON.stringify(mapped));
      setIsDirty(false);
    } catch (err) {
      console.error('[StudioEditor] Load failed:', err);
      toast.error('Hotspots konnten nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  }, [episodeId]);

  // Local-only mutations (no DB writes)
  const updateHotspot = useCallback((id: string, patch: Partial<StudioHotspot>) => {
    setHotspots((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
    setIsDirty(true);
  }, []);

  const updateKeyframe = useCallback(
    (hotspotId: string, frameIndex: number, kf: Partial<HotspotKeyframe>) => {
      setHotspots((prev) =>
        prev.map((h) => {
          if (h.id !== hotspotId) return h;
          const newKfs = [...h.keyframes];
          newKfs[frameIndex] = { ...newKfs[frameIndex], ...kf };
          return { ...h, keyframes: newKfs };
        })
      );
      setIsDirty(true);
    },
    []
  );

  const addKeyframe = useCallback((hotspotId: string, kf: HotspotKeyframe) => {
    setHotspots((prev) =>
      prev.map((h) => {
        if (h.id !== hotspotId) return h;
        return { ...h, keyframes: [...h.keyframes, kf].sort((a, b) => a.frame - b.frame) };
      })
    );
    setIsDirty(true);
  }, []);

  const removeKeyframe = useCallback((hotspotId: string, frameIndex: number) => {
    setHotspots((prev) =>
      prev.map((h) => {
        if (h.id !== hotspotId) return h;
        const newKfs = h.keyframes.filter((_, i) => i !== frameIndex);
        return { ...h, keyframes: newKfs };
      })
    );
    setIsDirty(true);
  }, []);

  const discardChanges = useCallback(() => {
    setHotspots(JSON.parse(JSON.stringify(originalRef.current)));
    setIsDirty(false);
  }, []);

  // Persist ALL changes in a single batch
  const saveAll = useCallback(async () => {
    if (!isDirty) return;
    setIsSaving(true);

    try {
      const updates = hotspots.map((h) =>
        supabase
          .from('episode_hotspots')
          .update({
            position_x: h.positionX,
            position_y: h.positionY,
            start_time: h.startTime,
            end_time: h.endTime,
            start_frame: h.startFrame,
            end_frame: h.endFrame,
            width: h.width,
            height: h.height,
            keyframes: h.keyframes as any,
            animation_type: h.animationType,
          })
          .eq('id', h.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        console.error('[StudioEditor] Save errors:', errors);
        toast.error(`${errors.length} Hotspot(s) konnten nicht gespeichert werden`);
      } else {
        originalRef.current = JSON.parse(JSON.stringify(hotspots));
        setIsDirty(false);
        toast.success('Hotspots gespeichert');
      }
    } catch (err) {
      console.error('[StudioEditor] Save failed:', err);
      toast.error('Speichern fehlgeschlagen');
    } finally {
      setIsSaving(false);
    }
  }, [hotspots, isDirty]);

  return {
    hotspots,
    isLoading,
    isSaving,
    isDirty,
    loadHotspots,
    updateHotspot,
    updateKeyframe,
    addKeyframe,
    removeKeyframe,
    discardChanges,
    saveAll,
  };
}
