import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Trash2, Globe, EyeOff, ExternalLink, CloudCog, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { VideoDropzone } from "./VideoDropzone";
import { ThumbnailDropzone } from "./ThumbnailDropzone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Episode } from "@/hooks/useProducerData";
import { toast } from "sonner";
import { useMediaCore } from "@/hooks/useMediaCore";

interface EpisodeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode | null;
  onUpdate: (episodeId: string, updates: Partial<Episode>) => Promise<boolean>;
}

export function EpisodeEditModal({ 
  isOpen, 
  onClose, 
  episode,
  onUpdate
}: EpisodeEditModalProps) {
  const { user } = useAuth();
  const { uploadVideo, uploading: isUploading, uploadProgress, isProcessing } = useMediaCore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailPosition, setThumbnailPosition] = useState<string>("center");
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>("draft");
  const [isGeneratingDeeplink, setIsGeneratingDeeplink] = useState(false);

  useEffect(() => {
    if (episode) {
      setTitle(episode.title);
      setDescription(episode.description || "");
      setVideoUrl(episode.video_url);
      setThumbnailUrl(episode.thumbnail_url);
      setStatus(episode.status || "draft");
      // Parse thumbnail_position from episode metadata or default to center
      setThumbnailPosition(episode.thumbnail_position || "center");
    }
  }, [episode]);

  const openShopableEditor = useCallback(async () => {
    if (!episode?.id) return;
    
    setIsGeneratingDeeplink(true);
    
    // Open window IMMEDIATELY on click to avoid popup blocker
    const newWindow = window.open('about:blank', '_blank');
    
    if (!newWindow) {
      toast.error("Popup wurde blockiert. Bitte erlaube Popups für diese Seite.");
      setIsGeneratingDeeplink(false);
      return;
    }
    
    // Show loading message while token is being generated
    newWindow.document.write(`
      <html>
        <head><title>Lädt...</title></head>
        <body style="background:#1a1a1a;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:system-ui,sans-serif;">
          <div style="text-align:center;">
            <div style="font-size:1.5rem;margin-bottom:1rem;">✨</div>
            <div>Shopable Editor wird geladen...</div>
          </div>
        </body>
      </html>
    `);
    
    try {
      const response = await supabase.functions.invoke('generate-shopable-token', {
        body: { episode_id: episode.id }
      });

      if (response.error || !response.data?.deeplink_url) {
        console.error("Deeplink generation failed:", response.error);
        newWindow.close();
        toast.error("Konnte Shopable nicht öffnen");
        setIsGeneratingDeeplink(false);
        return;
      }

      // Navigate to the actual deeplink URL
      newWindow.location.href = response.data.deeplink_url;
      toast.success("Shopable Editor wird geöffnet...");
      
    } catch (err) {
      console.error("Deeplink error:", err);
      newWindow.close();
      toast.error("Fehler beim Öffnen des Editors");
    } finally {
      setIsGeneratingDeeplink(false);
    }
  }, [episode?.id]);

  if (!isOpen || !episode) return null;

  const handleFileSelect = async (file: File) => {
    const result = await uploadVideo(file);
    if (result) {
      setVideoUrl(result.publicUrl);
      // Auto-save when video is uploaded - include video_asset_id for HLS linking
      setIsSaving(true);
      await onUpdate(episode.id, { 
        video_url: result.publicUrl,
        video_asset_id: result.assetId 
      });
      setIsSaving(false);
      toast.success("Video hochgeladen! HLS-Transcoding läuft...");
      console.log("Video uploaded, Cloudflare processing started for asset:", result.assetId);
    } else {
      toast.error("Upload fehlgeschlagen");
    }
  };

  const handleRemoveVideo = async () => {
    setVideoUrl(null);
    setIsSaving(true);
    await onUpdate(episode.id, { video_url: null });
    setIsSaving(false);
  };

  const uploadThumbnail = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setIsThumbnailUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-thumbnail.${fileExt}`;
    const filePath = `${user.id}/thumbnails/${fileName}`;
    
    const { error } = await supabase.storage
      .from("media")
      .upload(filePath, file, { upsert: true });
    
    if (error) {
      console.error("Thumbnail upload error:", error);
      setIsThumbnailUploading(false);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);
    
    setIsThumbnailUploading(false);
    const url = urlData.publicUrl;
    setThumbnailUrl(url);
    
    // Auto-save thumbnail
    setIsSaving(true);
    await onUpdate(episode.id, { thumbnail_url: url });
    setIsSaving(false);
    toast.success("Thumbnail gespeichert");
    
    return url;
  };

  const handleRemoveThumbnail = async () => {
    setThumbnailUrl(null);
    setIsSaving(true);
    await onUpdate(episode.id, { thumbnail_url: null });
    setIsSaving(false);
  };

  const handleSave = async () => {
    const updates: Partial<Episode> = {};
    if (title !== episode.title) updates.title = title;
    if (description !== (episode.description || "")) updates.description = description || null;
    
    if (Object.keys(updates).length > 0) {
      setIsSaving(true);
      await onUpdate(episode.id, updates);
      setIsSaving(false);
    }
    onClose();
  };

  const handleTogglePublish = async () => {
    if (!videoUrl && status !== "published") {
      toast.error("Bitte zuerst ein Video hochladen");
      return;
    }
    
    setIsSaving(true);
    const newStatus = status === "published" ? "draft" : "published";
    const success = await onUpdate(episode.id, { status: newStatus });
    if (success) {
      setStatus(newStatus);
      toast.success(newStatus === "published" ? "Episode veröffentlicht!" : "Episode offline genommen");
    }
    setIsSaving(false);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

       {/* Modal - Centered on all screens */}
       {/* NOTE: keep translate on an outer wrapper; animations that set `transform` would otherwise override centering */}
       <div
         className={cn(
           "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
           "w-[calc(100%-2rem)] max-w-md max-h-[calc(100%-4rem)]"
         )}
       >
         <div
           className={cn(
             "w-full max-h-full overflow-hidden",
             "bg-card rounded-2xl border border-border",
             "shadow-2xl animate-scale-in flex flex-col"
           )}
         >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-gold font-medium">E{episode.episode_number}</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Episodentitel"
            />
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleSave}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Beschreibung
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht es in dieser Episode?"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Video Section */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Video
            </label>
            {videoUrl ? (
              <div className="flex flex-col">
                {/* Video Preview */}
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                  <video
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                  />
                </div>
                
                {/* Transcoding Status */}
                {isProcessing && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <CloudCog className="w-4 h-4 animate-pulse text-gold" />
                    <span>HLS-Transcoding wird gestartet...</span>
                  </div>
                )}
                
                {/* Replace Video Button */}
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRemoveVideo}
                    disabled={isSaving}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Video entfernen
                  </Button>
                </div>
              </div>
            ) : (
              <VideoDropzone
                onFileSelect={handleFileSelect}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                uploadedUrl={videoUrl}
                onRemove={handleRemoveVideo}
              />
            )}
          </div>

          {/* Thumbnail Section */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Thumbnail
            </label>
            <ThumbnailDropzone
              currentUrl={thumbnailUrl}
              onUpload={uploadThumbnail}
              onRemove={handleRemoveThumbnail}
              isUploading={isThumbnailUploading}
            />
            {/* Thumbnail Position Controls */}
            {thumbnailUrl && (
              <div className="mt-3">
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Ausrichtung
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: "top", label: "Oben" },
                    { value: "center", label: "Mitte" },
                    { value: "bottom", label: "Unten" },
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={async () => {
                        setThumbnailPosition(pos.value);
                        setIsSaving(true);
                        await onUpdate(episode.id, { thumbnail_position: pos.value });
                        setIsSaving(false);
                        toast.success("Thumbnail-Ausrichtung gespeichert");
                      }}
                      className={cn(
                        "py-1.5 px-2 text-xs rounded-lg border transition-all",
                        thumbnailPosition === pos.value
                          ? "border-gold bg-gold/10 text-gold font-medium"
                          : "border-border text-muted-foreground hover:border-gold/50"
                      )}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Save */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Shopable Editor Button - JWT-authenticated Deeplink */}
          {/* Only show when video has been processed (has video_asset_id with stream_id) */}
          {episode.video_asset_id && (
            <Button 
              variant="outline"
              className="w-full" 
              onClick={openShopableEditor}
              disabled={isSaving || isUploading || isGeneratingDeeplink}
            >
              {isGeneratingDeeplink ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isGeneratingDeeplink ? "Wird geöffnet..." : "Hotspots bearbeiten"}
            </Button>
          )}

          {/* Publish Toggle */}
          <Button 
            variant={status === "published" ? "outline" : "premium"}
            className="w-full" 
            onClick={handleTogglePublish}
            disabled={isSaving || isUploading || (!videoUrl && status !== "published")}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : status === "published" ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Globe className="w-4 h-4 mr-2" />
            )}
            {status === "published" ? "Offline nehmen" : "Episode veröffentlichen"}
          </Button>
          
          {/* Close Button */}
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={handleSave}
            disabled={isSaving || isUploading}
          >
            Schließen
          </Button>
        </div>
        </div>
      </div>
    </>,
    document.body
  );
}
