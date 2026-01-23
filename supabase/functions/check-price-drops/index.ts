import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[check-price-drops] ${step}`, details ? JSON.stringify(details) : "");
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logStep("Checking for price drops");
    
    // Get saved products with price alerts enabled where current price is lower than saved price
    const { data: priceDrops, error: fetchError } = await supabase
      .from("saved_products")
      .select(`
        id,
        user_id,
        product_id,
        saved_price_cents,
        price_alert_enabled,
        shopable_products!inner (
          id,
          name,
          price_cents
        )
      `)
      .eq("price_alert_enabled", true)
      .not("saved_price_cents", "is", null);
    
    if (fetchError) throw fetchError;
    
    logStep("Found saved products", { count: priceDrops?.length || 0 });
    
    if (!priceDrops || priceDrops.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    let triggersCreated = 0;
    
    for (const saved of priceDrops) {
      const productData = saved.shopable_products as unknown as { id: string; name: string; price_cents: number };
      const savedPrice = saved.saved_price_cents as number;
      const currentPrice = productData.price_cents;
      
      // Check if price dropped by at least 5%
      if (currentPrice < savedPrice) {
        const dropPercent = Math.round(((savedPrice - currentPrice) / savedPrice) * 100);
        
        if (dropPercent >= 5) {
          logStep("Price drop detected", { 
            productId: productData.id, 
            productName: productData.name,
            savedPrice, 
            currentPrice, 
            dropPercent 
          });
          
          // Check if we already sent a notification for this price
          const { data: existing } = await supabase
            .from("notification_triggers")
            .select("id")
            .eq("trigger_type", "price_drop")
            .eq("target_user_id", saved.user_id)
            .eq("reference_id", productData.id)
            .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1);
          
          if (!existing || existing.length === 0) {
            // Create notification trigger
            await supabase
              .from("notification_triggers")
              .insert({
                trigger_type: "price_drop",
                target_user_id: saved.user_id,
                reference_id: productData.id,
                payload: {
                  product_name: productData.name,
                  saved_price_cents: savedPrice,
                  current_price_cents: currentPrice,
                  discount_percent: dropPercent,
                },
              });
            
            triggersCreated++;
          }
        }
      }
    }
    
    logStep("Price drop check complete", { triggersCreated });
    
    return new Response(
      JSON.stringify({ processed: priceDrops.length, triggersCreated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("Error", { error: String(error) });
    return new Response(
      JSON.stringify({ error: "Failed to check price drops" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
