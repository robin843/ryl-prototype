import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

function log(step: string, details?: Record<string, unknown>) {
  console.log(`[api-manage-keys] ${step}`, details ? JSON.stringify(details) : "");
}

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "ryl_sk_";
  const randomBytes = new Uint8Array(40);
  crypto.getRandomValues(randomBytes);
  for (const byte of randomBytes) {
    result += chars[byte % chars.length];
  }
  return result;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Authenticate via Supabase JWT (used from the Studio UI)
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: claimsData, error: claimsErr } = await supabaseUser.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub as string;
  const isAdmin = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();

  try {
    // --- GET: List API keys ---
    if (req.method === "GET") {
      const { data: keys, error } = await supabaseAdmin
        .from("api_keys")
        .select("id, name, key_prefix, scopes, is_active, is_global, last_used_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ keys }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- POST: Create API key ---
    if (req.method === "POST") {
      const body = await req.json();
      const name = body.name || "Default";
      const isGlobal = body.is_global === true && isAdmin.data;

      const rawKey = generateApiKey();
      const keyHash = await hashKey(rawKey);
      const keyPrefix = rawKey.substring(0, 12) + "...";

      const { data: newKey, error } = await supabaseAdmin
        .from("api_keys")
        .insert({
          user_id: userId,
          name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          is_global: isGlobal,
          scopes: body.scopes || ["episodes:write", "series:write"],
        })
        .select("id, name, key_prefix, is_global, created_at")
        .single();

      if (error) throw error;

      log("API key created", { keyId: newKey.id, userId });

      // Return the raw key ONLY on creation
      return new Response(JSON.stringify({
        ...newKey,
        api_key: rawKey,
        message: "Save this key — it won't be shown again.",
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- DELETE: Revoke API key ---
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const keyId = url.searchParams.get("id");

      if (!keyId) {
        return new Response(JSON.stringify({ error: "Missing key id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", keyId)
        .eq("user_id", userId);

      if (error) throw error;

      log("API key revoked", { keyId, userId });
      return new Response(JSON.stringify({ status: "revoked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    log("ERROR", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
