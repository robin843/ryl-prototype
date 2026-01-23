/**
 * Store and retrieve purchase context for post-purchase celebration.
 * This is saved before Stripe redirect and retrieved on success page.
 */

const PURCHASE_CONTEXT_KEY = 'ryl_purchase_context';

export interface PurchaseContext {
  productId: string;
  productName: string;
  productImage: string | null;
  brandName: string;
  priceDisplay: string;
  episodeId: string | null;
  episodeNumber: number | null;
  seriesTitle: string | null;
  purchasedAt: number;
  purchaseIntentId?: string;
}

/**
 * Save purchase context before Stripe redirect
 */
export function savePurchaseContext(context: Omit<PurchaseContext, 'purchasedAt'>): void {
  try {
    const fullContext: PurchaseContext = {
      ...context,
      purchasedAt: Date.now(),
    };
    localStorage.setItem(PURCHASE_CONTEXT_KEY, JSON.stringify(fullContext));
  } catch (e) {
    console.error('Error saving purchase context:', e);
  }
}

/**
 * Retrieve and clear purchase context on success page
 */
export function getPurchaseContext(): PurchaseContext | null {
  try {
    const stored = localStorage.getItem(PURCHASE_CONTEXT_KEY);
    if (!stored) return null;
    
    const context = JSON.parse(stored) as PurchaseContext;
    
    // Check if context is still valid (within last 30 minutes)
    const thirtyMinutes = 30 * 60 * 1000;
    if (Date.now() - context.purchasedAt > thirtyMinutes) {
      localStorage.removeItem(PURCHASE_CONTEXT_KEY);
      return null;
    }
    
    return context;
  } catch (e) {
    console.error('Error getting purchase context:', e);
    return null;
  }
}

/**
 * Clear purchase context
 */
export function clearPurchaseContext(): void {
  localStorage.removeItem(PURCHASE_CONTEXT_KEY);
}

/**
 * Get the return URL for after purchase (back to feed at same position)
 */
export function getReturnUrl(): string {
  const context = getPurchaseContext();
  if (context?.episodeId) {
    // Could enhance to return to specific episode in future
    return '/feed';
  }
  return '/feed';
}
