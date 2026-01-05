import { useState, useEffect } from "react";
import { X, Loader2, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { VideoDropzone } from "./VideoDropzone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Episode } from "@/hooks/useProducerData";

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
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (episode) {
      setTitle(episode.title);
      setVideoUrl(episode.video_url);
    }
  }, [episode]);

  if (!isOpen || !episode) return null;

  const uploadVideo = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-episode.${fileExt}`;
    const filePath = `${user.id}/videos/${fileName}`;
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
    
    const { error } = await supabase.storage
      .from("media")
      .upload(filePath, file, { upsert: true });
    
    clearInterval(progressInterval);
    
    if (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      setUploadProgress(0);
      return null;
    }
    
    setUploadProgress(100);
    
    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);
    
    setIsUploading(false);
    return urlData.publicUrl;
  };

  const handleFileSelect = async (file: File) => {
    const url = await uploadVideo(file);
    if (url) {
      setVideoUrl(url);
      // Auto-save when video is uploaded
      setIsSaving(true);
      await onUpdate(episode.id, { video_url: url });
      setIsSaving(false);
    }
  };

  const handleRemoveVideo = async () => {
    setVideoUrl(null);
    setUploadProgress(0);
    setIsSaving(true);
    await onUpdate(episode.id, { video_url: null });
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

        {/* Video Area - Main Focus */}
        <div className="flex-1 p-4 flex flex-col">
          {videoUrl ? (
            <div className="flex-1 flex flex-col">
              {/* Video Preview */}
              <div className="relative flex-1 rounded-xl overflow-hidden bg-black min-h-[200px]">
                <video
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
              </div>
              
              {/* Replace Video Button */}
              <div className="mt-4 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleRemoveVideo}
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Video entfernen
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <VideoDropzone
                onFileSelect={handleFileSelect}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                uploadedUrl={videoUrl}
                onRemove={handleRemoveVideo}
              />
              
              {/* Simple instruction */}
              <div className="mt-6 text-center">
                <p className="text-lg font-medium text-foreground">
                  Lade dein Video hoch
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ziehe es einfach in das Feld oder tippe drauf
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Save */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="premium" 
            className="w-full" 
            onClick={handleSaveTitle}
            disabled={isSaving || isUploading}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {videoUrl ? "Fertig" : "Später hochladen"}
          </Button>
        </div>
      </div>
    </>
  );
}
