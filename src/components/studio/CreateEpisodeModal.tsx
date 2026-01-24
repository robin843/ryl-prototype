import { useState, useCallback } from "react";
import { X, Loader2, CloudCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { VideoDropzone } from "./VideoDropzone";
import { ThumbnailDropzone } from "./ThumbnailDropzone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMediaCore } from "@/hooks/useMediaCore";

interface CreateEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, episodeNumber: number, description: string, videoUrl?: string, thumbnailUrl?: string) => Promise<void>;
  nextEpisodeNumber: number;
  isLoading?: boolean;
}

export function CreateEpisodeModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  nextEpisodeNumber,
  isLoading 
}: CreateEpisodeModalProps) {
  const { user } = useAuth();
  const { uploadVideo, uploading: isUploading, uploadProgress, isProcessing } = useMediaCore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState(nextEpisodeNumber);
  
  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoAssetId, setVideoAssetId] = useState<string | null>(null);
  
  // Thumbnail upload state
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setVideoFile(file);
    const result = await uploadVideo(file);
    if (result) {
      setUploadedVideoUrl(result.publicUrl);
      setVideoAssetId(result.assetId);
      console.log("Video uploaded, Cloudflare processing started for asset:", result.assetId);
    }
  }, [uploadVideo]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setUploadedVideoUrl(null);
    setVideoAssetId(null);
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
    setThumbnailUrl(urlData.publicUrl);
    return urlData.publicUrl;
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    // Pass videoAssetId so episode can be linked to the video_asset for HLS playback
    await onSubmit(title, episodeNumber, description, uploadedVideoUrl || undefined, thumbnailUrl || undefined);
    // Reset state
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setUploadedVideoUrl(null);
    setVideoAssetId(null);
    setThumbnailUrl(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "fixed inset-x-3 inset-y-4 z-50 mx-auto my-auto sm:inset-x-4",
        "h-fit max-h-[calc(100vh-2rem)] w-auto max-w-lg",
        "bg-card rounded-2xl border border-border",
        "shadow-2xl animate-scale-in"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-headline">Neue Episode</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Episode #
                </label>
                <Input
                  type="number"
                  min={1}
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Titel *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. The First Frame"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Beschreibung
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Worum geht es in dieser Episode?"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Video
              </label>
              <VideoDropzone
                onFileSelect={handleFileSelect}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                uploadedUrl={uploadedVideoUrl}
                onRemove={handleRemoveVideo}
              />
              {isProcessing && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <CloudCog className="w-4 h-4 animate-pulse text-gold" />
                  <span>HLS-Transcoding wird gestartet...</span>
                </div>
              )}
            </div>

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

          <div className="p-6 pt-4 flex gap-3 border-t border-border bg-card">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              variant="premium" 
              className="flex-1" 
              disabled={isLoading || !title.trim() || isUploading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Erstellen"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}