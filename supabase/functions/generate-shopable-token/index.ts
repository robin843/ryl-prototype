import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

// =============================================================================
// CONSTANTS - Centralized to prevent typos and ensure consistency
// =============================================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SHOPABLE_JWT_SECRET = Deno.env.get("SHOPABLE_JWT_SECRET")!;

// JWT Configuration
const TOKEN_EXPIRY_SECONDS = 5 * 60; // 5 minutes - short-lived for security
const JWT_ALGORITHM = "HS256"; // Fixed algorithm - NEVER allow "none"

// Partner Configuration
const SHOPABLE_CONFIG = {
  BASE_URL: "https://shopable-spotlight.lovable.app",
  PARTNER_ID: "ryl.zone",
} as const;

// JWT Claim Constants - must match Shopable's expectations
const JWT_CLAIMS = {
  SOURCE: "ryl",
  ROLE: "producer",
} as const;

// =============================================================================
// LOGGING
// =============================================================================

function logStep(step: string, details?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [generate-shopable-token] ${step}`, details ? JSON.stringify(details) : "");
}

// =============================================================================
// JWT SIGNING (HS256 only - hardcoded for security)
// =============================================================================

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Header - algorithm is HARDCODED, never configurable
  const header = { alg: JWT_ALGORITHM, typ: "JWT" };
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  
  // Payload with timestamps
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS
  };
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));
  
  // Signature using HMAC-SHA256
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

// =============================================================================
// REQUEST TYPES
// =============================================================================

interface TokenRequest {
  episode_id: string;
}

interface EpisodeWithVideo {
  id: string;
  video_asset_id: string | null;
  hls_url: string | null;
  series: {
    id: string;
    creator_id: string;
  };
  video_assets: {
    stream_id: string | null;
    hls_url: string | null;
    status: string | null;
  } | null;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // -------------------------------------------------------------------------
  // STEP 1: CORS Preflight / Origin Validation
  // -------------------------------------------------------------------------
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  // -------------------------------------------------------------------------
  // STEP 2: Method Validation
  // -------------------------------------------------------------------------
  if (req.method !== "POST") {
    logStep("REJECTED: Invalid method", { method: req.method });
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // -----------------------------------------------------------------------
    // STEP 3: Authentication - Verify Bearer Token
    // -----------------------------------------------------------------------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logStep("REJECTED: Missing or malformed auth header");
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
      logStep("REJECTED: Invalid auth token", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const user = userData.user;
    logStep("AUTH_SUCCESS", { userId: user.id });

    // -----------------------------------------------------------------------
    // STEP 4: Parse and Validate Request Body
    // -----------------------------------------------------------------------
    let body: TokenRequest;
    try {
      body = await req.json() as TokenRequest;
    } catch {
      logStep("REJECTED: Invalid JSON body");
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { episode_id } = body;

    if (!episode_id || typeof episode_id !== "string") {
      logStep("REJECTED: Missing or invalid episode_id");
      return new Response(JSON.stringify({ error: "episode_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // -----------------------------------------------------------------------
    // STEP 5: Load Episode + Series + Video Asset in SINGLE QUERY
    // This prevents race conditions between sequential queries
    // -----------------------------------------------------------------------
    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select(`
        id,
        video_asset_id,
        hls_url,
        series!inner (
          id,
          creator_id
        ),
        video_assets (
          stream_id,
          hls_url,
          status
        )
      `)
      .eq("id", episode_id)
      .single();

    if (episodeError || !episode) {
      logStep("REJECTED: Episode not found", { 
        episodeId: episode_id, 
        error: episodeError?.message 
      });
      return new Response(JSON.stringify({ error: "Episode not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Type assertion for joined data
    const episodeData = episode as unknown as EpisodeWithVideo;

    // -----------------------------------------------------------------------
    // STEP 6: Authorization - Verify Ownership
    // -----------------------------------------------------------------------
    if (!episodeData.series || episodeData.series.creator_id !== user.id) {
      logStep("REJECTED: Not episode owner", { 
        episodeId: episode_id,
        creatorId: episodeData.series?.creator_id, 
        userId: user.id 
      });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // -----------------------------------------------------------------------
    // STEP 7: Video Validation - Must have video attached
    // -----------------------------------------------------------------------
    if (!episodeData.video_asset_id) {
      logStep("REJECTED: No video attached", { episodeId: episode_id });
      return new Response(JSON.stringify({ error: "No video associated with this episode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // -----------------------------------------------------------------------
    // STEP 8: Video Readiness Check
    // Ensure video is fully processed before sending to Shopable
    // -----------------------------------------------------------------------
    const videoAsset = episodeData.video_assets;
    const videoStatus = videoAsset?.status;
    
    // Allow 'ready' status or null (legacy videos without status tracking)
    if (videoStatus && videoStatus !== "ready") {
      logStep("REJECTED: Video still processing", { 
        episodeId: episode_id,
        status: videoStatus 
      });
      return new Response(JSON.stringify({ 
        error: "Video wird noch verarbeitet. Bitte warte einen Moment." 
      }), {
        status: 409, // Conflict - resource not ready
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // -----------------------------------------------------------------------
    // STEP 9: Resolve Video ID and HLS URL
    // Priority: video_assets.stream_id > video_asset_id
    // Priority for URL: video_assets.hls_url > episode.hls_url
    // -----------------------------------------------------------------------
    const videoId = videoAsset?.stream_id || episodeData.video_asset_id;
    const hlsUrl = videoAsset?.hls_url || episodeData.hls_url;

    if (!videoId) {
      logStep("REJECTED: Could not resolve video ID", { episodeId: episode_id });
      return new Response(JSON.stringify({ error: "Video resolution failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    logStep("VIDEO_RESOLVED", { 
      videoId,
      hlsUrl: hlsUrl ? "present" : "missing",
      source: videoAsset?.stream_id ? "cloudflare" : "fallback"
    });

    // -----------------------------------------------------------------------
    // STEP 10: Generate JWT for Shopable
    // -----------------------------------------------------------------------
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: JWT_CLAIMS.ROLE,
      source: JWT_CLAIMS.SOURCE,
      video_id: videoId,
      video_url: hlsUrl,
      external_id: episode_id,
    };

    const token = await signJWT(jwtPayload, SHOPABLE_JWT_SECRET);
    
    logStep("TOKEN_GENERATED", { 
      videoId, 
      expiresIn: TOKEN_EXPIRY_SECONDS,
      hasHlsUrl: !!hlsUrl
    });

    // -----------------------------------------------------------------------
    // STEP 11: Build Deeplink URL
    // Include query params for backward compatibility with Shopable's
    // query-param-based loading logic
    // -----------------------------------------------------------------------
    const params = new URLSearchParams({
      token,
      source: JWT_CLAIMS.SOURCE,
      video_id: videoId,
      external_id: episode_id,
    });

    if (hlsUrl) {
      params.set("video_url", hlsUrl);
    }

    const deeplinkUrl = `${SHOPABLE_CONFIG.BASE_URL}/?${params.toString()}`;

    logStep("DEEPLINK_CREATED", { 
      episodeId: episode_id,
      userId: user.id 
    });

    // -----------------------------------------------------------------------
    // STEP 12: Return Success Response
    // -----------------------------------------------------------------------
    return new Response(JSON.stringify({
      success: true,
      deeplink_url: deeplinkUrl,
      expires_in: TOKEN_EXPIRY_SECONDS,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    // -------------------------------------------------------------------------
    // CATCH-ALL: Unexpected errors - log details, return generic message
    // -------------------------------------------------------------------------
    logStep("UNEXPECTED_ERROR", { 
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
