import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Eye, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorProfile() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const { creator, series, stats, isLoading, error } = useCreatorProfile(creatorId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="relative">
          <div className="h-32 bg-gradient-to-b from-gold/10 to-background" />
          <div className="px-6 -mt-12">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-8 w-40 mt-4" />
            <Skeleton className="h-4 w-60 mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-headline text-lg mb-3">Creator nicht gefunden</p>
          <p className="text-body text-muted-foreground mb-6">
            Dieser Creator existiert nicht oder ist nicht mehr verfügbar.
          </p>
          <Button asChild variant="outline">
            <Link to="/feed">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Feed
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-to-b from-gold/10 to-background" />
        
        {/* Back button */}
        <Link 
          to="/feed"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        {/* Avatar & Name */}
        <div className="px-6 -mt-12">
          <div className="w-24 h-24 rounded-full bg-card border-4 border-background flex items-center justify-center overflow-hidden">
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          
          <h1 className="text-headline text-2xl mt-4">{creator.displayName || 'Creator'}</h1>
          {creator.companyName && (
            <p className="text-body text-muted-foreground mt-1">{creator.companyName}</p>
          )}
          {creator.bio && (
            <p className="text-body text-foreground/80 mt-3 max-w-md">{creator.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mt-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Eye className="w-4 h-4 text-gold" />
            </div>
            <p className="text-title text-lg">{stats.totalViews.toLocaleString()}</p>
            <p className="text-caption text-muted-foreground">Views</p>
          </div>
          
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Play className="w-4 h-4 text-gold" />
            </div>
            <p className="text-title text-lg">{stats.totalEpisodes}</p>
            <p className="text-caption text-muted-foreground">Episoden</p>
          </div>
          
          <div className="p-4 rounded-xl bg-card/50 border border-border/30 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ShoppingBag className="w-4 h-4 text-gold" />
            </div>
            <p className="text-title text-lg">{stats.totalProducts}</p>
            <p className="text-caption text-muted-foreground">Produkte</p>
          </div>
        </div>
      </div>

      {/* Series */}
      <div className="px-6 mt-8">
        <h2 className="text-title mb-4">Serien</h2>
        
        {series.length === 0 ? (
          <div className="p-8 rounded-xl bg-card/30 border border-border/30 text-center">
            <p className="text-body text-muted-foreground">
              Noch keine veröffentlichten Serien
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {series.map((s) => (
              <Link
                key={s.id}
                to={`/series/${s.id}`}
                className="block p-4 rounded-xl bg-card/50 border border-border/30 hover:border-gold/30 transition-colors group"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-28 rounded-lg bg-muted/50 flex-shrink-0 overflow-hidden">
                    {s.coverUrl ? (
                      <img src={s.coverUrl} alt={s.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-title truncate group-hover:text-gold transition-colors">{s.title}</h3>
                    <p className="text-caption text-muted-foreground mt-1">
                      {s.episodeCount} Episoden • {s.genre || 'Drama'}
                    </p>
                    {s.description && (
                      <p className="text-body text-foreground/60 mt-2 line-clamp-2">
                        {s.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {s.totalViews?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}