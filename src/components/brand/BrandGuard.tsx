import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBrandData } from '@/hooks/useBrandData';
import { Loader2 } from 'lucide-react';

interface BrandGuardProps {
  children: ReactNode;
}

export function BrandGuard({ children }: BrandGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { brandAccount, isLoading: brandLoading } = useBrandData();

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
          <p className="text-muted-foreground">
            Dein Brand-Konto wird derzeit überprüft. Du erhältst eine Benachrichtigung, sobald dein Konto aktiviert wurde.
          </p>
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
          <p className="text-muted-foreground">
            Dein Brand-Konto wurde gesperrt. Bitte kontaktiere den Support für weitere Informationen.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
