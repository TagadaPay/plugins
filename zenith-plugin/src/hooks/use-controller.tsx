import { PluginConfig } from '@/types/plugin-config';
import type { CheckoutSessionPreview } from '@tagadapay/plugin-sdk/v2';
import {
  useCheckout,
  usePluginConfig,
  useProducts,
} from '@tagadapay/plugin-sdk/v2';
import { useEffect, useRef, useState } from 'react';
import { useStoreData } from './use-store-data';

const CART_TOKEN_KEY = 'tagada_cart_token';
const CART_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

interface StoredCartToken {
  token: string;
  timestamp: number;
}

const generateCartToken = (): string => {
  return (
    'cart_' +
    Math.random().toString(36).substr(2, 9) +
    '_' +
    Date.now().toString(36)
  );
};

const getValidCartToken = (): string => {
  try {
    const stored = localStorage.getItem(CART_TOKEN_KEY);
    if (stored) {
      const parsedToken: StoredCartToken = JSON.parse(stored);
      const now = Date.now();
      if (now - parsedToken.timestamp < CART_TOKEN_EXPIRY) {
        return parsedToken.token;
      }
    }
  } catch (error) {
    console.warn('Error reading cartToken from localStorage:', error);
  }
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
  bundleName: string;
  preview: CheckoutSessionPreview;
  promotionIds: string[];
  quantity: number;
  subtitle?: string;
  image?: string;
}

export const useController = () => {
  const { config } = usePluginConfig<PluginConfig>();
  const { variantId, priceId, promotions } = useStoreData();
  const { init, previewCheckoutSession } = useCheckout({});
  const { products } = useProducts({
    productIds: config?.storeData?.productId
      ? [config.storeData.productId]
      : [],
    includeVariants: true,
    includePrices: true,
    enabled: !!config?.storeData?.productId,
  });

  const [initLoading, setInitLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<PreviewPack | null>(null);
  const [packList, setPackList] = useState<PreviewPack[]>([]);
  const hasFetchedPreview = useRef(false);

  // Fetch preview data for each promotion
  useEffect(() => {
    const fetchPreview = async () => {
      if (
        hasFetchedPreview.current ||
        !variantId ||
        !priceId ||
        !promotions.length
      )
        return;
      hasFetchedPreview.current = true;
      setIsLoading(true);

      try {
        // Generate previews for each promotion
        const previewPromises = promotions.map(async promotion => {
          const lineItems = [
            {
              variantId,
              quantity: promotion.quantity,
              priceId,
            },
          ];

          const promotionIds = promotion.id ? [promotion.id] : [];

          const previewResult = await previewCheckoutSession(
            lineItems,
            promotionIds
          );

          return {
            bundleName:
              typeof promotion.name === 'string'
                ? promotion.name
                : promotion.name?.en || '',
            preview: previewResult.preview,
            promotionIds,
            quantity: promotion.quantity,
            subtitle:
              typeof promotion.subtitle === 'string'
                ? promotion.subtitle
                : promotion.subtitle?.en,
            image: promotion.image,
          };
        });

        const previews = await Promise.all(previewPromises);
        setPackList(previews);

        // Set default selected pack (first one or best value)
        const defaultPack = previews[0] || null;
        setSelectedPack(defaultPack);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching preview data:', error);
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [variantId, priceId, promotions, previewCheckoutSession]);

  const onSelectPack = (bundleName: string) => {
    const pack = packList.find(p => p.bundleName === bundleName);
    if (pack) {
      setSelectedPack(pack);
    }
  };

  const onBuyNow = async (bundleName: string) => {
    setInitLoading(true);

    try {
      const pack = packList.find(p => p.bundleName === bundleName);
      if (!pack) {
        throw new Error('Package not found');
      }

      const cartToken = getValidCartToken();

      const lineItems = [
        {
          variantId,
          quantity: pack.quantity,
          priceId,
        },
      ];

      // Use Tagada SDK to initialize checkout
      const result = await init({
        lineItems,
        promotionIds: pack.promotionIds,
        cartToken,
      });

      // Redirect to checkout URL
      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error('No checkout URL received from Tagada');
      }
    } catch (error) {
      console.error('[Checkout] Error:', error);
      alert(
        `Checkout failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setInitLoading(false);
    }
  };

  return {
    isLoading,
    initLoading,
    selectedPack,
    setSelectedPack,
    packList,
    onSelectPack,
    onBuyNow,
    product: products?.[0] || null,
  };
};
