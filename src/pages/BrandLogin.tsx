import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Building2, ArrowLeft } from 'lucide-react';

export default function BrandLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has a brand account
      const { data: brandAccount } = await supabase
        .from('brand_accounts')
        .select('id, status')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!brandAccount) {
        // IMPORTANT: Do NOT sign out here.
        // We want the user to stay authenticated so they can finish Brand-Setup.
        toast.error('Kein Brand-Konto gefunden. Bitte vervollständige die Brand-Registrierung.');
        navigate('/brand/register?setup=1');
        return;
      }

      toast.success('Erfolgreich angemeldet!');
      navigate('/brand-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Top-left back button */}
      <Link
        to="/"
        className="absolute top-8 left-6 inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>

      <div className="w-full max-w-md">
        <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-gold" />
            </div>
            <CardTitle className="text-2xl text-gold">Brand Login</CardTitle>
            <CardDescription>
              Melde dich an, um dein Brand Dashboard zu verwalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="brand@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gold/20 focus:border-gold/50 focus:ring-gold/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gold/20 focus:border-gold/50 focus:ring-gold/20"
                />
              </div>

              <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Anmelden...
                  </>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Noch kein Brand-Konto? </span>
              <Link to="/brand/register" className="text-gold hover:underline">
                Jetzt registrieren
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
