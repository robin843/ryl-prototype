import { useState, useRef, useCallback } from "react";
import { Upload, Film, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  uploadProgress: number;
  isUploading: boolean;
  uploadedUrl?: string | null;
  onRemove?: () => void;
}

const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/mov"];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export function VideoDropzone({
  onFileSelect,
  uploadProgress,
  isUploading,
  uploadedUrl,
  onRemove,
}: VideoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setError("Bitte nur MP4, WebM oder MOV Dateien hochladen.");
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError("Die Datei ist zu groß. Maximal 500MB erlaubt.");
      return false;
    }
    
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

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
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload completed
  if (uploadedUrl && !isUploading) {
    return (
      <div className="relative rounded-xl border border-green-500/30 bg-green-500/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {selectedFile?.name || "Video hochgeladen"}
            </p>
            <p className="text-xs text-muted-foreground">
              Upload erfolgreich
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Uploading state
  if (isUploading) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-gold animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {selectedFile?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile?.size || 0)} • Wird hochgeladen...
            </p>
          </div>
        </div>
        <Progress value={uploadProgress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {uploadProgress}%
        </p>
      </div>
    );
  }

  // File selected but not yet uploading
  if (selectedFile && !isUploading && !uploadedUrl) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Film className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - dropzone
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleInputChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200",
          "flex flex-col items-center justify-center text-center",
          isDragging
            ? "border-gold bg-gold/10"
            : "border-border hover:border-gold/50 hover:bg-muted/30",
          error && "border-destructive bg-destructive/10"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
          isDragging ? "bg-gold/20" : "bg-muted"
        )}>
          <Upload className={cn(
            "w-6 h-6 transition-colors",
            isDragging ? "text-gold" : "text-muted-foreground"
          )} />
        </div>
        
        <p className="text-sm font-medium text-foreground mb-1">
          {isDragging ? "Hier ablegen" : "Video hochladen"}
        </p>
        <p className="text-xs text-muted-foreground">
          Ziehe ein Video hierher oder klicke zum Auswählen
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          MP4, WebM, MOV • Max. 500MB
        </p>
      </div>
      
      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
