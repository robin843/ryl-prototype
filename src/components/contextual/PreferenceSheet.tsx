import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PreferenceSheetProps {
  open: boolean;
  onClose: () => void;
  onSelected: (preference: string) => void;
}

// NICHT "Geschlecht" fragen - stattdessen Shopping-Präferenz
const PREFERENCE_OPTIONS = [
  { value: "self", label: "Für mich" },
  { value: "others", label: "Für andere" },
  { value: "both", label: "Beides" },
];

export function PreferenceSheet({ 
  open, 
  onClose, 
  onSelected 
}: PreferenceSheetProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (preference: string) => {
    if (!user) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // Store shopping preference - algorithmically more useful than gender
      await supabase
        .from("profiles")
        .update({ 
          // Map preference to existing gender field for now
          // self = infer from content, others = gift-focused, both = mix
          gender: preference === "self" ? "self" : preference === "others" ? "gift" : "both"
        })
        .eq("user_id", user.id);

      onSelected(preference);
    } catch (error) {
      console.error("Error saving preference:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Optional - can be skipped
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-2xl max-h-[35vh] bg-card border-t border-border/50"
      >
        <div className="py-4 space-y-4">
          {/* Subtle, non-invasive question */}
          <div className="text-center space-y-1">
            <p className="text-lg font-medium">Für wen suchst du meist?</p>
            <p className="text-xs text-muted-foreground">Hilft uns, bessere Empfehlungen zu machen</p>
          </div>

          {/* Simple options - one tap */}
          <div className="flex gap-2">
            {PREFERENCE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                onClick={() => handleSelect(option.value)}
                disabled={isSubmitting}
                className="flex-1 h-11 text-sm font-medium hover:bg-primary/10 hover:border-primary/50 transition-colors"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Always skippable */}
          <button
            onClick={handleSkip}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Überspringen
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
