import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AtSign, ChevronRight, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UsernameStepProps {
  onNext: (username: string) => void;
}

export function UsernameStep({ onNext }: UsernameStepProps) {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate username format
  const isValidFormat = /^[a-zA-Z0-9_]{3,20}$/.test(username);

  const checkAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      setIsAvailable(null);
      setError("Nur Buchstaben, Zahlen und _ erlaubt (3-20 Zeichen)");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", value.toLowerCase())
        .maybeSingle();

      if (fetchError) throw fetchError;

      setIsAvailable(!data);
      if (data) {
        setError("Dieser Username ist bereits vergeben");
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setError("Fehler bei der Überprüfung");
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(sanitized);
    setIsAvailable(null);
    setError(null);

    // Debounce check
    const timeoutId = setTimeout(() => {
      checkAvailability(sanitized);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = () => {
    if (isAvailable && isValidFormat) {
      onNext(username);
    }
  };

  const canSubmit = isAvailable === true && isValidFormat && !isChecking;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6">
          <AtSign className="w-8 h-8 text-gold" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
          Wähle deinen Username
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">
          Dein einzigartiger Name auf Ryl
        </p>

        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="deinname"
                className="pl-8 pr-10 bg-background"
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking && (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                )}
                {!isChecking && isAvailable === true && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <X className="w-4 h-4 text-destructive" />
                )}
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {isAvailable === true && !isChecking && (
              <p className="text-sm text-green-500">Username ist verfügbar!</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20 Zeichen, nur Buchstaben, Zahlen und Unterstriche
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full"
          size="lg"
        >
          Weiter
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
