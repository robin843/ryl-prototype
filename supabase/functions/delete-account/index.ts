import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for deletion
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Delete user data from tables (cascading will handle most)
    // Delete saved products
    await supabaseAdmin
      .from("saved_products")
      .delete()
      .eq("user_id", user.id);

    // Delete user interests
    await supabaseAdmin
      .from("user_interests")
      .delete()
      .eq("user_id", user.id);

    // Delete comments
    await supabaseAdmin
      .from("comments")
      .delete()
      .eq("user_id", user.id);

    // Delete comment likes
    await supabaseAdmin
      .from("comment_likes")
      .delete()
      .eq("user_id", user.id);

    // Delete usage tracking
    await supabaseAdmin
      .from("usage_tracking")
      .delete()
      .eq("user_id", user.id);

    // Delete subscriptions
    await supabaseAdmin
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id);

    // Delete profile
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", user.id);

    // Delete user roles
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", user.id);

    // Finally, delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Account scheduled for deletion" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } }
    );
  }
});
