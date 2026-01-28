import { Link } from 'react-router-dom';
import { Film, Building2, ArrowRight, Play, DollarSign, Users } from 'lucide-react';

export default function Auth() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Centered Logo */}
      <header className="pt-10 pb-6 flex justify-center">
        <Link 
          to="/about" 
          className="text-display text-5xl text-gold"
        >
          Ryl
        </Link>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          {/* Headline - Simple, direct */}
          <div className="text-center mb-10">
            <h1 className="text-display text-2xl md:text-3xl mb-2 text-gold">
              Wähle deinen Zugang
            </h1>
            <p className="text-body text-muted-foreground text-sm">
              Videos entdecken, verkaufen oder investieren
            </p>
          </div>

          {/* Decision Cards - Stacked for clear hierarchy */}
          <div className="space-y-4">
            {/* Creator Card - Primary, larger presence */}
            <Link 
              to="/auth/login" 
              className="block group"
            >
              <div className="relative border border-gold/20 rounded-xl p-6 bg-card/50 hover:border-gold/40 hover:bg-card/80 transition-all">
                <div className="flex items-start gap-5">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                    <Film className="w-6 h-6 text-gold" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-lg font-semibold">Creator & Zuschauer</h2>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Entdecke Videos, verkaufe Produkte, verdiene Geld.
                    </p>
                    
                    {/* Features - subtle inline */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <Play className="w-3 h-3" />
                        Videos schauen
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        Produkte verkaufen
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        Community aufbauen
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Brand Card - Same structure, gold accent */}
            <Link 
              to="/brand/register" 
              className="block group"
            >
              <div className="relative border border-gold/20 rounded-xl p-6 bg-card/50 hover:border-gold/50 hover:bg-card/80 transition-all">
                <div className="flex items-start gap-5">
                  {/* Icon - Gold accent */}
                  <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-gold" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-lg font-semibold">Unternehmen</h2>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Budget investieren, Umsatz messen.
                    </p>
                    
                    {/* Features - matching Creator layout */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        Performance-Dashboard
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        Creator-Partnerschaften
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Play className="w-3 h-3" />
                        ROI-Tracking
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer - Fixed at bottom */}
      <footer className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          Bereits registriert?{' '}
          <Link to="/auth/login" className="text-foreground hover:text-gold transition-colors">
            Anmelden
          </Link>
        </p>
      </footer>
    </div>
  );
}
