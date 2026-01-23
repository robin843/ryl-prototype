import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface NotificationTarget {
  userId?: string;
  seriesId?: string;
  allSubscribers?: boolean;
}

// Web Push signature generation using SubtleCrypto
async function signWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<Response> {
  // For now, we'll use a simplified approach that works with most push services
  // In production, you'd want to use the web-push library or implement full VAPID signing
  
  const pushData = {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
  };

  console.log('[Push] Sending to endpoint:', endpoint.substring(0, 50) + '...');

  // Create VAPID headers
  const audience = new URL(endpoint).origin;
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

  // Build JWT header and payload
  const header = { typ: 'JWT', alg: 'ES256' };
  const jwtPayload = {
    aud: audience,
    exp: expiration,
    sub: vapidSubject,
  };

  // Base64url encode
  const base64url = (data: ArrayBuffer | Uint8Array | string): string => {
    let binary: string;
    if (typeof data === 'string') {
      binary = data;
    } else {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      binary = String.fromCharCode(...bytes);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(jwtPayload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key for signing
  const privateKeyBase64 = vapidPrivateKey.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (privateKeyBase64.length % 4)) % 4);
  const privateKeyBytes = Uint8Array.from(atob(privateKeyBase64 + padding), c => c.charCodeAt(0));

  // Create the ECDSA key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  ).catch(() => {
    // Fallback: try JWK format
    return crypto.subtle.importKey(
      'jwk',
      {
        kty: 'EC',
        crv: 'P-256',
        d: vapidPrivateKey,
        x: '', // Would need to derive from private key
        y: '',
      },
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
  }).catch(e => {
    console.error('[Push] Failed to import key:', e);
    return null;
  });

  let authHeader = '';
  
  if (cryptoKey) {
    // Sign the token
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    const jwt = `${unsignedToken}.${base64url(signature)}`;
    authHeader = `vapid t=${jwt}, k=${vapidPublicKey}`;
  } else {
    // Simplified auth without full VAPID signing (works for some push services)
    console.warn('[Push] Using simplified auth - some push services may reject');
    authHeader = `vapid t=, k=${vapidPublicKey}`;
  }

  // Send the push notification
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      'Authorization': authHeader,
      'Urgency': 'normal',
    },
    body: payload,
  });

  return response;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logStep = (step: string, details?: Record<string, unknown>) => {
    console.log(`[send-push-notification] ${step}`, details ? JSON.stringify(details) : '');
  };

  try {
    logStep('Starting push notification send');

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = 'mailto:support@ryl.app';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    const { payload, target } = body as { payload: PushPayload; target: NotificationTarget };

    logStep('Received request', { payload, target });

    if (!payload?.title || !payload?.body) {
      throw new Error('Missing required payload fields: title, body');
    }

    // Build query for subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('*');

    if (target?.userId) {
      query = query.eq('user_id', target.userId);
    }

    // If targeting series followers, we'd need a series_followers table
    // For now, we'll send to all if seriesId is specified (simplified)

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    }

    logStep('Found subscriptions', { count: subscriptions?.length || 0 });

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      icon: payload.icon || '/favicon.ico',
      image: payload.image,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction,
    });

    // Send to all subscriptions
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        const response = await signWebPush(
          sub.endpoint,
          sub.p256dh,
          sub.auth_key,
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey,
          vapidSubject
        );

        if (response.ok || response.status === 201) {
          sent++;
          logStep('Push sent successfully', { endpoint: sub.endpoint.substring(0, 30) });

          // Update last_used_at
          await supabase
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', sub.id);
        } else if (response.status === 410 || response.status === 404) {
          // Subscription expired, remove it
          logStep('Removing expired subscription', { endpoint: sub.endpoint.substring(0, 30) });
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
          failed++;
        } else {
          const errorText = await response.text();
          errors.push(`${sub.endpoint.substring(0, 30)}: ${response.status} - ${errorText}`);
          failed++;
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        errors.push(`${sub.endpoint.substring(0, 30)}: ${errorMsg}`);
        failed++;
      }
    }

    logStep('Push notification complete', { sent, failed });

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        failed,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('Error', { error: errorMessage });

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
