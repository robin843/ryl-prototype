import { useState, useEffect } from "react";
import { ArrowLeft, Plus, ChevronRight, Film, Eye, Upload, Trash2, Edit, Globe, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProducerData, Series, Episode } from "@/hooks/useProducerData";
import { CreateEpisodeModal } from "@/components/studio/CreateEpisodeModal";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SeriesDetail() {
  const navigate = useNavigate();
  const { seriesId } = useParams();
  const { user } = useAuth();
  const { fetchMySeries, fetchEpisodes, createEpisode, updateSeries, loading } = useProducerData();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!seriesId || !user) return;
      setIsLoadingData(true);
      
      const allSeries = await fetchMySeries();
      const found = allSeries.find(s => s.id === seriesId);
      setSeries(found || null);
      
      if (found) {
        const eps = await fetchEpisodes(seriesId);
        setEpisodes(eps);
      }
      
      setIsLoadingData(false);
    };
    loadData();
  }, [seriesId, user, fetchMySeries, fetchEpisodes]);

  const handleCreateEpisode = async (title: string, episodeNumber: number, description: string) => {
    if (!seriesId) return;
    const newEp = await createEpisode(seriesId, title, episodeNumber, description);
    if (newEp) {
      setEpisodes(prev => [...prev, newEp].sort((a, b) => a.episode_number - b.episode_number));
      setShowCreateModal(false);
      toast.success("Episode erstellt!");
    }
  };

  const handlePublish = async () => {
    if (!series) return;
    const success = await updateSeries(series.id, { status: "published" });
    if (success) {
      setSeries(prev => prev ? { ...prev, status: "published" } : null);
      toast.success("Serie veröffentlicht!");
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Serie nicht gefunden</p>
          <Button onClick={() => navigate("/studio")}>Zurück zum Studio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-top pb-24">
      {/* Header */}
      <header className="px-6 pt-4 pb-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/studio")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-headline truncate">{series.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium",
                series.status === "published" 
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gold/10 text-gold"
              )}>
                {series.status === "published" ? "Veröffentlicht" : "Entwurf"}
              </span>
              {series.genre && (
                <span className="text-xs text-muted-foreground">{series.genre}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Series Info */}
      <section className="px-6 py-6 border-b border-border/30">
        <div className="flex gap-4">
          <div className="w-24 h-32 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
            {series.cover_url ? (
              <img src={series.cover_url} alt={series.title} className="w-full h-full object-cover" />
            ) : (
              <Film className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-body text-muted-foreground line-clamp-3">
              {series.description || "Keine Beschreibung"}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Film className="w-3.5 h-3.5" />
                {episodes.length} Episoden
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {series.total_views} Views
              </span>
            </div>
          </div>
        </div>
        
        {series.status === "draft" && episodes.length > 0 && (
          <Button 
            variant="premium" 
            className="w-full mt-4"
            onClick={handlePublish}
          >
            <Globe className="w-4 h-4 mr-2" />
            Serie veröffentlichen
          </Button>
        )}
      </section>

      {/* Episodes List */}
      <section className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline text-lg">Episoden</h2>
          <Button variant="subtle" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Neue Episode
          </Button>
        </div>

        {episodes.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border text-center">
            <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              Noch keine Episoden
            </p>
            <Button variant="outline" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Erste Episode erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/30 group"
              >
                <div className="w-16 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {episode.thumbnail_url ? (
                    <img src={episode.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Film className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gold">E{episode.episode_number}</span>
                    <h3 className="text-sm font-medium truncate">{episode.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {episode.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {episode.duration}
                      </span>
                    )}
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px]",
                      episode.status === "published" ? "bg-green-500/20 text-green-400" : "bg-muted"
                    )}>
                      {episode.status === "published" ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Episode Modal */}
      <CreateEpisodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEpisode}
        nextEpisodeNumber={episodes.length + 1}
        isLoading={loading}
      />
    </div>
  );
}
