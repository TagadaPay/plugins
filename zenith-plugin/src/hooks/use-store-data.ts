import { PluginConfig } from '@/types/plugin-config';
import { usePluginConfig, useProducts } from '@tagadapay/plugin-sdk/v2';

export function useStoreData() {
  const { config } = usePluginConfig<PluginConfig>();

  // Get product ID from config
  const productId = config?.storeData?.productId || '';

  // Fetch products using SDK
  const { products, isLoading, error } = useProducts({
    productIds: productId ? [productId] : [],
    includeVariants: true,
    includePrices: true,
    enabled: !!productId,
  });

  // Get variant ID from config
  const variantId = config?.storeData?.variantId || '';

  // Get price ID from config
  const priceId = config?.storeData?.priceId || '';

  // Get promotions from config
  const promotions = config?.storeData?.promotions || [];

  return {
    productId,
    variantId,
    priceId,
    promotions,
    products: products || [],
    isLoading,
    error: error?.message || null,
  };
}
