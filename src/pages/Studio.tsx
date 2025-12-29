import { ArrowLeft, Film, ShoppingBag, BarChart3, Layers, Plus, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockSeries } from "@/data/mockData";

export default function Studio() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-area-top pb-24">
      {/* Header */}
      <header className="px-6 pt-4 pb-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-headline">Studio Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Producer & Brand Portal
            </p>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="px-6 py-8 border-b border-border/30">
        <div className="max-w-lg">
          <h2 className="text-display text-2xl mb-3">
            Where Stories Meet Commerce
          </h2>
          <p className="text-body text-muted-foreground">
            Ryl enables premium storytelling with seamlessly integrated brand partnerships. 
            Create episodic content that captivates audiences while offering authentic 
            product discovery moments.
          </p>
        </div>
      </section>

      {/* Quick Stats Placeholder */}
      <section className="px-6 py-6">
        <h3 className="text-headline text-lg mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Series", value: "—", icon: Film },
            { label: "Episodes", value: "—", icon: Layers },
            { label: "Products", value: "—", icon: ShoppingBag },
            { label: "Views", value: "—", icon: BarChart3 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-card border border-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-gold" />
                <span className="text-caption text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-serif text-foreground/50">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Analytics available when content is published
        </p>
      </section>

      {/* Series Overview */}
      <section className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline text-lg">Your Series</h3>
          <Button variant="subtle" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Series
          </Button>
        </div>
        <div className="space-y-3">
          {mockSeries.slice(0, 2).map((series) => (
            <Link
              key={series.id}
              to={`/series/${series.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/30 hover:border-border transition-colors group"
            >
              <div className="w-14 h-18 rounded-lg bg-secondary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-title text-sm">{series.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {series.episodeCount} episodes • {series.genre}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] font-medium">
                  Draft
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">
            Ready to create your first series?
          </p>
        </div>
      </section>

      {/* Commerce Integration */}
      <section className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-4 h-4 text-gold" />
          <h3 className="text-headline text-lg">Commerce Integration</h3>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-border/30">
          <h4 className="text-title mb-2">In-Video Shopping</h4>
          <p className="text-body text-muted-foreground mb-4">
            Place product hotspots directly in your episodes. Viewers can discover 
            and explore products without leaving the viewing experience. Subtle, 
            contextual, and designed for premium content.
          </p>
          <div className="space-y-2 text-sm">
            {[
              "Non-intrusive product placement",
              "Contextual shopping moments",
              "Brand partnership ready",
              "Detailed engagement insights",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="px-6 py-6 mb-8">
        <h3 className="text-headline text-lg mb-4">Why Ryl?</h3>
        <div className="space-y-4">
          {[
            {
              title: "Premium First",
              description:
                "Curated content, not algorithmic chaos. Your stories get the attention they deserve.",
            },
            {
              title: "Episodic Focus",
              description:
                "Built for serialized storytelling. Keep audiences coming back for more.",
            },
            {
              title: "Commerce Native",
              description:
                "Shopable content designed from the ground up, not bolted on as an afterthought.",
            },
          ].map((benefit) => (
            <div
              key={benefit.title}
              className="p-4 rounded-xl border border-border/30"
            >
              <h4 className="text-title text-sm mb-1">{benefit.title}</h4>
              <p className="text-body text-muted-foreground text-xs">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
    </div>
  );
}
