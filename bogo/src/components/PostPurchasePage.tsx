import { Button } from "@/components/ui/button";
import { PluginConfig } from "@/types/plugin-config";
import {
  formatMoney,
  usePluginConfig,
  usePostPurchases,
  useTranslation,
} from "@tagadapay/plugin-sdk/v2";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Type to track offer responses in localStorage
interface OfferResponse {
  offerId: string;
  accepted: boolean;
  date: string;
}

// Key for localStorage
const LS_KEY_PREFIX = "post-purchase-offers-";

type PostPurchasePageProps = {
  orderId: string;
};

function PostPurchasePage({
  orderId,
}: PostPurchasePageProps): React.JSX.Element | null {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [offerResponses, setOfferResponses] = useState<OfferResponse[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();

  // Construct localStorage key with orderId for this specific order's offers
  const localStorageKey = `${LS_KEY_PREFIX}${orderId}`;

  const {
    offers,
    isLoading,
    error,
    initCheckoutSession,
    payWithCheckoutSession,
  } = usePostPurchases({
    orderId,
  });

  // Load offer responses from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedResponses = localStorage.getItem(localStorageKey);
        if (savedResponses) {
          const parsedResponses = JSON.parse(savedResponses) as OfferResponse[];
          setOfferResponses(parsedResponses);

          // If we have responses, find the first unanswered offer
          if (offers && parsedResponses.length > 0) {
            const firstUnansweredIndex = offers.findIndex(
              (offer) =>
                !parsedResponses.some(
                  (response) => response.offerId === offer.id
                )
            );

            if (firstUnansweredIndex !== -1) {
              setCurrentOfferIndex(firstUnansweredIndex);
            } else {
              // All offers have been answered, don't set any index
              // The main render logic will handle redirecting to thank you page
            }
          }
        }
      } catch (error) {
        console.error(
          "Error loading offer responses from localStorage:",
          error
        );
      }
    }
  }, [localStorageKey, offers]);

  // Save offer responses to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && offerResponses.length > 0) {
      localStorage.setItem(localStorageKey, JSON.stringify(offerResponses));
    }
  }, [localStorageKey, offerResponses]);

  const goToThankYouPage = useCallback(() => {
    navigate(`/thankyou/${orderId}`);
  }, [navigate, orderId]);

  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();
  const postPurchaseContent = pluginConfig.content.postPurchase;
  const bannerImages = postPurchaseContent.bannerImages;
  const productContent = postPurchaseContent.product;
  const actionsContent = postPurchaseContent.actions;
  const footerContent = postPurchaseContent.footer;
  const companyName = t(pluginConfig.branding.companyName);
  const currentYear = new Date().getFullYear().toString();

  const getDiscountPercentage = useCallback((offer: any) => {
    if (!offer?.summaries?.[0]) return 0;

    const summary = offer.summaries[0];
    if (summary.totalAmount === 0) return 0;

    return Math.round(
      (1 - summary.totalAdjustedAmount / summary.totalAmount) * 100
    );
  }, []);

  // Go to previous offer if allowed
  const handlePreviousOffer = useCallback(() => {
    if (currentOfferIndex > 0) {
      // Only allow going back if the previous offer wasn't accepted
      const previousOfferIndex = currentOfferIndex - 1;
      const previousOffer = offers?.[previousOfferIndex];

      if (previousOffer) {
        const previousResponse = offerResponses.find(
          (r) => r.offerId === previousOffer.id
        );

        // Only allow going back if the previous offer wasn't accepted
        if (!previousResponse?.accepted) {
          setCurrentOfferIndex(previousOfferIndex);

          // Remove the previous response from our tracking if it exists
          if (previousResponse) {
            setOfferResponses((prev) =>
              prev.filter((r) => r.offerId !== previousOffer.id)
            );
          }
        }
      }
    }
  }, [currentOfferIndex, offers, offerResponses]);

  // Skip current offer - handles next functionality
  const handleSkipOffer = useCallback(() => {
    if (!offers || currentOfferIndex >= offers.length) return;

    const currentOffer = offers[currentOfferIndex];

    // Record the rejection
    const newResponse: OfferResponse = {
      offerId: currentOffer.id,
      accepted: false,
      date: new Date().toISOString(),
    };

    setOfferResponses((prev) => [...prev, newResponse]);

    // Move to next offer or thank you page if this was the last one
    if (currentOfferIndex < offers.length - 1) {
      setCurrentOfferIndex(currentOfferIndex + 1);
    } else {
      goToThankYouPage();
    }
  }, [currentOfferIndex, offers, goToThankYouPage]);

  // Handles accepting and paying for the current offer with selected variants
  const handlePay = useCallback(async () => {
    if (!offers || !offers[currentOfferIndex]) return;

    const currentOffer = offers[currentOfferIndex];
    setIsProcessingPayment(true);

    try {
      // Record the acceptance
      const newResponse: OfferResponse = {
        offerId: currentOffer.id,
        accepted: true,
        date: new Date().toISOString(),
      };

      setOfferResponses((prev) => [...prev, newResponse]);

      // TODO: Use initCheckoutSessionWithVariants when SDK is updated
      // For now, using the default initCheckoutSession
      // const session = await initCheckoutSessionWithVariants(
      //   currentOffer.id,
      //   orderId,
      //   selectedVariants
      // );
      const session = await initCheckoutSession(currentOffer.id, orderId);
      const checkoutSessionId = session.checkoutSessionId;
      if (!checkoutSessionId)
        throw new Error("Failed to create checkout session");

      // Pay for the offer using the checkout session
      await payWithCheckoutSession(checkoutSessionId, orderId);

      // Move to next offer or thank you page if this was the last one
      goToThankYouPage();
    } catch (err) {
      console.error("Error processing payment:", err);
      // Remove the response if payment failed
      setOfferResponses((prev) =>
        prev.filter((r) => r.offerId !== currentOffer.id)
      );
    } finally {
      setIsProcessingPayment(false);
    }
  }, [
    offers,
    currentOfferIndex,
    orderId,
    goToThankYouPage,
    initCheckoutSession,
    payWithCheckoutSession,
  ]);

  // If there are no offers, go to thank you page
  if (!isLoading && (!offers || offers.length === 0)) {
    goToThankYouPage();
    return null;
  }

  // If all offers have been answered, go to thank you page
  if (!isLoading && offers && offers.length > 0 && offerResponses.length > 0) {
    const allOffersAnswered = offers.every((offer) =>
      offerResponses.some((response) => response.offerId === offer.id)
    );
    if (allOffersAnswered) {
      goToThankYouPage();
      return null;
    }
  }

  // If there are no unanswered offers, go to thank you page
  if (!isLoading && offers && offers.length > 0) {
    const hasUnansweredOffers = offers.some(
      (offer) =>
        !offerResponses.some((response) => response.offerId === offer.id)
    );
    if (!hasUnansweredOffers) {
      goToThankYouPage();
      return null;
    }
  }

  // Show loading state while fetching offers
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f3f0] font-sans">
        <div className="flex flex-grow flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">
              {t(postPurchaseContent.loadingMessage)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f3f0] font-sans">
        <div className="flex flex-grow flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {t(postPurchaseContent.errorTitle)}
            </h1>
            <p className="mt-2 text-gray-600">
              {error?.message || t(postPurchaseContent.errorTitle)}
            </p>
            <Button onClick={goToThankYouPage} className="mt-4">
              {t(postPurchaseContent.errorButton)}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get the current offer to display
  const currentOffer = offers?.[currentOfferIndex];

  if (!currentOffer) {
    goToThankYouPage();
    return null;
  }

  // Check if we can show previous button (can't go back to accepted offers)
  const canGoPrevious =
    currentOfferIndex > 0 &&
    offers?.[currentOfferIndex - 1] &&
    !offerResponses.some((r) => {
      const previousOfferId = offers[currentOfferIndex - 1].id;
      return r.offerId === previousOfferId && r.accepted;
    });

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Special Offer Banner */}

      <div className="flex flex-col items-center">
        <div className="relative h-[104px] w-full border-b-[2.4px] border-[rgb(183,183,183)] pb-6 pt-2.5">
          <img
            src={bannerImages.specialOffer}
            alt={t(postPurchaseContent.banner.offerExpires)}
            className="absolute top-0 bottom-0 left-0 h-full w-auto"
          />
          <img
            src={bannerImages.steps}
            alt={t(postPurchaseContent.banner.headline)}
            className="mx-auto h-full w-auto"
          />
        </div>
        {/* Main Content */}
        <div className="w-full max-w-[1170px] text-center">
          {/* Expiration Message */}
          <p className="mb-4 text-lg font-semibold text-red-600">
            {t(postPurchaseContent.banner.offerExpires)}
          </p>

          {/* Main Headline */}
          <h1 className="mb-5 text-2xl font-bold text-black sm:text-5xl">
            {t(postPurchaseContent.banner.headline)}
          </h1>

          {/* Persuasive Message */}
          <p
            className="mb-8 text-lg text-black sm:text-2xl"
            dangerouslySetInnerHTML={{
              __html: t(postPurchaseContent.banner.persuasiveMessage),
            }}
          />

          {/* Product Section with Dashed Border */}
          <div className="relative mx-2.5 mb-8 border-2 border-dashed border-black py-1.25 px-2.5 sm:py-2.5 sm:px-5">
            <img
              src={bannerImages.product}
              alt={t(productContent.fallbackProductName)}
              className="absolute -bottom-6 left-2 block h-auto w-[80px] ratio-130/119 object-cover sm:hidden"
            />
            <div
              className="size-[93px] text-[27px] leading-[28px] text-white absolute -top-10 right-2 sm:top-4 sm:right-5 pt-3.5"
              style={{
                fontFamily: "'Oswald', sans-serif",
                backgroundImage: `url(${bannerImages.priceBadge})`,
                backgroundOrigin: "padding-box",
                backgroundPosition: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundSize: "100%",
              }}
            >
              {t(productContent.badgeLabel)}
              <br />
              <span className="text-[19px]">
                {t(productContent.priceLabel)} {formatMoney(14399)}
              </span>
            </div>
            <div className="flex flex-row items-center">
              <div className="flex gap-4 max-w-[30%] min-w-[30%] w-[30%] flex-grow">
                {offers &&
                  offers.length > 0 &&
                  currentOffer &&
                  (() => {
                    const offer = currentOffer;
                    const summary = offer.summaries[0];

                    if (!summary?.items || summary.items.length === 0) {
                      // Fallback product images
                      return (
                        <>
                          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 w-32 h-40 flex flex-col items-center justify-center">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold mb-2">
                              {t(productContent.fallbackProductName)}
                            </div>
                            <div className="text-xs text-center text-gray-600">
                              {t(productContent.fallbackFormula)}
                            </div>
                            <div className="text-xs text-center text-gray-500 mt-2">
                              {t(productContent.fallbackSupplement)}
                            </div>
                            <div className="text-xs text-center text-gray-500">
                              {t(productContent.fallbackCount)}
                            </div>
                          </div>
                          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 w-32 h-40 flex flex-col items-center justify-center">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold mb-2">
                              {t(productContent.fallbackProductName)}
                            </div>
                            <div className="text-xs text-center text-gray-600">
                              {t(productContent.fallbackFormula)}
                            </div>
                            <div className="text-xs text-center text-gray-500 mt-2">
                              {t(productContent.fallbackSupplement)}
                            </div>
                            <div className="text-xs text-center text-gray-500">
                              {t(productContent.fallbackCount)}
                            </div>
                          </div>
                        </>
                      );
                    }

                    return summary.items.slice(0, 2).map((item, index) => (
                      <div
                        key={item.id || index}
                        className="bg-white w-full flex flex-col justify-center"
                      >
                        <img
                          src={bannerImages.product}
                          alt={t(productContent.fallbackProductName)}
                          className="hidden h-auto w-[130px] ratio-130/119 object-cover sm:block"
                        />
                        {item.variant.imageUrl ? (
                          <img
                            alt={item.product.name}
                            src={item.variant.imageUrl}
                            className="mt-2.5 h-full w-full object-contain"
                          />
                        ) : (
                          <>
                            <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold mb-2">
                              {t(productContent.fallbackProductName)}
                            </div>
                            <div className="text-xs text-center text-gray-600">
                              {t(productContent.fallbackFormula)}
                            </div>
                            <div className="text-xs text-center text-gray-500 mt-2">
                              {t(productContent.fallbackSupplement)}
                            </div>
                            <div className="text-xs text-center text-gray-500">
                              {t(productContent.fallbackCount)}
                            </div>
                          </>
                        )}
                      </div>
                    ));
                  })()}
              </div>
              <div className="flex flex-col flex-grow ">
                {/* Natural Ingredients Badge */}

                {/* Product Headlines */}
                <div className="text-left">
                  <p
                    className="mt-5 text-lg text-[rgb(48,48,48)] text-black sm:text-4xl"
                    style={{
                      fontFamily: "'Fjalla One', sans-serif",
                    }}
                  >
                    <strong>{t(productContent.sectionTitle)}</strong>
                  </p>
                  <h2
                    style={{
                      transform:
                        "matrix(0.996195, -0.0871557, 0.0871557, 0.996195, 0, 0)",
                      textShadow: "rgba(33, 6, 52, 0.5) 0px 2px 2px",
                      fontFamily: "'Fjalla One', sans-serif",
                    }}
                    className="mt-2 font-bold text-[rgb(117,88,221)] sm:my-2"
                  >
                    <span className="text-xl leading-[20px] sm:text-[63px] sm:leading-[63px]">
                      <em>{t(productContent.supportHeadline)}</em>
                    </span>
                  </h2>
                  <p
                    className=" mb-4 mt-10 font-semibold text-black sm:ml-[30px] sm:text-3xl"
                    style={{
                      fontFamily: "Oswald",
                    }}
                  >
                    <em>
                      <strong>{t(productContent.powerfulHeadline)}</strong>
                    </em>
                  </p>

                  {/* Product Features */}
                  <ul className="list-disc sm:ml-[30px] p-2.5">
                    <li>{t(productContent.bulletOne)}</li>
                    <li>{t(productContent.bulletTwo)}</li>
                    <li>{t(productContent.bulletThree)}</li>
                  </ul>

                  <div className="sm:ml-[30px] mt-2.5">
                    {/* Pricing */}
                    <p className="mt-2.5 py-2.5 text-base text-black sm:ml-[30px] sm:p-2.5 sm:text-2xl">
                      {t(productContent.claimToday)}
                    </p>
                    <p
                      className="mb-2.5 text-xl font-bold text-black leading-[20px] sm:text-[62px] sm:leading-[62px]"
                      style={{
                        fontFamily: "'Fjalla One', sans-serif",
                      }}
                    >
                      {formatMoney(
                        currentOffer.summaries[0].totalAdjustedAmount / 2
                      )}
                      {t(productContent.priceSuffix)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scarcity Message */}
          <p
            className="mb-8 text-5xl text-[rgb(203,19,19)] text-red-600"
            style={{
              fontFamily: "'Oswald', sans-serif",
            }}
          >
            {t(productContent.scarcityMessage)}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              onClick={handlePay}
              disabled={isProcessingPayment}
              className="bg-gradient-to-r h-auto from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold md:px-[200px] px-5 py-2.5 md:py-5 rounded-lg shadow-lg text-lg sm:text-3xl"
            >
              {isProcessingPayment
                ? t(actionsContent.processingLabel)
                : t(actionsContent.confirmLabel)}
            </Button>
          </div>

          {/* Opt-out Link */}
          <button
            onClick={handleSkipOffer}
            disabled={isProcessingPayment}
            className="text-gray-400 text-sm underline mb-8 hover:text-gray-600"
          >
            {t(actionsContent.declineLabel)}
          </button>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <img
              src={bannerImages.trustBadges}
              alt={t(productContent.sectionTitle)}
              className="w-[289px] h-auto"
            />
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-600">
            {t(footerContent.copyright, "", {
              year: currentYear,
              company: companyName,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PostPurchasePage;
