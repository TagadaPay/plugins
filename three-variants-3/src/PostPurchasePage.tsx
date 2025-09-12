import {
  formatMoney,
  usePluginConfig,
  usePostPurchases,
} from "@tagadapay/plugin-sdk/react";
import { ChevronLeft, ChevronRight, Clock, ShoppingCart } from "lucide-react";
import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";

interface PostPurchasePageProps {
  orderId: string;
}

const PostPurchasePage: React.FC<PostPurchasePageProps> = ({ orderId }) => {
  // Get branding configuration
  const config = usePluginConfig();
  const theme = config?.config?.theme || {};
  const settings = config?.config?.settings || {};

  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.countdownDuration || 120);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use the enhanced SDK hook with auto-initialization and variant selection
  const {
    offers,
    isLoading,
    error,
    getAvailableVariants,
    selectVariant,
    getOrderSummary,
    isLoadingVariants,
    isUpdatingOrderSummary,
    confirmPurchase,
  } = usePostPurchases({
    orderId,
    enabled: true,
    autoInitializeCheckout: settings.autoInitializeCheckout ?? true,
  });

  // Countdown timer effect
  React.useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-redirect effect for errors - must be before any conditional returns
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        // Redirect to thank you page or main site
        window.location.href = `/thankyou/${orderId}`;
        console.log("Would redirect due to error loading offers");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, orderId]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAcceptOffer = useCallback(async () => {
    if (!offers || currentOfferIndex >= offers.length) return;

    const currentOffer = offers[currentOfferIndex];
    setIsProcessing(true);

    try {
      // Use the enhanced SDK method to confirm purchase with current variant selections
      await confirmPurchase(currentOffer.id, {
        draft: false,
        returnUrl: window.location.href,
      });

      toast.success("Offer accepted successfully!");

      // Move to next offer or redirect to thank you page
      if (currentOfferIndex < offers.length - 1) {
        setCurrentOfferIndex(currentOfferIndex + 1);
      } else {
        // Redirect to thank you page
        window.location.href = `/thankyou/${orderId}`;
      }
    } catch (error) {
      console.error("Failed to accept offer:", error);

      // Auto-skip to next offer instead of stopping the flow
      if (currentOfferIndex < offers.length - 1) {
        toast.error("Offer failed to process. Moving to next offer...");
        setCurrentOfferIndex(currentOfferIndex + 1);
      } else {
        toast.error("Offer failed to process. Redirecting...");
        // Redirect to thank you page even on error
        window.location.href = `/thankyou/${orderId}`;
      }
    } finally {
      setIsProcessing(false);
    }
  }, [offers, currentOfferIndex, confirmPurchase]);

  const handleSkipOffer = useCallback(() => {
    if (currentOfferIndex < offers.length - 1) {
      setCurrentOfferIndex(currentOfferIndex + 1);
    } else {
      // Redirect to thank you page
      //   window.location.href = `/thankyou/${orderId}`;
    }
  }, [currentOfferIndex, offers.length]);

  const handlePreviousOffer = useCallback(() => {
    if (currentOfferIndex > 0) {
      setCurrentOfferIndex(currentOfferIndex - 1);
    }
  }, [currentOfferIndex]);

  // Handle variant selection using enhanced SDK method
  const handleVariantSelect = useCallback(
    async (offerId: string, productId: string, variantId: string) => {
      try {
        await selectVariant(offerId, productId, variantId);
        // No toast notification for variant changes - they're frequent and visual feedback is provided by UI
      } catch (error) {
        console.error("Failed to update variant:", error);
        // Only show error toasts for failed variant selections
        toast.error("Failed to update variant selection");
      }
    },
    [selectVariant]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your exclusive offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Offers
          </h2>
          <p className="text-gray-600 mb-4">
            We're having trouble loading your special offers right now.
          </p>
          <p className="text-sm text-gray-500">Redirecting you shortly...</p>
        </div>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    // Redirect to thank you page if no offers
    // window.location.href = `/thankyou/${orderId}`;
    return null;
  }

  const currentOffer = offers[currentOfferIndex];

  // Get the enhanced order summary with variant options from SDK
  const orderSummary = getOrderSummary(currentOffer.id);
  // Fall back to basic summary if enhanced summary not available yet
  const summary = orderSummary || currentOffer.summaries[0];

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your offer...</p>
        </div>
      </div>
    );
  }

  const discountPercentage = Math.round(
    (1 - summary.totalAdjustedAmount / summary.totalAmount) * 100
  );
  const isOfferUpdating = isUpdatingOrderSummary(currentOffer.id);

  // Generate dynamic styles based on theme
  const primaryColor = theme.primary || "#3b82f6";
  const accentColor = theme.accent || "#0ea5e9";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            🎉 Special Offer Just For You!
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            Limited time offer - don't miss out on these amazing deals
          </p>

          {/* Progress indicators */}
          {offers.length > 1 && (
            <div className="flex justify-center items-center gap-3 mb-6">
              {offers.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                    index === currentOfferIndex
                      ? "scale-125"
                      : index < currentOfferIndex
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                  style={{
                    backgroundColor:
                      index === currentOfferIndex ? primaryColor : undefined,
                  }}
                />
              ))}
              <span className="ml-3 text-sm sm:text-base text-gray-600 font-medium">
                {currentOfferIndex + 1} of {offers.length}
              </span>
            </div>
          )}

          {/* Countdown Timer */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-100 to-orange-100 text-red-800 px-4 sm:px-5 py-2 sm:py-3 rounded-full text-sm sm:text-base shadow-md">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-mono font-bold text-base sm:text-lg">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm font-medium">left to claim</span>
          </div>
        </div>

        {/* Offer Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-100">
          {/* Offer Header */}
          <div
            className="text-white p-4 sm:p-6"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
            }}
          >
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight">
                  {currentOffer.titleTrans?.en || `Offer #${currentOffer.id}`}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {formatMoney(summary.totalAdjustedAmount, summary.currency)}
                  </span>
                  {summary.totalAmount > summary.totalAdjustedAmount && (
                    <span className="text-lg sm:text-xl line-through opacity-75">
                      {formatMoney(summary.totalAmount, summary.currency)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 sm:py-3 inline-block border border-white/30">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    {discountPercentage}%
                  </div>
                  <div className="text-xs sm:text-sm font-medium">OFF</div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
              <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
              What you'll get ({summary.items.length}{" "}
              {summary.items.length === 1 ? "item" : "items"})
            </h3>

            <div
              className={`grid gap-4 ${
                summary.items.length > 1 ? "lg:grid-cols-2" : ""
              }`}
            >
              {summary.items.map((item: any) => {
                const availableVariants = getAvailableVariants(
                  currentOffer.id,
                  item.productId
                );
                const isLoadingThisVariant = isLoadingVariants(
                  currentOffer.id,
                  item.productId
                );

                return (
                  <div
                    key={item.id}
                    className={`border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-200 bg-gray-50/50 ${
                      summary.items.length === 1 ? "p-4 sm:p-6" : "p-3 sm:p-4"
                    }`}
                  >
                    <div
                      className={`flex flex-col gap-3 ${
                        summary.items.length === 1
                          ? "sm:flex-row sm:gap-6"
                          : "lg:flex-row lg:gap-4"
                      }`}
                    >
                      {/* Product Image */}
                      <div
                        className={`relative bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm ${
                          summary.items.length === 1
                            ? "w-full sm:w-32 h-32 sm:h-32"
                            : "w-full lg:w-24 h-32 lg:h-24"
                        }`}
                      >
                        {item.variant?.imageUrl ? (
                          <img
                            src={item.variant.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="w-8 h-8 lg:w-6 lg:h-6" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">
                          x{item.quantity}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                            {item.product.name}
                          </h4>
                          <p className="text-lg sm:text-xl font-bold text-blue-600">
                            {formatMoney(item.unitAmount, summary.currency)}
                          </p>
                        </div>

                        {/* Enhanced Variant Selection */}
                        {availableVariants.length > 1 ? (
                          <div>
                            <p className="text-sm font-semibold text-gray-800 mb-2">
                              Choose variant:
                            </p>
                            <div className="space-y-2">
                              {availableVariants.map((variant: any) => {
                                const isSelected =
                                  item.variantId === variant.variantId;
                                // Get price from currencyOptions - handle both object and direct amount structures
                                const variantPrice = (() => {
                                  if (!variant.currencyOptions) return 0;

                                  // Handle CurrencyOptions structure with currency keys
                                  if (
                                    typeof variant.currencyOptions ===
                                      "object" &&
                                    summary.currency in variant.currencyOptions
                                  ) {
                                    const currencyData = (
                                      variant.currencyOptions as any
                                    )[summary.currency];
                                    return currencyData?.amount || 0;
                                  }

                                  // Handle direct amount structure
                                  if ("amount" in variant.currencyOptions) {
                                    return (
                                      (variant.currencyOptions as any).amount ||
                                      0
                                    );
                                  }

                                  return 0;
                                })();

                                return (
                                  <button
                                    key={variant.variantId}
                                    onClick={() =>
                                      handleVariantSelect(
                                        currentOffer.id,
                                        item.productId,
                                        variant.variantId
                                      )
                                    }
                                    disabled={
                                      isLoadingThisVariant || isOfferUpdating
                                    }
                                    className={`
                                      w-full p-3 rounded-lg border-2 text-left transition-all duration-200 
                                      ${
                                        isSelected
                                          ? "shadow-md ring-1"
                                          : "border-gray-200 bg-white hover:shadow-sm"
                                      }
                                      ${
                                        isLoadingThisVariant || isOfferUpdating
                                          ? "opacity-50 cursor-not-allowed"
                                          : "cursor-pointer active:scale-[0.98]"
                                      }
                                      focus:outline-none focus:ring-2 focus:ring-offset-2
                                    `}
                                    style={
                                      {
                                        borderColor: isSelected
                                          ? primaryColor
                                          : undefined,
                                        backgroundColor: isSelected
                                          ? `${primaryColor}10`
                                          : undefined,
                                        "--tw-ring-color": isSelected
                                          ? `${primaryColor}40`
                                          : undefined,
                                        "--tw-ring-offset-color": primaryColor,
                                      } as React.CSSProperties
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        {/* Radio button indicator */}
                                        <div
                                          className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all shadow-sm`}
                                          style={{
                                            borderColor: isSelected
                                              ? primaryColor
                                              : "#d1d5db",
                                            backgroundColor: isSelected
                                              ? primaryColor
                                              : "transparent",
                                          }}
                                        >
                                          {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                          )}
                                        </div>

                                        <div className="flex-1">
                                          <p
                                            className={`font-semibold text-sm sm:text-base ${
                                              isSelected
                                                ? "text-blue-900"
                                                : "text-gray-900"
                                            }`}
                                          >
                                            {variant.variantName}
                                          </p>
                                          {variant.variantSku && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              SKU: {variant.variantSku}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Price display */}
                                      <div className="text-right">
                                        <p
                                          className={`font-bold text-base sm:text-lg ${
                                            isSelected
                                              ? "text-blue-600"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          {formatMoney(
                                            variantPrice,
                                            summary.currency
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          item.variant?.name && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-600">
                                {item.variant.name}
                              </p>
                            </div>
                          )
                        )}

                        {isLoadingThisVariant && (
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Updating...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
            <button
              onClick={handleAcceptOffer}
              disabled={
                isProcessing ||
                isOfferUpdating ||
                summary.items.some((item: any) =>
                  isLoadingVariants(currentOffer.id, item.productId)
                )
              }
              className="w-full text-white font-bold py-5 sm:py-6 px-6 sm:px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 mb-6 text-lg sm:text-xl active:scale-[0.98] shadow-xl disabled:shadow-none hover:shadow-2xl disabled:opacity-50"
              style={{
                background:
                  isProcessing || isOfferUpdating
                    ? "#9ca3af"
                    : `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                filter:
                  isProcessing || isOfferUpdating
                    ? "none"
                    : "brightness(1) hover:brightness(0.9)",
              }}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="font-bold">Processing...</span>
                </>
              ) : isOfferUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="font-bold">Updating prices...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  <span className="font-bold">
                    Add to Cart -{" "}
                    {formatMoney(summary.totalAdjustedAmount, summary.currency)}
                  </span>
                </>
              )}
            </button>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePreviousOffer}
                disabled={currentOfferIndex === 0 || isProcessing}
                className="flex items-center gap-3 px-5 py-4 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-white hover:shadow-md transition-all active:scale-95 min-h-[52px] font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-base sm:text-lg">Previous</span>
              </button>

              {/* Offer indicator dots */}
              {offers.length > 1 && (
                <div className="flex items-center gap-2">
                  {offers.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentOfferIndex
                          ? "scale-125 shadow-md"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      style={{
                        backgroundColor:
                          index === currentOfferIndex
                            ? primaryColor
                            : undefined,
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={handleSkipOffer}
                disabled={isProcessing}
                className="flex items-center gap-3 px-5 py-4 text-gray-600 hover:text-gray-800 disabled:opacity-50 rounded-xl hover:bg-white hover:shadow-md transition-all active:scale-95 min-h-[52px] font-medium"
              >
                <span className="text-base sm:text-lg">No Thanks</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        {settings.showTrustBadges !== false && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3 text-gray-700 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                ✓
              </div>
              <span className="text-base font-semibold">Secure Checkout</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-700 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg">
                🔒
              </div>
              <span className="text-base font-semibold">Safe Payment</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-700 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-lg">
                ⚡
              </div>
              <span className="text-base font-semibold">Limited Time</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPurchasePage;
