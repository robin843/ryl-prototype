import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

Deno.serve(async (req) => {
  const logs: string[] = [];
  const logStep = (step: string, details?: Record<string, unknown>) => {
    const msg = details ? `${step}: ${JSON.stringify(details)}` : step;
    logs.push(msg);
    console.log(`[CREATE-STRIPE-CHECKOUT] ${msg}`);
  };

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  try {
    logStep("Start");

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
    const { purchase_intent_id } = await req.json();

    if (!purchase_intent_id) {
      logStep("ERROR: Missing purchase_intent_id");
      return new Response(
        JSON.stringify({ error: "purchase_intent_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Request parsed", { purchase_intent_id });

    // Load purchase_intent and validate
    const { data: intent, error: intentError } = await supabaseAdmin
      .from("purchase_intents")
      .select("*")
      .eq("id", purchase_intent_id)
      .single();

    if (intentError || !intent) {
      logStep("ERROR: Intent not found", { purchase_intent_id, error: intentError?.message });
      return new Response(
        JSON.stringify({ error: "Purchase intent not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate intent belongs to user
    if (intent.user_id !== user.id) {
      logStep("ERROR: Intent belongs to different user", { intentUser: intent.user_id, requestUser: user.id });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate intent status
    if (intent.status !== "created") {
      logStep("ERROR: Invalid intent status", { status: intent.status });
      return new Response(
        JSON.stringify({ error: `Cannot checkout intent with status: ${intent.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Intent validated", { intentId: intent.id, status: intent.status, totalCents: intent.total_cents });

    // Load purchase_items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("purchase_items")
      .select("*, shopable_products(*)")
      .eq("purchase_intent_id", purchase_intent_id);

    if (itemsError || !items || items.length === 0) {
      logStep("ERROR: No items found", { purchase_intent_id, error: itemsError?.message });
      return new Response(
        JSON.stringify({ error: "No items found for this intent" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Items loaded", { itemCount: items.length });

    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    // Build line_items for Stripe Checkout
    const line_items = items.map((item) => ({
      price_data: {
        currency: intent.currency.toLowerCase(),
        product_data: {
          name: item.shopable_products?.name || "Product",
          description: item.shopable_products?.brand_name || undefined,
          images: item.shopable_products?.image_url ? [item.shopable_products.image_url] : undefined,
        },
        unit_amount: item.unit_price_cents,
      },
      quantity: item.quantity,
    }));

    logStep("Line items built", { lineItemCount: line_items.length });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items,
      mode: "payment",
      locale: "de",
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/watch`,
      metadata: {
        purchase_intent_id: intent.id,
        user_id: user.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Create purchase_event for checkout_started
    const { error: eventError } = await supabaseAdmin
      .from("purchase_events")
      .insert({
        purchase_intent_id: intent.id,
        event_type: "checkout_started",
        from_status: intent.status,
        metadata: {
          stripe_checkout_session_id: session.id,
          stripe_customer_id: customerId || null,
        },
      });

    if (eventError) {
      logStep("WARN: Failed to create checkout_started event", { error: eventError.message });
    } else {
      logStep("checkout_started event created");
    }

    logStep("Success");

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
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
