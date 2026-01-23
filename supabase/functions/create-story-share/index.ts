import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[create-story-share] ${step}`, details ? JSON.stringify(details) : "");
};

// Generate a short code for the share link
function generateShortCode(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  try {
    const { episodeId, productId, creatorId, sharerId, targetUrl } = await req.json();
    
    logStep("Creating story share link", { episodeId, productId, creatorId });
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate unique short code
    let shortCode = generateShortCode();
    let attempts = 0;
    
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("story_share_links")
        .select("id")
        .eq("short_code", shortCode)
        .maybeSingle();
      
      if (!existing) break;
      shortCode = generateShortCode();
      attempts++;
    }
    
    // Create the share link
    const { data, error } = await supabase
      .from("story_share_links")
      .insert({
        short_code: shortCode,
        target_url: targetUrl || `/watch/${episodeId}`,
        episode_id: episodeId,
        product_id: productId || null,
        creator_id: creatorId,
        sharer_id: sharerId || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Generate the full share URL
    const shareUrl = `https://ryl.app/s/${shortCode}`;
    
    logStep("Story share link created", { shortCode, shareUrl });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        shortCode,
        shareUrl,
        link: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("Error", { error: String(error) });
    return new Response(
      JSON.stringify({ error: "Failed to create story share link" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
