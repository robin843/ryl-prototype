import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[track-hotspot-click] ${step}`, details ? JSON.stringify(details) : "");
};

/**
 * Track Hotspot Click & Build UTM Redirect URL
 * 
 * Flow:
 * 1. Receive hotspot click data
 * 2. Look up hotspot + product + episode context
 * 3. Generate click_id (UUID)
 * 4. Log click to hotspot_clicks table
 * 5. Build final redirect URL with UTMs + ryl_click_id + ryl_hid
 * 6. Return redirect URL to client
 */
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  // CORS preflight
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { hotspot_id, episode_id } = body;

    if (!hotspot_id || !episode_id) {
      return new Response(
        JSON.stringify({ error: "hotspot_id and episode_id required" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    logStep("Processing click", { hotspot_id, episode_id });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get auth user if available (optional)
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id ?? null;
    }

    // Fetch hotspot with product and episode context
    const { data: hotspot, error: hotspotError } = await supabase
      .from("episode_hotspots")
      .select(`
        id,
        product_id,
        episode_id,
        shopable_products (
          id,
          product_url,
          creator_id,
          name,
          brand_name
        )
      `)
      .eq("id", hotspot_id)
      .eq("episode_id", episode_id)
      .single();

    if (hotspotError || !hotspot) {
      logStep("Hotspot not found", { hotspot_id, error: hotspotError?.message });
      return new Response(
        JSON.stringify({ error: "Hotspot not found" }),
        { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const product = hotspot.shopable_products as {
      id: string;
      product_url: string | null;
      creator_id: string;
      name: string;
      brand_name: string;
    } | null;

    if (!product?.product_url) {
      return new Response(
        JSON.stringify({ error: "No destination URL for this hotspot" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Get episode + series context for UTM params
    const { data: episode } = await supabase
      .from("episodes")
      .select("title, series_id, series(title, creator_id)")
      .eq("id", episode_id)
      .single();

    const creatorId = product.creator_id;
    const seriesTitle = (episode?.series as { title?: string })?.title ?? "unknown";

    // Get creator username for UTM
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("user_id", creatorId)
      .single();

    const creatorSlug = profile?.username || profile?.display_name || creatorId;

    // Build final redirect URL with UTMs
    const destinationUrl = new URL(product.product_url);
    
    // Standard UTMs
    destinationUrl.searchParams.set("utm_source", "ryl");
    destinationUrl.searchParams.set("utm_medium", "hotspot");
    destinationUrl.searchParams.set("utm_campaign", slugify(seriesTitle));
    destinationUrl.searchParams.set("utm_content", slugify(episode?.title ?? episode_id));
    destinationUrl.searchParams.set("utm_term", slugify(creatorSlug));

    // Ryl attribution IDs (hard join keys)
    destinationUrl.searchParams.set("ryl_hid", hotspot_id);

    // Generate click_id
    const clickId = crypto.randomUUID();
    destinationUrl.searchParams.set("ryl_click_id", clickId);

    const finalRedirectUrl = destinationUrl.toString();

    // Build the /r/:click_id redirect URL for the frontend
    const redirectEndpoint = `${Deno.env.get("SUPABASE_URL")}/functions/v1/redirect-click?id=${clickId}`;

    // Hash IP for bot detection / dedup (never store plaintext)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashIp(clientIp);

    // Log click to database
    const { error: insertError } = await supabase
      .from("hotspot_clicks")
      .insert({
        id: clickId,
        hotspot_id,
        episode_id,
        creator_id: creatorId,
        product_id: product.id,
        user_id: userId,
        destination_url: product.product_url,
        final_redirect_url: finalRedirectUrl,
        source: "shopable",
        user_agent: req.headers.get("user-agent"),
        referrer: req.headers.get("referer"),
        ip_hash: ipHash,
        session_id: body.session_id ?? null,
      });

    if (insertError) {
      logStep("Failed to log click", { error: insertError.message });
      // Don't block redirect on logging failure
    }

    logStep("Click tracked", { clickId, redirect: finalRedirectUrl });

    return new Response(
      JSON.stringify({
        click_id: clickId,
        redirect_url: redirectEndpoint,
      }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("Error", { message: (error as Error).message });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
});

/** Slugify a string for UTM parameters */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] || c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

/** Hash IP address with SHA-256 (never store plaintext IPs) */
async function hashIp(ip: string): Promise<string> {
  const salt = "ryl-click-salt-v1";
  const data = new TextEncoder().encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
