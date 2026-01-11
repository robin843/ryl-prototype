import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  const msg = details ? `${step}: ${JSON.stringify(details)}` : step;
  console.log(`[STRIPE-WEBHOOK] ${msg}`);
};

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    logStep("Webhook received");

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No Stripe signature");
      return new Response("No signature", { status: 400 });
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });
    
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logStep("ERROR: Invalid signature", { error: String(err) });
      return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    // Only handle checkout.session.completed
    if (event.type !== "checkout.session.completed") {
      logStep("Ignoring event type", { type: event.type });
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    logStep("Processing checkout.session.completed", { sessionId: session.id });

    // Revenue Split Logging
    logStep("Revenue split details", {
      producer_id: session.metadata?.producer_id,
      platform_fee_cents: session.metadata?.platform_fee_cents,
      total_amount: session.amount_total,
    });

    // Customer-Details loggen (fuer Fulfillment-Vorbereitung)
    logStep("Customer details", {
      name: session.customer_details?.name,
      email: session.customer_details?.email,
    });

    // Shipping-Details loggen (wenn vorhanden)
    if (session.shipping_details) {
      logStep("Shipping details", {
        name: session.shipping_details.name,
        address: session.shipping_details.address,
      });
      // TODO: Fulfillment - Hier spaeter Versandlogik implementieren
      // Shipping-Daten bleiben in Stripe als Source of Truth
    } else {
      logStep("INFO: No shipping details (possibly digital product)");
    }

    // Get purchase_intent_id from metadata
    const purchase_intent_id = session.metadata?.purchase_intent_id;
    if (!purchase_intent_id) {
      logStep("ERROR: No purchase_intent_id in metadata");
      return new Response("Missing purchase_intent_id in metadata", { status: 400 });
    }

    logStep("Purchase intent ID found", { purchase_intent_id });

    // Create admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load current intent
    const { data: intent, error: intentError } = await supabaseAdmin
      .from("purchase_intents")
      .select("*")
      .eq("id", purchase_intent_id)
      .single();

    if (intentError || !intent) {
      logStep("ERROR: Intent not found", { purchase_intent_id, error: intentError?.message });
      return new Response("Purchase intent not found", { status: 404 });
    }

    const previousStatus = intent.status;
    logStep("Intent loaded", { currentStatus: previousStatus });

    // Update intent to completed
    const { error: updateError } = await supabaseAdmin
      .from("purchase_intents")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchase_intent_id);

    if (updateError) {
      logStep("ERROR: Failed to update intent", { error: updateError.message });
      return new Response("Failed to update intent", { status: 500 });
    }

    logStep("Intent updated to completed");

    // Create purchase_event for payment_completed
    const { error: eventError } = await supabaseAdmin
      .from("purchase_events")
      .insert({
        purchase_intent_id,
        event_type: "payment_completed",
        from_status: previousStatus,
        to_status: "completed",
        metadata: {
          stripe_checkout_session_id: session.id,
          stripe_payment_intent: session.payment_intent,
          amount_total: session.amount_total,
          currency: session.currency,
          // Shipping-Flag fuer Analytics
          has_shipping: !!session.shipping_details,
          shipping_country: session.shipping_details?.address?.country || null,
        },
      });

    if (eventError) {
      logStep("WARN: Failed to create payment_completed event", { error: eventError.message });
    } else {
      logStep("payment_completed event created");
    }

    logStep("Webhook processed successfully");

    return new Response(
      JSON.stringify({ received: true, purchase_intent_id, status: "completed" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR: Unexpected", { error: String(error) });
    return new Response(`Webhook error: ${error}`, { status: 500 });
  }
});
