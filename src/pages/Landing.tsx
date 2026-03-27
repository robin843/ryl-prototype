import { Link } from "react-router-dom";
import { Play, Sparkles, ShoppingBag, CreditCard, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import rylLogo from "@/assets/ryl-logo-purple.png";

export default function Landing() {
  // Landing page is now at /about - no redirects needed
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-between px-6 py-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-40 right-10 w-32 h-32 rounded-full bg-gold/10 blur-3xl" />
        
        {/* Top: Header with Logo + Brand Entry */}
        <div className="relative z-10 w-full flex items-center justify-between">
          <img src={rylLogo} alt="Ryl" className="h-10 w-auto" />
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="rounded-full border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
          >
            <Link to="/brand">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              Für Unternehmen
            </Link>
          </Button>
        </div>
        
        {/* Center: Phone Mockup */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-6">
          {/* Visual Demo: Phone Mockup with Hotspot */}
          <div className="relative mx-auto mb-8 w-52 h-72 rounded-[2rem] bg-gradient-to-b from-card to-muted/50 border border-border/60 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
            {/* Video frame lines */}
            <div className="absolute inset-4 rounded-2xl border border-border/30" />
            
            {/* Product hotspot - animated */}
            <div className="absolute top-[40%] left-[55%] -translate-x-1/2 -translate-y-1/2">
              {/* Outer glow */}
              <span className="absolute -inset-4 rounded-full bg-gold/20 blur-xl animate-pulse" />
              
              {/* Ripple rings */}
              <span className="absolute -inset-3 rounded-full border border-gold/30 animate-ping" style={{ animationDuration: '2.5s' }} />
              <span className="absolute -inset-5 rounded-full border border-gold/15 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.8s' }} />
              
              {/* Core orb */}
              <div className="relative w-5 h-5 rounded-full bg-gold/40 backdrop-blur-md border border-gold/70 shadow-[0_0_25px_rgba(212,175,55,0.5)] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-gold to-gold/70" />
              </div>
            </div>
            
            {/* Product card at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/90 backdrop-blur-md border-t border-gold/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-muted to-muted/50 border border-border/30" />
                <div className="flex-1 min-w-0">
                  <div className="h-2 w-14 bg-foreground/30 rounded-full mb-1.5" />
                  <div className="h-1.5 w-8 bg-gold/50 rounded-full" />
                </div>
                <div className="px-2.5 py-1 rounded-full bg-gold text-[9px] font-semibold text-primary-foreground shadow-sm">
                  Kaufen
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom: Text + CTAs */}
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <h1 className="text-display text-2xl md:text-3xl mb-2 leading-tight">
            Sieh es. Klick es. Kauf es.
          </h1>
          <p className="text-body text-base text-muted-foreground mb-5">
            Produkte direkt im Video kaufen.
            <br />
            <span className="text-gold">Kein Link-in-Bio. Kein App-Wechsel.</span>
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-primary-foreground rounded-full px-8">
              <Link to="/why-shopable">
                <ArrowRight className="w-4 h-4 mr-2" />
                Anleitung
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-border/50">
              <Link to="/studio">
                <Sparkles className="w-4 h-4 mr-2" />
                Creator werden
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3-Step Explainer */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-headline text-center mb-4">So einfach geht's</h2>
          <p className="text-body text-center text-muted-foreground mb-12">
            Drei Schritte zum Kauf – ohne die App zu verlassen
          </p>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-title mb-1">1. Video schauen</h3>
                <p className="text-body text-muted-foreground">
                  Entdecke Stories von Creatorn, die du liebst. Swipe durch den Feed wie gewohnt.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-title mb-1">2. Produkt im Video klicken</h3>
                <p className="text-body text-muted-foreground">
                  Siehst du etwas, das dir gefällt? Tippe auf den Hotspot direkt im Video.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-title mb-1">3. Direkt kaufen</h3>
                <p className="text-body text-muted-foreground">
                  Sicherer Checkout mit Stripe. Keine Umwege, keine verlorenen Links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-6 border-t border-border/30">
        <div className="max-w-lg mx-auto">
          <div className="flex flex-col items-center gap-6">
            {/* Stripe badge */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/50 border border-border/30">
              <svg viewBox="0 0 60 25" className="h-6 w-auto text-foreground/80" fill="currentColor">
                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-6.3-5.73c-1.25 0-2.1.9-2.3 2.64h4.56c-.03-1.54-.72-2.64-2.26-2.64zm-14.95 7.72c-1.13 0-2.17-.05-3-.27v-13.4h4.14v4.8c.58-.11 1.15-.17 1.68-.17 3.27 0 5.25 1.97 5.25 5.54 0 4.3-2.5 6.08-5.85 6.08-.77 0-1.5-.12-2.22-.24v-.24zm2.82-5.2c-.53 0-1.01.04-1.42.11v4.18c.33.05.7.08 1.08.08 1.3 0 2.28-.48 2.28-2.25 0-1.52-.77-2.12-1.94-2.12zM24.36 20.3c-4.2 0-7.04-2.97-7.04-7.52 0-4.4 2.85-7.48 7.04-7.48 4.24 0 7.05 3.08 7.05 7.48 0 4.55-2.81 7.52-7.05 7.52zm0-11.2c-1.76 0-2.8 1.38-2.8 3.68 0 2.44 1.04 3.72 2.8 3.72 1.73 0 2.8-1.28 2.8-3.72 0-2.3-1.07-3.68-2.8-3.68zM14.4 20V5.52h4.14V20H14.4zM14.4 4.3V.92h4.14V4.3H14.4zm-5.5 1.22v.63c-.6-.5-1.52-.85-2.63-.85-3.07 0-5.33 2.5-5.33 6.33 0 3.88 2.3 6.28 5.4 6.28 1.08 0 2-.35 2.57-.82v.61c0 1.68-.71 2.46-2.4 2.46-1.4 0-2.6-.52-3.67-1.22L.96 21.8c1.22.95 3.2 1.69 5.55 1.69 4.36 0 6.53-2.19 6.53-6.63V5.52H8.9z" />
              </svg>
              <span className="text-sm text-muted-foreground">Sicheres Checkout</span>
            </div>
            
            {/* Powered by */}
            <p className="text-caption text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              Powered by Shopable™
            </p>
          </div>
        </div>
      </section>

      {/* Why Shopable CTA */}
      <section className="py-16 px-6">
        <div className="max-w-lg mx-auto">
          <Link 
            to="/why-shopable" 
            className="block p-6 rounded-2xl bg-card/50 border border-border/30 hover:border-gold/30 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-title mb-1">Warum Shopable?</h3>
                <p className="text-body text-muted-foreground">
                  Erfahre, wie wir Shopping neu definieren
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/30">
        <div className="max-w-lg mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Anmelden
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Preise
            </Link>
            <Link to="/why-shopable" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Über Shopable
            </Link>
            <Link to="/brand" className="text-sm text-gold hover:text-gold/80 transition-colors font-medium">
              Für Brands
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground/60">
            <Link to="/impressum" className="hover:text-muted-foreground">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-muted-foreground">Datenschutz</Link>
            <Link to="/agb" className="hover:text-muted-foreground">AGB</Link>
          </div>
          
          <p className="text-center text-xs text-muted-foreground/40 mt-6">
            © {new Date().getFullYear()} Ryl. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}