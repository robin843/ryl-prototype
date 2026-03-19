import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMediaCore } from "@/hooks/useMediaCore";
import { toast } from "sonner";

export interface EpisodeSegment {
  index: number;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  isGeneratingDescription: boolean;
}

export type FunnelStep = "series" | "upload" | "segments" | "review";

interface BulkUploadState {
  step: FunnelStep;
  seriesTitle: string;
  seriesGenre: string;
  seriesDescription: string;
  videoFile: File | null;
  videoDuration: number;
  videoAssetId: string | null;
  videoPublicUrl: string | null;
  segments: EpisodeSegment[];
  isCreating: boolean;
}

const SEGMENT_DURATION = 120; // 2 minutes in seconds

function generateSegments(duration: number): EpisodeSegment[] {
  const segments: EpisodeSegment[] = [];
  let start = 0;
  let index = 1;

  while (start < duration) {
    const end = Math.min(start + SEGMENT_DURATION, duration);
    // Don't create segments shorter than 10 seconds
    if (end - start < 10 && segments.length > 0) {
      // Merge into last segment
      segments[segments.length - 1].endTime = end;
      break;
    }
    segments.push({
      index,
      title: `Episode ${index}`,
      description: "",
      startTime: Math.round(start * 100) / 100,
      endTime: Math.round(end * 100) / 100,
      isGeneratingDescription: false,
    });
    start = end;
    index++;
  }
  return segments;
}

export function useBulkUpload() {
  const { user } = useAuth();
  const { uploadVideo, uploading, uploadProgress, isProcessing } = useMediaCore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [state, setState] = useState<BulkUploadState>({
    step: "series",
    seriesTitle: "",
    seriesGenre: "",
    seriesDescription: "",
    videoFile: null,
    videoDuration: 0,
    videoAssetId: null,
    videoPublicUrl: null,
    segments: [],
    isCreating: false,
  });

  const setStep = useCallback((step: FunnelStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const setSeriesInfo = useCallback((title: string, genre: string, description: string) => {
    setState(prev => ({ ...prev, seriesTitle: title, seriesGenre: genre, seriesDescription: description }));
  }, []);

  const handleVideoSelect = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, videoFile: file }));

    // Detect duration using a hidden video element
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    videoRef.current = video;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      const segments = generateSegments(duration);
      setState(prev => ({
        ...prev,
        videoDuration: duration,
        segments,
      }));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Videodatei konnte nicht gelesen werden.");
    };
    video.src = url;
  }, []);

  const startUpload = useCallback(async () => {
    if (!state.videoFile) return;
    const result = await uploadVideo(state.videoFile);
    if (result) {
      setState(prev => ({
        ...prev,
        videoAssetId: result.assetId,
        videoPublicUrl: result.publicUrl,
        step: "segments",
      }));
    }
  }, [state.videoFile, uploadVideo]);

  const updateSegment = useCallback((index: number, updates: Partial<EpisodeSegment>) => {
    setState(prev => ({
      ...prev,
      segments: prev.segments.map(s => s.index === index ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteSegment = useCallback((index: number) => {
    setState(prev => {
      const filtered = prev.segments.filter(s => s.index !== index);
      // Re-index
      const reindexed = filtered.map((s, i) => ({
        ...s,
        index: i + 1,
        title: s.title.startsWith("Episode ") ? `Episode ${i + 1}` : s.title,
      }));
      return { ...prev, segments: reindexed };
    });
  }, []);

  const adjustSegmentBoundary = useCallback((index: number, newEndTime: number) => {
    setState(prev => {
      const segments = [...prev.segments];
      const segIdx = segments.findIndex(s => s.index === index);
      if (segIdx === -1) return prev;

      segments[segIdx] = { ...segments[segIdx], endTime: newEndTime };

      // Adjust next segment's start time
      if (segIdx + 1 < segments.length) {
        segments[segIdx + 1] = { ...segments[segIdx + 1], startTime: newEndTime };
      }

      return { ...prev, segments };
    });
  }, []);

  const generateDescription = useCallback(async (segmentIndex: number) => {
    updateSegment(segmentIndex, { isGeneratingDescription: true });

    try {
      const segment = state.segments.find(s => s.index === segmentIndex);
      if (!segment) return;

      const { data, error } = await supabase.functions.invoke("generate-episode-description", {
        body: {
          seriesTitle: state.seriesTitle,
          seriesGenre: state.seriesGenre,
          episodeNumber: segment.index,
          totalEpisodes: state.segments.length,
          startTime: segment.startTime,
          endTime: segment.endTime,
          videoDuration: state.videoDuration,
        },
      });

      if (error) throw error;

      updateSegment(segmentIndex, {
        description: data.description || "",
        isGeneratingDescription: false,
      });
    } catch (err) {
      console.error("Failed to generate description:", err);
      toast.error("Beschreibung konnte nicht generiert werden.");
      updateSegment(segmentIndex, { isGeneratingDescription: false });
    }
  }, [state.segments, state.seriesTitle, state.seriesGenre, state.videoDuration, updateSegment]);

  const generateAllDescriptions = useCallback(async () => {
    for (const segment of state.segments) {
      await generateDescription(segment.index);
    }
  }, [state.segments, generateDescription]);

  const createSeriesWithEpisodes = useCallback(async (): Promise<string | null> => {
    if (!user || !state.videoAssetId) return null;
    setState(prev => ({ ...prev, isCreating: true }));

    try {
      // 1. Create series
      const { data: series, error: seriesErr } = await supabase
        .from("series")
        .insert({
          creator_id: user.id,
          title: state.seriesTitle,
          description: state.seriesDescription || null,
          genre: state.seriesGenre || null,
          source_video_asset_id: state.videoAssetId,
        })
        .select()
        .single();

      if (seriesErr || !series) throw seriesErr || new Error("Series creation failed");

      // 2. Batch create episodes
      const episodeInserts = state.segments.map(segment => ({
        series_id: series.id,
        creator_id: user.id,
        title: segment.title,
        description: segment.description || null,
        episode_number: segment.index,
        video_asset_id: state.videoAssetId,
        source_video_asset_id: state.videoAssetId,
        start_time_seconds: segment.startTime,
        end_time_seconds: segment.endTime,
        status: "draft" as const,
      }));

      const { error: episodesErr } = await supabase
        .from("episodes")
        .insert(episodeInserts);

      if (episodesErr) throw episodesErr;

      toast.success(`Serie "${state.seriesTitle}" mit ${state.segments.length} Episoden erstellt!`);
      setState(prev => ({ ...prev, isCreating: false }));
      return series.id;
    } catch (err) {
      console.error("Failed to create series:", err);
      toast.error("Fehler beim Erstellen der Serie.");
      setState(prev => ({ ...prev, isCreating: false }));
      return null;
    }
  }, [user, state]);

  const reset = useCallback(() => {
    setState({
      step: "series",
      seriesTitle: "",
      seriesGenre: "",
      seriesDescription: "",
      videoFile: null,
      videoDuration: 0,
      videoAssetId: null,
      videoPublicUrl: null,
      segments: [],
      isCreating: false,
    });
  }, []);

  return {
    ...state,
    uploading,
    uploadProgress,
    isProcessing,
    setStep,
    setSeriesInfo,
    handleVideoSelect,
    startUpload,
    updateSegment,
    deleteSegment,
    adjustSegmentBoundary,
    generateDescription,
    generateAllDescriptions,
    createSeriesWithEpisodes,
    reset,
  };
}
