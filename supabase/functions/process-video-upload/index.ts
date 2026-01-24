import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const CLOUDFLARE_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID")!;
const CLOUDFLARE_STREAM_TOKEN = Deno.env.get("CLOUDFLARE_STREAM_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ProcessRequest {
  videoAssetId: string;
  storagePath: string;
}

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[process-video-upload] ${step}`, details ? JSON.stringify(details) : "");
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Parse request
    const { videoAssetId, storagePath } = await req.json() as ProcessRequest;
    logStep("Processing video", { videoAssetId, storagePath });

    if (!videoAssetId || !storagePath) {
      return new Response(
        JSON.stringify({ error: "Missing videoAssetId or storagePath" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update status to processing
    await supabase
      .from("video_assets")
      .update({ stream_status: "processing" })
      .eq("id", videoAssetId);

    // Get public URL for the video from Supabase Storage
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath);
    const videoUrl = urlData.publicUrl;
    logStep("Got video URL", { videoUrl });

    // Upload to Cloudflare Stream using URL-to-upload
    // This is more reliable than downloading and re-uploading
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/copy`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl,
          meta: {
            videoAssetId,
            source: "ryl-app",
          },
          // Enable automatic quality variants
          requireSignedURLs: false,
        }),
      }
    );

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      logStep("Cloudflare error", { status: cfResponse.status, error: errorText });
      
      await supabase
        .from("video_assets")
        .update({ stream_status: "error" })
        .eq("id", videoAssetId);

      return new Response(
        JSON.stringify({ error: "Failed to upload to Cloudflare Stream" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cfData = await cfResponse.json();
    const streamId = cfData.result?.uid;
    logStep("Cloudflare upload started", { streamId });

    if (!streamId) {
      logStep("No stream ID returned", { cfData });
      await supabase
        .from("video_assets")
        .update({ stream_status: "error" })
        .eq("id", videoAssetId);

      return new Response(
        JSON.stringify({ error: "No stream ID returned from Cloudflare" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update video_assets with stream_id
    const { error: updateError } = await supabase
      .from("video_assets")
      .update({ 
        stream_id: streamId,
        stream_status: "processing",
      })
      .eq("id", videoAssetId);

    if (updateError) {
      logStep("Failed to update video_assets", { error: updateError });
    }

    logStep("Successfully queued for processing", { videoAssetId, streamId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        streamId,
        message: "Video queued for processing. HLS URL will be available once transcoding completes." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    logStep("Error processing video", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
