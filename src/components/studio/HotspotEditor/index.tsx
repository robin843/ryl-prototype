import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Plus, Crosshair, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Product } from '@/hooks/useProducerData';
import { useHotspotEditor, Hotspot, HotspotInput } from '@/hooks/useHotspotEditor';
import { HotspotForm } from './HotspotForm';
import { HotspotList } from './HotspotList';
import { toast } from 'sonner';

interface HotspotEditorProps {
  episodeId: string;
  videoUrl: string;
  products: Product[];
  onClose: () => void;
}

export function HotspotEditor({
  episodeId,
  videoUrl,
  products,
  onClose,
}: HotspotEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  
  const {
    hotspots,
    isLoading,
    createHotspot,
    updateHotspot,
    deleteHotspot,
  } = useHotspotEditor(episodeId);

  // Video time sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  // Handle click on video to place hotspot
  const handleVideoClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Clamp values
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    setPendingPosition({ x: clampedX, y: clampedY });
    setEditingHotspot(null);
    setIsFormOpen(true);
  }, []);

  // Handle save
  const handleSave = async (input: HotspotInput) => {
    const result = await createHotspot(input);
    if (result) {
      toast.success('Hotspot erstellt');
      setIsFormOpen(false);
      setPendingPosition(null);
    } else {
      toast.error('Fehler beim Erstellen');
    }
  };

  // Handle update
  const handleUpdate = async (id: string, input: Partial<HotspotInput>) => {
    const success = await updateHotspot(id, input);
    if (success) {
      toast.success('Hotspot aktualisiert');
      setIsFormOpen(false);
      setEditingHotspot(null);
    } else {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const success = await deleteHotspot(id);
    if (success) {
      toast.success('Hotspot gelöscht');
      setIsFormOpen(false);
      setEditingHotspot(null);
    } else {
      toast.error('Fehler beim Löschen');
    }
  };

  // Handle edit
  const handleEdit = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setPendingPosition(null);
    setIsFormOpen(true);
  };

  // Cancel form
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingHotspot(null);
    setPendingPosition(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter active hotspots for overlay
  const activeHotspots = hotspots.filter(
    h => currentTime >= h.start_time && currentTime <= h.end_time
  );

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Crosshair className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Hotspot Editor</h2>
          <span className="text-sm text-muted-foreground">
            {hotspots.length} Hotspot{hotspots.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-4 flex flex-col min-h-0">
          {/* Video Container */}
          <div
            ref={wrapperRef}
            className="relative bg-black rounded-xl overflow-hidden cursor-crosshair flex-1"
            onClick={handleVideoClick}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              controls
              playsInline
            />
            
            {/* Hotspot Markers Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {activeHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className={cn(
                    "absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2",
                    "rounded-full border-2 border-primary bg-primary/30",
                    "flex items-center justify-center",
                    "animate-pulse"
                  )}
                  style={{
                    left: `${hotspot.position_x * 100}%`,
                    top: `${hotspot.position_y * 100}%`,
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
              ))}
              
              {/* Pending position marker */}
              {pendingPosition && (
                <div
                  className={cn(
                    "absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2",
                    "rounded-full border-2 border-dashed border-gold bg-gold/20",
                    "flex items-center justify-center"
                  )}
                  style={{
                    left: `${pendingPosition.x * 100}%`,
                    top: `${pendingPosition.y * 100}%`,
                  }}
                >
                  <Plus className="w-4 h-4 text-gold" />
                </div>
              )}
            </div>
          </div>

          {/* Time Info */}
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Aktuell: {formatTime(currentTime)}</span>
            <span>Dauer: {formatTime(duration)}</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border p-4 overflow-y-auto">
          {/* No products warning */}
          {products.length === 0 && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 mb-4 text-sm">
              Keine Produkte vorhanden. Erstelle zuerst Produkte für diese Serie.
            </div>
          )}

          {/* Form or Add Button */}
          {isFormOpen ? (
            <HotspotForm
              products={products}
              editingHotspot={editingHotspot}
              pendingPosition={pendingPosition}
              currentTime={currentTime}
              onSave={handleSave}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
          ) : (
            <Button
              onClick={() => {
                setPendingPosition({ x: 0.5, y: 0.5 });
                setIsFormOpen(true);
              }}
              className="w-full mb-4"
              disabled={products.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Hotspot hinzufügen
            </Button>
          )}

          {/* Hotspot List */}
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-3">Alle Hotspots</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <HotspotList
                hotspots={hotspots}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentTime={currentTime}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
