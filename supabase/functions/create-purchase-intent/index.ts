import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const logs: string[] = [];
  const logStep = (step: string, details?: Record<string, unknown>) => {
    const msg = details ? `${step}: ${JSON.stringify(details)}` : step;
    logs.push(msg);
    console.log(msg);
  };

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  try {
    logStep("create-purchase-intent: Start");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for service operations
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      logStep("ERROR: Invalid token", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { productId, quantity = 1, context } = await req.json();

    if (!productId) {
      logStep("ERROR: Missing productId");
      return new Response(
        JSON.stringify({ error: "productId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Request parsed", { productId, quantity });

    // Get product details for price
    const { data: product, error: productError } = await supabaseAdmin
      .from("shopable_products")
      .select("id, price_cents, currency")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      logStep("ERROR: Product not found", { productId, error: productError?.message });
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Product found", { priceCents: product.price_cents });

    const totalCents = product.price_cents * quantity;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min expiry

    // Create purchase_intent
    const { data: intent, error: intentError } = await supabaseAdmin
      .from("purchase_intents")
      .insert({
        user_id: user.id,
        total_cents: totalCents,
        currency: product.currency || "EUR",
        status: "created",
        expires_at: expiresAt,
      })
      .select("id, status, total_cents, currency, expires_at, created_at")
      .single();

    if (intentError || !intent) {
      logStep("ERROR: Failed to create intent", { error: intentError?.message });
      return new Response(
        JSON.stringify({ error: "Failed to create purchase intent" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Intent created", { intentId: intent.id });

    // Create purchase_item
    const { error: itemError } = await supabaseAdmin
      .from("purchase_items")
      .insert({
        purchase_intent_id: intent.id,
        product_id: productId,
        quantity,
        unit_price_cents: product.price_cents,
        context: context || null,
      });

    if (itemError) {
      logStep("ERROR: Failed to create item", { error: itemError.message });
      // Rollback intent
      await supabaseAdmin.from("purchase_intents").delete().eq("id", intent.id);
      return new Response(
        JSON.stringify({ error: "Failed to create purchase item" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Item created");

    // Create purchase_event
    const { error: eventError } = await supabaseAdmin
      .from("purchase_events")
      .insert({
        purchase_intent_id: intent.id,
        event_type: "intent_created",
        to_status: "created",
        metadata: { productId, quantity, source: "hotspot_click" },
      });

    if (eventError) {
      logStep("WARN: Failed to create event", { error: eventError.message });
      // Non-critical, don't fail the request
    } else {
      logStep("Event created");
    }

    logStep("create-purchase-intent: Success");

    return new Response(
      JSON.stringify({
        success: true,
        intentId: intent.id,
        status: intent.status,
        totalCents: intent.total_cents,
        currency: intent.currency,
        expiresAt: intent.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR: Unexpected", { error: String(error) });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
