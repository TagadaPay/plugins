import { useState, useEffect, useCallback } from 'react';
import { useCheckout, useProducts, useCurrency } from "@tagadapay/plugin-sdk/react";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { DermaPenConfig, applyThemeColors } from '../lib/config-helpers';

export interface PreviewPack {
    bundleName: string;
    promotionIds: string[];
    preview: any; // CheckoutSessionPreview from SDK
    displayDiscount: number;
    basePrice: number;
    discountedPrice: number;
}

export const useLandingPageController = () => {
    // SDK v2.3.8 - Automatic config loading
    const { config, loading: configLoading } = usePluginConfig<DermaPenConfig>();
    const { init, previewCheckoutSession } = useCheckout({});
    const { format } = useCurrency();

    // Products come from store via SDK
    const { products, isLoading: productsLoading } = useProducts({
        productIds: config?.productIds || [],
        includeVariants: true,
        includePrices: true
    });

    // State for multi-pack system
    const [isLoading, setIsLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(false);
    const [packOne, setPackOne] = useState<PreviewPack | null>(null);
    const [packTwo, setPackTwo] = useState<PreviewPack | null>(null);
    const [packThree, setPackThree] = useState<PreviewPack | null>(null);
    const [selectedPack, setSelectedPack] = useState<PreviewPack | null>(null);
    const [packList, setPackList] = useState<PreviewPack[]>([]);

    // Apply theme colors when config loads
    useEffect(() => {
        if (config) {
            applyThemeColors(config);
        }
    }, [config]);

    // Multi-pack system using config-based pricing
    const fetchPreview = useCallback(async () => {
        if (!products[0]?.variants?.[0] || !config?.pricing) return;

        setIsLoading(true);
        const variant = products[0].variants[0];
        const price = variant.prices[0];

        // Use config-based pricing (prices are in dollars, convert to cents for display)
        const singlePrice = (config.pricing.singlePackPrice || 80) * 100;
        const dualPrice = (config.pricing.dualPackPrice || 160) * 100;
        const triplePrice = (config.pricing.triplePackPrice || 240) * 100;

        try {
            // Create pack data with config-based pricing and discounts
            const previews: PreviewPack[] = [
                {
                    bundleName: 'Single Pack',
                    promotionIds: [],
                    preview: {
                        total: singlePrice,
                        originalPrice: singlePrice,
                        items: [{
                            variantId: variant.id,
                            quantity: 1,
                            priceId: price.id
                        }]
                    },
                    displayDiscount: config.pricing?.singlePackDiscount || 0,
                    basePrice: singlePrice,
                    discountedPrice: singlePrice * (1 - (config.pricing?.singlePackDiscount || 0) / 100)
                },
                {
                    bundleName: 'Double Pack',
                    promotionIds: [],
                    preview: {
                        total: dualPrice,
                        originalPrice: dualPrice,
                        items: [{
                            variantId: variant.id,
                            quantity: 2,
                            priceId: price.id
                        }]
                    },
                    displayDiscount: config.pricing?.dualPackDiscount || 25,
                    basePrice: dualPrice,
                    discountedPrice: dualPrice * (1 - (config.pricing?.dualPackDiscount || 25) / 100)
                },
                {
                    bundleName: 'Triple Pack',
                    promotionIds: [],
                    preview: {
                        total: triplePrice,
                        originalPrice: triplePrice,
                        items: [{
                            variantId: variant.id,
                            quantity: 3,
                            priceId: price.id
                        }]
                    },
                    displayDiscount: config.pricing?.triplePackDiscount || 40,
                    basePrice: triplePrice,
                    discountedPrice: triplePrice * (1 - (config.pricing?.triplePackDiscount || 40) / 100)
                }
            ];

            setPackList(previews);
            setPackOne(previews[0]);
            setPackTwo(previews[1]);
            setPackThree(previews[2]);
            setSelectedPack(previews[1]); // Default to double pack
        } catch (error) {
            console.error('Error creating pack previews:', error);
        } finally {
            setIsLoading(false);
        }
    }, [products, config]);

    // Initialize pack previews when products and config are ready
    useEffect(() => {
        if (products.length > 0 && config && !isLoading) {
            fetchPreview();
        }
    }, [products, config, fetchPreview, isLoading]);

    const onBuyNow = async (packName: string) => {
        setInitLoading(true);
        const pack = packList.find((pack) => pack.bundleName === packName);
        if (!pack || !products[0]?.variants?.[0]) {
            setInitLoading(false);
            return;
        }

        const variant = products[0].variants[0];
        const price = variant.prices[0];

        // Determine quantity based on pack name
        let quantity = 1;
        if (packName === 'Double Pack') quantity = 2;
        if (packName === 'Triple Pack') quantity = 3;

        const lineItems = [{
            variantId: variant.id,
            quantity: quantity,
            priceId: price.id,
        }];

        try {
            // Initialize checkout without promotion IDs - promotions handled at store level
            const result = await init({
                lineItems,
            });

            if (result) {
                window.location.href = result.checkoutUrl;
            }
        } catch (error) {
            console.error('Checkout initialization failed:', error);
        } finally {
            setInitLoading(false);
        }
    };

    const onSelectPack = (packName: string) => {
        const pack = packList.find((pack) => pack.bundleName === packName);
        if (pack) {
            setSelectedPack(pack);
        }
    };

    return {
        // Product data from SDK
        product: products[0],
        productImage: products[0]?.variants?.[0]?.imageUrl,
        productName: products[0]?.name,
        productPrice: config?.pricing?.singlePackPrice || 80,

        // Config data
        config,

        // Loading states
        isLoading: productsLoading || configLoading || isLoading,
        initLoading,

        // Pack system
        packOne,
        packTwo,
        packThree,
        selectedPack,
        packList,
        onSelectPack,
        onBuyNow,

        // Currency formatter
        format
    };
};