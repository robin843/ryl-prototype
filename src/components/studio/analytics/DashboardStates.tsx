import { Link } from "react-router-dom";
import { 
  Play,
  Video, 
  ShoppingBag, 
  Target, 
  ArrowRight,
  TrendingUp,
  Rocket,
  Zap,
  MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SetupStep {
  id: string;
  label: string;
  isComplete: boolean;
  link: string;
}

interface DashboardStateProps {
  hasProducts: boolean;
  hasSeries: boolean;
  hasEpisodes?: boolean;
  hasHotspots: boolean;
  totalSales: number;
  totalRevenueCents?: number;
}

export type DashboardPhase = 'setup' | 'early' | 'scale';

export function determineDashboardPhase({
  hasProducts,
  hasSeries,
  hasHotspots,
  totalSales,
}: DashboardStateProps): DashboardPhase {
  // Scale: Multiple sales, system is working
  if (totalSales >= 5) return 'scale';
  
  // Early Revenue: 1-4 sales, just getting started
  if (totalSales >= 1) return 'early';
  
  // Setup: No sales yet, need to complete setup
  return 'setup';
}

export function getSetupSteps(props: DashboardStateProps): SetupStep[] {
  return [
    {
      id: 'series',
      label: 'Serie erstellen',
      isComplete: props.hasSeries,
      link: '/studio',
    },
    {
      id: 'product',
      label: 'Produkt anlegen',
      isComplete: props.hasProducts,
      link: '/studio',
    },
    {
      id: 'hotspot',
      label: 'Hotspot hinzufügen',
      isComplete: props.hasHotspots,
      link: '/studio',
    },
  ];
}

// Revenue-oriented actions for the "live" state
interface RevenueAction {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  isPrimary?: boolean;
}

function getRevenueActions(setupComplete: boolean): RevenueAction[] {
  if (!setupComplete) {
    return [
      {
        id: 'complete-setup',
        icon: <Zap className="w-4 h-4" />,
        title: 'Ersten Hotspot aktivieren',
        description: 'Ohne Hotspot kann niemand kaufen',
        link: '/studio',
        isPrimary: true,
      },
    ];
  }

  return [
    {
      id: 'new-episode',
      icon: <Play className="w-4 h-4" />,
      title: 'Neue Episode posten',
      description: 'Mehr Episoden = mehr Kaufmomente',
      link: '/studio',
      isPrimary: true,
    },
    {
      id: 'reuse-product',
      icon: <ShoppingBag className="w-4 h-4" />,
      title: 'Bestseller-Produkt erneut platzieren',
      description: 'Wiederholung verkauft besser als Neues',
      link: '/studio',
    },
    {
      id: 'early-hotspot',
      icon: <Target className="w-4 h-4" />,
      title: 'Hotspot früher im Video setzen',
      description: 'Erste 20 Sekunden konvertieren am besten',
      link: '/studio',
    },
  ];
}

// ========== SETUP STATE (0 Revenue) - NOW "YOUR BUSINESS IS LIVE" ==========
export function SetupStateHero({ steps }: { steps: SetupStep[] }) {
  const setupComplete = steps.every(s => s.isComplete);
  const actions = getRevenueActions(setupComplete);

  return (
    <div className="px-6 py-10">
      {/* Live Business Header - NOT a checklist */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          Dein Business ist live
        </div>
        
        <p className="text-lg font-medium mb-2">
          Umsatz entsteht durch Aktionen
        </p>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
          {setupComplete 
            ? "Dein Verkauf beginnt mit der nächsten Episode."
            : "Schließe dein Setup ab, um Verkäufe zu ermöglichen."
          }
        </p>
      </div>

      {/* Revenue Actions - NOT a checklist */}
      <div className="space-y-3 max-w-sm mx-auto">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Was jetzt Umsatz bringt
        </p>
        
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.link}
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl transition-all group",
              action.isPrimary
                ? "bg-gold/10 border border-gold/30 hover:border-gold/50"
                : "bg-card/30 border border-border/30 hover:border-gold/30"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              action.isPrimary ? "bg-gold text-primary-foreground" : "bg-muted/50 text-foreground"
            )}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-0.5">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
            <ArrowRight className={cn(
              "w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1",
              action.isPrimary && "text-gold"
            )} />
          </Link>
        ))}
      </div>

      {/* Motivation stat - social proof */}
      {setupComplete && (
        <div className="text-center mt-8 pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            <span className="text-gold font-medium">Creators mit 3+ Episoden</span> verkaufen 4× häufiger
          </p>
        </div>
      )}
    </div>
  );
}

