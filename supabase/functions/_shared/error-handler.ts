/**
 * Centralized error handling for Edge Functions.
 * Returns generic user-facing messages while logging detailed errors server-side.
 */

export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Authentifizierung erforderlich. Bitte melden Sie sich an.',
  AUTH_INVALID: 'Ungültige oder abgelaufene Sitzung. Bitte melden Sie sich erneut an.',
  PAYMENT_FAILED: 'Zahlung konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.',
  SUBSCRIPTION_FAILED: 'Abonnement konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.',
  NOT_FOUND: 'Die angeforderte Ressource wurde nicht gefunden.',
  FORBIDDEN: 'Sie haben keine Berechtigung für diese Aktion.',
  VALIDATION_FAILED: 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.',
  SERVER_ERROR: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

interface ErrorContext {
  functionName: string;
  error: unknown;
  userId?: string;
  additionalContext?: Record<string, unknown>;
}

interface SafeErrorResponse {
  userMessage: string;
  statusCode: number;
}

/**
 * Logs detailed error information server-side and returns a safe user message.
 */
export function handleError(context: ErrorContext, logStep: (step: string, details?: Record<string, unknown>) => void): SafeErrorResponse {
  const errorMessage = context.error instanceof Error ? context.error.message : String(context.error);
  const errorStack = context.error instanceof Error ? context.error.stack : undefined;
  
  // Detailed server-side logging (visible in Edge Function logs)
  logStep("ERROR", {
    function: context.functionName,
    message: errorMessage,
    stack: errorStack,
    userId: context.userId,
    timestamp: new Date().toISOString(),
    ...context.additionalContext,
  });

  // Determine safe user message based on error content
  const lowerMessage = errorMessage.toLowerCase();
  
  let userMessage: string = ERROR_MESSAGES.SERVER_ERROR;
  let statusCode = 500;
  
  if (lowerMessage.includes('authorization') || lowerMessage.includes('no authorization header')) {
    userMessage = ERROR_MESSAGES.AUTH_FAILED;
    statusCode = 401;
  } else if (lowerMessage.includes('invalid') && (lowerMessage.includes('token') || lowerMessage.includes('session'))) {
    userMessage = ERROR_MESSAGES.AUTH_INVALID;
    statusCode = 401;
  } else if (lowerMessage.includes('authenticated') || lowerMessage.includes('authentication')) {
    userMessage = ERROR_MESSAGES.AUTH_FAILED;
    statusCode = 401;
  } else if (lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
    userMessage = ERROR_MESSAGES.FORBIDDEN;
    statusCode = 403;
  } else if (lowerMessage.includes('not found') || lowerMessage.includes('no customer')) {
    userMessage = ERROR_MESSAGES.NOT_FOUND;
    statusCode = 404;
  } else if (lowerMessage.includes('stripe') || lowerMessage.includes('payment') || lowerMessage.includes('charge')) {
    userMessage = ERROR_MESSAGES.PAYMENT_FAILED;
    statusCode = 400;
  } else if (lowerMessage.includes('subscription') || lowerMessage.includes('billing')) {
    userMessage = ERROR_MESSAGES.SUBSCRIPTION_FAILED;
    statusCode = 400;
  } else if (lowerMessage.includes('required') || lowerMessage.includes('invalid') || lowerMessage.includes('missing')) {
    userMessage = ERROR_MESSAGES.VALIDATION_FAILED;
    statusCode = 400;
  }

  return { userMessage, statusCode };
}

/**
 * Creates a standardized error response with generic user message.
 */
export function createErrorResponse(
  corsHeaders: Record<string, string>,
  userMessage: string,
  statusCode: number
): Response {
  return new Response(
    JSON.stringify({ error: userMessage }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    }
  );
}
