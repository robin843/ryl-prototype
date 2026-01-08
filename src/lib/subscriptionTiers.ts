export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  priceId: string;
  productId: string;
  description: string;
  features: string[];
  type: 'user' | 'producer';
  popular?: boolean;
}

export const subscriptionTiers: SubscriptionTier[] = [
  // User: Nur ein optionales Werbefrei-Abo
  {
    id: 'user-adfree',
    name: 'Werbefrei',
    price: 4.99,
    priceId: 'price_1SnO98LHz2QNjBxKLOyyiyTG',
    productId: 'prod_TktxSiZipxdyuk',
    description: 'Genieße Ryl ohne Unterbrechungen',
    features: [
      'Keine Werbung',
      'Alle Serien & Episoden',
      'Unbegrenzte Wiedergabezeit',
    ],
    type: 'user',
    popular: true,
  },
  // Producer Tiers bleiben unverändert
  {
    id: 'producer-basic',
    name: 'Producer Basic',
    price: 149,
    priceId: 'price_1SlWXgLHz2QNjBxKlbxJwCxs',
    productId: 'prod_TiyUXiUAvRa4at',
    description: 'Für aufstrebende Creator',
    features: [
      'Bis zu 7 Soaps',
      '+1 Soap pro Jahr',
      'Standard-Analytics',
      'E-Mail-Support',
    ],
    type: 'producer',
  },
  {
    id: 'producer-premium',
    name: 'Producer Premium',
    price: 399,
    priceId: 'price_1SlWYULHz2QNjBxKcfK9Wf9T',
    productId: 'prod_TiyV0GdDprNJFa',
    description: 'Für professionelle Creator',
    features: [
      'Unbegrenzte Soaps',
      'Premium-Analytics',
      'Dedicated Account Manager',
      'Priority-Support',
    ],
    type: 'producer',
    popular: true,
  },
  {
    id: 'producer-enterprise',
    name: 'Producer Enterprise',
    price: 1500,
    priceId: 'price_1SlWaJLHz2QNjBxKHyvF65YA',
    productId: 'prod_TiyXMA6dBhrKFj',
    description: 'Für große Studios & Labels',
    features: [
      'Mehrere Labels',
      'Custom Revenue-Splits',
      'Dedizierter Support',
      'White-Label-Analytics',
      'Individuelle Verträge',
    ],
    type: 'producer',
  },
];

// Werbefrei Produkt-ID für einfache Prüfungen
export const ADFREE_PRODUCT_ID = 'prod_TktxSiZipxdyuk';

export const getTierByProductId = (productId: string): SubscriptionTier | undefined => {
  return subscriptionTiers.find(tier => tier.productId === productId);
};

export const getTierByPriceId = (priceId: string): SubscriptionTier | undefined => {
  return subscriptionTiers.find(tier => tier.priceId === priceId);
};

export const getUserTier = (): SubscriptionTier | undefined => {
  return subscriptionTiers.find(tier => tier.type === 'user');
};

export const getProducerTiers = (): SubscriptionTier[] => {
  return subscriptionTiers.filter(tier => tier.type === 'producer');
};
