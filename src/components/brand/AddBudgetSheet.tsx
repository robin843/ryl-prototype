import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddBudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (amountCents: number) => Promise<void>;
}

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000]; // in cents

export function AddBudgetSheet({ open, onOpenChange, onConfirm }: AddBudgetSheetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const parsed = parseFloat(value.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 50) {
      setSelectedAmount(Math.round(parsed * 100));
    }
  };

  const handleConfirm = async () => {
    if (selectedAmount < 5000) {
      toast.error('Mindestbetrag: €50');
      return;
    }

    setIsLoading(true);
    try {
      if (onConfirm) {
        await onConfirm(selectedAmount);
      }
      toast.success(`${formatCurrency(selectedAmount)} Budget hinzugefügt`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Budgets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="border-gold/20">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-gold">
            <Wallet className="h-5 w-5" />
            Budget hinzufügen
          </SheetTitle>
          <SheetDescription>
            Allokiere Budget für performance-basierte Umsatzbeteiligung. 
            Du zahlst nur bei echten Verkäufen.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Preset amounts */}
          <div className="grid grid-cols-2 gap-3">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={cn(
                  "py-3 px-4 rounded-lg border-2 text-center transition-all",
                  selectedAmount === amount && !customAmount
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-gold/20 hover:border-gold/40"
                )}
              >
                <div className="font-bold text-lg">{formatCurrency(amount)}</div>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Eigener Betrag (min. €50)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="custom-amount"
                type="text"
                placeholder="z.B. 150"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-8 border-gold/20 focus:border-gold"
              />
            </div>
          </div>

          {/* Trust indicators */}
          <div className="space-y-3 pt-4 border-t border-gold/10">
            <div className="flex items-start gap-3 text-sm">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Zahlung nur bei echtem Umsatz – keine Vorabkosten
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Volle Transparenz über alle Transaktionen
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Shield className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Sichere Zahlungsabwicklung via Stripe
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-lg p-4 border border-gold/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Budget</span>
              <span className="font-bold text-lg">{formatCurrency(selectedAmount)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Dieses Budget wird automatisch für Umsatzbeteiligungen (15%) verwendet, 
              sobald Verkäufe über deine Produkte generiert werden.
            </p>
          </div>

          {/* CTA */}
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || selectedAmount < 5000}
            className="w-full bg-gold hover:bg-gold/90 text-black"
          >
            {isLoading ? 'Wird verarbeitet...' : `${formatCurrency(selectedAmount)} Budget hinzufügen`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
