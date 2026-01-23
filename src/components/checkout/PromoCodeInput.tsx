import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, X, Loader2, Check } from "lucide-react";
import { usePromoCodes, PromoCode } from "@/hooks/usePromoCodes";
import { cn } from "@/lib/utils";

interface PromoCodeInputProps {
  totalCents: number;
  onApply: (code: PromoCode, discountCents: number) => void;
  onRemove: () => void;
  appliedCode: PromoCode | null;
  className?: string;
}

export function PromoCodeInput({
  totalCents,
  onApply,
  onRemove,
  appliedCode,
  className,
}: PromoCodeInputProps) {
  const { validateCode } = usePromoCodes();
  const [inputValue, setInputValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = useCallback(async () => {
    if (!inputValue.trim()) return;

    setIsValidating(true);
    setError(null);

    const result = await validateCode(inputValue, totalCents);

    setIsValidating(false);

    if (result.valid && result.code && result.discountCents !== undefined) {
      onApply(result.code, result.discountCents);
      setInputValue("");
    } else {
      setError(result.error || "Code ungültig");
    }
  }, [inputValue, totalCents, validateCode, onApply]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleValidate();
    }
  };

  const formatDiscount = (code: PromoCode, discountCents: number) => {
    if (code.discount_percent) {
      return `-${code.discount_percent}%`;
    }
    return `-€${(discountCents / 100).toFixed(2)}`;
  };

  // If a code is already applied, show it
  if (appliedCode) {
    const discountCents = appliedCode.discount_percent
      ? Math.round(totalCents * (appliedCode.discount_percent / 100))
      : Math.min(appliedCode.discount_amount_cents || 0, totalCents);

    return (
      <div className={cn("flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg", className)}>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span className="font-mono font-bold">{appliedCode.code}</span>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {formatDiscount(appliedCode, discountCents)}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Promo Code eingeben"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              "pl-10 font-mono uppercase",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            maxLength={12}
            disabled={isValidating}
          />
        </div>
        <Button
          onClick={handleValidate}
          disabled={!inputValue.trim() || isValidating}
          variant="secondary"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Einlösen"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
