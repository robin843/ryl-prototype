import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AgeVerificationSheetProps {
  open: boolean;
  onClose: () => void;
  onVerified: (ageGroup: string) => void;
  reason?: "content" | "product";
}

const AGE_BUCKETS = [
  { value: "under_18", label: "Unter 18", minAge: 0 },
  { value: "18_24", label: "18–24", minAge: 18 },
  { value: "25_34", label: "25–34", minAge: 18 },
  { value: "35_plus", label: "35+", minAge: 18 },
];

export function AgeVerificationSheet({ 
  open, 
  onClose, 
  onVerified,
  reason = "content" 
}: AgeVerificationSheetProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (bucket: typeof AGE_BUCKETS[0]) => {
    if (!user) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // Store age bucket (not birthdate - privacy first)
      await supabase
        .from("profiles")
        .update({ 
          // We'll add age_group column if needed, for now use existing fields
          age_at_signup: bucket.minAge || 16 
        })
        .eq("user_id", user.id);

      onVerified(bucket.value);
    } catch (error) {
      console.error("Error saving age:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonText = reason === "product" 
    ? "Für dieses Produkt müssen wir dein Alter kennen."
    : "Für diese Inhalte müssen wir dein Alter kennen.";

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-2xl max-h-[40vh] bg-card border-t border-border/50"
      >
        <div className="py-4 space-y-4">
          {/* Minimal header */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">{reasonText}</p>
            <p className="text-lg font-medium">Wie alt bist du?</p>
          </div>

          {/* Age buckets - single tap selection */}
          <div className="grid grid-cols-2 gap-2">
            {AGE_BUCKETS.map((bucket) => (
              <Button
                key={bucket.value}
                variant="outline"
                onClick={() => handleSelect(bucket)}
                disabled={isSubmitting}
                className="h-12 text-base font-medium hover:bg-primary/10 hover:border-primary/50 transition-colors"
              >
                {bucket.label}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
