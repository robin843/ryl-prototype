import { useState, useRef } from "react";
import { Upload, ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ThumbnailDropzoneProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove?: () => void;
  className?: string;
  isUploading?: boolean;
}

export function ThumbnailDropzone({ 
  currentUrl, 
  onUpload, 
  onRemove,
  className,
  isUploading: externalUploading 
}: ThumbnailDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploading = externalUploading || isUploading;
  const displayUrl = previewUrl || currentUrl;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    
    // Show preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const uploadedUrl = await onUpload(file);
      if (uploadedUrl) {
        setPreviewUrl(uploadedUrl);
      }
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onRemove?.();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer transition-all group",
        isDragging 
          ? "ring-2 ring-gold bg-gold/10" 
          : "bg-secondary hover:ring-2 hover:ring-gold/50",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {displayUrl ? (
        <>
          <img 
            src={displayUrl} 
            alt="Episode Thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-white" />
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                    onClick={handleRemove}
                  >
                    <X className="w-4 h-4 text-white" />
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground text-center">
                Thumbnail hochladen (16:9)
              </span>
              <span className="text-xs text-muted-foreground/60 text-center">
                Ziehen oder klicken
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
