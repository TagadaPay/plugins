import { ProductPackageName } from '../components/ProductCard';
import { Colors } from '../types/colors';
import { useProductContext } from '../contexts/ConfigProvider';
import { useStoreData } from './useStoreData';
import {
  CheckoutSessionPreview,
  useCheckout,
  useCurrency,
  useProducts,
  useTagadaContext,
} from '@tagadapay/plugin-sdk/react';
import { useEffect, useRef, useState } from 'react';

const CART_TOKEN_KEY = 'tagada_cart_token';
const CART_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

interface StoredCartToken {
  token: string;
  timestamp: number;
}

const generateCartToken = (): string => {
  return 'cart_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

const getValidCartToken = (): string => {
  try {
    const stored = localStorage.getItem(CART_TOKEN_KEY);
    if (stored) {
      const parsedToken: StoredCartToken = JSON.parse(stored);
      const now = Date.now();
      // Check if token is still valid (within 15 minutes)
      if (now - parsedToken.timestamp < CART_TOKEN_EXPIRY) {
        return parsedToken.token;
      }
    }
  } catch (error) {
    console.warn('Error reading cartToken from localStorage:', error);
  }
  // Generate new token if none exists or expired
  const newToken = generateCartToken();
  const tokenData: StoredCartToken = {
    token: newToken,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(CART_TOKEN_KEY, JSON.stringify(tokenData));
  } catch (error) {
    console.warn('Error storing cartToken in localStorage:', error);
  }
  return newToken;
};

export interface PreviewPack {
  bundleName: ProductPackageName;
  preview: CheckoutSessionPreview;
  promotionIds: string[];
}

export const useGymkartelController = () => {
  const appConfig = useProductContext();
  const { init, previewCheckoutSession } = useCheckout({});
  const { products } = useProducts({ productIds: [appConfig?.productId || ''] });
  const { store } = useTagadaContext();
  const { format } = useCurrency();
  const { productOptions, availableSizes, getVariantByOptionAndSize } = useStoreData();

  const [initLoading, setInitLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [packOne, setPackOne] = useState<PreviewPack | null>(null);
  const [packTwo, setPackTwo] = useState<PreviewPack | null>(null);
  const [packThree, setPackThree] = useState<PreviewPack | null>(null);
  const [selectedPack, setSelectedPack] = useState<PreviewPack | null>(null);
  const [packList, setPackList] = useState<PreviewPack[]>([]);
  const hasFetchedPreview = useRef(false);

  // Helper function to get variant ID from color
  const getVariantId = (color: Colors): string | null => {
    if (!appConfig?.variants) return null;
    const variantId = appConfig.variants[color];
    return typeof variantId === 'string' && variantId !== 'undefined' ? variantId : null;
  };

  // Helper function to get available colors from store data
  const getAvailableColors = (): string[] => {
    return productOptions.map(option => option.name);
  };

  // Helper function to get available sizes from store data
  const getAvailableSizes = (): string[] => {
    return availableSizes;
  };

  const onBuyNow = async (packageName: ProductPackageName, colors: string[], sizes: string[]) => {
    setInitLoading(true);
    
    try {
      const pack = packList.find((pack) => pack.bundleName === packageName);
      if (!pack) {
        throw new Error('Package not found');
      }

      const cartToken = getValidCartToken();

      // Build lineItems from the selected colors and sizes
      const lineItems = [];
      const packQuantity = getPackQuantity(packageName);

      for (let i = 0; i < packQuantity; i++) {
        const color = colors[i];
        const size = sizes[i];

        if (color && size) {
          // Use store data to find the exact variant for this color+size combination
          const variant = getVariantByOptionAndSize(color, size);
          
          if (variant) {
            lineItems.push({
              variantId: variant.id,
              quantity: 1,
              priceId: variant.prices?.[0]?.id || appConfig?.defaultPriceId || '',
            });
          } else {
            // Fallback to default variant if specific variant not found
            console.warn(`Variant not found for ${color} ${size}, using default`);
            lineItems.push({
              variantId: appConfig?.defaultVariantId || '',
              quantity: 1,
              priceId: appConfig?.defaultPriceId || '',
            });
          }
        } else {
          // Fallback to default variant if color or size not selected
          lineItems.push({
            variantId: appConfig?.defaultVariantId || '',
            quantity: 1,
            priceId: appConfig?.defaultPriceId || '',
          });
        }
      }

      console.log('[Checkout] Initializing checkout with lineItems:', lineItems);

      // Use Tagada SDK to initialize checkout
      const result = await init({
        lineItems,
        promotionIds: pack.promotionIds,
        storeId: store?.id,
        cartToken,
      });

      // Redirect to checkout URL
      if (result?.checkoutUrl) {
        console.log('[Checkout] Redirecting to:', result.checkoutUrl);
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error('No checkout URL received from Tagada');
      }
    } catch (error) {
      console.error('[Checkout] Error:', error);
      alert(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setInitLoading(false);
    }
  };

  // Helper function to get pack quantity based on package name
  const getPackQuantity = (packageName: ProductPackageName): number => {
    switch (packageName) {
      case ProductPackageName.ONE_PAIR:
        return 1;
      case ProductPackageName.TWO_PAIRS:
        return 2;
      case ProductPackageName.THREE_PAIRS:
        return 3;
      default:
        return 1;
    }
  };

  // Fetch preview data for each package
  useEffect(() => {
    const fetchPreview = async () => {
      if (hasFetchedPreview.current) return;
      hasFetchedPreview.current = true;
      setIsLoading(true);

      try {
        // Generate previews for each package
        const result = await Promise.all([
          {
            bundleName: ProductPackageName.ONE_PAIR,
            promotionIds: [], // Add promotion IDs when available
            res: await previewCheckoutSession(
              [
                {
                  variantId: appConfig?.defaultVariantId || '',
                  quantity: 1,
                  priceId: appConfig?.defaultPriceId || '',
                },
              ],
              [], // Add promotion IDs when available
            ),
          },
          {
            bundleName: ProductPackageName.TWO_PAIRS,
            promotionIds: [], // Add promotion IDs when available
            res: await previewCheckoutSession(
              [
                {
                  variantId: appConfig?.defaultVariantId || '',
                  quantity: 2,
                  priceId: appConfig?.defaultPriceId || '',
                },
              ],
              [], // Add promotion IDs when available
            ),
          },
          {
            bundleName: ProductPackageName.THREE_PAIRS,
            promotionIds: [], // Add promotion IDs when available
            res: await previewCheckoutSession(
              [
                {
                  variantId: appConfig?.defaultVariantId || '',
                  quantity: 3,
                  priceId: appConfig?.defaultPriceId || '',
                },
              ],
              [], // Add promotion IDs when available
            ),
          },
        ]);

        const previews = result.map((r) => ({
          preview: r.res.preview,
          bundleName: r.bundleName,
          promotionIds: r.promotionIds,
        }));

        setPackList(previews);
        setPackOne(previews[0]);
        setPackTwo(previews[1]);
        setPackThree(previews[2]);
        setSelectedPack(previews[1]); // Default to two pairs
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching preview data:', error);
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [previewCheckoutSession]);

  return {
    isLoading,
    packOne,
    packTwo,
    packThree,
    selectedPack,
    setSelectedPack,
    packList,
    format,
    onBuyNow,
    product: products[0],
    initLoading,
    getAvailableColors,
    getAvailableSizes,
    getVariantId,
  };
};
