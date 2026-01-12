import { Link } from "react-router-dom";
import { ArrowLeft, X, Check, ShoppingBag, Link2, CreditCard, Shield, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhyShopable() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link to="/feed" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-title">Warum Shopable?</h1>
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-headline text-gold tracking-wider">ryl</span>
        </div>
        <h2 className="text-headline text-2xl mb-4">
          Shopping, wie es sein sollte
        </h2>
        <p className="text-body text-muted-foreground max-w-sm mx-auto">
          Kein Wechseln zwischen Apps. Kein Suchen nach Links. 
          Kaufe direkt im Video, was dir gefällt.
        </p>
      </section>

      {/* Benefits - moved up */}
      <section className="px-6 py-8">
        <h3 className="text-title text-center mb-8">Vorteile für dich</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm font-medium">Schneller kaufen</p>
            <p className="text-xs text-muted-foreground mt-1">In Sekunden, nicht Minuten</p>
          </div>
          
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm font-medium">Sicher zahlen</p>
            <p className="text-xs text-muted-foreground mt-1">Stripe-geschützt</p>
          </div>
          
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm font-medium">Creator unterstützen</p>
            <p className="text-xs text-muted-foreground mt-1">Direkte Unterstützung</p>
          </div>
          
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm font-medium">Alles an einem Ort</p>
            <p className="text-xs text-muted-foreground mt-1">Keine App-Wechsel</p>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 py-8 border-t border-border/30">
        <h3 className="text-title text-center mb-8">Der Unterschied</h3>
        
        <div className="space-y-6">
          {/* Old Way - TikTok first */}
          <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium">TikTok + Link-in-Bio</p>
                <p className="text-xs text-muted-foreground">Der alte Weg</p>
              </div>
            </div>
            
            <ul className="space-y-3">
              {[
                "Video pausieren",
                "Zum Profil gehen",
                "Link suchen",
                "Website öffnen",
                "Produkt wieder finden",
                "Checkout ausfüllen",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-destructive flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
            
            <p className="mt-4 pt-4 border-t border-destructive/20 text-xs text-destructive">
              6+ Schritte • Hohe Abbruchrate • Verlorene Conversions
            </p>
          </div>

          {/* New Way - Ryl second */}
          <div className="p-5 rounded-2xl bg-gold/5 border border-gold/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-gold">Ryl Shopable</p>
                <p className="text-xs text-muted-foreground">Der neue Weg</p>
              </div>
            </div>
            
            <ul className="space-y-3">
              {[
                "Auf Hotspot im Video tippen",
                "Produkt ansehen",
                "Kaufen",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-gold flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
            
            <p className="mt-4 pt-4 border-t border-gold/20 text-xs text-gold">
              3 Schritte • Höhere Conversion • Nahtloses Erlebnis
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-8">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 text-center">
          <h3 className="text-title mb-2">Bereit?</h3>
          <p className="text-body text-muted-foreground mb-6">
            Erlebe Shopping, wie es sein sollte.
          </p>
          <Button asChild className="bg-gold hover:bg-gold/90 text-primary-foreground rounded-full px-8">
            <Link to="/feed">
              Jetzt ausprobieren
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
