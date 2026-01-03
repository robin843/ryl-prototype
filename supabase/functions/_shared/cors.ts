// Shared CORS configuration for all Edge Functions
// Whitelist of allowed origins - update when deploying to production

const ALLOWED_ORIGINS = [
  // Production domains (update these with your actual domains)
  "https://ryl.app",
  "https://www.ryl.app",
  // Lovable preview domains
  "https://lovableproject.com",
  // Development
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is in whitelist or matches Lovable preview pattern
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith(".lovableproject.com") ||
    origin.endsWith(".lovable.app")
  );

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function handleCorsPreflightOrValidateOrigin(
  req: Request,
  logStep: (step: string, details?: Record<string, unknown>) => void
): Response | null {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // Validate origin for non-preflight requests
  const isAllowed = origin && (
    ALLOWED_ORIGINS.some(allowed => origin === allowed) ||
    origin.endsWith(".lovableproject.com") ||
    origin.endsWith(".lovable.app")
  );

  if (origin && !isAllowed) {
    logStep("SECURITY: Blocked unauthorized origin", { origin });
    return new Response(
      JSON.stringify({ error: "Unauthorized origin" }),
      { headers, status: 403 }
    );
  }

  return null; // Origin is valid, continue processing
}
