import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Trash2 } from 'lucide-react';
import { Product } from '@/hooks/useProducerData';
import { Hotspot, HotspotInput } from '@/hooks/useHotspotEditor';

interface HotspotFormProps {
  products: Product[];
  editingHotspot: Hotspot | null;
  pendingPosition: { x: number; y: number } | null;
  currentTime: number;
  onSave: (input: HotspotInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<HotspotInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
}

export function HotspotForm({
  products,
  editingHotspot,
  pendingPosition,
  currentTime,
  onSave,
  onUpdate,
  onDelete,
  onCancel,
}: HotspotFormProps) {
  const [productId, setProductId] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(5);
  const [positionX, setPositionX] = useState<number>(0.5);
  const [positionY, setPositionY] = useState<number>(0.5);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when editing or creating
  useEffect(() => {
    if (editingHotspot) {
      setProductId(editingHotspot.product_id);
      setStartTime(editingHotspot.start_time);
      setEndTime(editingHotspot.end_time);
      setPositionX(editingHotspot.position_x);
      setPositionY(editingHotspot.position_y);
    } else if (pendingPosition) {
      setProductId('');
      setPositionX(pendingPosition.x);
      setPositionY(pendingPosition.y);
      setStartTime(Math.floor(currentTime));
      setEndTime(Math.floor(currentTime) + 5);
    }
  }, [editingHotspot, pendingPosition, currentTime]);

  const handleSubmit = async () => {
    if (!productId) return;
    
    setIsSaving(true);
    
    const input: HotspotInput = {
      product_id: productId,
      position_x: positionX,
      position_y: positionY,
      start_time: startTime,
      end_time: endTime,
    };

    if (editingHotspot) {
      await onUpdate(editingHotspot.id, input);
    } else {
      await onSave(input);
    }
    
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!editingHotspot) return;
    setIsSaving(true);
    await onDelete(editingHotspot.id);
    setIsSaving(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {editingHotspot ? 'Hotspot bearbeiten' : 'Neuer Hotspot'}
        </h3>
        <Button variant="ghost" size="icon-sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {/* Product Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="product">Produkt</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Produkt auswählen..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center gap-2">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt="" 
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <span>{product.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({(product.price_cents / 100).toFixed(2)} €)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="startTime">Start (Sekunden)</Label>
            <Input
              id="startTime"
              type="number"
              min={0}
              step={0.1}
              value={startTime}
              onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">{formatTime(startTime)}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endTime">Ende (Sekunden)</Label>
            <Input
              id="endTime"
              type="number"
              min={0}
              step={0.1}
              value={endTime}
              onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">{formatTime(endTime)}</p>
          </div>
        </div>

        {/* Position Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Position X</Label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={positionX.toFixed(2)}
              onChange={(e) => setPositionX(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Position Y</Label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={positionY.toFixed(2)}
              onChange={(e) => setPositionY(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Tipp: Klicke auf das Video, um die Position zu setzen.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!productId || isSaving}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          {editingHotspot ? 'Speichern' : 'Erstellen'}
        </Button>
        {editingHotspot && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSaving}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
