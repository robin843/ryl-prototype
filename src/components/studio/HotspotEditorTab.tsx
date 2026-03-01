import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Loader2, ShoppingBag, Clock, Link2, Play, Pause, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  brand_name: string;
  price_cents: number;
  product_url: string | null;
  image_url: string | null;
}

interface HotspotItem {
  id: string;
  productId: string;
  productName: string;
  productUrl: string;
  startTime: number;
  duration: number;
  label: string;
  imageUrl: string | null;
  positionX: number;
  positionY: number;
  width: number;   // percentage 0-100 of video width
  height: number;  // percentage 0-100 of video height
}

interface HotspotEditorTabProps {
  episodeId: string;
  videoUrl: string | null;
}

// ── Draggable Hotspot on Video ──────────────────────────────

function DraggableHotspot({
  item,
  isSelected,
  onSelect,
  onDragEnd,
}: {
  item: HotspotItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const startDrag = useCallback((startX: number, startY: number) => {
    dragging.current = true;
    onSelect();

    const parent = ref.current?.parentElement;
    if (!parent) return;

    const move = (cx: number, cy: number) => {
      const rect = parent.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100));
      if (ref.current) {
        ref.current.style.left = `${x}%`;
        ref.current.style.top = `${y}%`;
      }
    };

    const end = (cx: number, cy: number) => {
      dragging.current = false;
      const rect = parent.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100));
      onDragEnd(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    const onMouseMove = (e: MouseEvent) => { e.preventDefault(); move(e.clientX, e.clientY); };
    const onMouseUp = (e: MouseEvent) => end(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      end(t.clientX, t.clientY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  }, [onSelect, onDragEnd]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute rounded-full border-2 border-gold bg-gold/20 flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow touch-none z-20",
        isSelected && "ring-2 ring-gold ring-offset-2 ring-offset-black shadow-lg shadow-gold/30"
      )}
      style={{
        left: `${item.positionX}%`,
        top: `${item.positionY}%`,
        transform: 'translate(-50%, -50%)',
        width: `${item.width}%`,
        aspectRatio: '1 / 1',
      }}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); startDrag(e.clientX, e.clientY); }}
      onTouchStart={(e) => { e.stopPropagation(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
    >
      <ShoppingBag className="w-1/2 h-1/2 text-gold pointer-events-none" />
    </div>
  );
}

export function HotspotEditorTab({ episodeId, videoUrl }: HotspotEditorTabProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [hotspots, setHotspots] = useState<HotspotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Ensure we have a valid session before DB operations
  const ensureSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Try refreshing
      const { data: { session: refreshed } } = await supabase.auth.refreshSession();
      if (!refreshed) {
        toast.error('Session abgelaufen. Bitte neu einloggen.');
        return false;
      }
    }
    return true;
  }, []);

  // Load hotspots
  useEffect(() => {
    if (!episodeId) return;

    let active = true;

    const loadHotspots = async () => {
      setIsLoading(true);
      try {
        await ensureSession();

        const { data, error } = await supabase
          .from('episode_hotspots')
          .select('*, shopable_products(name, product_url, image_url)')
          .eq('episode_id', episodeId);

        if (error) throw error;

        const mapped: HotspotItem[] = (data || []).map((h: any) => ({
          id: h.id,
          productId: h.product_id,
          productName: h.shopable_products?.name || 'Produkt',
          productUrl: h.shopable_products?.product_url || '',
          startTime: h.start_time,
          duration: h.end_time - h.start_time,
          label: h.shopable_products?.name || '',
          imageUrl: h.shopable_products?.image_url || null,
          positionX: Number(h.position_x) || 50,
          positionY: Number(h.position_y) || 50,
          width: Number(h.width) * 100 || 8,
          height: Number(h.height) * 100 || 8,
        }));

        if (!active) return;
        setHotspots(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadHotspots();

    return () => {
      active = false;
    };
  }, [episodeId, ensureSession]);

  // Sync video time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Capture duration if already loaded (e.g. cached video)
    if (video.duration && isFinite(video.duration)) {
      setVideoDuration(video.duration);
    }

    const onTime = () => { if (!isDragging) setCurrentTime(video.currentTime); };
    const onDur = () => {
      if (video.duration && isFinite(video.duration)) {
        setVideoDuration(video.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onDur);
    video.addEventListener('durationchange', onDur);
    video.addEventListener('loadeddata', onDur);
    video.addEventListener('canplay', onDur);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onDur);
      video.removeEventListener('durationchange', onDur);
      video.removeEventListener('loadeddata', onDur);
      video.removeEventListener('canplay', onDur);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [isDragging]);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }, []);

  // Timeline drag
  const getTimeFromEvent = useCallback((clientX: number) => {
    if (!timelineRef.current || videoDuration <= 0) return null;
    const rect = timelineRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pct * videoDuration;
  }, [videoDuration]);

  const handleTimelineMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const time = getTimeFromEvent(e.clientX);
    if (time !== null) seekTo(time);
    setIsDragging(true);
    const onMove = (ev: MouseEvent) => {
      const t = getTimeFromEvent(ev.clientX);
      if (t !== null) seekTo(t);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [getTimeFromEvent, seekTo]);

  const handleTimelineTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const time = getTimeFromEvent(e.touches[0].clientX);
    if (time !== null) seekTo(time);
    setIsDragging(true);
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const t = getTimeFromEvent(ev.touches[0].clientX);
      if (t !== null) seekTo(t);
    };
    const onEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }, [getTimeFromEvent, seekTo]);

  // Add hotspot at current playhead
  const handleAddHotspot = useCallback(async () => {
    if (!user) {
      toast.error('Bitte zuerst einloggen');
      return;
    }

    setIsCreating(true);
    try {
      const ok = await ensureSession();
      if (!ok) return;

      const startTime = Math.round(currentTime * 10) / 10;
      const duration = 5;

      const { data: product, error: pErr } = await supabase
        .from('shopable_products')
        .insert({
          creator_id: user.id,
          name: 'Neues Produkt',
          brand_name: 'Marke',
          price_cents: 0,
          product_url: '',
        })
        .select('id, name, product_url, image_url')
        .single();

      if (pErr) throw pErr;

      const { data: hotspot, error: hErr } = await supabase
        .from('episode_hotspots')
        .insert({
          episode_id: episodeId,
          product_id: product.id,
          position_x: 50,
          position_y: 50,
          start_time: Math.round(startTime),
          end_time: Math.round(startTime + duration),
        })
        .select()
        .single();

      if (hErr) throw hErr;

      const newItem: HotspotItem = {
        id: hotspot.id,
        productId: product.id,
        productName: 'Neues Produkt',
        productUrl: '',
        startTime,
        duration,
        label: 'Neues Produkt',
        imageUrl: null,
        positionX: 50,
        positionY: 50,
        width: 8,
        height: 8,
      };

      setHotspots(prev => [...prev, newItem]);
      setEditingId(hotspot.id);
      toast.success(`Hotspot bei ${formatTime(startTime)} erstellt`);
    } catch (err) {
      console.error(err);
      toast.error('Hotspot konnte nicht erstellt werden');
    } finally {
      setIsCreating(false);
    }
  }, [user, currentTime, episodeId, ensureSession]);

  const handleUpdateHotspot = useCallback(async (item: HotspotItem) => {
    try {
      const ok = await ensureSession();
      if (!ok) return;

      await supabase
        .from('episode_hotspots')
        .update({
          start_time: Math.round(item.startTime),
          end_time: Math.round(item.startTime + item.duration),
          width: item.width / 100,
          height: item.height / 100,
        })
        .eq('id', item.id);

      await supabase
        .from('shopable_products')
        .update({
          name: item.label || 'Produkt',
          product_url: item.productUrl || null,
        })
        .eq('id', item.productId);

      setHotspots(prev => prev.map(h => h.id === item.id ? item : h));
      toast.success('Gespeichert');
    } catch {
      toast.error('Speichern fehlgeschlagen');
    }
  }, [ensureSession]);

  const handleDeleteHotspot = useCallback(async (id: string) => {
    try {
      const ok = await ensureSession();
      if (!ok) return;

      await supabase.from('episode_hotspots').delete().eq('id', id);
      setHotspots(prev => prev.filter(h => h.id !== id));
      if (editingId === id) setEditingId(null);
      toast.success('Hotspot gelöscht');
    } catch {
      toast.error('Löschen fehlgeschlagen');
    }
  }, [editingId, ensureSession]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Lade zuerst ein Video hoch, um Hotspots zu platzieren.
      </div>
    );
  }

  const playheadPct = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Video Preview */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[50vh] mx-auto touch-none">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          playsInline
          preload="auto"
          onLoadedMetadata={() => {
            const v = videoRef.current;
            if (v && v.duration && isFinite(v.duration)) {
              setVideoDuration(v.duration);
            }
          }}
        />
        {/* Draggable hotspot markers on video */}
        {hotspots
          .filter(h => currentTime >= h.startTime && currentTime <= h.startTime + h.duration)
          .map(h => (
            <DraggableHotspot
              key={h.id}
              item={h}
              isSelected={editingId === h.id}
              onSelect={() => setEditingId(h.id)}
              onDragEnd={(x, y) => {
                const updated = { ...h, positionX: x, positionY: y };
                setHotspots(prev => prev.map(p => p.id === h.id ? updated : p));
                // persist position
                ensureSession().then(ok => {
                  if (!ok) return;
                  supabase
                    .from('episode_hotspots')
                    .update({ position_x: x, position_y: y })
                    .eq('id', h.id)
                    .then(({ error: err }) => { if (err) console.error(err); });
                });
              }}
            />
          ))}
      </div>

      {/* Playback Controls + Timeline */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={togglePlay}
            className="shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <span className="text-xs text-muted-foreground font-mono tabular-nums w-20 shrink-0">
            {formatTime(currentTime)} / {formatTime(videoDuration)}
          </span>
        </div>

        {/* Timeline bar */}
        <div
          ref={timelineRef}
          className="relative h-14 bg-muted/30 rounded-lg cursor-pointer select-none touch-none group"
          onMouseDown={handleTimelineMouseDown}
          onTouchStart={handleTimelineTouchStart}
        >
          {/* Hotspot ranges on timeline */}
          {hotspots.map(h => {
            const left = videoDuration > 0 ? (h.startTime / videoDuration) * 100 : 0;
            const width = videoDuration > 0 ? (h.duration / videoDuration) * 100 : 0;
            return (
              <div
                key={h.id}
                className={cn(
                  "absolute top-1 bottom-1 rounded-md transition-colors",
                  editingId === h.id ? "bg-gold/40 border border-gold" : "bg-gold/20"
                )}
                style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
                onClick={(e) => { e.stopPropagation(); setEditingId(h.id); }}
              />
            );
          })}

          {/* Playhead – draggable knob */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
            style={{ left: `${playheadPct}%` }}
          >
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-foreground border-2 border-background cursor-grab active:cursor-grabbing shadow-lg"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleTimelineMouseDown(e as unknown as React.MouseEvent);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                handleTimelineTouchStart(e as unknown as React.TouchEvent);
              }}
            />
          </div>
        </div>
      </div>

      {/* Add Hotspot Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddHotspot}
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        Hotspot bei {formatTime(currentTime)} hinzufügen
      </Button>

      {/* Hotspot List */}
      {hotspots.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {hotspots.length} Hotspot{hotspots.length !== 1 && 's'}
          </span>
          {hotspots.map(h => (
            <HotspotCard
              key={h.id}
              item={h}
              isEditing={editingId === h.id}
              onSelect={() => { setEditingId(h.id); seekTo(h.startTime); }}
              onUpdate={handleUpdateHotspot}
              onDelete={handleDeleteHotspot}
              onSizeChange={(id, s) => {
                setHotspots(prev => prev.map(p => p.id === id ? { ...p, width: s, height: s } : p));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hotspot Card ────────────────────────────────────────────

interface HotspotCardProps {
  item: HotspotItem;
  isEditing: boolean;
  onSelect: () => void;
  onUpdate: (item: HotspotItem) => void;
  onDelete: (id: string) => void;
  onSizeChange: (id: string, size: number) => void;
}

function HotspotCard({ item, isEditing, onSelect, onUpdate, onDelete, onSizeChange }: HotspotCardProps) {
  const [label, setLabel] = useState(item.label);
  const [url, setUrl] = useState(item.productUrl);
  const [duration, setDuration] = useState(String(item.duration));
  const [size, setSize] = useState(item.width);

  // Sync from parent
  useEffect(() => {
    setLabel(item.label);
    setUrl(item.productUrl);
    setDuration(String(item.duration));
    setSize(item.width);
  }, [item]);

  const handleSave = () => {
    const s = Math.max(3, Math.min(15, size));
    onUpdate({
      ...item,
      label,
      productUrl: url,
      duration: Math.max(1, parseFloat(duration) || 5),
      width: s,
      height: s,
    });
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-border bg-card",
          "hover:border-gold/50 transition-colors text-left w-full"
        )}
      >
        {item.imageUrl && (
          <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.label || 'Kein Titel'}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {formatTime(item.startTime)} · {item.duration}s sichtbar
          </div>
        </div>
        {item.productUrl && <ShoppingBag className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
    );
  }

  return (
    <div className="rounded-lg border-2 border-gold/50 bg-card p-3 space-y-3">
      {/* Label */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Bezeichnung</label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="z.B. Rolex Submariner"
          className="h-8 text-sm"
        />
      </div>

      {/* Product URL */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          <Link2 className="w-3 h-3 inline mr-1" />
          Produkt-Link
        </label>
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://rolex.com/submariner"
          className="h-8 text-sm"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">
          <Clock className="w-3 h-3 inline mr-1" />
          Sichtbar (Sekunden)
        </label>
        <Input
          type="number"
          min={1}
          step={0.5}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="h-8 text-sm w-24"
        />
      </div>

      {/* Size Slider */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">
          <Maximize2 className="w-3 h-3 inline mr-1" />
          Größe
        </label>
        <Slider
          value={[size]}
          onValueChange={([v]) => { setSize(v); onSizeChange(item.id, v); }}
          min={3}
          max={15}
          step={1}
          className="w-full"
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Start: {formatTime(item.startTime)}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" variant="premium" className="flex-1 h-8 text-xs" onClick={handleSave}>
          Speichern
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-destructive hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
