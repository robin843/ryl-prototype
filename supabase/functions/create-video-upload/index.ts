import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUploadRequest {
  filename: string;
  contentType: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    const { filename, contentType }: CreateUploadRequest = await req.json();
    
    if (!filename || !contentType) {
      return new Response(
        JSON.stringify({ error: "Missing filename or contentType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique storage path
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${user.id}/videos/${timestamp}_${safeName}`;

    console.log("Creating video asset with path:", storagePath);

    // Create video_asset record in DB
    const { data: asset, error: insertError } = await supabase
      .from("video_assets")
      .insert({
        creator_id: user.id,
        storage_path: storagePath,
        status: "uploaded",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create video asset", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Video asset created:", asset.id);

    // Create signed upload URL for direct browser upload
    // Using service role client to create signed URL
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from("media")
      .createSignedUploadUrl(storagePath);

    if (uploadError) {
      console.error("Upload URL error:", uploadError);
      // Rollback: delete the asset
      await supabase.from("video_assets").delete().eq("id", asset.id);
      return new Response(
        JSON.stringify({ error: "Failed to create upload URL", details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Signed upload URL created");

    // Get public URL for the video
    const { data: publicUrlData } = serviceClient.storage
      .from("media")
      .getPublicUrl(storagePath);

    return new Response(
      JSON.stringify({
        videoAssetId: asset.id,
        uploadUrl: uploadData.signedUrl,
        uploadToken: uploadData.token,
        storagePath: storagePath,
        publicUrl: publicUrlData.publicUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
