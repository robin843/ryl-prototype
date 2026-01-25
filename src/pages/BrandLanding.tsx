import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Users, TrendingUp, Shield, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrandLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-40 right-10 w-40 h-40 rounded-full bg-gold/10 blur-3xl" />
        
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm mb-6">
            <Target className="w-4 h-4" />
            Performance Marketing für Video Commerce
          </div>
          
          <h1 className="text-display text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight">
            Messbarer ROI.
            <br />
            <span className="text-gold">Nicht Influencer-Hoffnung.</span>
          </h1>
          
          <p className="text-body text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Creator verkaufen deine Produkte mit In-Video Hotspots. 
            Du zahlst nur für Performance – und siehst jeden Klick, jede Conversion.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-primary-foreground rounded-full px-8">
              <Link to="/brand/register">
                <ArrowRight className="w-4 h-4 mr-2" />
                Brand-Konto erstellen
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-gold/30 hover:border-gold/50">
              <Link to="/brand/login">
                Anmelden
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-headline text-center mb-4">Warum Brands Ryl wählen</h2>
          <p className="text-body text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            Kein Rätselraten. Echte Attribution. Direkter Checkout.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-card/50 border border-border/30">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-title mb-2">Performance Dashboard</h3>
              <p className="text-body text-muted-foreground text-sm">
                Spend, Revenue, ROAS auf einen Blick. Keine Vanity Metrics – nur was zählt.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-card/50 border border-border/30">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-title mb-2">Creator Ranking</h3>
              <p className="text-body text-muted-foreground text-sm">
                Sieh welche Creator deine Produkte am besten verkaufen. Skaliere was funktioniert.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-card/50 border border-border/30">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-title mb-2">In-Video Checkout</h3>
              <p className="text-body text-muted-foreground text-sm">
                Frame-genaue Hotspots. Keine Link-in-Bio. Direkte Conversion ohne Friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-headline text-center mb-12">So funktioniert's</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-title mb-1">Brand-Konto erstellen</h3>
                <p className="text-body text-muted-foreground">
                  Registriere deine Brand und warte auf Verifizierung durch unser Team.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-title mb-1">Creator taggen deine Produkte</h3>
                <p className="text-body text-muted-foreground">
                  Wenn Creator Produkte deiner Marke verkaufen, wählst sie aus einer Liste. 
                  Du siehst automatisch alle Verkäufe im Dashboard.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-title mb-1">Performance tracken & skalieren</h3>
                <p className="text-body text-muted-foreground">
                  Sieh welche Creator, Videos und Produkte performen. 
                  Investiere in was funktioniert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 px-6 border-t border-border/30">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/50 border border-border/30">
              <Shield className="w-5 h-5 text-gold" />
              <span className="text-sm text-muted-foreground">Brand Safety</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/50 border border-border/30">
              <Zap className="w-5 h-5 text-gold" />
              <span className="text-sm text-muted-foreground">Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/50 border border-border/30">
              <svg viewBox="0 0 60 25" className="h-5 w-auto text-foreground/80" fill="currentColor">
                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-6.3-5.73c-1.25 0-2.1.9-2.3 2.64h4.56c-.03-1.54-.72-2.64-2.26-2.64z" />
              </svg>
              <span className="text-sm text-muted-foreground">Stripe Payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-headline mb-4">Bereit für messbaren Erfolg?</h2>
          <p className="text-body text-muted-foreground mb-8">
            Erstelle jetzt dein Brand-Konto und sieh, welche Creator deine Produkte verkaufen.
          </p>
          <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-primary-foreground rounded-full px-8">
            <Link to="/brand/register">
              <ArrowRight className="w-4 h-4 mr-2" />
              Jetzt starten
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/30">
        <div className="max-w-lg mx-auto text-center">
          <Link to="/" className="text-display text-xl text-gold mb-4 block">Ryl</Link>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground/60">
            <Link to="/impressum" className="hover:text-muted-foreground">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-muted-foreground">Datenschutz</Link>
            <Link to="/agb" className="hover:text-muted-foreground">AGB</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
