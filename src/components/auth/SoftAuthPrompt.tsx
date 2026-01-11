import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SoftAuthPromptProps {
  open: boolean;
  onDismiss: () => void;
  videosWatched: number;
}

export function SoftAuthPrompt({ open, onDismiss, videosWatched }: SoftAuthPromptProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/feed`,
        },
      });
      
      if (error) {
        toast.error('Anmeldung fehlgeschlagen');
        console.error('Google OAuth error:', error);
      }
    } catch (err) {
      toast.error('Anmeldung fehlgeschlagen');
      console.error('Google sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    // Navigate to auth page but preserve that we came from feed
    navigate('/auth', { state: { from: '/feed' } });
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl border-t border-border/50 bg-card/95 backdrop-blur-xl px-6 pb-safe-area-bottom"
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <SheetHeader className="text-center pt-2 pb-6">
          {/* Visual hook */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>
          
          <SheetTitle className="text-headline text-foreground">
            Willst du weiterschauen?
          </SheetTitle>
          
          <SheetDescription className="text-body text-muted-foreground">
            {videosWatched} Videos geschaut – melde dich an, um unbegrenzt zu swipen
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 pb-4">
          {/* Primary: Google OAuth */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-14 rounded-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold text-base gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Mit Google weiter
          </Button>

          {/* Secondary: Email */}
          <Button
            onClick={handleEmailSignIn}
            variant="outline"
            className="w-full h-12 rounded-full border-border/50 text-foreground font-medium gap-2"
          >
            <Mail className="w-4 h-4" />
            Mit E-Mail anmelden
          </Button>

          {/* Ghost: Dismiss */}
          <Button
            onClick={onDismiss}
            variant="ghost"
            className="w-full h-10 text-muted-foreground hover:text-foreground font-normal"
          >
            Noch nicht
          </Button>
        </div>

        {/* Trust signal */}
        <p className="text-center text-xs text-muted-foreground/60 pb-2">
          Kostenlos • Kein Spam • Jederzeit abmelden
        </p>
      </SheetContent>
    </Sheet>
  );
}
