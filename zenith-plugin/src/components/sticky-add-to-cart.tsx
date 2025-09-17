declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

import { Button } from "@/src/components/ui/button"
import { formatSimpleMoney } from "@tagadapay/plugin-sdk"
import { PreviewPack } from "@/src/hooks/use-controller"
import { useKlaviyoTracking } from "@/src/hooks/use-klaviyo-tracking"
import { useStoreData } from "@/src/hooks/use-store-data"
import { useTagataConfig } from "@/src/hooks/use-tagada-context"

interface StickyAddToCartProps {
  selectedPack: PreviewPack | null
  onBuyNow: (packName: string) => void
  isLoading?: boolean
  productImage?: string
}

export function StickyAddToCart({
  selectedPack,
  onBuyNow,
  isLoading = false,
  productImage = "/images/zenith-product.webp"
}: StickyAddToCartProps) {
  const { trackAddedToCart } = useKlaviyoTracking();
  const { productId, variantId } = useStoreData();
  const { config } = useTagataConfig();
  const uiText = config?.content?.text?.en?.uiText;
  const productData = config?.productData;

  const handleBuyNowClick = () => {
    if (selectedPack) {
      // Facebook Pixel: AddToCart and InitiateCheckout events
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'AddToCart', {
          content_name: selectedPack.bundleName,
          value: selectedPack.preview.totalAdjustedAmount / 100,
          currency: 'USD',
        });
        window.fbq('track', 'InitiateCheckout', {
          content_name: selectedPack.bundleName,
          value: selectedPack.preview.totalAdjustedAmount / 100,
          currency: 'USD',
        });
      }

      // Klaviyo tracking
      trackAddedToCart({
        productId: productId,
        productName: productData?.productName || 'Zenith Pure Himalayan Shilajit Gold Gummies',
        variantId: variantId,
        price: selectedPack.preview.totalAdjustedAmount / 100,
        currency: 'USD',
        quantity: selectedPack.bundleName.includes('1 Pack') ? 1 :
          selectedPack.bundleName.includes('2 + 1') ? 3 : 5,
        lineTotal: selectedPack.preview.totalAdjustedAmount / 100,
        bundleName: selectedPack.bundleName,
        sku: variantId,
        categories: productData?.categories || ['Supplements', 'Shilajit', 'Gummies', 'Health'],
        imageUrl: productImage,
        url: window.location.href
      });

      onBuyNow(selectedPack.bundleName)
    } else {
      // Fallback: scroll to product picker if no pack selected
      const chooseColorSection = document.getElementById("choose-flavor")
      if (chooseColorSection) {
        chooseColorSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  // Calculate original price (before discounts) - simplified approach
  const getOriginalPrice = () => {
    if (!selectedPack) return 0

    // If there's a total amount before adjustments, use that
    if (selectedPack.preview.totalAmount && selectedPack.preview.totalAmount > selectedPack.preview.totalAdjustedAmount) {
      return selectedPack.preview.totalAmount
    }

    // Otherwise, don't show original price
    return 0
  }

  const currentPrice = selectedPack?.preview.totalAdjustedAmount ?? 0
  const originalPrice = getOriginalPrice()
  const hasDiscount = originalPrice > currentPrice && originalPrice > 0

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl p-4 flex items-center justify-between z-50 md:hidden border-t border-gray-200">
      <div className="flex items-center gap-3">
        <img
          src={productImage}
          alt={productData?.productName || "Zenith Pure Himalayan Shilajit Gold Gummies"}
          width={50}
          height={50}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatSimpleMoney(currentPrice, 'USD')}
            </span>
            {selectedPack && (
              <span
                className="text-xs px-2 py-1 rounded-full font-medium text-primary-dark"
                style={{
                  backgroundColor: '#FAF8F2'
                }}
              >
                {selectedPack.bundleName}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatSimpleMoney(originalPrice, 'USD')}
            </span>
          )}
        </div>
      </div>
      <Button
        onClick={handleBuyNowClick}
        disabled={isLoading}
        className="text-white px-6 py-2 rounded-md text-base disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--primary-color)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
      >
        {isLoading ? (uiText?.loading || "Loading...") : (uiText?.buyNow?.toUpperCase() || "BUY NOW")}
      </Button>
    </div>
  )
}
