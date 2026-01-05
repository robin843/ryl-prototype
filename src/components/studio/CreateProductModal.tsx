import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    brandName: string,
    priceCents: number,
    description?: string,
    productUrl?: string
  ) => Promise<void>;
  isLoading?: boolean;
}

export function CreateProductModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}: CreateProductModalProps) {
  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brandName.trim() || !price) return;
    
    const priceCents = Math.round(parseFloat(price) * 100);
    await onSubmit(name, brandName, priceCents, description || undefined, productUrl || undefined);
    
    // Reset form
    setName("");
    setBrandName("");
    setPrice("");
    setDescription("");
    setProductUrl("");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "fixed inset-x-3 inset-y-4 z-50 mx-auto my-auto sm:inset-x-4",
        "h-fit max-h-[calc(100vh-2rem)] w-auto max-w-lg",
        "bg-card rounded-2xl border border-border",
        "shadow-2xl animate-scale-in"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-headline">Neues Produkt</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Produktname *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Designer Sonnenbrille"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Marke *
              </label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="z.B. Ray-Ban"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Preis (€) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="z.B. 149.99"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Beschreibung
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kurze Produktbeschreibung"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Produkt-URL
              </label>
              <Input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://shop.example.com/produkt"
              />
            </div>
          </div>

          <div className="p-6 pt-4 flex gap-3 border-t border-border bg-card">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              variant="premium" 
              className="flex-1" 
              disabled={isLoading || !name.trim() || !brandName.trim() || !price}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Hinzufügen"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
