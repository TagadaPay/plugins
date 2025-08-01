import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePostPurchases } from "@tagadapay/plugin-sdk";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      if (currentOfferIndex < offers.length - 1) {
        setCurrentOfferIndex(currentOfferIndex + 1);
      } else {
        goToThankYouPage();
      }
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
            <p className="mt-2 text-gray-600">Loading offers...</p>
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
              Error Loading Offers
            </h1>
            <p className="mt-2 text-gray-600">{error.message}</p>
            <Button onClick={goToThankYouPage} className="mt-4">
              Continue to Thank You Page
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
    <div className="flex min-h-screen flex-col bg-[#f5f3f0] font-sans">
      <div className="flex flex-grow flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 w-full max-w-3xl text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Special Offer For You
          </h1>

          {/* Offer navigation indicators */}
          <div className="mt-4 flex items-center justify-center gap-1">
            {offers?.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === currentOfferIndex
                    ? "bg-current"
                    : index < currentOfferIndex
                    ? "bg-gray-400"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {offers && offers.length > 1 && (
            <p className="mt-2 text-sm text-gray-500">
              Offer {currentOfferIndex + 1} of {offers.length}
            </p>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl">
          {offers && offers.length > 0 && (
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              {(() => {
                const offer = currentOffer;
                const summary = offer.summaries[0];

                if (!summary?.items || summary.items.length === 0) return null;

                return (
                  <div className="space-y-6">
                    {/* Display all items in the offer */}
                    {summary.items.map((item, itemIndex) => {
                      return (
                        <div
                          key={item.id || itemIndex}
                          className={cn(
                            "flex flex-col items-center gap-6 sm:flex-row border-b border-gray-100 pb-6 ",
                            {
                              "border-b-0 pb-0":
                                summary.items.length - 1 === itemIndex,
                            }
                          )}
                        >
                          {item.variant.imageUrl && (
                            <img
                              src={item.variant.imageUrl}
                              alt={item.product.name}
                              className="h-32 w-32 rounded border object-contain"
                            />
                          )}
                          <div className="flex-1 text-left">
                            <h2 className="mb-1 text-xl font-semibold text-gray-800">
                              {item.product.name}
                            </h2>
                            <div className="mb-2 text-gray-600">
                              {item.product.description}
                            </div>

                            <div className="mb-4 flex items-center gap-2">
                              {/* Pricing for this item */}
                              {item.amount > item.adjustedAmount &&
                                item.amount > 0 &&
                                summary.currency && (
                                  <span className="text-lg text-gray-400 line-through">
                                    {`${(item.amount / 100).toLocaleString(
                                      undefined,
                                      {
                                        style: "currency",
                                        currency: summary.currency,
                                      }
                                    )}`}
                                  </span>
                                )}
                              <span className="text-lg font-bold text-green-600">
                                {item.adjustedAmount > 0 && summary.currency
                                  ? `${(
                                      item.adjustedAmount / 100
                                    ).toLocaleString(undefined, {
                                      style: "currency",
                                      currency: summary.currency,
                                    })}`
                                  : ""}
                              </span>
                              {(() => {
                                const itemDiscountPercentage =
                                  item.amount > 0
                                    ? Math.round(
                                        (1 -
                                          item.adjustedAmount / item.amount) *
                                          100
                                      )
                                    : 0;
                                return itemDiscountPercentage > 0 ? (
                                  <span className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-800">
                                    {itemDiscountPercentage}% OFF
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Total pricing for the entire offer */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">
                          Total:
                        </span>
                        <div className="flex items-center gap-2">
                          {summary.totalAmount > summary.totalAdjustedAmount &&
                            summary.totalAmount > 0 &&
                            summary.currency && (
                              <span className="text-lg text-gray-400 line-through">
                                {`${(summary.totalAmount / 100).toLocaleString(
                                  undefined,
                                  {
                                    style: "currency",
                                    currency: summary.currency,
                                  }
                                )}`}
                              </span>
                            )}
                          <span className="text-xl font-bold text-green-600">
                            {summary.totalAdjustedAmount > 0 && summary.currency
                              ? `${(
                                  summary.totalAdjustedAmount / 100
                                ).toLocaleString(undefined, {
                                  style: "currency",
                                  currency: summary.currency,
                                })}`
                              : ""}
                          </span>
                          {getDiscountPercentage(offer) > 0 && (
                            <span className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-800">
                              {getDiscountPercentage(offer)}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePreviousOffer}
              disabled={
                currentOfferIndex === 0 || !canGoPrevious || isProcessingPayment
              }
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={handleSkipOffer}
              disabled={isProcessingPayment}
              className="flex items-center gap-2"
            >
              No Thanks
              <ChevronRight size={16} />
            </Button>

            <Button
              onClick={handlePay}
              disabled={isProcessingPayment}
              className="ml-auto"
            >
              {isProcessingPayment ? "Processing..." : "Accept Offer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostPurchasePage;
