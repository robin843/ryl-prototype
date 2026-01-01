import { ShoppingBag, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { mockSeries } from "@/data/mockData";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";
import episode1Cover from "@/assets/episode-1-cover.jpg";

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <img
        src={episode1Cover}
        alt="Featured series"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      
      {/* Subtle hotspot hint - positioned on the "content" */}
      <button
        className={cn(
          "absolute z-20 hotspot-pulse",
          "w-10 h-10 rounded-full",
          "bg-foreground/10 backdrop-blur-sm border border-foreground/20",
          "flex items-center justify-center",
          "transition-all duration-300 hover:bg-foreground/20"
        )}
        style={{ left: "65%", top: "32%" }}
        aria-label="Shopable product"
      >
        <ShoppingBag className="w-4 h-4 text-foreground/70" />
      </button>

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-center">
        {/* Logo */}
        <span 
          className="text-caption text-gold tracking-[0.3em] mb-6"
        >
          RYL
        </span>
        
        {/* Headline */}
        <h1 className="text-display text-2xl sm:text-3xl leading-tight max-w-xs mb-3">
          Serien schauen. Produkte direkt entdecken.
        </h1>
        
        {/* Subline */}
        <p className="text-body text-muted-foreground max-w-[280px] mb-8">
          Premium Short-Form-Serien mit integriertem Shopping
        </p>
        
        {/* Primary CTA */}
        <Link
          to="/watch/ep-1-1"
          className={cn(
            "inline-flex items-center gap-2",
            "px-6 py-3 rounded-full",
            "bg-gold text-primary-foreground",
            "font-medium text-sm",
            "transition-all duration-300 hover:opacity-90"
          )}
        >
          <Play className="w-4 h-4" />
          Episode 1 kostenlos schauen
        </Link>
      </div>
    </section>
  );
}

// Series Card Component
interface SeriesCardProps {
  id: string;
  title: string;
  coverUrl: string;
  genre: string;
}

function SeriesCard({ id, title, coverUrl, genre }: SeriesCardProps) {
  return (
    <Link 
      to={`/series/${id}`}
      className="flex-shrink-0 w-[260px] group"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Shopable badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-sm">
          <ShoppingBag className="w-3 h-3 text-gold" />
          <span className="text-[10px] uppercase tracking-wider text-foreground/80">Shopable</span>
        </div>
      </div>
      
      <h3 className="text-title text-base group-hover:text-gold transition-colors duration-300">{title}</h3>
      <p className="text-caption text-muted-foreground mt-1">{genre}</p>
    </Link>
  );
}

// Featured Series Section
function FeaturedSeriesSection() {
  return (
    <section className="py-10 px-6">
      <h2 className="text-headline text-lg mb-6">Ausgewählte Serien</h2>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
        {mockSeries.map((series) => (
          <SeriesCard
            key={series.id}
            id={series.id}
            title={series.title}
            coverUrl={series.coverUrl}
            genre={series.genre}
          />
        ))}
      </div>
    </section>
  );
}

// Commerce Micro-Demo Section
function CommerceDemoSection() {
  return (
    <section className="py-10 px-6">
      <div className="relative aspect-[9/12] max-w-[300px] mx-auto rounded-2xl overflow-hidden">
        {/* Mock video frame */}
        <img
          src={episode1Cover}
          alt="Demo scene"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Visible hotspot with tooltip */}
        <div 
          className="absolute"
          style={{ left: "55%", top: "40%" }}
        >
          {/* Hotspot button */}
          <button
            className={cn(
              "hotspot-pulse",
              "w-12 h-12 rounded-full",
              "bg-gold/20 backdrop-blur-sm border border-gold/50",
              "flex items-center justify-center"
            )}
          >
            <ShoppingBag className="w-5 h-5 text-gold" />
          </button>
          
          {/* Minimal tooltip */}
          <div className={cn(
            "absolute left-full ml-3 top-1/2 -translate-y-1/2",
            "px-3 py-1.5 rounded-lg",
            "bg-card/90 backdrop-blur-sm border border-border/50",
            "whitespace-nowrap"
          )}>
            <span className="text-xs text-foreground/80">Tippe, um zu entdecken</span>
          </div>
        </div>
        
        {/* Pause indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-8 h-1 rounded-full bg-foreground/30">
            <div className="w-1/3 h-full rounded-full bg-gold" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Primary CTA Section
function PrimaryCtaSection() {
  return (
    <section className="py-12 px-6 pb-32">
      <div className="text-center">
        <Link
          to="/watch/ep-1-1"
          className={cn(
            "inline-flex items-center gap-2",
            "px-8 py-4 rounded-full",
            "bg-gold text-primary-foreground",
            "font-medium text-sm",
            "transition-all duration-300 hover:opacity-90"
          )}
        >
          <Play className="w-4 h-4" />
          Jetzt die erste Episode ansehen
        </Link>
      </div>
    </section>
  );
}

// Main Index Component
const Index = () => {
  return (
    <>
      <main className="min-h-screen bg-background overflow-y-auto">
        <HeroSection />
        <FeaturedSeriesSection />
        <CommerceDemoSection />
        <PrimaryCtaSection />
      </main>
      <BottomNav />
    </>
  );
};

export default Index;
