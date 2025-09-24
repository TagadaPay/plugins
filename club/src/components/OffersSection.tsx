"use client";

import { OfferCard } from "@/components/OfferCard";
import { Badge } from "@/components/ui/badge";
import { PluginConfig } from "@/types/plugin-config";
import { useClubOffers, usePluginConfig } from "@tagadapay/plugin-sdk/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function OffersSkeleton() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Skeleton width={120} height={24} className="mx-auto" />
            <Skeleton width={300} height={40} className="mx-auto" />
            <Skeleton width={400} height={24} className="mx-auto" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm mt-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} width={100} height={24} />
            ))}
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <Skeleton height={200} />
              <div className="p-4 space-y-2">
                <Skeleton height={24} />
                <Skeleton height={16} width="80%" />
                <Skeleton height={16} width="60%" />
                <Skeleton height={40} className="mt-4" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Skeleton width={150} height={40} />
        </div>
      </div>
    </section>
  );
}

export function OffersSection() {
  const { config } = usePluginConfig<PluginConfig>();
  const { offers, isLoading, error, payOffer } = useClubOffers({
    enabled: true,
  });

  // Fetch offers from backend

  //   const currency = useCurrency({
  //     presentmentCurrencies: offers?.[0]?.summaries?.map((s) => s.currency) || [],
  //     chargeCurrencies: offers?.[0]?.summaries?.map((s) => s.currency) || [],
  //   });

  // Show loading state if data is not ready
  if (isLoading || !config) {
    return <OffersSkeleton />;
  }

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">
              {config.offers.errorMessages.loading}
            </h2>
            <p className="mt-2 text-zinc-500">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  if (!offers?.length) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-500">
              {config.offers.errorMessages.noOffers}
            </h2>
            <p className="mt-2 text-zinc-400">
              {config.offers.errorMessages.checkBack}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="offers" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge className="text-white bg-[var(--primary-color)]">
              {config.offers.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              {config.offers.title}
            </h2>
            <p className="mx-auto max-w-[700px] text-zinc-500 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {config.offers.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm mt-4">
            {config.offers.categories.map((category, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  category.active
                    ? "text-[var(--primary-color)] border-[var(--primary-color)]"
                    : ""
                }`}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              themeColor={config.branding.colors.primary}
              currency={"USD"}
              payOffer={payOffer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
