import { useState } from "react";
import { Star, Send, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WriteReviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  purchaseIntentId?: string;
  onSuccess?: () => void;
}

export function WriteReviewSheet({
  isOpen,
  onClose,
  productId,
  productName,
  purchaseIntentId,
  onSuccess,
}: WriteReviewSheetProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Bitte melde dich an");
      return;
    }

    if (rating === 0) {
      toast.error("Bitte wähle eine Bewertung");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        user_id: user.id,
        purchase_intent_id: purchaseIntentId || null,
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
        is_verified_purchase: !!purchaseIntentId,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Du hast dieses Produkt bereits bewertet");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Bewertung abgeschickt!");
      onSuccess?.();
      onClose();
      
      // Reset form
      setRating(0);
      setTitle("");
      setBody("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Fehler beim Absenden der Bewertung");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setTitle("");
    setBody("");
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="bg-background max-h-[90vh]">
        <DrawerHeader className="text-center border-b border-border/50 pb-4">
          <DrawerTitle className="text-lg">Bewertung schreiben</DrawerTitle>
          <p className="text-sm text-muted-foreground mt-1">{productName}</p>
        </DrawerHeader>

        <div className="px-4 py-6 space-y-6 overflow-y-auto">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Wie bewertest du dieses Produkt?
            </p>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
              />
            </div>
            {rating > 0 && (
              <p className="text-sm text-gold mt-2">
                {rating === 5
                  ? "Ausgezeichnet!"
                  : rating === 4
                  ? "Sehr gut!"
                  : rating === 3
                  ? "Gut"
                  : rating === 2
                  ? "Geht so"
                  : "Nicht zufrieden"}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Titel (optional)
            </label>
            <Input
              placeholder="Fasse deine Bewertung zusammen..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Deine Erfahrung (optional)
            </label>
            <Textarea
              placeholder="Erzähle anderen was du über dieses Produkt denkst..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {body.length}/1000
            </p>
          </div>

          {/* Verified Purchase Badge */}
          {purchaseIntentId && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Star className="w-4 h-4 text-green-500 fill-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Verifizierter Kauf – deine Bewertung erhält ein Badge
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border/50 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex-1 bg-gold hover:bg-gold/90 text-black"
          >
            {isSubmitting ? (
              "Wird gesendet..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Absenden
              </>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
