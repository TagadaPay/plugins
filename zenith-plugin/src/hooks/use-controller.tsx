import { useStoreData } from './use-store-data';
import { useCartCheckout } from './use-cart-checkout';
import { useEffect, useState } from 'react';
import { CheckoutSessionPreview, useCurrency, useProducts, usePluginConfig } from '@tagadapay/plugin-sdk/react';

export interface PreviewPack {
  bundleName: string;
  promotionIds: string[];
  preview: CheckoutSessionPreview;
  subtitle?: string;
  image?: string;
  quantity?: number;
}

export const useLandingPageController = () => {
  const { productId, variantId, priceId, promotions } = useStoreData();
  const { init, previewCheckoutSession } = useCartCheckout();
  const { products } = useProducts({ productIds: [productId] });
  const { storeId } = usePluginConfig();
  const { format } = useCurrency();
  const [initLoading, setInitLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<PreviewPack | null>(null);
  const [packList, setPackList] = useState<PreviewPack[]>([]);

  console.log(packList, "packList")

  const onBuyNow = async (packName: string) => {
    setInitLoading(true);
    const pack = packList.find(pack => pack.bundleName === packName);
    if (!pack) {
      return;
    }
    const lineItems = pack.preview.items.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
      priceId: item.priceId,
    }));

    const result = await init({
      lineItems,
      promotionIds: pack.promotionIds,
      storeId,
    });
    if (result) {
      window.location.href = result.checkoutUrl;
    }
    setInitLoading(false);
  };

  const onSelectPack = (packName: string) => {
    const pack = packList.find(pack => pack.bundleName === packName);
    if (pack) {
      setSelectedPack(pack);
    }
  };

  useEffect(() => {
    console.log(promotions, "promotions")
    const fetchPreview = async () => {
      setIsLoading(true);

      // Create pack configurations from promotions array
      const packConfigs = promotions.map(promo => ({
        bundleName: promo.name,
        promotionIds: promo.id && promo.id.trim() !== '' ? [promo.id] : [],
        quantity: promo.quantity,
        subtitle: promo.subtitle,
        image: promo.image,
      }));

      const result = await Promise.all(
        packConfigs.map(async config => ({
          bundleName: config.bundleName,
          promotionIds: config.promotionIds,
          subtitle: config.subtitle,
          image: config.image,
          quantity: config.quantity,
          res: await previewCheckoutSession(
            [
              {
                variantId: variantId,
                quantity: config.quantity,
                priceId: priceId,
              },
            ],
            config.promotionIds
          ),
        }))
      );

      const previews = result.map(r => ({
        preview: r.res.preview,
        bundleName: r.bundleName,
        promotionIds: r.promotionIds,
        subtitle: r.subtitle,
        image: r.image,
        quantity: r.quantity,
      }));
      setPackList(previews);
      setSelectedPack(previews[0]);
      setIsLoading(false);
    };
    fetchPreview();
  }, [promotions, previewCheckoutSession]);

  return {
    isLoading,
    selectedPack,
    onSelectPack,
    packList,
    format,
    onBuyNow,
    initLoading,
    product: products[0],
  };
};
