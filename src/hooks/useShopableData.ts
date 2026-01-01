import { useState, useEffect } from 'react';
import {
  ShopableEpisodeData,
  ShopableProductDetail,
  getShopableDataForEpisode,
  getEpisodeProducts,
  getProductDetail,
} from '@/services/shopable';

/**
 * Hook to fetch shopable data for an episode
 */
export function useShopableData(episodeId: string | undefined) {
  const [data, setData] = useState<ShopableEpisodeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!episodeId) {
      setData(null);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      const response = await getShopableDataForEpisode(episodeId);

      if (cancelled) return;

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to load shopable data');
      }

      setIsLoading(false);
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  return { data, isLoading, error };
}

/**
 * Hook to fetch all products for an episode (for shop menu)
 */
export function useEpisodeProducts(episodeId: string | undefined) {
  const [products, setProducts] = useState<ShopableProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!episodeId) {
      setProducts([]);
      return;
    }

    let cancelled = false;

    async function fetchProducts() {
      setIsLoading(true);
      setError(null);

      const response = await getEpisodeProducts(episodeId);

      if (cancelled) return;

      if (response.success) {
        setProducts(response.data);
      } else {
        setError(response.error || 'Failed to load products');
      }

      setIsLoading(false);
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  return { products, isLoading, error };
}

/**
 * Hook to fetch a single product detail
 */
export function useProductDetail(productId: string | null) {
  const [product, setProduct] = useState<ShopableProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }

    let cancelled = false;

    async function fetchProduct() {
      setIsLoading(true);
      setError(null);

      const response = await getProductDetail(productId);

      if (cancelled) return;

      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.error || 'Failed to load product');
      }

      setIsLoading(false);
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, isLoading, error };
}
