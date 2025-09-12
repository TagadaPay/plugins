// Hook for managing store data and product information using Tagada SDK
import { useMemo } from 'react';
import { useProducts, useTagadaContext } from '@tagadapay/plugin-sdk/react';
import { useConfigContext } from '../contexts/ConfigProvider';
import type { ProductOption as ConfigProductOption } from '../types/config';

export interface ProductOption extends ConfigProductOption {
  variantId: string;
  variants: any[]; // Tagada SDK variant type
}

export interface StoreData {
  products: any[]; // Tagada SDK product type
  productOptions: ProductOption[];
  availableSizes: string[];
  isLoading: boolean;
  error: string | null;
}

export function useStoreData(): StoreData & {
  getVariantByOptionAndSize: (option: string, size: string) => any | null;
  getImageForOption: (option: string) => string;
} {
  const { config } = useConfigContext();
  const tagadaContext = useTagadaContext();

  // Get all product IDs from productMapping if available, otherwise fallback to main productId
  const productIds = useMemo(() => {
    if (config?.product?.productMapping && config.product.productMapping.length > 0) {
      return config.product.productMapping.map(mapping => mapping.productId);
    } else if (config?.product?.productId) {
      return [config.product.productId];
    }
    return [];
  }, [config?.product]);

  // Simplified: enable if we have product IDs (matching use-controller pattern)
  const canFetchProducts = productIds.length > 0;
  
  // Debug session state
  console.log('[useStoreData] Session debugging:', {
    isSessionInitialized: tagadaContext.isSessionInitialized,
    hasSessionId: !!tagadaContext.session?.sessionId,
    sessionId: tagadaContext.session?.sessionId,
    authIsLoading: tagadaContext.auth?.isLoading,
    productIds,
    canFetchProducts
  });

  // Use Tagada SDK to fetch products
  const { products, isLoading, error } = useProducts({
    productIds,
    includeVariants: true,
    includePrices: true,
    enabled: canFetchProducts,
  });

  // Debug logging
  console.log('[useStoreData] Can fetch products:', canFetchProducts);
  console.log('[useStoreData] Product IDs to fetch:', productIds);
  console.log('[useStoreData] Config variants mapping:', config?.product?.variants);
  console.log('[useStoreData] Products:', products);
  console.log('[useStoreData] Loading:', isLoading);
  console.log('[useStoreData] Error:', error);
  
  // Debug variants
  if (products && products.length > 0) {
    console.log('[useStoreData] All variants found:');
    products.forEach((product, idx) => {
      console.log(`Product ${idx}:`, {
        id: product.id,
        name: product.name,
        variantCount: product.variants?.length || 0,
        variants: product.variants?.map((v: any) => ({
          id: v.id,
          name: v.name,
          hasImage: !!v.imageUrl,
          imageUrl: v.imageUrl
        }))
      });
    });
  } else {
    console.log('[useStoreData] No products found or empty array');
  }

  // Get config-based product options (for fallback)
  const configProductOptions = useMemo(() => {
    return config?.content?.productOptions || config?.content?.colorOptions || [];
  }, [config?.content?.productOptions, config?.content?.colorOptions]);

  // Use store data if available, otherwise fall back to config
  const productOptions = useMemo(() => {
    // If we have products, create product options from the actual product data
    if (products && products.length > 0) {
      const storeColorOptions: ProductOption[] = [];
      
      products.forEach(product => {
        console.log(`[useStoreData] Processing product: "${product.name}" (${product.id})`);
        
        // Extract color name from product name (e.g., "Pink Leggings" -> "Pink")
        const colorName = product.name.replace(/\s+(Leggings|leggings).*$/i, '').trim();
        
        if (product.variants && product.variants.length > 0) {
          // Find the first variant with an image, or just the first variant
          let variantWithImage = product.variants.find((v: any) => v.imageUrl) || product.variants[0];
          
          console.log(`[useStoreData] For product "${product.name}": extracted color "${colorName}", found ${product.variants.length} variants`);
          
          storeColorOptions.push({
            name: colorName,
            image: variantWithImage.imageUrl || '/images/placeholder-product.png',
            variantId: variantWithImage.id,
            variants: product.variants,
          });
        }
      });
      
      console.log('[useStoreData] Generated store product options:', storeColorOptions);
      
      if (storeColorOptions.length > 0) {
        return storeColorOptions;
      }
    }
    
    console.log('[useStoreData] Falling back to config product options:', configProductOptions);
    console.log('[useStoreData] Reason for fallback - products empty or no config variants:', {
      hasProducts: !!(products && products.length > 0),
      hasConfigVariants: !!config?.product?.variants,
      productCount: products?.length || 0
    });
    
    // Fall back to config-based product options with local images
    return configProductOptions.map((opt: any) => ({
      ...opt,
      variantId: opt.variantId || '',
      variants: []
    }));
  }, [products, config?.product?.variants, configProductOptions]);

  // Extract available sizes from variants
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    
    // Extract sizes from all product variants
    if (products && products.length > 0) {
      products.forEach(product => {
        if (product.variants) {
          product.variants.forEach((variant: any) => {
            const title = variant.title || variant.name || '';
            // Look for size patterns in variant names
            if (/small|^s$|size\s*s/i.test(title)) sizeSet.add('S');
            if (/medium|^m$|size\s*m/i.test(title)) sizeSet.add('M');
            if (/large|^l$|size\s*l/i.test(title)) sizeSet.add('L');
          });
        }
      });
    }

    // If no sizes found from products, use fallback
    if (sizeSet.size === 0) {
      return ['S', 'M', 'L'];
    }

    return Array.from(sizeSet).sort();
  }, [products]);

  // Helper function to get variant by product option and size
  const getVariantByOptionAndSize = (option: string, size: string): any | null => {
    // Find the product option for this color
    const productOption = productOptions.find(opt => opt.name === option);
    if (!productOption?.variants) return null;

    // Find variant that matches the size
    return productOption.variants.find((variant: any) => {
      const title = variant.title || variant.name || '';
      // Look for size patterns in the variant name
      const sizePatterns = {
        'S': /small|^s$|size\s*s/i,
        'M': /medium|^m$|size\s*m/i,
        'L': /large|^l$|size\s*l/i
      };
      
      return sizePatterns[size as keyof typeof sizePatterns]?.test(title);
    }) || productOption?.variants?.[0]; // fallback to first variant if no size match
  };

  // Helper function to get image for a specific product option
  const getImageForOption = (option: string): string => {
    const productOption = productOptions.find(opt => opt.name === option);
    return productOption?.image || '/images/placeholder-product.png';
  };

  return {
    products: products || [],
    productOptions: productOptions,
    availableSizes,
    isLoading,
    error: error?.message || null,
    getVariantByOptionAndSize,
    getImageForOption,
  };
}