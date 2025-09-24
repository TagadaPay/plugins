"use client";

import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PluginConfig } from "@/types/plugin-config";
import { formatMoney, usePluginConfig } from "@tagadapay/plugin-sdk/react";

interface OfferSummary {
  currency: string;
  totalAmount: number;
  totalAdjustedAmount: number;
  items: {
    id: string;
    productId: string;
    variantId: string;
    product: {
      name: string;
      description: string;
    };
    variant: {
      name: string;
      description: string;
      imageUrl: string;
      grams: number;
    };
    unitAmount: number;
    quantity: number;
    amount: number;
    adjustedAmount: number;
  }[];
}

interface Offer {
  id: string;
  titleTrans: {
    en: string;
  };
  summaries: OfferSummary[];
  offerLineItems: {
    id: string;
    quantity: number;
    price: {
      variant: {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string;
        grams: number;
        product: {
          id: string;
          name: string;
          description: string;
        };
      };
    };
  }[];
}

interface OfferCardProps {
  offer: Offer;
  themeColor?: string;
  currency: string;
  payOffer: (offerId: string) => Promise<Response>;
}

export function OfferCard({
  offer,
  themeColor = "#0F172A",
  currency,
  payOffer,
}: OfferCardProps) {
  const { config } = usePluginConfig<PluginConfig>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [_, setSelectedVariants] = useState<string[]>([]);
  // const { fetchCms } = useCmsAuth();

  // Get the summary for the current currency
  const summary = offer.summaries.find((s: any) => s.currency === currency);
  if (!summary) return null;

  // Initialize selected variants when offer line items are available
  useEffect(() => {
    if (offer.offerLineItems?.length) {
      setSelectedVariants(
        offer.offerLineItems.map((item) => item.price.variant.id)
      );
    }
  }, [offer.offerLineItems]);

  // Group variants by type (e.g., color, size, weight)
  const getVariantGroups = (variantName: string) => {
    const groups: Record<string, string[]> = {};
    const parts = variantName.split(" / ");

    parts.forEach((part: string, index: number) => {
      const groupName = index === 0 ? "Color" : index === 1 ? "Size" : "Weight";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      if (!groups[groupName].includes(part)) {
        groups[groupName].push(part);
      }
    });

    return groups;
  };

  // Get color class based on color name
  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      Blue: "bg-blue-500",
      Red: "bg-red-500",
      Green: "bg-green-500",
      Black: "bg-black",
      White: "bg-white border border-gray-300",
      Gray: "bg-gray-500",
      Navy: "bg-indigo-900",
      Stone: "bg-stone-500",
      Purple: "bg-purple-500",
      Pink: "bg-pink-500",
      Yellow: "bg-yellow-400",
      Orange: "bg-orange-500",
      Brown: "bg-amber-800",
    };

    return colorMap[colorName] || "bg-gray-300";
  };

  const handleConfirmPurchase = async () => {
    setIsConfirming(true);
    const toastId = toast.loading("Processing...", {
      style: {
        background: themeColor,
        color: "#fff",
      },
    });

    try {
      const result = await payOffer(offer.id);

      console.log(result);

      // if (result.redirectUrl) {
      //   window.location.href = result.redirectUrl;
      // }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden text-center transition-all duration-200 hover:shadow-md">
      <div className="relative">
        <img
          src={
            summary.items[0]?.variant?.imageUrl || "https://prd.place/400/300"
          }
          alt={offer.titleTrans.en}
          className="h-48 w-full rounded-t-lg object-cover"
        />
        <Badge
          className="absolute right-2 top-2 text-white"
          style={{ backgroundColor: themeColor }}
        >
          {config.offers.labels.vipOnly}
        </Badge>
        {summary.items.length > 1 && (
          <Badge
            className="absolute left-2 top-2 text-white"
            style={{ backgroundColor: themeColor }}
          >
            {summary.items.length} {config.offers.labels.products}
          </Badge>
        )}
      </div>
      <CardHeader className="flex-grow">
        <CardTitle className="text-xl">{offer.titleTrans.en}</CardTitle>
        <CardDescription>
          <div className="mt-1 flex items-center justify-center">
            <span className="mr-2 text-zinc-400 line-through">
              {formatMoney(summary.totalAmount, currency)}
            </span>
            <span className="text-lg font-bold">
              {formatMoney(summary.totalAdjustedAmount, currency)}
            </span>
            <Badge
              variant="outline"
              className="ml-2"
              style={{ color: themeColor, borderColor: themeColor }}
            >
              {Math.round(
                (1 - summary.totalAdjustedAmount / summary.totalAmount) * 100
              )}
              % OFF
            </Badge>
          </div>
          {summary.items[0]?.product?.description && (
            <div
              className="prose prose-sm dark:prose-invert mt-2 line-clamp-2 max-w-none text-sm text-zinc-500"
              dangerouslySetInnerHTML={{
                __html: summary.items[0].product.description,
              }}
            />
          )}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-full text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: themeColor }}
            >
              {config.offers.cta.viewDeal}
            </Button>
          </DialogTrigger>
          <DialogContent className="h-[100dvh] w-full overflow-y-auto border-0 bg-white p-0 dark:bg-zinc-900 sm:h-auto sm:max-h-[85vh] sm:max-w-[800px] sm:rounded-lg">
            <div className="flex h-full flex-col sm:h-auto">
              {/* Deal Header with Image */}
              <div className="relative h-32 w-full overflow-hidden sm:h-48">
                {summary.items.length === 1 ? (
                  <img
                    src={
                      summary.items[0]?.variant?.imageUrl ||
                      "https://prd.place/800/600"
                    }
                    alt={offer.titleTrans.en}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full grid-cols-2">
                    {summary.items.slice(0, 4).map((item, index) => (
                      <div key={item.id} className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/10 dark:from-black/20 dark:to-black/30" />
                        <img
                          src={item.variant.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                        {index === 3 && summary.items.length > 4 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-lg font-medium text-white">
                              +{summary.items.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent">
                  <div className="w-full p-4 sm:p-6">
                    <Badge
                      className="mb-2 text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      {config.offers.labels.vipOnly}
                    </Badge>
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                      {offer.titleTrans.en}
                    </h2>
                    {summary.items[0]?.product?.description && (
                      <div
                        className="prose prose-sm dark:prose-invert prose-headings:text-white prose-p:text-zinc-200 mt-1 line-clamp-2 max-w-none text-sm text-zinc-200"
                        dangerouslySetInnerHTML={{
                          __html: summary.items[0].product.description,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6">
                  {/* Price and Savings Section */}
                  <div className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="mr-2 text-zinc-400 line-through">
                          {formatMoney(summary.totalAmount, currency)}
                        </span>
                        <span className="text-2xl font-bold">
                          {formatMoney(summary.totalAdjustedAmount, currency)}
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-2"
                          style={{ color: themeColor, borderColor: themeColor }}
                        >
                          {Math.round(
                            (1 -
                              summary.totalAdjustedAmount /
                                summary.totalAmount) *
                              100
                          )}
                          % OFF
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Save{" "}
                        {formatMoney(
                          summary.totalAmount - summary.totalAdjustedAmount,
                          currency
                        )}{" "}
                        on this bundle
                      </p>
                    </div>
                  </div>

                  {/* Products Section */}
                  <div className="space-y-4">
                    <h3 className="flex items-center text-base font-medium sm:text-lg">
                      <ShoppingCart
                        className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
                        style={{ color: themeColor }}
                      />
                      {config.offers.labels.bundleContents} (
                      {summary.items.length} items)
                    </h3>

                    <div className="space-y-4">
                      {summary.items.map((item) => {
                        const variantGroups = getVariantGroups(
                          item.variant.name
                        );
                        const selectedVariant = item.variant;

                        return (
                          <div
                            key={item.id}
                            className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
                          >
                            {/* Product Header */}
                            <div className="flex items-start gap-3 bg-white p-3 dark:bg-zinc-900">
                              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 sm:h-24 sm:w-24">
                                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/10 dark:from-black/20 dark:to-black/30" />
                                <img
                                  src={selectedVariant?.imageUrl}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 rounded-md border border-zinc-200/50 dark:border-zinc-700/50" />
                                <div
                                  className="absolute right-1 top-1"
                                  style={{ backgroundColor: themeColor }}
                                >
                                  <span className="rounded px-1 py-0.5 text-xs font-medium text-white">
                                    x{item.quantity}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <h4 className="text-base font-medium">
                                    {item.product.name}
                                  </h4>
                                  <div className="mt-1 text-left sm:mt-0 sm:text-right">
                                    <p
                                      className="font-medium"
                                      style={{ color: themeColor }}
                                    >
                                      {formatMoney(item.unitAmount, currency)}
                                    </p>
                                  </div>
                                </div>
                                {item.product.description && (
                                  <p
                                    className="mb-2 mt-1 text-sm text-zinc-500"
                                    dangerouslySetInnerHTML={{
                                      __html: item.product.description,
                                    }}
                                  />
                                )}

                                {/* Variant Selection */}
                                <div className="mt-2 space-y-3">
                                  {Object.entries(variantGroups).map(
                                    ([groupName, options]) => (
                                      <div
                                        key={`${item.id}-${groupName}`}
                                        className="space-y-2"
                                      >
                                        <div className="flex items-center">
                                          <span className="text-xs font-medium text-zinc-500">
                                            {groupName}
                                          </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {options.map((option) => {
                                            const isSelected =
                                              selectedVariant?.name.includes(
                                                option
                                              );

                                            return (
                                              <button
                                                key={`${item.id}-${groupName}-${option}`}
                                                type="button"
                                                className={`relative flex h-10 min-w-[45px] items-center justify-center rounded-md px-3 transition-all duration-150 ${
                                                  isSelected
                                                    ? "bg-primary-50 text-primary-700 border-primary-500 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-500 border-2"
                                                    : "hover:border-primary-300 dark:hover:border-primary-700 border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                                } `}
                                                style={
                                                  isSelected
                                                    ? {
                                                        borderColor: themeColor,
                                                        color: themeColor,
                                                      }
                                                    : {}
                                                }
                                                title={option}
                                              >
                                                {groupName.toLowerCase() ===
                                                "color" ? (
                                                  <div className="flex items-center">
                                                    <span
                                                      className={`h-5 w-5 rounded-full ${getColorClass(
                                                        option
                                                      )}`}
                                                    ></span>
                                                    <span className="ml-1.5 text-xs font-medium">
                                                      {option}
                                                    </span>
                                                  </div>
                                                ) : groupName.toLowerCase() ===
                                                  "weight" ? (
                                                  <div className="flex items-center">
                                                    <span className="text-xs font-medium">
                                                      {option}g
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <span className="text-xs font-medium">
                                                    {option}
                                                  </span>
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Button */}
              <div className="sticky bottom-0 left-0 right-0 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                <Button
                  type="submit"
                  className="h-12 w-full text-base text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: themeColor }}
                  onClick={handleConfirmPurchase}
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600"></div>
                      {config.offers.labels.addingToCart}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {config.offers.labels.getDealNow} •{" "}
                      {formatMoney(summary.totalAdjustedAmount, currency)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
