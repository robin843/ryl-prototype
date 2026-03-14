import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLOUDFLARE_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID")!;
const CLOUDFLARE_STREAM_TOKEN = Deno.env.get("CLOUDFLARE_STREAM_TOKEN")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function log(step: string, details?: Record<string, unknown>) {
  console.log(`[api-upload-episode] ${step}`, details ? JSON.stringify(details) : "");
}

/** Validate API key and return owner user_id */
async function validateApiKey(apiKey: string, supabase: any): Promise<{ userId: string | null; isGlobal: boolean } | null> {
  // Hash the key with SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const { data: keyRow, error } = await supabase
    .from("api_keys")
    .select("id, user_id, is_global, scopes")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (error || !keyRow) return null;

  // Update last_used_at
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id);

  return { userId: keyRow.user_id, isGlobal: keyRow.is_global };
}

/** Fire webhooks for an event */
async function fireWebhooks(supabase: any, userId: string | null, eventType: string, payload: Record<string, unknown>) {
  // Get matching subscriptions
  let query = supabase
    .from("webhook_subscriptions")
    .select("id, url, secret, events")
    .eq("is_active", true)
    .contains("events", [eventType]);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: subs } = await query;
  if (!subs || subs.length === 0) return;

  const fullPayload = { event: eventType, timestamp: new Date().toISOString(), ...payload };

  for (const sub of subs) {
    // Create event record
    const { data: evt } = await supabase.from("webhook_events").insert({
      subscription_id: sub.id,
      event_type: eventType,
      payload: fullPayload,
      status: "sending",
    }).select("id").single();

    try {
      // Sign payload with HMAC
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", encoder.encode(sub.secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(JSON.stringify(fullPayload)));
      const sigHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");

      const resp = await fetch(sub.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Ryl-Signature": sigHex,
          "X-Ryl-Event": eventType,
        },
        body: JSON.stringify(fullPayload),
      });

      await supabase.from("webhook_events").update({
        status: resp.ok ? "delivered" : "failed",
        response_status: resp.status,
        response_body: (await resp.text()).substring(0, 1000),
        delivered_at: resp.ok ? new Date().toISOString() : null,
        attempts: 1,
      }).eq("id", evt.id);
    } catch (err) {
      await supabase.from("webhook_events").update({
        status: "failed",
        response_body: err instanceof Error ? err.message : "Unknown error",
        attempts: 1,
      }).eq("id", evt?.id);
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // --- Auth: API Key ---
    const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key") || "";
    const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key. Use Authorization: Bearer {key} or X-API-Key header." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyInfo = await validateApiKey(apiKey, supabase);
    if (!keyInfo) {
      return new Response(JSON.stringify({ error: "Invalid or revoked API key." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("Authenticated", { userId: keyInfo.userId, isGlobal: keyInfo.isGlobal });

    // --- Parse multipart form data ---
    const formData = await req.formData();

    const videoFile = formData.get("video_file") as File | null;
    const seriesName = formData.get("series_name") as string | null;
    const episodeNumber = parseInt(formData.get("episode_number") as string || "1", 10);
    const segmentNumber = formData.get("segment_number") ? parseInt(formData.get("segment_number") as string, 10) : null;
    const title = (formData.get("title") as string) || `Episode ${episodeNumber}`;
    const description = (formData.get("description") as string) || null;
    const tagsRaw = formData.get("tags") as string | null;
    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];
    const publish = (formData.get("publish") as string) === "true";
    const thumbnailFile = formData.get("thumbnail_override") as File | null;
    const creatorId = (formData.get("creator_id") as string) || keyInfo.userId;

    if (!videoFile) {
      return new Response(JSON.stringify({ error: "video_file is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!seriesName) {
      return new Response(JSON.stringify({ error: "series_name is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!creatorId) {
      return new Response(JSON.stringify({ error: "creator_id is required for global API keys." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("Parsed input", { seriesName, episodeNumber, segmentNumber, title, publish, hasVideo: true, hasThumbnail: !!thumbnailFile });

    // --- Find or create series ---
    let seriesId: string;
    const { data: existingSeries } = await supabase
      .from("series")
      .select("id")
      .eq("creator_id", creatorId)
      .ilike("title", seriesName)
      .limit(1)
      .single();

    if (existingSeries) {
      seriesId = existingSeries.id;
      log("Found existing series", { seriesId });
    } else {
      const genre = tags.length > 0 ? tags[0] : null;
      const { data: newSeries, error: seriesErr } = await supabase
        .from("series")
        .insert({
          creator_id: creatorId,
          title: seriesName,
          genre,
          status: publish ? "published" : "draft",
        })
        .select("id")
        .single();

      if (seriesErr) throw new Error(`Failed to create series: ${seriesErr.message}`);
      seriesId = newSeries.id;
      log("Created new series", { seriesId });
    }

    // --- Upload video to Supabase Storage ---
    const ext = videoFile.name.split(".").pop() || "mp4";
    const storagePath = `episodes/${creatorId}/${seriesId}/${crypto.randomUUID()}.${ext}`;
    const videoBuffer = await videoFile.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from("media")
      .upload(storagePath, videoBuffer, { contentType: videoFile.type || "video/mp4" });

    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);
    log("Video uploaded to storage", { storagePath });

    // --- Create video_asset entry ---
    const { data: videoAsset, error: vaErr } = await supabase
      .from("video_assets")
      .insert({
        creator_id: creatorId,
        storage_path: storagePath,
        original_filename: videoFile.name,
        file_size_bytes: videoFile.size,
        mime_type: videoFile.type || "video/mp4",
        stream_status: "pending",
      })
      .select("id")
      .single();

    if (vaErr) throw new Error(`video_assets insert failed: ${vaErr.message}`);
    log("Video asset created", { videoAssetId: videoAsset.id });

    // --- Upload thumbnail if provided ---
    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const thumbExt = thumbnailFile.name.split(".").pop() || "jpg";
      const thumbPath = `thumbnails/${creatorId}/${seriesId}/${crypto.randomUUID()}.${thumbExt}`;
      const thumbBuffer = await thumbnailFile.arrayBuffer();

      const { error: thumbErr } = await supabase.storage
        .from("media")
        .upload(thumbPath, thumbBuffer, { contentType: thumbnailFile.type || "image/jpeg" });

      if (!thumbErr) {
        const { data: thumbUrl } = supabase.storage.from("media").getPublicUrl(thumbPath);
        thumbnailUrl = thumbUrl.publicUrl;
        log("Thumbnail uploaded", { thumbnailUrl });
      }
    }

    // --- Create episode entry ---
    const { data: episode, error: epErr } = await supabase
      .from("episodes")
      .insert({
        series_id: seriesId,
        creator_id: creatorId,
        episode_number: episodeNumber,
        segment_number: segmentNumber,
        title,
        description,
        status: publish ? "published" : "draft",
        video_asset_id: videoAsset.id,
        thumbnail_url: thumbnailUrl,
      })
      .select("id, title, status, episode_number, segment_number")
      .single();

    if (epErr) throw new Error(`Episode insert failed: ${epErr.message}`);
    log("Episode created", { episodeId: episode.id });

    // --- Trigger Cloudflare Stream processing ---
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath);
    const videoUrl = urlData.publicUrl;

    try {
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
            meta: { videoAssetId: videoAsset.id, episodeId: episode.id, source: "ryl-api" },
            requireSignedURLs: false,
          }),
        }
      );

      if (cfResponse.ok) {
        const cfData = await cfResponse.json();
        const streamId = cfData.result?.uid;
        if (streamId) {
          await supabase.from("video_assets").update({
            stream_id: streamId,
            stream_status: "processing",
          }).eq("id", videoAsset.id);
          log("Cloudflare Stream processing started", { streamId });

          // If no thumbnail was uploaded, use Cloudflare Stream thumbnail
          if (!thumbnailUrl) {
            thumbnailUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${streamId}/thumbnails/thumbnail.jpg?time=3s`;
            await supabase.from("episodes").update({ thumbnail_url: thumbnailUrl }).eq("id", episode.id);
          }
        }
      } else {
        const errText = await cfResponse.text();
        log("Cloudflare Stream error (non-blocking)", { error: errText });
        await supabase.from("video_assets").update({ stream_status: "error" }).eq("id", videoAsset.id);
      }
    } catch (cfErr) {
      log("Cloudflare Stream call failed (non-blocking)", { error: cfErr instanceof Error ? cfErr.message : "unknown" });
    }

    // --- Fire webhooks ---
    const webhookPayload = {
      episode_id: episode.id,
      series_id: seriesId,
      series: seriesName,
      episode: episodeNumber,
      segment: segmentNumber,
      title,
      status: episode.status,
    };

    // Fire upload event (async, don't block response)
    fireWebhooks(supabase, keyInfo.userId, "episode_uploaded", webhookPayload).catch(e =>
      log("Webhook fire error", { error: e.message })
    );

    if (publish) {
      fireWebhooks(supabase, keyInfo.userId, "episode_published", webhookPayload).catch(e =>
        log("Webhook fire error", { error: e.message })
      );
    }

    // --- Response ---
    return new Response(JSON.stringify({
      status: "success",
      episode_id: episode.id,
      series_id: seriesId,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      episode_number: episodeNumber,
      segment_number: segmentNumber,
      published: publish,
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    log("ERROR", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
