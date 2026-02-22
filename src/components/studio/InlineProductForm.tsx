import { useState, useCallback } from 'react';
import { Link2, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface InlineProductFormProps {
  onProductCreated: (product: { id: string; name: string; brand_name: string; price_cents: number }) => void;
  onCancel: () => void;
}

export function InlineProductForm({ onProductCreated, onCancel }: InlineProductFormProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleFetchMeta = useCallback(async () => {
    if (!url.trim()) return;
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-product-meta', {
        body: { url: url.trim() },
      });
      if (error) throw error;
      if (data?.title) setName(data.title);
      if (data?.brand) setBrand(data.brand);
      if (data?.description) setDescription(data.description || '');
      if (data?.image) setImageUrl(data.image || '');
      if (data?.price_cents) {
        setPrice((data.price_cents / 100).toFixed(2));
      }
      setFetched(true);
      toast.success('Produktdaten geladen');
    } catch {
      toast.error('Konnte Produktdaten nicht laden – bitte manuell ausfüllen');
    } finally {
      setIsFetching(false);
    }
  }, [url]);

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFetchMeta();
    }
  };

  const handleSave = useCallback(async () => {
    if (!user || !name.trim() || !brand.trim() || !price) return;
    setIsSaving(true);
    try {
      const priceCents = Math.round(parseFloat(price) * 100);
      const { data, error } = await supabase
        .from('shopable_products')
        .insert({
          creator_id: user.id,
          name: name.trim(),
          brand_name: brand.trim(),
          price_cents: priceCents,
          description: description.trim() || null,
          product_url: url.trim() || null,
          image_url: imageUrl.trim() || null,
        })
        .select('id, name, brand_name, price_cents')
        .single();

      if (error) throw error;
      toast.success('Produkt erstellt');
      onProductCreated(data);
    } catch (err) {
      console.error(err);
      toast.error('Produkt konnte nicht erstellt werden');
    } finally {
      setIsSaving(false);
    }
  }, [user, name, brand, price, description, url, imageUrl, onProductCreated]);

  const canSave = name.trim() && brand.trim() && price;

  return (
    <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gold">Neues Produkt</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onCancel}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* URL Input with auto-fetch */}
      <div className="flex gap-1.5">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleUrlKeyDown}
          placeholder="Produkt-URL einfügen..."
          className="h-8 text-sm flex-1"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2.5 shrink-0"
          onClick={handleFetchMeta}
          disabled={!url.trim() || isFetching}
        >
          {isFetching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Link2 className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>

      {/* Form fields */}
      <div className="space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Produktname *"
          className="h-8 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Marke *"
            className="h-8 text-sm"
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Preis (€) *"
            className="h-8 text-sm"
          />
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibung (optional)"
          rows={2}
          className="text-sm resize-none"
        />
      </div>

      {/* Save */}
      <Button
        size="sm"
        variant="premium"
        className="w-full h-8 text-xs"
        onClick={handleSave}
        disabled={!canSave || isSaving}
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
        ) : (
          <Plus className="w-3.5 h-3.5 mr-1" />
        )}
        Produkt erstellen & Hotspot hinzufügen
      </Button>
    </div>
  );
}
