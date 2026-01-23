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

// Handle charge.refunded events for Regret-Signal tracking
async function handleChargeRefunded(event: Stripe.Event, stripe: Stripe): Promise<Response> {
  const charge = event.data.object as Stripe.Charge;
  logStep("Processing charge.refunded", { chargeId: charge.id, paymentIntent: charge.payment_intent });

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Get the payment intent to find metadata
    const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) {
      logStep("WARN: No payment_intent on charge, skipping refund tracking");
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the payment intent from Stripe to get metadata
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const purchaseIntentId = paymentIntent.metadata?.purchase_intent_id;

    if (!purchaseIntentId) {
      logStep("WARN: No purchase_intent_id in payment intent metadata");
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the original purchase intent
    const { data: intent, error: intentError } = await supabaseAdmin
      .from("purchase_intents")
      .select("id, user_id, product_id, creator_id, total_cents")
      .eq("id", purchaseIntentId)
      .single();

    if (intentError || !intent) {
      logStep("WARN: Purchase intent not found for refund", { purchaseIntentId, error: intentError?.message });
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate refund amount (could be partial)
    const refundAmountCents = charge.amount_refunded;
    const isFullRefund = refundAmountCents >= (intent.total_cents || 0);

    // Map Stripe refund reason to our enum
    let refundReason = "unknown";
    if (charge.refunds?.data?.[0]?.reason) {
      const stripeReason = charge.refunds.data[0].reason;
      if (stripeReason === "duplicate") refundReason = "duplicate";
      else if (stripeReason === "fraudulent") refundReason = "fraudulent";
      else if (stripeReason === "requested_by_customer") refundReason = "customer_request";
    }

    // Insert into purchase_returns for Regret-Signal tracking
    const { error: returnError } = await supabaseAdmin
      .from("purchase_returns")
      .insert({
        purchase_intent_id: purchaseIntentId,
        user_id: intent.user_id,
        creator_id: intent.creator_id,
        product_id: intent.product_id,
        refund_amount_cents: refundAmountCents,
        reason: refundReason,
        stripe_refund_id: charge.refunds?.data?.[0]?.id || null,
      });

    if (returnError) {
      logStep("ERROR: Failed to insert purchase_return", { error: returnError.message });
      // Don't fail the webhook, just log
    } else {
      logStep("Refund tracked in purchase_returns", {
        purchaseIntentId,
        refundAmountCents,
        refundReason,
        isFullRefund,
      });
    }

    // Create purchase_event for refund
    await supabaseAdmin
      .from("purchase_events")
      .insert({
        purchase_intent_id: purchaseIntentId,
        event_type: "refund_processed",
        from_status: "completed",
        to_status: "refunded",
        metadata: {
          stripe_charge_id: charge.id,
          refund_amount_cents: refundAmountCents,
          refund_reason: refundReason,
          is_full_refund: isFullRefund,
        },
      });

    logStep("Refund event created");

    return new Response(
      JSON.stringify({ received: true, refund_tracked: true, purchase_intent_id: purchaseIntentId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR: Refund processing failed", { error: String(error) });
    return new Response(`Refund processing error: ${error}`, { status: 500 });
  }
}

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

    // Handle different event types
    if (event.type === "charge.refunded") {
      return await handleChargeRefunded(event, stripe);
    }

    // Only handle checkout.session.completed for the rest
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

    // Calculate referral commission if applicable
    const producer_id = session.metadata?.producer_id;
    if (producer_id && session.amount_total) {
      logStep("Triggering referral commission calculation", { producer_id });
      
      try {
        // Call the commission calculation function
        const commissionResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/calculate-referral-commission`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              creator_id: producer_id,
              purchase_intent_id: purchase_intent_id,
              sale_amount_cents: session.amount_total,
            }),
          }
        );
        
        const commissionResult = await commissionResponse.json();
        logStep("Commission calculation result", commissionResult);
      } catch (commissionError) {
        logStep("WARN: Commission calculation failed", { error: String(commissionError) });
        // Non-critical, continue
      }
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
