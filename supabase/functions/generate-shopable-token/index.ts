import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SHOPABLE_JWT_SECRET = Deno.env.get("SHOPABLE_JWT_SECRET")!;

// Token expires in 5 minutes (short-lived for security)
const TOKEN_EXPIRY_SECONDS = 5 * 60;

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[generate-shopable-token] ${step}`, details ? JSON.stringify(details) : "");
}

// Base64URL encode helper
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Sign JWT with HS256
async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Header
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  
  // Payload with timestamps
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS
  };
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));
  
  // Signature
  const signatureInput = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signatureInput));
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

interface TokenRequest {
  episode_id: string;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logStep("ERROR: Missing auth header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      logStep("ERROR: Invalid auth", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body = await req.json() as TokenRequest;
    const { episode_id } = body;

    if (!episode_id) {
      return new Response(JSON.stringify({ error: "episode_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify user owns this episode (is producer of the series)
    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select(`
        id,
        video_asset_id,
        hls_url,
        video_url,
        series!inner (
          id,
          creator_id
        )
      `)
      .eq("id", episode_id)
      .single();

    if (episodeError || !episode) {
      logStep("ERROR: Episode not found", { error: episodeError?.message });
      return new Response(JSON.stringify({ error: "Episode not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check ownership - series is an array from inner join
    const seriesData = episode.series as unknown as Array<{ id: string; creator_id: string }>;
    const series = seriesData?.[0];
    
    if (!series || series.creator_id !== user.id) {
      logStep("ERROR: Not owner", { creatorId: series?.creator_id, userId: user.id });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get video_id: prefer video_asset's stream_id, fallback to video_asset_id
    let videoId: string | null = null;

    if (episode.video_asset_id) {
      // Fetch stream_id from video_assets
      const { data: videoAsset } = await supabase
        .from("video_assets")
        .select("stream_id")
        .eq("id", episode.video_asset_id)
        .single();

      if (videoAsset?.stream_id) {
        videoId = videoAsset.stream_id;
        logStep("Using Cloudflare stream_id", { streamId: videoId });
      } else {
        videoId = episode.video_asset_id;
        logStep("Using video_asset_id as fallback", { assetId: videoId });
      }
    }

    if (!videoId) {
      return new Response(JSON.stringify({ error: "No video associated with this episode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Generate JWT for Shopable
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: "producer",
      source: "ryl",
      video_id: videoId
    };

    const token = await signJWT(jwtPayload, SHOPABLE_JWT_SECRET);
    logStep("Token generated", { videoId, expiresIn: TOKEN_EXPIRY_SECONDS });

    // Build deeplink URL
    const deeplinkUrl = `https://mdnhzhbfvnbowgklbvyf.supabase.co/functions/v1/deeplink-sso/deeplink/editor?token=${encodeURIComponent(token)}&source=ryl`;

    return new Response(JSON.stringify({
      success: true,
      deeplink_url: deeplinkUrl,
      expires_in: TOKEN_EXPIRY_SECONDS
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    logStep("ERROR: Unexpected error", { error: String(err) });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
