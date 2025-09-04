import { useMemo } from "react";
import { useConfigContext } from "../contexts/ConfigProvider";
import { useProducts, useTagadaContext } from "@tagadapay/plugin-sdk/react";

/**
 * Hook that uses SDK useProducts directly + config filtering
 */
export const useConfigProducts = () => {
  const { config } = useConfigContext();
  const tagadaContext = useTagadaContext();

  // Use the SDK useProducts hook directly
  // Only enable when session is ready AND has a valid token to avoid authentication errors
  const canFetchProducts = !!(
    tagadaContext.isSessionInitialized &&
    tagadaContext.session?.sessionId &&
    !tagadaContext.auth?.isLoading
  );

  const {
    products: sdkProducts,
    isLoading,
    error,
    refetch,
  } = useProducts({
    enabled: canFetchProducts,
    includeVariants: true,
    includePrices: true,
  });

  // Filter SDK products by config productIds
  const filteredProducts = useMemo(() => {
    if (!config?.productIds || config.productIds.length === 0) {
      return sdkProducts || [];
    }

    if (!sdkProducts || sdkProducts.length === 0) {
      return [];
    }

    const filtered = sdkProducts.filter((product) =>
      config.productIds.includes(product.id)
    );

    return filtered;
  }, [sdkProducts, config?.productIds]);

  // Get single product by ID
  const getProductById = useMemo(() => {
    return (productId: string) => {
      return filteredProducts.find((product) => product.id === productId);
    };
  }, [filteredProducts]);

  // For category-based filtering (fallback to all products)
  const getProductsByCategory = useMemo(() => {
    return () => {
      return filteredProducts;
    };
  }, [filteredProducts]);

  // Get hero product (first product or by heroProductId)
  const heroProduct = useMemo(() => {
    if (config?.heroProductId) {
      return getProductById(config.heroProductId) || filteredProducts[0];
    }
    return filteredProducts[0];
  }, [filteredProducts, config?.heroProductId, getProductById]);

  return {
    products: filteredProducts,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    error,
    refetch,
    getProductById,
    getProductsByCategory,
    heroProduct,
    isEmpty: !isLoading && (!filteredProducts || filteredProducts.length === 0),
    count: filteredProducts?.length || 0,
  };
};

// Export individual product getter for direct use
export const useProduct = (productId: string) => {
  const { getProductById, isLoading, error } = useConfigProducts();

  return {
    product: getProductById(productId),
    isLoading,
    error,
  };
};