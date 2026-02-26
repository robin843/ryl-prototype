import { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthModal, AuthReason } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Bitte gib eine gültige E-Mail-Adresse ein');
const passwordSchema = z.string().min(6, 'Mindestens 6 Zeichen');

// Human-readable messages for auth reasons
function getReasonMessage(reason: AuthReason | null): string {
  if (!reason) return 'Melde dich an, um weiterzumachen';
  
  switch (reason.type) {
    case 'purchase':
      return 'Melde dich an, um zu kaufen';
    case 'comment':
      return 'Melde dich an, um zu kommentieren';
    case 'save':
      return 'Melde dich an, um Produkte zu speichern';
    case 'follow':
      return 'Melde dich an, um zu folgen';
    case 'like':
      return 'Melde dich an, um deine Likes zu behalten';
    case 'series-continue':
      return 'Melde dich an, um weiterzuschauen';
    case 'flow-limit':
      return 'Melde dich an für unbegrenztes Swipen';
    case 'generic':
      return reason.message || 'Melde dich an, um weiterzumachen';
    default:
      return 'Melde dich an, um weiterzumachen';
  }
}

export function AuthModal() {
  const { isOpen, reason, hideAuthModal } = useAuthModal();
  const { signIn, signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrors({});
    setActiveTab('login');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      hideAuthModal();
      setTimeout(resetForm, 300);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      
      if (error) {
        toast.error('Google-Anmeldung fehlgeschlagen');
        console.error('Google OAuth error:', error);
      }
      // Success: OAuth will redirect, then AuthModalContext will close modal on user change
    } catch (err) {
      toast.error('Anmeldung fehlgeschlagen');
      console.error('Google sign in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Ungültige Anmeldedaten');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Bitte bestätige zuerst deine E-Mail');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Erfolgreich angemeldet!');
      // Modal will close automatically via AuthModalContext effect
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const { error } = await signUp(email, password, displayName);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Diese E-Mail ist bereits registriert');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Konto erstellt!');
      // Modal will close automatically via AuthModalContext effect
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl border-t border-border/50 bg-card/95 backdrop-blur-xl px-6 pb-safe-area-bottom max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center pt-2 pb-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>
          
          <h2 className="text-headline text-foreground mb-1">
            Willkommen bei ryl
          </h2>
          
          <p className="text-body text-muted-foreground">
            {getReasonMessage(reason)}
          </p>
        </div>

        {/* Google OAuth - Primary */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full h-14 rounded-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold text-base gap-3 mb-4"
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

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">oder mit E-Mail</span>
          </div>
        </div>

        {/* Email Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50">
            <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
              Anmelden
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
              Registrieren
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-email">E-Mail</Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="deine@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">Passwort</Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird angemeldet...
                  </>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-name">Name (optional)</Label>
                <Input
                  id="auth-name"
                  type="text"
                  placeholder="Dein Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-signup-email">E-Mail</Label>
                <Input
                  id="auth-signup-email"
                  type="email"
                  placeholder="deine@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-signup-password">Passwort</Label>
                <div className="relative">
                  <Input
                    id="auth-signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mindestens 6 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird registriert...
                  </>
                ) : (
                  'Konto erstellen'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Trust signal */}
        <p className="text-center text-xs text-muted-foreground/60 mt-4 pb-2">
          Kostenlos • Kein Spam • Jederzeit abmelden
        </p>
      </SheetContent>
    </Sheet>
  );
}
