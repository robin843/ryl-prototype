import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";
import { handleError, createErrorResponse, ERROR_MESSAGES } from "../_shared/error-handler.ts";

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
      return createErrorResponse(corsHeaders, ERROR_MESSAGES.AUTH_FAILED, 401);
    }

    // Create admin client for service operations
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      logStep("ERROR: Invalid token", { error: userError?.message });
      return createErrorResponse(corsHeaders, ERROR_MESSAGES.AUTH_INVALID, 401);
    }

    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { purchase_intent_id, promo_code } = await req.json();

    if (!purchase_intent_id) {
      logStep("ERROR: Missing purchase_intent_id");
      return createErrorResponse(corsHeaders, ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }

    logStep("Request parsed", { purchase_intent_id, promo_code: promo_code || "none" });

    // Load purchase_intent and validate
    const { data: intent, error: intentError } = await supabaseAdmin
      .from("purchase_intents")
      .select("*")
      .eq("id", purchase_intent_id)
      .single();

    if (intentError || !intent) {
      logStep("ERROR: Intent not found", { purchase_intent_id, error: intentError?.message });
      return createErrorResponse(corsHeaders, ERROR_MESSAGES.NOT_FOUND, 404);
    }

    // Validate intent belongs to user
    if (intent.user_id !== user.id) {
      logStep("ERROR: Intent belongs to different user", { intentUser: intent.user_id, requestUser: user.id });
      return createErrorResponse(corsHeaders, ERROR_MESSAGES.FORBIDDEN, 403);
    }

    // Validate intent status
    if (intent.status !== "created") {
      logStep("ERROR: Invalid intent status", { status: intent.status });
      return createErrorResponse(corsHeaders, ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }

    logStep("Intent validated", { intentId: intent.id, status: intent.status, totalCents: intent.total_cents });

    // ===== PROMO CODE VALIDATION =====
    let promoCodeDiscount = 0;
    let validatedPromoCode: { id: string; code: string; discount_percent?: number; discount_amount_cents?: number; creator_id: string } | null = null;

    if (promo_code) {
      logStep("Validating promo code", { code: promo_code });

      const { data: promoData, error: promoError } = await supabaseAdmin
        .from("promo_codes")
        .select("*")
        .eq("code", promo_code.toUpperCase())
        .eq("status", "active")
        .single();

      if (promoError || !promoData) {
        logStep("Promo code not found or inactive", { code: promo_code });
        return createErrorResponse(corsHeaders, "Invalid promo code", 400);
      }

      // Check usage limit
      if (promoData.usage_limit && promoData.used_count >= promoData.usage_limit) {
        logStep("Promo code usage limit reached", { code: promo_code, limit: promoData.usage_limit });
        return createErrorResponse(corsHeaders, "Promo code usage limit reached", 400);
      }

      // Check expiration
      if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
        logStep("Promo code expired", { code: promo_code, expires_at: promoData.expires_at });
        return createErrorResponse(corsHeaders, "Promo code has expired", 400);
      }

      // Calculate discount
      if (promoData.discount_percent) {
        promoCodeDiscount = Math.round(intent.total_cents * (promoData.discount_percent / 100));
      } else if (promoData.discount_amount_cents) {
        promoCodeDiscount = Math.min(promoData.discount_amount_cents, intent.total_cents);
      }

      validatedPromoCode = {
        id: promoData.id,
        code: promoData.code,
        discount_percent: promoData.discount_percent,
        discount_amount_cents: promoData.discount_amount_cents,
        creator_id: promoData.creator_id,
      };

      logStep("Promo code validated", { 
        code: promoData.code, 
        discountCents: promoCodeDiscount,
        discountPercent: promoData.discount_percent,
        discountAmountCents: promoData.discount_amount_cents
      });
    }

    // Load purchase_items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("purchase_items")
      .select("*, shopable_products(*)")
      .eq("purchase_intent_id", purchase_intent_id);

    if (itemsError || !items || items.length === 0) {
      logStep("ERROR: No items found", { purchase_intent_id, error: itemsError?.message });
      return createErrorResponse(corsHeaders, ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }

    logStep("Items loaded", { itemCount: items.length });

    // Get producer ID from first item (all items should belong to same producer)
    const producerId = items[0].shopable_products?.creator_id;
    if (!producerId) {
      logStep("ERROR: No producer ID found for products");
      return createErrorResponse(corsHeaders, ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }

    // Load producer's Stripe Connected Account
    const { data: producerProfile, error: producerError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_completed, display_name")
      .eq("user_id", producerId)
      .single();

    if (producerError || !producerProfile) {
      logStep("ERROR: Producer profile not found", { producerId, error: producerError?.message });
      return createErrorResponse(corsHeaders, "Producer not found", 404);
    }

    if (!producerProfile.stripe_account_id || !producerProfile.stripe_onboarding_completed) {
      logStep("ERROR: Producer has no connected Stripe account", { 
        producerId, 
        hasAccountId: !!producerProfile.stripe_account_id,
        onboardingCompleted: producerProfile.stripe_onboarding_completed 
      });
      return createErrorResponse(corsHeaders, "Producer payment setup incomplete", 400);
    }

    logStep("Producer Stripe account loaded", { 
      producerId, 
      stripeAccountId: producerProfile.stripe_account_id 
    });

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

    // Build line_items for Stripe Checkout with promo code discount applied
    const line_items = items.map((item) => {
      // Calculate per-item discount proportionally
      const itemTotal = item.unit_price_cents * item.quantity;
      const itemDiscountRatio = itemTotal / intent.total_cents;
      const itemDiscount = Math.round(promoCodeDiscount * itemDiscountRatio);
      const discountedUnitPrice = Math.max(item.unit_price_cents - Math.round(itemDiscount / item.quantity), 0);

      return {
        price_data: {
          currency: intent.currency.toLowerCase(),
          product_data: {
            name: item.shopable_products?.name || "Product",
            description: item.shopable_products?.brand_name || undefined,
            images: item.shopable_products?.image_url ? [item.shopable_products.image_url] : undefined,
          },
          unit_amount: promoCodeDiscount > 0 ? discountedUnitPrice : item.unit_price_cents,
        },
        quantity: item.quantity,
      };
    });

    logStep("Line items built", { lineItemCount: line_items.length, promoDiscount: promoCodeDiscount });

    // Calculate final total after promo code
    const finalTotalCents = Math.max(intent.total_cents - promoCodeDiscount, 0);

    // Calculate platform fee (15% of FINAL total after discount)
    const PLATFORM_FEE_PERCENT = 0.15;
    const platformFeeCents = Math.round(finalTotalCents * PLATFORM_FEE_PERCENT);
    
    logStep("Revenue split calculated", { 
      originalCents: intent.total_cents,
      promoDiscount: promoCodeDiscount,
      finalTotalCents,
      platformFeeCents,
      producerReceives: finalTotalCents - platformFeeCents,
      feePercent: PLATFORM_FEE_PERCENT * 100
    });

    // Create Stripe Checkout Session with Connect revenue split
    const session = await stripe.checkout.sessions.create({
      // Konditionierte Customer-Logik: Existierende Kunden verknuepfen, neue anlegen
      ...(customerId
        ? { customer: customerId }
        : {
            customer_email: user.email,
            customer_creation: "always",
          }),
      line_items,
      mode: "payment",
      locale: "de",

      // Stripe Connect: Revenue Split
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: producerProfile.stripe_account_id,
        },
      },

      // Lieferadresse erfassen (DE/AT/CH - spaeter erweiterbar)
      shipping_address_collection: {
        allowed_countries: ["DE", "AT", "CH"],
      },

      // Rechnungsadresse verbindlich
      billing_address_collection: "required",

      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/watch`,
      metadata: {
        purchase_intent_id: intent.id,
        user_id: user.id,
        producer_id: producerId,
        platform_fee_cents: String(platformFeeCents),
        promo_code_id: validatedPromoCode?.id || "",
        promo_code: validatedPromoCode?.code || "",
        promo_discount_cents: String(promoCodeDiscount),
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // If promo code was used, increment usage count and log usage
    if (validatedPromoCode) {
      // Increment used_count on promo_codes
      await supabaseAdmin
        .from("promo_codes")
        .update({ used_count: (await supabaseAdmin.from("promo_codes").select("used_count").eq("id", validatedPromoCode.id).single()).data?.used_count + 1 || 1 })
        .eq("id", validatedPromoCode.id);

      // Log promo code usage
      await supabaseAdmin
        .from("promo_code_usages")
        .insert({
          promo_code_id: validatedPromoCode.id,
          purchase_intent_id: intent.id,
          user_id: user.id,
          discount_applied_cents: promoCodeDiscount,
        });

      logStep("Promo code usage logged", { codeId: validatedPromoCode.id, discountCents: promoCodeDiscount });
    }

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
          promo_code: validatedPromoCode?.code || null,
          promo_discount_cents: promoCodeDiscount || null,
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
        promoCodeApplied: validatedPromoCode?.code || null,
        discountCents: promoCodeDiscount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const { userMessage, statusCode } = handleError(
      { functionName: "create-stripe-checkout", error },
      logStep
    );
    return createErrorResponse(corsHeaders, userMessage, statusCode);
  }
});
