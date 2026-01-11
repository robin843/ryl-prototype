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
    console.log(`[CREATE-CONNECTED-ACCOUNT] ${msg}`);
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

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is a verified producer
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "verified_producer")
      .maybeSingle();

    if (!roleData) {
      logStep("ERROR: User is not a verified producer");
      return new Response(
        JSON.stringify({ error: "Only verified producers can create connected accounts" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User is verified producer");

    // Get profile to check for existing stripe_account_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_account_id, stripe_account_status")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      logStep("ERROR: Profile not found", { error: profileError.message });
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Profile loaded", { 
      hasStripeAccount: !!profile.stripe_account_id, 
      status: profile.stripe_account_status 
    });

    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

    let stripeAccountId = profile.stripe_account_id;

    // If no account exists, create a new Express account
    if (!stripeAccountId) {
      logStep("Creating new Express account");

      const account = await stripe.accounts.create({
        type: "express",
        country: "DE",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          producer_id: user.id,
        },
      });

      stripeAccountId = account.id;
      logStep("Express account created", { accountId: stripeAccountId });

      // Save account ID to profile
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          stripe_account_id: stripeAccountId,
          stripe_account_status: "pending",
        })
        .eq("user_id", user.id);

      if (updateError) {
        logStep("ERROR: Failed to save stripe_account_id", { error: updateError.message });
        return new Response(
          JSON.stringify({ error: "Failed to save account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      logStep("Account ID saved to profile");
    } else {
      logStep("Using existing account", { accountId: stripeAccountId });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/studio?stripe_refresh=true`,
      return_url: `${origin}/studio?onboarding=success`,
      type: "account_onboarding",
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(
      JSON.stringify({
        success: true,
        url: accountLink.url,
        accountId: stripeAccountId,
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