// ========== EARLY REVENUE STATE (1-4 Sales) ==========
interface EarlyRevenueHeroProps {
  totalRevenueCents: number;
  totalSales: number;
}

export function EarlyRevenueHero({ totalRevenueCents, totalSales }: EarlyRevenueHeroProps) {
  const formattedRevenue = (totalRevenueCents / 100).toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="text-center px-6 py-10">
      {/* Celebration Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium mb-6">
        <Rocket className="w-4 h-4" />
        Es funktioniert!
      </div>

      {/* Revenue Number */}
      <p className="text-5xl font-bold text-gold mb-2">
        {formattedRevenue}
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        {totalSales} {totalSales === 1 ? 'Verkauf' : 'Verkäufe'} – du bist auf dem richtigen Weg
      </p>

      {/* Encouragement Message */}
      <div className="p-4 rounded-xl bg-card/30 border border-gold/20 max-w-xs mx-auto">
        <p className="text-sm font-medium mb-1">Dein System funktioniert</p>
        <p className="text-xs text-muted-foreground">
          Jeder weitere Verkauf beweist: Dein Content konvertiert. Jetzt skalieren.
        </p>
      </div>
    </div>
  );
}

// ========== SCALE STATE (5+ Sales) ==========
interface ScaleHeroProps {
  totalRevenueCents: number;
  totalSales: number;
  avgOrderCents: number;
  pendingRevenueCents: number;
  timeRangeLabel: string;
}

export function ScaleHero({ 
  totalRevenueCents, 
  totalSales, 
  avgOrderCents, 
  pendingRevenueCents,
  timeRangeLabel 
}: ScaleHeroProps) {
  const formatCurrency = (cents: number) => (cents / 100).toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="px-6 py-8">
      {/* Main Hero Number */}
      <div className="text-center mb-6">
        <p className="text-5xl font-bold text-gold mb-1">
          {formatCurrency(totalRevenueCents)}
        </p>
        <p className="text-sm text-muted-foreground">{timeRangeLabel}</p>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xl font-semibold">{totalSales}</p>
          <p className="text-xs text-muted-foreground">Verkäufe</p>
        </div>
        <div className="text-center border-x border-border/30">
          <p className="text-xl font-semibold">{formatCurrency(avgOrderCents)}</p>
          <p className="text-xs text-muted-foreground">Ø pro Verkauf</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-muted-foreground">
            {formatCurrency(pendingRevenueCents)}
          </p>
          <p className="text-xs text-muted-foreground">Ausstehend</p>
        </div>
      </div>
    </div>
  );
}

// ========== EMPTY STATE PLACEHOLDERS ==========
export function EmptySeriesSection() {
  return (
    <div className="py-8 text-center">
      <Video className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
      <p className="text-sm font-medium mb-1">Noch keine Verkäufe nach Serie</p>
      <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
        Sobald du Verkäufe machst, siehst du hier welche Serie am besten performt.
      </p>
    </div>
  );
}

export function EmptyProductSection() {
  return (
    <div className="py-8 text-center">
      <ShoppingBag className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
      <p className="text-sm font-medium mb-1">Noch keine Produktverkäufe</p>
      <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
        Hier erscheinen deine Top-Produkte, sobald der erste Kauf eingeht.
      </p>
    </div>
  );
}

export function EmptyFunnelSection({ hasHotspots }: { hasHotspots: boolean }) {
  if (!hasHotspots) {
    return (
      <div className="py-8 text-center">
        <MousePointer2 className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">Noch keine Hotspots aktiv</p>
        <p className="text-xs text-muted-foreground max-w-[240px] mx-auto mb-4">
          Füge Hotspots zu deinen Videos hinzu, um Klicks und Käufe zu tracken.
        </p>
        <Link
          to="/studio"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-medium hover:bg-gold/20 transition-colors"
        >
          <MousePointer2 className="w-4 h-4" />
          Hotspot hinzufügen
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 text-center">
      <TrendingUp className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
      <p className="text-sm font-medium mb-1">Funnel wird aufgebaut</p>
      <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
        Deine Hotspots sind aktiv. Sobald Zuschauer klicken, erscheinen hier deine Daten.
      </p>
    </div>
  );
}
