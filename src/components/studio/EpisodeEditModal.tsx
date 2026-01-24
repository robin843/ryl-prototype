import { useState, useEffect } from "react";
import { X, Loader2, Trash2, Globe, EyeOff, ExternalLink, CloudCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { VideoDropzone } from "./VideoDropzone";
import { ThumbnailDropzone } from "./ThumbnailDropzone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Episode } from "@/hooks/useProducerData";
import { toast } from "sonner";
import { useMediaCore } from "@/hooks/useMediaCore";

const SHOPABLE_EDITOR_URL = import.meta.env.VITE_SHOPABLE_EDITOR_URL || 'https://editor.shopable.io';

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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>("draft");

  useEffect(() => {
    if (episode) {
      setTitle(episode.title);
      setVideoUrl(episode.video_url);
      setThumbnailUrl(episode.thumbnail_url);
      setStatus(episode.status || "draft");
    }
  }, [episode]);

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

  const handleSaveTitle = async () => {
    if (title !== episode.title) {
      setIsSaving(true);
      await onUpdate(episode.id, { title });
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

  const openShopableEditor = () => {
    const editorUrl = new URL(SHOPABLE_EDITOR_URL);
    editorUrl.searchParams.set('partner', 'ryl.zone');
    editorUrl.searchParams.set('external_id', episode.id);
    
    if (videoUrl) {
      editorUrl.searchParams.set('video_url', videoUrl);
    }
    
    editorUrl.searchParams.set('return_url', window.location.href);
    
    window.open(editorUrl.toString(), '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal - Full screen on mobile for simplicity */}
      <div className={cn(
        "fixed inset-2 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
        "sm:w-full sm:max-w-xl",
        "bg-card rounded-2xl border border-border",
        "shadow-2xl animate-scale-in flex flex-col"
      )}>
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
          <Button variant="ghost" size="icon-sm" onClick={handleSaveTitle}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
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
          </div>
        </div>

        {/* Footer with Save */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Shopable Editor Button - External Deep Link */}
          {videoUrl && (
            <Button 
              variant="outline"
              className="w-full" 
              onClick={openShopableEditor}
              disabled={isSaving || isUploading}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Hotspots bearbeiten (Shopable)
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
            onClick={handleSaveTitle}
            disabled={isSaving || isUploading}
          >
            Schließen
          </Button>
        </div>
      </div>
    </>
  );
}
