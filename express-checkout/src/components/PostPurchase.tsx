"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrandingColors } from "@/lib/branding";
import { cn } from "@/lib/utils";
import { ExpressCheckoutConfig } from "@/types/plugin-config";
import {
  formatMoney,
  usePluginConfig,
  usePostPurchases,
} from "@tagadapay/plugin-sdk/v2";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";

const getText = (value: string | undefined, fallback: string) =>
  value ?? fallback;

export default function PostPurchase() {
  const { orderId } = useParams<{ orderId: string }>();
  const brandingColors = useBrandingColors();
  const { config } = usePluginConfig<ExpressCheckoutConfig>();
  const postPurchaseTexts = config?.texts?.postPurchase;

  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);

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
    orderId: orderId || "",
    enabled: Boolean(orderId),
    autoInitializeCheckout: true,
  });

  // countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // redirect on error after short delay
  useEffect(() => {
    if (!error || !orderId) return;
    const timer = setTimeout(() => {
      window.location.href = `/thankyou/${orderId}`;
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, orderId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAcceptOffer = useCallback(async () => {
    if (!offers || currentOfferIndex >= offers.length || !orderId) return;

    const currentOffer = offers?.[currentOfferIndex];
    setIsProcessing(true);

    try {
      await confirmPurchase(currentOffer.id, {
        draft: false,
        returnUrl: window.location.href,
      });

      toast.success(
        getText(
          postPurchaseTexts?.toastOfferAccepted,
          "Offer added to your order!"
        )
      );

      if (currentOfferIndex < offers.length - 1) {
        setCurrentOfferIndex((idx) => idx + 1);
      } else {
        window.location.href = `/thankyou/${orderId}`;
      }
    } catch (err) {
      console.error("Failed to accept offer:", err);
      if (currentOfferIndex < offers.length - 1) {
        toast.error(
          getText(
            postPurchaseTexts?.toastOfferFailedNext,
            "Offer failed to process. Moving to next offer..."
          )
        );
        setCurrentOfferIndex((idx) => idx + 1);
      } else {
        toast.error(
          getText(
            postPurchaseTexts?.toastOfferFailedRedirect,
            "Offer failed to process. Redirecting..."
          )
        );
        window.location.href = `/thankyou/${orderId}`;
      }
    } finally {
      setIsProcessing(false);
    }
  }, [offers, currentOfferIndex, confirmPurchase, orderId, postPurchaseTexts]);

  const handleSkipOffer = useCallback(() => {
    if (!offers || !orderId) return;
    if (currentOfferIndex < offers.length - 1) {
      setCurrentOfferIndex((idx) => idx + 1);
    } else {
      window.location.href = `/thankyou/${orderId}`;
    }
  }, [currentOfferIndex, offers, orderId]);

  const handlePreviousOffer = useCallback(() => {
    setCurrentOfferIndex((idx) => (idx > 0 ? idx - 1 : idx));
  }, []);

  const handleVariantSelect = useCallback(
    async (offerId: string, productId: string, variantId: string) => {
      try {
        await selectVariant(offerId, productId, variantId);
      } catch (err) {
        console.error("Failed to update variant:", err);
        toast.error(
          getText(
            postPurchaseTexts?.toastVariantFailed,
            "Failed to update variant selection"
          )
        );
      }
    },
    [selectVariant, postPurchaseTexts]
  );
  const currentOffer = offers[currentOfferIndex];
  const summary = useMemo(() => {
    if (!currentOffer) return null;
    const enhanced = getOrderSummary(currentOffer.id);
    return enhanced || currentOffer.summaries[0];
  }, [currentOffer, getOrderSummary]);

  const primaryColor = brandingColors.primary;
  const accentColor = brandingColors.primary400;

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive">
            {getText(
              postPurchaseTexts?.orderIdRequiredTitle,
              "Order ID required"
            )}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {getText(
              postPurchaseTexts?.orderIdRequiredMessage,
              "No order ID provided in the URL."
            )}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">
            {getText(
              postPurchaseTexts?.loadingTitle,
              "Loading your exclusive offer..."
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {getText(
              postPurchaseTexts?.loadingMessage,
              "Please wait while we prepare your limited-time upgrade."
            )}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="mx-4 max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              {getText(postPurchaseTexts?.errorTitle, "Unable to load offers")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {getText(
                postPurchaseTexts?.errorMessage,
                "We’re having trouble loading your post‑purchase offers right now."
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {getText(
                postPurchaseTexts?.errorRedirectMessage,
                "You’ll be redirected to your order confirmation shortly."
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return null;
  }

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">
            {getText(
              postPurchaseTexts?.preparingTitle,
              "Preparing your offer..."
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {getText(
              postPurchaseTexts?.preparingMessage,
              "Hang tight while we finalize the details of your upgrade."
            )}
          </p>
        </div>
      </div>
    );
  }

  const discountPercentage = Math.round(
    (1 - summary.totalAdjustedAmount / summary.totalAmount) * 100
  );
  const isOfferUpdating = isUpdatingOrderSummary(currentOffer.id);

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm font-semibold">
              {formatTime(timeLeft)}
            </span>
            <span className="hidden sm:inline">
              {getText(
                postPurchaseTexts?.timerLabel,
                "left to claim this offer"
              )}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {getText(
                postPurchaseTexts?.headerTitle,
                "One more thing before you go"
              )}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {getText(
                postPurchaseTexts?.headerSubtitle,
                "As a thank you for your order, we’ve unlocked a limited‑time upgrade you can add in one click."
              )}
            </p>
          </div>

          {offers.length > 1 && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={handlePreviousOffer}
                disabled={currentOfferIndex === 0}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border bg-background",
                  currentOfferIndex === 0 && "opacity-40"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                {getText(
                  postPurchaseTexts?.offerPositionLabel,
                  `Offer ${currentOfferIndex + 1} of ${offers.length}`
                )
                  .replace("{current}", String(currentOfferIndex + 1))
                  .replace("{total}", String(offers.length))}
              </span>
              <button
                type="button"
                onClick={handleSkipOffer}
                disabled={currentOfferIndex === offers.length - 1}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border bg-background",
                  currentOfferIndex === offers.length - 1 && "opacity-40"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Offer card */}
          <Card className="overflow-hidden">
            <div
              className="border-b px-4 py-3 text-left text-sm font-medium text-primary-foreground sm:px-6"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
              }}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide opacity-80">
                    {getText(
                      postPurchaseTexts?.bannerBadge,
                      "Limited‑time upgrade"
                    )}
                  </div>
                  <div className="text-lg font-semibold sm:text-xl">
                    {currentOffer.titleTrans?.en || `Offer #${currentOffer.id}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-background/15 px-3 py-1 text-xs font-semibold">
                    {getText(
                      postPurchaseTexts?.bannerSubtitle,
                      `Save ${discountPercentage}% on this exclusive add‑on to your order.`
                    ).replace("{discount}", String(discountPercentage))}
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="space-y-4 p-4 sm:p-6">
              {/* Items */}
              <div className="space-y-3">
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
                      className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3 sm:flex-row sm:items-center sm:p-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="relative h-20 w-20 overflow-hidden rounded-md bg-background shadow-sm">
                          {item.variant?.imageUrl ? (
                            <img
                              src={item.variant.imageUrl}
                              alt={item.product?.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <ShoppingCart className="h-6 w-6" />
                            </div>
                          )}
                          <div className="absolute right-1 top-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold text-foreground shadow">
                            ×{item.quantity}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground sm:text-base">
                              {item.product?.name}
                            </p>
                            {item.variant?.name && (
                              <p className="text-xs text-muted-foreground">
                                {item.variant.name}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              {formatMoney(item.unitAmount, summary.currency)}
                            </p>
                          </div>
                        </div>

                        {availableVariants.length > 1 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              {getText(
                                postPurchaseTexts?.chooseVariantLabel,
                                "Choose a variant:"
                              )}
                            </p>
                            <div className="space-y-2">
                              {availableVariants.map((variant: any) => {
                                const isSelected =
                                  item.variantId === variant.variantId;
                                return (
                                  <button
                                    key={variant.variantId}
                                    type="button"
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
                                    className={cn(
                                      "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs sm:text-sm",
                                      isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-background",
                                      (isLoadingThisVariant ||
                                        isOfferUpdating) &&
                                        "cursor-not-allowed opacity-60"
                                    )}
                                  >
                                    <span className="font-medium">
                                      {variant.variantName}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary / actions */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                {getText(
                  postPurchaseTexts?.summaryTitle,
                  "Order upgrade summary"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {getText(
                      postPurchaseTexts?.summaryOriginalTotalLabel,
                      "Original total"
                    )}
                  </span>
                  <span className="font-medium">
                    {formatMoney(summary.totalAmount, summary.currency)}
                  </span>
                </div>
                {summary.totalAmount > summary.totalAdjustedAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {getText(
                        postPurchaseTexts?.summaryYouSaveLabel,
                        "You save"
                      )}
                    </span>
                    <span className="font-medium text-green-600">
                      {formatMoney(
                        summary.totalAmount - summary.totalAdjustedAmount,
                        summary.currency
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-sm font-semibold">
                  <span>
                    {getText(
                      postPurchaseTexts?.summaryTotalWithUpgradeLabel,
                      "Total with upgrade"
                    )}
                  </span>
                  <span>
                    {formatMoney(summary.totalAdjustedAmount, summary.currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAcceptOffer}
                  disabled={isProcessing || isOfferUpdating}
                  style={{
                    backgroundColor: brandingColors.primary,
                    borderColor: brandingColors.primary,
                    color: "white",
                  }}
                >
                  {isProcessing
                    ? getText(
                        postPurchaseTexts?.primaryCtaProcessingLabel,
                        "Adding to your order..."
                      )
                    : getText(
                        postPurchaseTexts?.primaryCtaLabel,
                        "Yes, add this to my order"
                      )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSkipOffer}
                  disabled={isProcessing}
                >
                  {getText(
                    postPurchaseTexts?.secondaryCtaLabel,
                    "No thanks, continue to order confirmation"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
