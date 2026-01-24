import { useState, useCallback, useRef } from "react";
import * as tus from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const TUS_ENDPOINT = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;

interface TusUploadResult {
  publicUrl: string;
  filePath: string;
}

export function useTusUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const uploadRef = useRef<tus.Upload | null>(null);

  const uploadVideo = useCallback(async (
    file: File,
    folder: string = "videos"
  ): Promise<TusUploadResult | null> => {
    if (!user) {
      setError("Not authenticated");
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("No auth token");
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${folder}/${Date.now()}-${safeName}`;

      return new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: TUS_ENDPOINT,
          retryDelays: [0, 1000, 3000, 5000],
          headers: {
            authorization: `Bearer ${token}`,
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          chunkSize: 6 * 1024 * 1024, // 6MB chunks (Supabase standard)
          metadata: {
            bucketName: "media",
            objectName: filePath,
            contentType: file.type,
            cacheControl: "3600",
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percent = Math.round((bytesUploaded / bytesTotal) * 100);
            setProgress(percent);
          },
          onSuccess: () => {
            const publicUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/media/${filePath}`;
            setUploading(false);
            setProgress(100);
            uploadRef.current = null;
            resolve({ publicUrl, filePath });
          },
          onError: (err) => {
            console.error("TUS upload error:", err);
            setError(err.message || "Upload failed");
            setUploading(false);
            uploadRef.current = null;
            reject(err);
          },
        });

        uploadRef.current = upload;

        // Check for previous uploads to resume
        upload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length > 0) {
            console.log("Resuming previous upload");
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }
          upload.start();
        });
      });
    } catch (err) {
      console.error("Upload setup error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      return null;
    }
  }, [user]);

  const cancelUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
      setUploading(false);
      setProgress(0);
    }
  }, []);

  return {
    uploadVideo,
    cancelUpload,
    uploading,
    progress,
    error,
  };
}
