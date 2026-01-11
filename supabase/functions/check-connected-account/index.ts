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
    console.log(`[CHECK-CONNECTED-ACCOUNT] ${msg}`);
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

    // Get profile with stripe_account_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_account_id, stripe_account_status, stripe_onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      logStep("ERROR: Profile not found", { error: profileError.message });
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no stripe account, return early
    if (!profile.stripe_account_id) {
      logStep("No Stripe account found");
      return new Response(
        JSON.stringify({
          success: true,
          hasAccount: false,
          status: "none",
          onboardingCompleted: false,
          payoutsEnabled: false,
          chargesEnabled: false,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Profile has Stripe account", { accountId: profile.stripe_account_id });

    // Initialize Stripe and retrieve account
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    logStep("Stripe account retrieved", {
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });

    // Determine status
    let newStatus = profile.stripe_account_status;
    let onboardingCompleted = profile.stripe_onboarding_completed;

    if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
      newStatus = "verified";
      onboardingCompleted = true;
    } else if (account.details_submitted) {
      newStatus = "restricted"; // Details submitted but not fully enabled
    } else {
      newStatus = "pending";
    }

    // Update profile if status changed
    if (newStatus !== profile.stripe_account_status || onboardingCompleted !== profile.stripe_onboarding_completed) {
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          stripe_account_status: newStatus,
          stripe_onboarding_completed: onboardingCompleted,
        })
        .eq("user_id", user.id);

      if (updateError) {
        logStep("WARN: Failed to update profile status", { error: updateError.message });
      } else {
        logStep("Profile status updated", { newStatus, onboardingCompleted });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        hasAccount: true,
        accountId: profile.stripe_account_id,
        status: newStatus,
        onboardingCompleted,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
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
