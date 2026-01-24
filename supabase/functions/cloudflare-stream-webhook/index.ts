import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Webhook types from Cloudflare Stream
interface CloudflareWebhookPayload {
  uid: string;
  readyToStream: boolean;
  status: {
    state: string;
    pctComplete?: string;
    errorReasonCode?: string;
    errorReasonText?: string;
  };
  meta?: {
    videoAssetId?: string;
    source?: string;
  };
  duration?: number;
  playback?: {
    hls?: string;
    dash?: string;
  };
  thumbnail?: string;
  preview?: string;
}

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[cloudflare-stream-webhook] ${step}`, details ? JSON.stringify(details) : "");
}

Deno.serve(async (req: Request) => {
  // Only allow POST for webhooks
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json() as CloudflareWebhookPayload;
    logStep("Received webhook", { 
      streamId: payload.uid, 
      state: payload.status?.state,
      readyToStream: payload.readyToStream,
      meta: payload.meta,
    });

    const streamId = payload.uid;
    if (!streamId) {
      logStep("No stream ID in webhook");
      return new Response("Missing stream ID", { status: 400 });
    }

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find video_asset by stream_id
    const { data: videoAsset, error: fetchError } = await supabase
      .from("video_assets")
      .select("id, creator_id")
      .eq("stream_id", streamId)
      .maybeSingle();

    if (fetchError || !videoAsset) {
      logStep("Video asset not found", { streamId, error: fetchError });
      // Try to find by meta.videoAssetId if embedded in the upload
      if (payload.meta?.videoAssetId) {
        const { data: altAsset } = await supabase
          .from("video_assets")
          .select("id")
          .eq("id", payload.meta.videoAssetId)
          .maybeSingle();
        
        if (altAsset) {
          // Update stream_id if we found by meta
          await supabase
            .from("video_assets")
            .update({ stream_id: streamId })
            .eq("id", altAsset.id);
        }
      }
      return new Response("OK", { status: 200 });
    }

    // Handle different states
    if (payload.readyToStream && payload.status?.state === "ready") {
      // Video is ready! Extract HLS URL and duration
      const hlsUrl = payload.playback?.hls;
      const durationMs = payload.duration ? Math.round(payload.duration * 1000) : null;
      const thumbnailUrl = payload.thumbnail;

      logStep("Video ready", { 
        videoAssetId: videoAsset.id, 
        hlsUrl, 
        durationMs,
        thumbnailUrl,
      });

      // Update video_assets
      const { error: updateError } = await supabase
        .from("video_assets")
        .update({
          stream_status: "ready",
          hls_url: hlsUrl,
          duration_ms: durationMs,
          thumbnail_url: thumbnailUrl,
        })
        .eq("id", videoAsset.id);

      if (updateError) {
        logStep("Failed to update video_assets", { error: updateError });
      }

      // Also update any episodes using this video_asset
      // Find episodes by video_asset_id (primary) or video_url pattern (fallback)
      const { data: episodes } = await supabase
        .from("episodes")
        .select("id")
        .eq("video_asset_id", videoAsset.id);

      if (episodes && episodes.length > 0) {
        for (const ep of episodes) {
          await supabase
            .from("episodes")
            .update({ hls_url: hlsUrl })
            .eq("id", ep.id);
          logStep("Updated episode HLS URL via video_asset_id", { episodeId: ep.id });
        }
      } else {
        // Fallback: try finding by video_url pattern
        const { data: fallbackEpisodes } = await supabase
          .from("episodes")
          .select("id")
          .ilike("video_url", `%${videoAsset.id}%`);

        if (fallbackEpisodes && fallbackEpisodes.length > 0) {
          for (const ep of fallbackEpisodes) {
            await supabase
              .from("episodes")
              .update({ hls_url: hlsUrl })
              .eq("id", ep.id);
            logStep("Updated episode HLS URL via video_url fallback", { episodeId: ep.id });
          }
        }
      }

    } else if (payload.status?.state === "error") {
      // Handle error state
      logStep("Video processing error", { 
        videoAssetId: videoAsset.id,
        errorCode: payload.status.errorReasonCode,
        errorText: payload.status.errorReasonText,
      });

      await supabase
        .from("video_assets")
        .update({ stream_status: "error" })
        .eq("id", videoAsset.id);

    } else if (payload.status?.state === "inprogress") {
      // Processing in progress - could update progress percentage if needed
      logStep("Video processing", { 
        videoAssetId: videoAsset.id,
        progress: payload.status.pctComplete,
      });
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Webhook error", { error: errorMessage });
    return new Response("Internal error", { status: 500 });
  }
});
