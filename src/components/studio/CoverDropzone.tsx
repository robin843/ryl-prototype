import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverDropzoneProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<string | null>;
  className?: string;
}

export function CoverDropzone({ currentUrl, onUpload, className }: CoverDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative w-24 h-32 rounded-xl overflow-hidden cursor-pointer transition-all group",
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
            alt="Series Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-white" />
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground text-center px-2">
                Cover hochladen
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
