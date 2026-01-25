import { ReactNode } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBrandData } from '@/hooks/useBrandData';
import { Loader2, Home, LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface BrandGuardProps {
  children: ReactNode;
}

export function BrandGuard({ children }: BrandGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { brandAccount, isLoading: brandLoading } = useBrandData();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading || brandLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/brand/login" replace />;
  }

  if (!brandAccount) {
    return <Navigate to="/brand/register" replace />;
  }

  if (brandAccount.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Konto wird überprüft</h1>
          <p className="text-muted-foreground mb-6">
            Dein Brand-Konto wird derzeit überprüft. Du erhältst eine Benachrichtigung, sobald dein Konto aktiviert wurde.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Zur Startseite
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (brandAccount.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Konto gesperrt</h1>
          <p className="text-muted-foreground mb-6">
            Dein Brand-Konto wurde gesperrt. Bitte kontaktiere den Support für weitere Informationen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <a href="mailto:support@ryl.app">
                <Mail className="w-4 h-4 mr-2" />
                Support kontaktieren
              </a>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}