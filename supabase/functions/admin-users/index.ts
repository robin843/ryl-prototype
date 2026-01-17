import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[admin-users] Request received, method:", req.method);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[admin-users] No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.log("[admin-users] Failed to get user:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[admin-users] User authenticated:", user.id);

    // Check if user has admin role
    const { data: roleData, error: roleError } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.log("[admin-users] Role check error:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Failed to verify permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!roleData) {
      console.log("[admin-users] User is not admin");
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[admin-users] Admin verified");

    // Create admin client to access auth.users
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Handle POST requests for admin actions
    if (req.method === "POST") {
      const body = await req.json();
      const { action, targetUserId } = body;

      if (!targetUserId) {
        return new Response(
          JSON.stringify({ error: "Target user ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Prevent admin from banning/deleting themselves
      if (targetUserId === user.id) {
        return new Response(
          JSON.stringify({ error: "Cannot perform this action on yourself" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[admin-users] Action:", action, "for user:", targetUserId);

      if (action === "ban") {
        const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
          ban_duration: "876000h", // ~100 years = effectively permanent
        });

        if (error) {
          console.error("[admin-users] Ban error:", error.message);
          return new Response(
            JSON.stringify({ error: "Failed to ban user" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("[admin-users] User banned:", targetUserId);
        return new Response(
          JSON.stringify({ success: true, message: "User banned" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === "unban") {
        const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
          ban_duration: "none",
        });

        if (error) {
          console.error("[admin-users] Unban error:", error.message);
          return new Response(
            JSON.stringify({ error: "Failed to unban user" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("[admin-users] User unbanned:", targetUserId);
        return new Response(
          JSON.stringify({ success: true, message: "User unbanned" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === "delete") {
        // Delete related data first
        const tablesToClean = [
          "saved_products",
          "saved_series",
          "user_interests",
          "comments",
          "comment_likes",
          "usage_tracking",
          "watch_history",
          "subscriptions",
          "profiles",
          "user_roles",
        ];

        for (const table of tablesToClean) {
          await adminClient.from(table).delete().eq("user_id", targetUserId);
        }

        // Delete the user from auth
        const { error } = await adminClient.auth.admin.deleteUser(targetUserId);

        if (error) {
          console.error("[admin-users] Delete error:", error.message);
          return new Response(
            JSON.stringify({ error: "Failed to delete user" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("[admin-users] User deleted:", targetUserId);
        return new Response(
          JSON.stringify({ success: true, message: "User deleted" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET request - fetch all users with emails and ban status
    console.log("[admin-users] Fetching users");

    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) {
      console.log("[admin-users] Failed to fetch auth users:", authError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map to email and ban status
    const emailMap: Record<string, string> = {};
    const bannedMap: Record<string, boolean> = {};
    
    authData.users.forEach((u) => {
      if (u.email) {
        emailMap[u.id] = u.email;
      }
      // Check if user is banned
      bannedMap[u.id] = u.banned_until ? new Date(u.banned_until) > new Date() : false;
    });

    console.log("[admin-users] Returning", Object.keys(emailMap).length, "user emails");

    return new Response(
      JSON.stringify({ emails: emailMap, banned: bannedMap }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[admin-users] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
