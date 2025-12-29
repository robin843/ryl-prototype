import { ChevronRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockSeries } from "@/data/mockData";

export default function Soaps() {
  return (
    <AppLayout>
      <div className="min-h-screen safe-area-top">
        {/* Header */}
        <header className="px-6 pt-4 pb-6">
          <h1 className="text-display text-3xl">
            <span className="text-gold">Serien</span>
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Premium Micro-Dramas entdecken
          </p>
        </header>

        {/* Featured Series */}
        <section className="px-6 mb-8">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden group">
            <img
              src={mockSeries[0].coverUrl}
              alt={mockSeries[0].title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="text-caption text-gold">{mockSeries[0].genre}</span>
              <h2 className="text-headline mt-1">{mockSeries[0].title}</h2>
              <p className="text-body text-foreground/70 line-clamp-2 mt-1 mb-3">
                {mockSeries[0].description}
              </p>
              <Link
                to={`/series/${mockSeries[0].id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold text-primary-foreground font-medium text-sm"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Jetzt ansehen
              </Link>
            </div>
          </div>
        </section>

        {/* All Series */}
        <section className="px-6 pb-8">
          <h2 className="text-headline text-lg mb-4">Alle Serien</h2>
          <div className="space-y-4">
            {mockSeries.map((series, index) => (
              <Link
                key={series.id}
                to={`/series/${series.id}`}
                className="flex gap-4 p-3 rounded-xl bg-card/50 hover:bg-card transition-all group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={series.coverUrl}
                    alt={series.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40">
                    <Play className="w-6 h-6 text-foreground" fill="currentColor" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className="text-caption text-gold">{series.genre}</span>
                  <h3 className="text-title mt-0.5 mb-1">{series.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {series.description}
                  </p>
                  <span className="text-xs text-muted-foreground mt-2">
                    {series.episodeCount} Episoden
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground self-center group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="px-6 pb-8">
          <div className="p-6 rounded-2xl border border-dashed border-border text-center">
            <p className="text-body text-muted-foreground">
              Weitere Premium-Serien kommen bald.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
