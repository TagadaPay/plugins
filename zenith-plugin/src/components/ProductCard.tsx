declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
    }
}
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { PreviewPack } from "@/src/hooks/use-controller"
import { formatSimpleMoney } from "@tagadapay/plugin-sdk/react"
import { Spinner } from "./ui/spinner"
import { useKlaviyoTracking } from "@/src/hooks/use-klaviyo-tracking"
import { useStoreData } from "@/src/hooks/use-store-data";
import { useTagataConfig } from "@/src/hooks/use-tagada-context";
import { useState } from "react";


interface FreeGift {
    image: string;
    text: string;
    value?: number;
}

interface CardProps {
    pack: PreviewPack;
    selected: boolean;
    title: string;
    currency: string;
    subtitle: string;
    image: string;
    onSelect: (pack: string) => void;
    onBuyNow: (packName: string) => Promise<void>;
    disabled: boolean;
    showBuyNow: boolean;
    badge?: string;
    freeGift?: FreeGift;
}

export const ProductCard = ({ pack, selected, title, currency, subtitle, image, onSelect, onBuyNow, disabled, showBuyNow, badge, freeGift }: CardProps) => {
    const { preview } = pack;
    const [btnBuyNowLoading, setBtnBuyNowLoading] = useState(false);
    const { productId, variantId } = useStoreData();
    const { trackAddedToCart } = useKlaviyoTracking();
    const { config } = useTagataConfig();
    const uiText = config?.content?.text?.en?.uiText;
    const productData = config?.productData;
    const promotions = config?.storeData?.promotions || [];
    
    // Find the matching promotion for this pack
    const matchingPromotion = promotions.find(promo => promo.name === pack.bundleName);

    // Facebook Pixel and Klaviyo events for Buy Now
    const handleBuyNow = async (bundleName: string) => {
        // Facebook Pixel tracking
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
            window.fbq('track', 'AddToCart', {
                content_name: bundleName,
                value: preview.totalAdjustedAmount / 100,
                currency: currency,
            });
            window.fbq('track', 'InitiateCheckout', {
                content_name: bundleName,
                value: preview.totalAdjustedAmount / 100,
                currency: currency,
            });
        }

        // Klaviyo tracking
        trackAddedToCart({
            productId: productId,
            productName: productData?.productName || 'Zenith Pure Himalayan Shilajit Gold Gummies',
            variantId: variantId,
            price: preview.totalAdjustedAmount / 100,
            currency: currency,
            quantity: pack.quantity || 1,
            lineTotal: preview.totalAdjustedAmount / 100,
            bundleName: bundleName,
            sku: variantId,
            categories: productData?.categories || ['Supplements', 'Shilajit', 'Gummies', 'Health'],
            imageUrl: image,
            url: window.location.href
        });

        await onBuyNow(bundleName);
    };
    const saveAmount = (preview.totalAmount - preview.totalAdjustedAmount) / 100;
    return (
        <Card
            key={pack.bundleName}
            className={`relative flex flex-col md:flex-row items-stretch justify-between min-h-[180px] p-0 overflow-visible shadow-xl border-2 transition-all duration-200 bg-gradient-to-b from-white to-gray-50
        ${selected ? "scale-[1.03]" : "border-gray-200 hover:scale-[1.01]"}
        cursor-pointer group`}
            style={{
                borderColor: selected ? 'var(--primary-color)' : undefined,
                boxShadow: selected ? '0 0 0 4px rgba(219, 181, 91, 0.2)' : undefined
            }}
            onClick={() => {
                onSelect(pack.bundleName);
            }}
        >
            {/* Badge */}
            {badge && (
                <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-full text-xs font-bold shadow-lg
          ${badge === "BEST VALUE" ? "bg-black text-primary-color" : "text-white bg-primary-color"}`}
                >
                    {badge}
                </div>
            )}

            <CardContent className="flex flex-row md:items-center items-start flex-1 p-4 gap-3 md:gap-4">
                {/* Product Image */}
                {image && (
                    <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 md:w-32 md:h-32">
                        <img
                            src={image || "/placeholder.svg"}
                            alt={`${uiText?.productAltTextPrefix || 'Pure Shilajit Gummies -'} ${title}`}
                            width={120}
                            height={120}
                            className="rounded-lg object-cover border border-gray-200 shadow-sm w-full h-full"
                        />
                    </div>
                )}

                {/* Info Section */}
                <div className="flex flex-col flex-1 items-start justify-center">
                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight mb-1">{title}</h3>
                    {/* Subtitle (e.g. 30/90/150-day Supply) */}
                    <p className="text-xs text-gray-500 mb-2">{subtitle}</p>

                    {/* Free Gift Badge - Only render if promotion has free gift */}
                    {matchingPromotion?.freeGift && (
                        <div
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3 shadow-sm bg-primary-color text-white"
                        >
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {matchingPromotion.freeGift}
                            </span>
                        </div>
                    )}

                    {/* Free Gift */}
                    {freeGift && (
                        <div
                            className="flex items-center gap-2 rounded-lg px-2 py-1 mb-3 bg-primary-50 border-primary-light"
                            style={{
                                borderWidth: '1px'
                            }}
                        >
                            <img src={freeGift.image} alt={freeGift.text} width={20} height={20} className="rounded" />
                            <span className="text-xs font-bold text-primary-dark">{freeGift.text}</span>
                            {freeGift.value && <span className="text-xs text-gray-400 ml-1">(${freeGift.value})</span>}
                        </div>
                    )}

                    {/* Price Row */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-primary-color">{formatSimpleMoney(preview.totalAdjustedAmount, currency)}</span>
                        <span className="text-xs text-gray-400 line-through">{formatSimpleMoney(preview.totalAmount, currency)}</span>
                        <span className="text-xs text-green-600 font-semibold ml-2">{uiText?.youSaveText || 'You save $'}{saveAmount.toFixed(2)}</span>
                    </div>

                    {/* Buy Now Button */}
                    {showBuyNow && (
                        <Button
                            disabled={btnBuyNowLoading || disabled}
                            className="w-full text-white px-6 py-2 text-base rounded-full font-bold shadow-lg"
                            style={{ backgroundColor: 'var(--primary-color)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
                            onClick={async (e) => {
                                e.stopPropagation();
                                setBtnBuyNowLoading(true);
                                await handleBuyNow(pack.bundleName);
                                setBtnBuyNowLoading(false);
                            }}
                        >
                            {btnBuyNowLoading ? <Spinner /> : (uiText?.buyNow?.toUpperCase() || "BUY NOW")}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};