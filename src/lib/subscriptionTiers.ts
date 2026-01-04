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
  {
    id: 'user-basic',
    name: 'User Basic',
    price: 9.90,
    priceId: 'price_1SlWVsLHz2QNjBxKXqF4Fgep',
    productId: 'prod_TiySjPRbUeQtkv',
    description: 'Perfekt zum Einstieg',
    features: [
      'Mit Werbung',
      'Unbegrenzte Wiedergabezeit',
      'Zugang zu allen Serien',
    ],
    type: 'user',
  },
  {
    id: 'user-premium',
    name: 'User Premium',
    price: 15,
    priceId: 'price_1SlWWSLHz2QNjBxK0vqSC8Jc',
    productId: 'prod_TiyTYZzQdyLKfX',
    description: 'Das volle Erlebnis',
    features: [
      'Werbefrei',
      'Unbegrenzte Wiedergabezeit',
      'Zugang zu allen Serien',
      'Offline-Downloads',
      'Exklusive Inhalte',
    ],
    type: 'user',
    popular: true,
  },
  {
    id: 'user-offline',
    name: 'User Offline',
    price: 22.90,
    priceId: 'price_1SlYqPLHz2QNjBxKNTKe0tSb',
    productId: 'prod_Tj0siuWt5WmSUV',
    description: 'Mehr Offline-Downloads',
    features: [
      'Werbefrei',
      'Unbegrenzte Wiedergabezeit',
      'Zugang zu allen Serien',
      'Erweiterte Offline-Downloads',
      'Exklusive Inhalte',
      'Download-Qualität wählbar',
    ],
    type: 'user',
  },
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

export const getTierByProductId = (productId: string): SubscriptionTier | undefined => {
  return subscriptionTiers.find(tier => tier.productId === productId);
};

export const getTierByPriceId = (priceId: string): SubscriptionTier | undefined => {
  return subscriptionTiers.find(tier => tier.priceId === priceId);
};
