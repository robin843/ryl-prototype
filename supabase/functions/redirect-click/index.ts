import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Redirect Endpoint: /r/:click_id
 * 
 * Looks up the stored final_redirect_url for a click_id
 * and issues a 302 redirect to the brand URL.
 * 
 * Benefits:
 * - Click is guaranteed logged before redirect
 * - Single source of truth for redirects
 * - Enables future fraud filters, TTL, retries
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const url = new URL(req.url);
    // Extract click_id from query param (edge functions don't support path params)
    const clickId = url.searchParams.get("id");

    if (!clickId) {
      return new Response("Missing click ID", { status: 400 });
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clickId)) {
      return new Response("Invalid click ID", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("hotspot_clicks")
      .select("final_redirect_url")
      .eq("id", clickId)
      .single();

    if (error || !data?.final_redirect_url) {
      console.error("[redirect-click] Not found:", clickId, error?.message);
      // Fallback to homepage or a generic page
      return new Response(null, {
        status: 302,
        headers: { Location: "https://ryl.app" },
      });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: data.final_redirect_url },
    });
  } catch (err) {
    console.error("[redirect-click] Error:", (err as Error).message);
    return new Response("Internal error", { status: 500 });
  }
});
