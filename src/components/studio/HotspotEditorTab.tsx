import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, GripVertical, ChevronDown, ChevronUp, Save, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useStudioHotspotEditor, type StudioHotspot } from '@/hooks/useStudioHotspotEditor';
import { InlineProductForm } from './InlineProductForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  brand_name: string;
  price_cents: number;
}

interface HotspotEditorTabProps {
  episodeId: string;
}

export function HotspotEditorTab({ episodeId }: HotspotEditorTabProps) {
  const { user } = useAuth();
  const {
    hotspots,
    isLoading,
    isSaving,
    isDirty,
    loadHotspots,
    updateHotspot,
    addKeyframe,
    removeKeyframe,
    discardChanges,
    saveAll,
  } = useStudioHotspotEditor({ episodeId });

  const [products, setProducts] = useState<Product[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  // Load hotspots and products on mount
  useEffect(() => {
    loadHotspots();
  }, [loadHotspots]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('shopable_products')
      .select('id, name, brand_name, price_cents')
      .eq('creator_id', user.id)
      .then(({ data }) => setProducts(data || []));
  }, [user]);

  const handleCreateHotspotWithProduct = useCallback(async (productId: string) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('episode_hotspots')
        .insert({
          episode_id: episodeId,
          product_id: productId,
          position_x: 50,
          position_y: 50,
          start_time: 0,
          end_time: 5,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Hotspot erstellt');
      await loadHotspots();
      if (data) setExpandedId(data.id);
    } catch (err) {
      console.error(err);
      toast.error('Hotspot konnte nicht erstellt werden');
    } finally {
      setIsCreating(false);
    }
  }, [episodeId, loadHotspots]);

  const handleCreateHotspot = useCallback(async () => {
    if (products.length === 0) {
      setShowProductForm(true);
      return;
    }
    await handleCreateHotspotWithProduct(products[0].id);
  }, [products, handleCreateHotspotWithProduct]);

  const handleProductCreated = useCallback(async (product: Product) => {
    setProducts((prev) => [...prev, product]);
    setShowProductForm(false);
    await handleCreateHotspotWithProduct(product.id);
  }, [handleCreateHotspotWithProduct]);

  const handleDeleteHotspot = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('episode_hotspots')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Hotspot gelöscht');
      await loadHotspots();
    } catch {
      toast.error('Löschen fehlgeschlagen');
    }
  }, [loadHotspots]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Save / Discard Bar */}
      {isDirty && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gold/10 border border-gold/20">
          <span className="text-xs text-gold flex-1">Ungespeicherte Änderungen</span>
          <Button size="sm" variant="ghost" onClick={discardChanges} className="h-7 text-xs">
            <Undo2 className="w-3 h-3 mr-1" /> Verwerfen
          </Button>
          <Button size="sm" variant="premium" onClick={saveAll} disabled={isSaving} className="h-7 text-xs">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
            Speichern
          </Button>
        </div>
      )}

      {/* Hotspot List */}
      {hotspots.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Keine Hotspots. Füge einen hinzu, um Produkte im Video zu platzieren.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {hotspots.map((h) => (
            <HotspotRow
              key={h.id}
              hotspot={h}
              products={products}
              isExpanded={expandedId === h.id}
              onToggle={() => setExpandedId(expandedId === h.id ? null : h.id)}
              onUpdate={updateHotspot}
              onDelete={handleDeleteHotspot}
              onAddKeyframe={addKeyframe}
              onRemoveKeyframe={removeKeyframe}
            />
          ))}
        </div>
      )}

      {/* Inline Product Form */}
      {showProductForm && (
        <InlineProductForm
          onProductCreated={handleProductCreated}
          onCancel={() => setShowProductForm(false)}
        />
      )}

      {/* Add Hotspot */}
      {!showProductForm && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateHotspot}
            disabled={isCreating}
            className="flex-1"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Hotspot hinzufügen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProductForm(true)}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Produkt
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Single Hotspot Row ──────────────────────────────────────

interface HotspotRowProps {
  hotspot: StudioHotspot;
  products: Product[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, patch: Partial<StudioHotspot>) => void;
  onDelete: (id: string) => void;
  onAddKeyframe: (id: string, kf: { frame: number; x: number; y: number }) => void;
  onRemoveKeyframe: (id: string, index: number) => void;
}

function HotspotRow({
  hotspot,
  products,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddKeyframe,
  onRemoveKeyframe,
}: HotspotRowProps) {
  const product = products.find((p) => p.id === hotspot.productId);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-3 hover:bg-muted/30 transition-colors text-left"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {product?.name || 'Unbekanntes Produkt'}
          </div>
          <div className="text-xs text-muted-foreground">
            {hotspot.startTime}s – {hotspot.endTime}s · Position ({Math.round(hotspot.positionX)}, {Math.round(hotspot.positionY)})
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          {/* Product Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Produkt</label>
            <Select
              value={hotspot.productId}
              onValueChange={(v) => onUpdate(hotspot.id, { productId: v })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({(p.price_cents / 100).toFixed(2)}€)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">X-Position (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={hotspot.positionX}
                onChange={(e) => onUpdate(hotspot.id, { positionX: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Y-Position (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={hotspot.positionY}
                onChange={(e) => onUpdate(hotspot.id, { positionY: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Start (s)</label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={hotspot.startTime}
                onChange={(e) => onUpdate(hotspot.id, { startTime: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Ende (s)</label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={hotspot.endTime}
                onChange={(e) => onUpdate(hotspot.id, { endTime: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Animation Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Animation</label>
            <Select
              value={hotspot.animationType}
              onValueChange={(v) => onUpdate(hotspot.id, { animationType: v })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Statisch</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="ease">Ease In/Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Keyframes */}
          {hotspot.animationType !== 'static' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">Keyframes</label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={() =>
                    onAddKeyframe(hotspot.id, {
                      frame: Math.floor(((hotspot.startTime + hotspot.endTime) / 2) * 30),
                      x: hotspot.positionX,
                      y: hotspot.positionY,
                    })
                  }
                >
                  <Plus className="w-3 h-3 mr-1" /> Keyframe
                </Button>
              </div>
              {hotspot.keyframes.length === 0 ? (
                <p className="text-xs text-muted-foreground/70">Keine Keyframes definiert</p>
              ) : (
                <div className="space-y-1.5">
                  {hotspot.keyframes.map((kf, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground w-8 shrink-0">F{kf.frame}</span>
                      <Input
                        type="number"
                        value={kf.x}
                        onChange={(e) => {
                          const newKfs = [...hotspot.keyframes];
                          newKfs[i] = { ...newKfs[i], x: Number(e.target.value) };
                          onUpdate(hotspot.id, { keyframes: newKfs });
                        }}
                        className="h-6 text-xs w-16"
                        min={0}
                        max={100}
                      />
                      <Input
                        type="number"
                        value={kf.y}
                        onChange={(e) => {
                          const newKfs = [...hotspot.keyframes];
                          newKfs[i] = { ...newKfs[i], y: Number(e.target.value) };
                          onUpdate(hotspot.id, { keyframes: newKfs });
                        }}
                        className="h-6 text-xs w-16"
                        min={0}
                        max={100}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => onRemoveKeyframe(hotspot.id, i)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(hotspot.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Hotspot löschen
          </Button>
        </div>
      )}
    </div>
  );
}
