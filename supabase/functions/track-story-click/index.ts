import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[track-story-click] ${step}`, details ? JSON.stringify(details) : "");
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  try {
    const { shortCode, conversion } = await req.json();
    
    logStep("Tracking story click", { shortCode, conversion });
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find the share link
    const { data: link, error: findError } = await supabase
      .from("story_share_links")
      .select("*")
      .eq("short_code", shortCode)
      .maybeSingle();
    
    if (findError) throw findError;
    
    if (!link) {
      return new Response(
        JSON.stringify({ error: "Share link not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Update click count or conversion
    const updates: Record<string, number> = { clicks: link.clicks + 1 };
    if (conversion) {
      updates.conversions = link.conversions + 1;
    }
    
    await supabase
      .from("story_share_links")
      .update(updates)
      .eq("id", link.id);
    
    logStep("Click tracked", { linkId: link.id, newClicks: updates.clicks });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        targetUrl: link.target_url,
        episodeId: link.episode_id,
        productId: link.product_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("Error", { error: String(error) });
    return new Response(
      JSON.stringify({ error: "Failed to track story click" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
