import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user token to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Claims error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminUserId = claimsData.claims.sub;
    console.log('Admin user ID:', adminUserId);

    // Create service role client for privileged operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const { data: adminRole, error: roleError } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUserId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !adminRole) {
      console.error('Not admin:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { applicationId, action, rejectionReason } = await req.json();

    if (!applicationId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing applicationId or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "approve" or "reject"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the application
    const { data: application, error: appError } = await serviceClient
      .from('producer_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('Application not found:', appError);
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (application.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Application has already been processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const applicantUserId = application.user_id;

    if (action === 'approve') {
      // Update application status
      const { error: updateError } = await serviceClient
        .from('producer_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminUserId,
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Add verified_producer role
      const { error: roleInsertError } = await serviceClient
        .from('user_roles')
        .insert({
          user_id: applicantUserId,
          role: 'verified_producer',
        });

      if (roleInsertError) {
        console.error('Role insert error:', roleInsertError);
        // If role already exists, that's okay
        if (!roleInsertError.message.includes('duplicate')) {
          throw roleInsertError;
        }
      }

      // Update profile with company name if provided
      if (application.company_name) {
        await serviceClient
          .from('profiles')
          .update({ company_name: application.company_name })
          .eq('user_id', applicantUserId);
      }

      console.log(`Application ${applicationId} approved, user ${applicantUserId} is now verified_producer`);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Application approved' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Reject application
      const { error: updateError } = await serviceClient
        .from('producer_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminUserId,
          rejection_reason: rejectionReason || null,
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log(`Application ${applicationId} rejected`);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Application rejected' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in approve-producer:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
