import { Hotspot } from '@/hooks/useHotspotEditor';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Package } from 'lucide-react';

interface HotspotListProps {
  hotspots: Hotspot[];
  onEdit: (hotspot: Hotspot) => void;
  onDelete: (id: string) => void;
  currentTime: number;
}

export function HotspotList({ hotspots, onEdit, onDelete, currentTime }: HotspotListProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hotspots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Noch keine Hotspots</p>
        <p className="text-xs">Klicke auf das Video, um einen zu erstellen</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hotspots.map((hotspot) => {
        const isActive = currentTime >= hotspot.start_time && currentTime <= hotspot.end_time;
        
        return (
          <div
            key={hotspot.id}
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-colors
              ${isActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card hover:bg-accent/50'
              }
            `}
          >
            {/* Product Image */}
            {hotspot.product?.image_url ? (
              <img
                src={hotspot.product.image_url}
                alt=""
                className="w-10 h-10 rounded object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {hotspot.product?.name || 'Unbekanntes Produkt'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTime(hotspot.start_time)} - {formatTime(hotspot.end_time)}
                <span className="mx-1">•</span>
                {Math.round(hotspot.position_x * 100)}%, {Math.round(hotspot.position_y * 100)}%
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(hotspot)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(hotspot.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
