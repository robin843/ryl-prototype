import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Film, Eye, Globe, Clock, ShoppingBag, ExternalLink, Upload, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducerData, Series, Episode, Product } from "@/hooks/useProducerData";
import { CreateEpisodeModal } from "@/components/studio/CreateEpisodeModal";
import { CreateProductModal } from "@/components/studio/CreateProductModal";
import { EpisodeEditModal } from "@/components/studio/EpisodeEditModal";
import { CoverDropzone } from "@/components/studio/CoverDropzone";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SeriesDetail() {
  const navigate = useNavigate();
  const { seriesId } = useParams();
  const { user } = useAuth();
  const { 
    fetchMySeries, 
    fetchEpisodes, 
    fetchSeriesProducts,
    createEpisode, 
    createProduct,
    updateEpisode, 
    updateSeries,
    uploadMedia,
    loading 
  } = useProducerData();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateEpisodeModal, setShowCreateEpisodeModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!seriesId || !user) return;
      setIsLoadingData(true);
      
      const allSeries = await fetchMySeries();
      const found = allSeries.find(s => s.id === seriesId);
      setSeries(found || null);
      
      if (found) {
        const [eps, prods] = await Promise.all([
          fetchEpisodes(seriesId),
          fetchSeriesProducts(seriesId)
        ]);
        setEpisodes(eps);
        setProducts(prods);
      }
      
      setIsLoadingData(false);
    };
    loadData();
  }, [seriesId, user, fetchMySeries, fetchEpisodes, fetchSeriesProducts]);

  const handleCreateEpisode = async (title: string, episodeNumber: number, description: string, videoUrl?: string) => {
    if (!seriesId) return;
    const newEp = await createEpisode(seriesId, title, episodeNumber, description);
    if (newEp) {
      if (videoUrl) {
        await updateEpisode(newEp.id, { video_url: videoUrl });
        newEp.video_url = videoUrl;
      }
      setEpisodes(prev => [...prev, newEp].sort((a, b) => a.episode_number - b.episode_number));
      setShowCreateEpisodeModal(false);
      toast.success("Episode erstellt!");
    }
  };

  const handleUpdateEpisode = async (episodeId: string, updates: Partial<Episode>): Promise<boolean> => {
    const success = await updateEpisode(episodeId, updates);
    if (success) {
      setEpisodes(prev => prev.map(ep => 
        ep.id === episodeId ? { ...ep, ...updates } : ep
      ));
      toast.success("Episode aktualisiert!");
    }
    return success;
  };

  const handleCreateProduct = async (
    name: string, 
    brandName: string, 
    priceCents: number, 
    description?: string, 
    productUrl?: string
  ) => {
    if (!seriesId) return;
    const newProduct = await createProduct(seriesId, name, brandName, priceCents, description, productUrl);
    if (newProduct) {
      setProducts(prev => [newProduct, ...prev]);
      setShowCreateProductModal(false);
      toast.success("Produkt hinzugefügt!");
    }
  };

  const handlePublish = async () => {
    if (!series) return;
    const newStatus = series.status === "published" ? "draft" : "published";
    const success = await updateSeries(series.id, { status: newStatus });
    if (success) {
      setSeries(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(newStatus === "published" ? "Serie veröffentlicht!" : "Serie offline genommen!");
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  const handleCoverUpload = async (file: File): Promise<string | null> => {
    if (!series) return null;
    const url = await uploadMedia(file, `series/${series.id}/cover-${Date.now()}.${file.name.split('.').pop()}`);
    if (url) {
      const success = await updateSeries(series.id, { cover_url: url });
      if (success) {
        setSeries(prev => prev ? { ...prev, cover_url: url } : null);
        toast.success("Cover hochgeladen!");
        return url;
      }
    }
    return null;
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
          <CoverDropzone
            currentUrl={series.cover_url}
            onUpload={handleCoverUpload}
          />
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
                <ShoppingBag className="w-3.5 h-3.5" />
                {products.length} Produkte
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {series.total_views} Views
              </span>
            </div>
          </div>
        </div>
        
        {episodes.length > 0 && (
          <Button 
            variant={series.status === "published" ? "outline" : "premium"}
            className="w-full mt-4"
            onClick={handlePublish}
          >
            <Globe className="w-4 h-4 mr-2" />
            {series.status === "published" ? "Offline nehmen" : "Serie veröffentlichen"}
          </Button>
        )}
      </section>

      {/* Tabs for Episodes & Products */}
      <Tabs defaultValue="episodes" className="px-6 py-6">
        <TabsList className="w-full">
          <TabsTrigger value="episodes" className="flex-1">
            <Film className="w-4 h-4 mr-2" />
            Episoden
          </TabsTrigger>
          <TabsTrigger value="products" className="flex-1">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Produkte
          </TabsTrigger>
        </TabsList>

        {/* Episodes Tab */}
        <TabsContent value="episodes" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{episodes.length} Episoden</p>
            <Button variant="subtle" size="sm" onClick={() => setShowCreateEpisodeModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Neue Episode
            </Button>
          </div>

          {episodes.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-border text-center">
              <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Noch keine Episoden</p>
              <Button variant="outline" onClick={() => setShowCreateEpisodeModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Erste Episode erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => setEditingEpisode(episode)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                    episode.video_url 
                      ? "bg-card border-border/30 hover:border-gold/50" 
                      : "bg-gold/5 border-gold/30 hover:border-gold"
                  )}
                >
                  <div className={cn(
                    "w-16 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0",
                    episode.video_url ? "bg-secondary" : "bg-gold/20"
                  )}>
                    {episode.video_url ? (
                      episode.thumbnail_url ? (
                        <img src={episode.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )
                    ) : (
                      <Upload className="w-4 h-4 text-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gold font-medium">E{episode.episode_number}</span>
                      <h3 className="text-sm font-medium truncate">{episode.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {episode.video_url ? (
                        <>
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
                        </>
                      ) : (
                        <span className="text-gold">Tippe um Video hochzuladen</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{products.length} Produkte</p>
            <Button variant="subtle" size="sm" onClick={() => setShowCreateProductModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Produkt hinzufügen
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-border text-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Noch keine Produkte</p>
              <p className="text-xs text-muted-foreground mb-4">
                Füge Produkte hinzu, die du in den Episoden platzieren kannst.
              </p>
              <Button variant="outline" onClick={() => setShowCreateProductModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Erstes Produkt hinzufügen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-xl bg-card border border-border/30"
                >
                  <div className="w-full aspect-square rounded-lg bg-secondary flex items-center justify-center overflow-hidden mb-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <p className="text-xs text-gold mb-1">{product.brand_name}</p>
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{formatPrice(product.price_cents)}</p>
                  {product.product_url && (
                    <a 
                      href={product.product_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gold mt-2 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Shop-Link
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateEpisodeModal
        isOpen={showCreateEpisodeModal}
        onClose={() => setShowCreateEpisodeModal(false)}
        onSubmit={handleCreateEpisode}
        nextEpisodeNumber={episodes.length + 1}
        isLoading={loading}
      />

      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => setShowCreateProductModal(false)}
        onSubmit={handleCreateProduct}
        isLoading={loading}
      />

      <EpisodeEditModal
        isOpen={!!editingEpisode}
        onClose={() => setEditingEpisode(null)}
        episode={editingEpisode}
        onUpdate={handleUpdateEpisode}
      />
    </div>
  );
}
