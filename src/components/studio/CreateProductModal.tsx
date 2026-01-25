import { useState, useEffect } from "react";
import { X, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface BrandSuggestion {
  id: string;
  company_name: string;
  logo_url: string | null;
}

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
  
  // Brand autocomplete state
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  // Fetch brand suggestions when typing
  useEffect(() => {
    const fetchBrands = async () => {
      if (brandName.length < 2) {
        setBrandSuggestions([]);
        return;
      }

      const { data } = await supabase
        .from('brand_accounts')
        .select('id, company_name, logo_url')
        .eq('status', 'active')
        .ilike('company_name', `%${brandName}%`)
        .limit(5);

      if (data) {
        setBrandSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    };

    const debounce = setTimeout(fetchBrands, 200);
    return () => clearTimeout(debounce);
  }, [brandName]);

  if (!isOpen) return null;

  const handleSelectBrand = (brand: BrandSuggestion) => {
    setBrandName(brand.company_name);
    setSelectedBrandId(brand.id);
    setShowSuggestions(false);
  };

  const handleBrandNameChange = (value: string) => {
    setBrandName(value);
    setSelectedBrandId(null); // Clear selection if user types manually
  };

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
    setSelectedBrandId(null);
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

            <div className="relative">
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Marke *
              </label>
              <Input
                value={brandName}
                onChange={(e) => handleBrandNameChange(e.target.value)}
                onFocus={() => brandSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="z.B. Ray-Ban"
                required
              />
              
              {/* Brand suggestions dropdown */}
              {showSuggestions && brandSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 text-xs text-muted-foreground border-b border-border bg-muted/30">
                    <Building2 className="w-3 h-3 inline mr-1" />
                    Verifizierte Brands
                  </div>
                  {brandSuggestions.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => handleSelectBrand(brand)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.company_name}
                          className="w-8 h-8 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-gold/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gold" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{brand.company_name}</div>
                        <div className="text-xs text-gold">Verifizierte Brand</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Selected brand indicator */}
              {selectedBrandId && (
                <p className="mt-1 text-xs text-gold flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Verknüpft mit verifizierter Brand
                </p>
              )}
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
