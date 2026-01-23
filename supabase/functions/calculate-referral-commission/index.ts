import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const COMMISSION_RATE = 0.05; // 5% commission
const REFERRAL_DURATION_MONTHS = 12;

const logStep = (step: string, details?: unknown) => {
  const msg = details ? `${step}: ${JSON.stringify(details)}` : step;
  console.log(`[REFERRAL-COMMISSION] ${msg}`);
};

interface CalculateCommissionRequest {
  creator_id: string;
  purchase_intent_id: string;
  sale_amount_cents: number;
}

Deno.serve(async (req) => {
  // Only allow POST from internal calls (webhook)
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    logStep("Commission calculation triggered");

    const body: CalculateCommissionRequest = await req.json();
    const { creator_id, purchase_intent_id, sale_amount_cents } = body;

    if (!creator_id || !purchase_intent_id || !sale_amount_cents) {
      logStep("ERROR: Missing required fields", body);
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    logStep("Processing sale", { creator_id, purchase_intent_id, sale_amount_cents });

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if this creator was referred by someone
    const { data: referral, error: referralError } = await supabaseAdmin
      .from("creator_referrals")
      .select("*")
      .eq("referred_id", creator_id)
      .eq("status", "active")
      .maybeSingle();

    if (referralError) {
      logStep("ERROR: Failed to check referral", { error: referralError.message });
      return new Response(
        JSON.stringify({ error: "Failed to check referral" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!referral) {
      logStep("No active referral found for creator", { creator_id });
      return new Response(
        JSON.stringify({ message: "No referral found", commission_created: false }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if referral has expired
    const expiresAt = new Date(referral.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      logStep("Referral has expired", { 
        referral_id: referral.id, 
        expires_at: referral.expires_at 
      });

      // Update referral status to expired
      await supabaseAdmin
        .from("creator_referrals")
        .update({ status: "expired" })
        .eq("id", referral.id);

      return new Response(
        JSON.stringify({ message: "Referral expired", commission_created: false }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate commission (5%)
    const commission_cents = Math.round(sale_amount_cents * COMMISSION_RATE);

    logStep("Calculating commission", {
      referral_id: referral.id,
      referrer_id: referral.referrer_id,
      sale_amount_cents,
      commission_rate: COMMISSION_RATE,
      commission_cents,
    });

    // Check for duplicate commission (same purchase_intent_id)
    const { data: existingCommission } = await supabaseAdmin
      .from("referral_commissions")
      .select("id")
      .eq("purchase_intent_id", purchase_intent_id)
      .maybeSingle();

    if (existingCommission) {
      logStep("Commission already exists for this purchase", { purchase_intent_id });
      return new Response(
        JSON.stringify({ message: "Commission already recorded", commission_created: false }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create commission record
    const { error: insertError } = await supabaseAdmin
      .from("referral_commissions")
      .insert({
        referral_id: referral.id,
        purchase_intent_id,
        sale_amount_cents,
        commission_cents,
        status: "pending",
      });

    if (insertError) {
      logStep("ERROR: Failed to create commission", { error: insertError.message });
      return new Response(
        JSON.stringify({ error: "Failed to create commission" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    logStep("Commission created successfully", {
      referral_id: referral.id,
      referrer_id: referral.referrer_id,
      commission_cents,
    });

    return new Response(
      JSON.stringify({
        success: true,
        commission_created: true,
        referrer_id: referral.referrer_id,
        commission_cents,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR: Unexpected", { error: String(error) });
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
