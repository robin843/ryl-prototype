import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` | ${JSON.stringify(details)}` : "";
  console.log(`[assign-hotspot-variant] ${step}${detailsStr}`);
};

/**
 * Deterministic A/B variant assignment.
 *
 * Algorithm:
 *   hash = djb2(userId + hotspotId)
 *   bucket = hash % totalWeight
 *   variant = first variant where cumulative weight > bucket
 *
 * This ensures the same user always sees the same variant for a given hotspot,
 * without any server-side state storage.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  const blocked = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (blocked) return blocked;

  try {
    const { hotspot_id, user_id, session_id } = await req.json();
    logStep("Request received", { hotspot_id, user_id, session_id });

    if (!hotspot_id) {
      return new Response(
        JSON.stringify({ error: "hotspot_id is required" }),
        { headers: { ...headers, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Identifier: prefer user_id, fall back to session_id
    const identifier = user_id || session_id;
    if (!identifier) {
      return new Response(
        JSON.stringify({ error: "user_id or session_id is required" }),
        { headers: { ...headers, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch variants for this hotspot
    const { data: variants, error: variantsError } = await supabase
      .from("hotspot_variants")
      .select("id, variant_name, position_x, position_y, weight")
      .eq("hotspot_id", hotspot_id)
      .order("created_at", { ascending: true });

    if (variantsError) {
      logStep("DB error fetching variants", { error: variantsError.message });
      return new Response(
        JSON.stringify({ error: "Failed to fetch variants" }),
        { headers: { ...headers, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // No variants → return null (use default hotspot position)
    if (!variants || variants.length === 0) {
      logStep("No variants found, using default position");
      return new Response(
        JSON.stringify({ variant: null }),
        { headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Deterministic assignment via hash
    const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
    const hash = djb2Hash(`${identifier}:${hotspot_id}`);
    const bucket = hash % totalWeight;

    let cumulative = 0;
    let assigned = variants[0];
    for (const v of variants) {
      cumulative += v.weight || 1;
      if (bucket < cumulative) {
        assigned = v;
        break;
      }
    }

    logStep("Variant assigned", {
      variant_id: assigned.id,
      variant_name: assigned.variant_name,
      bucket,
      totalWeight,
    });

    return new Response(
      JSON.stringify({
        variant: {
          id: assigned.id,
          variant_name: assigned.variant_name,
          position_x: assigned.position_x,
          position_y: assigned.position_y,
        },
      }),
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (err) {
    logStep("Unexpected error", { error: String(err) });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...headers, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
