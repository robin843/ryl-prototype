import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VideoAsset {
  id: string;
  creator_id: string;
  storage_path: string;
  duration_seconds: number | null;
  status: "uploaded" | "ready" | "failed";
  created_at: string;
}

interface UploadResponse {
  videoAssetId: string;
  uploadUrl: string;
  uploadToken: string;
  storagePath: string;
  publicUrl: string;
}

export function useMediaCore() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a video file to the Media-Core
   * 1. Creates video_asset record in DB
   * 2. Gets signed upload URL
   * 3. Uploads directly to Storage
   * 4. Returns asset ID and public URL
   */
  const uploadVideo = useCallback(async (
    file: File
  ): Promise<{ assetId: string; publicUrl: string } | null> => {
    if (!user) {
      setError("Not authenticated");
      return null;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Get signed upload URL from edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("No auth token");
      }

      const response = await supabase.functions.invoke("create-video-upload", {
        body: {
          filename: file.name,
          contentType: file.type,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create upload");
      }

      const uploadData: UploadResponse = response.data;
      console.log("Got upload URL for asset:", uploadData.videoAssetId);

      // Step 2: Upload file with real progress tracking using XMLHttpRequest
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            // Map progress from 5% to 95% (leaving room for pre/post processing)
            const percent = 5 + Math.round((event.loaded / event.total) * 90);
            setUploadProgress(percent);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
        
        xhr.open('PUT', uploadData.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Step 3: Update asset status to ready
      const { error: updateError } = await supabase
        .from("video_assets")
        .update({ status: "ready" })
        .eq("id", uploadData.videoAssetId);

      if (updateError) {
        console.error("Failed to update asset status:", updateError);
        // Don't throw - upload succeeded, status update is non-critical
      }

      setUploadProgress(100);
      setUploading(false);

      return {
        assetId: uploadData.videoAssetId,
        publicUrl: uploadData.publicUrl,
      };

    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      return null;
    }
  }, [user]);

  /**
   * Get the public URL for a video asset
   */
  const getVideoUrl = useCallback(async (assetId: string): Promise<string | null> => {
    const { data, error: err } = await supabase
      .from("video_assets")
      .select("storage_path")
      .eq("id", assetId)
      .maybeSingle();

    if (err || !data) {
      console.error("Failed to get video asset:", err);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(data.storage_path);

    return urlData.publicUrl;
  }, []);

  /**
   * Fetch all video assets for the current creator
   */
  const fetchMyVideoAssets = useCallback(async (): Promise<VideoAsset[]> => {
    if (!user) return [];

    const { data, error: err } = await supabase
      .from("video_assets")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (err) {
      console.error("Failed to fetch video assets:", err);
      return [];
    }

    return data as VideoAsset[];
  }, [user]);

  return {
    uploading,
    uploadProgress,
    error,
    uploadVideo,
    getVideoUrl,
    fetchMyVideoAssets,
  };
}
