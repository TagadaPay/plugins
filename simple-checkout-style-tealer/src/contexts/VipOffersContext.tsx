'use client';

import { useVipOffers } from '@tagadapay/plugin-sdk/v2';
import { createContext, useContext, useMemo, useState } from 'react';

import { useOrderBumpOffers } from '@/components/OrderBump';

interface VipOffersContextValue {
  offers: any[];
  vipOfferIds: string[];
  vipPreview: any | null;
  isOfferSelected: (offer: any) => boolean;
  selectVipOffers: () => Promise<void> | void;
  cancelVipOffers: () => Promise<void> | void;
  hasVipOffers: boolean;
  isAnyVipOfferSelected: boolean;
  isLoadingVipPreview: boolean;
}

const VipOffersContext = createContext<VipOffersContextValue | undefined>(undefined);

interface VipOffersProviderProps {
  children: React.ReactNode;
  checkout: any | null;
}

export function VipOffersProvider({ children, checkout }: VipOffersProviderProps) {
  const [isLoadingVipPreview, setIsLoadingVipPreview] = useState(false);
  const customerIsClubMember = checkout?.customerIsClubMember;
  const clubProductId = checkout?.clubProductId;

  const offers = useOrderBumpOffers('vip', checkout, clubProductId, customerIsClubMember);
  const vipOfferIds = useMemo(() => offers.map((offer: any) => offer.id), [offers]);

  const { vipPreview, isOfferSelected, selectVipOffers, cancelVipOffers } = useVipOffers({
    sessionId: checkout?.checkoutSession?.id || '',
    vipOfferIds,
  });

  const hasVipOffers = useMemo(() => vipOfferIds.length > 0, [vipOfferIds]);
  const isAnyVipOfferSelected = !!vipPreview?.selectedOffers?.some((offer: any) => offer.isSelected);

  const wrappedSelectVipOffers = async () => {
    try {
      setIsLoadingVipPreview(true);
      await selectVipOffers();
    } finally {
      setIsLoadingVipPreview(false);
    }
  };

  const wrappedCancelVipOffers = async () => {
    try {
      setIsLoadingVipPreview(true);
      await cancelVipOffers();
    } finally {
      setIsLoadingVipPreview(false);
    }
  };

  const value = useMemo<VipOffersContextValue>(
    () => ({
      offers,
      vipOfferIds,
      vipPreview,
      isOfferSelected,
      selectVipOffers: wrappedSelectVipOffers,
      cancelVipOffers: wrappedCancelVipOffers,
      hasVipOffers,
      isAnyVipOfferSelected,
      isLoadingVipPreview,
    }),
    [
      offers,
      vipOfferIds,
      vipPreview,
      isOfferSelected,
      wrappedSelectVipOffers,
      wrappedCancelVipOffers,
      hasVipOffers,
      isAnyVipOfferSelected,
      isLoadingVipPreview,
    ],
  );

  return <VipOffersContext.Provider value={value}>{children}</VipOffersContext.Provider>;
}

export function useVipOffersContext(): VipOffersContextValue {
  const ctx = useContext(VipOffersContext);
  if (!ctx) {
    throw new Error('useVipOffersContext must be used within a VipOffersProvider');
  }
  return ctx;
}
