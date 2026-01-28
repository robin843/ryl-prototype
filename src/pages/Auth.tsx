import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Building2, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function Auth() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="p-6">
        <Link to="/about" className="text-display text-2xl text-gold">
          Ryl
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          {/* Headline */}
          <div className="text-center mb-12">
            <h1 className="text-display text-3xl md:text-4xl mb-3">
              Wie möchtest du starten?
            </h1>
            <p className="text-body text-muted-foreground">
              Wähle deinen Zugang zur Plattform
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Creator / User Card */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-border transition-colors">
              <CardHeader className="text-center pt-8 pb-4">
                <div className="mx-auto w-14 h-14 rounded-xl bg-foreground/10 flex items-center justify-center mb-4">
                  <Film className="w-7 h-7 text-foreground" />
                </div>
                <CardTitle className="text-xl">Creator & Zuschauer</CardTitle>
                <CardDescription className="text-sm">
                  Videos schauen, Produkte entdecken oder selbst verkaufen
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-8 space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-foreground/60" />
                    Shoppable Videos entdecken
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-foreground/60" />
                    Als Creator Produkte verkaufen
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-foreground/60" />
                    Eigene Umsätze generieren
                  </li>
                </ul>
                <Button asChild className="w-full" size="lg">
                  <Link to="/auth/login">
                    Weiter als Creator / User
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Brand Card - slightly more prominent */}
            <Card className="relative border-gold/30 bg-card/80 backdrop-blur-sm shadow-[0_0_40px_-15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_50px_-15px_rgba(212,175,55,0.25)] transition-all">
              {/* Subtle glow effect */}
              <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-gold/10 to-transparent pointer-events-none" />
              
              <CardHeader className="relative text-center pt-8 pb-4">
                <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-black" />
                </div>
                <CardTitle className="text-xl">Unternehmen</CardTitle>
                <CardDescription className="text-sm">
                  Investiere Budget und messe echten Umsatz
                </CardDescription>
              </CardHeader>
              <CardContent className="relative pt-2 pb-8 space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold" />
                    Performance-Dashboard & ROI-Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold" />
                    Creator-Partnerschaften aufbauen
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold" />
                    Produkte in Videos platzieren
                  </li>
                </ul>
                <Button asChild className="w-full bg-gold hover:bg-gold/90 text-black" size="lg">
                  <Link to="/brand/register">
                    Als Unternehmen starten
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Link 
                  to="/brand" 
                  className="block text-center text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Mehr erfahren →
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Already have an account */}
          <p className="text-center mt-10 text-sm text-muted-foreground">
            Bereits registriert?{' '}
            <Link to="/auth/login" className="text-foreground hover:text-gold transition-colors font-medium">
              Anmelden
            </Link>
            {' · '}
            <Link to="/brand/login" className="text-gold hover:text-gold/80 transition-colors font-medium">
              Brand Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
