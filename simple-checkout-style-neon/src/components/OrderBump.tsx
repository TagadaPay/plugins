import { ClubOrderBump } from '@/components/ClubOrderBump';
import { SectionHeader, SectionHeaderProps } from '@/components/ui/section-header';
import { useVipOffersContext } from '@/contexts/VipOffersContext';
import { getColorOpacityFromCSSVar } from '@/lib/utils';
import { CheckoutData, formatMoney, getAssignedOrderBumpOfferIds, useTagadaContext, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { useMemo, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';

export interface OrderBumpOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  originalPrice?: number;
  imageUrl?: string;
  preChecked?: boolean;
  displayPrice?: boolean;
}

interface OrderBumpProps {
  offer: OrderBumpOffer;
  type: 'primary' | 'secondary' | 'vip';
  onSelectionChange: (offerId: string, selected: boolean) => Promise<void>;
  isSelected?: boolean;
}

export function OrderBump({ offer, type, onSelectionChange, isSelected }: OrderBumpProps) {
  const { locale } = useTranslation();
  const [selected, setSelected] = useState(isSelected ?? offer.preChecked ?? false);
  const [isToggling, setIsToggling] = useState(false);

  const handleCheckboxChange = async (checked: boolean) => {
    if (isToggling) return;

    setIsToggling(true);
    setSelected(checked);

    try {
      await onSelectionChange(offer.id, checked);
    } catch (error) {
      // Revert on error
      setSelected(!checked);
      console.error('Failed to toggle order bump:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCardClick = async () => {
    if (isToggling) return;

    const newSelected = !selected;
    setIsToggling(true);
    setSelected(newSelected);

    try {
      await onSelectionChange(offer.id, newSelected);
    } catch (error) {
      // Revert on error
      setSelected(!newSelected);
      console.error('Failed to toggle order bump:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const hasDiscount = offer.originalPrice && offer.originalPrice > offer.price;
  const discountPercentage = hasDiscount
    ? Math.round(((offer.originalPrice! - offer.price) / offer.originalPrice!) * 100)
    : 0;

  // VIP-specific styling
  const boderColor = getColorOpacityFromCSSVar('border-color', 100);

  return (
    <Card
      className={`cursor-pointer rounded-[4px] border border-[var(--line-strong)] transition-colors duration-100 hover:border-[var(--ink-500)]`}
      style={{
        ...(selected && {
          borderColor: 'var(--primary-color)',
          backgroundColor: getColorOpacityFromCSSVar('primary-color', 8),
        }),
        ...(!selected && {
          ':hover': {
            borderColor: boderColor,
          },
        }),
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = getColorOpacityFromCSSVar('primary-color', 40);
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = boderColor; // amber-300 : gray-300
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selected}
              onCheckedChange={handleCheckboxChange}
              disabled={isToggling}
              className="h-5 w-5"
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className={`text-base font-semibold ${'text-[var(--text-color)]'}`}>
                    {offer.title}
                  </h3>
                </div>
                <p className={`mb-2 text-sm ${'text-[var(--text-secondary-color)]'}`}>
                  {offer.description}
                </p>

                {/* Price */}
                {offer.displayPrice !== false && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[var(--text-color)] text-lg font-bold">
                      {formatMoney(offer.price, offer.currency, locale)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-[var(--text-secondary-color)] text-sm line-through">
                          {offer.originalPrice && formatMoney(offer.originalPrice, offer.currency, locale)}
                        </span>
                        <span className="text-sm font-medium text-[var(--primary-color)]">Save {discountPercentage}%</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Product Image */}
              {offer.imageUrl && (
                <div className="ml-3 flex-shrink-0">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="h-16 w-16 rounded-[4px] border border-[var(--line-strong)] object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OrderBumpListProps {
  offers: OrderBumpOffer[];
  type: 'primary' | 'secondary' | 'vip';
  onSelectionChange: (offerId: string, selected: boolean) => Promise<void>;
  selectedOffers?: string[];
}

export function OrderBumpList({ offers, type, onSelectionChange, selectedOffers = [] }: OrderBumpListProps) {
  if (!offers || offers.length === 0) return null;

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <OrderBump
          key={offer.id}
          offer={offer}
          type={type}
          onSelectionChange={onSelectionChange}
          isSelected={selectedOffers.includes(offer.id)}
        />
      ))}
    </div>
  );
}

// Hook to get order bump offers from checkout data (like CMS)
// Respects stepConfig.orderBumps filtering when mode is 'custom'.
export const useOrderBumpOffers = (
  type: 'primary' | 'secondary' | 'vip',
  checkout: CheckoutData | undefined,
  clubProductId?: string | null,
  customerIsClubMember?: boolean,
) => {
  const enabledOfferIds = useMemo(() => getAssignedOrderBumpOfferIds(), []);

  return useMemo(() => {
    if (!checkout?.checkoutSession?.store?.upsells?.length) {
      return [];
    }

    const allowedSet = enabledOfferIds ? new Set(enabledOfferIds) : null;

    return checkout.checkoutSession.store.upsells
      .filter(
        (upsell) =>
          upsell.type === 'orderbump' &&
          upsell.enabled &&
          !(
            customerIsClubMember &&
            upsell.orderBumpOffers?.some(({ productId }) => productId === clubProductId)
          ),
      )
      .flatMap(
        (upsell) =>
          upsell?.orderBumpOffers
            ?.filter((offer) => {
              if (offer.type !== type) return false;
              if (allowedSet && !allowedSet.has(offer.id)) return false;
              return true;
            })
            .map((offer) => ({
              ...offer,
              type: offer.type || 'primary',
            })) || [],
      );
  }, [checkout?.checkoutSession?.store?.upsells, type, clubProductId, customerIsClubMember, enabledOfferIds]);
};

interface PrimaryOrderBumpListProps {
  checkout: CheckoutData | undefined;
  disabled?: boolean;
  sectionHeader: SectionHeaderProps;
  refresh: () => Promise<void>;
}

// Real order bump list components that use the v2 design
export const PrimaryOrderBumpList = ({
  checkout,
  disabled,
  sectionHeader,
  refresh,
}: PrimaryOrderBumpListProps) => {
  const { locale } = useTranslation();
  const { apiService, refreshCoordinator } = useTagadaContext();
  const clubProductId = checkout?.clubProductId;
  const customerIsClubMember = checkout?.customerIsClubMember;
  const offers = useOrderBumpOffers('primary', checkout, clubProductId, customerIsClubMember);
  const currency = checkout?.summary?.currency || 'USD';
  const checkoutSessionId = checkout?.checkoutSession?.id;

  if (!offers.length || !checkoutSessionId) return null;

  // Check which offers are selected
  const selectedLineItems = checkout?.checkoutSession?.sessionLineItems || [];
  const getSelectedOfferIds = () => {
    const selectedProductIds = selectedLineItems
      .filter((item: any) => item.isOrderBump && item.orderBumpType === 'primary')
      .map((item: any) => item.productId);

    // Map product IDs back to offer IDs
    return offers.filter((offer) => selectedProductIds.includes(offer.productId)).map((offer) => offer.id);
  };

  // Convert real offers to OrderBumpOffer format for v2 design
  const convertedOffers: OrderBumpOffer[] = offers.map((offer) => {
    const priceOption = offer.price?.currencyOptions[currency];
    const price = priceOption?.amount || 0;
    const compareAtAmount =
      offer.displayCompareAtPrice && price && offer.compareAtPriceDiscount
        ? Math.round(price / (1 - offer.compareAtPriceDiscount / 100))
        : undefined;

    return {
      id: offer.id,
      title: offer.titleTrans[locale] || offer.product?.name || 'Order Bump',
      description: offer.descriptionTrans[locale] || offer.variant?.name || 'Add this to your order',
      currency: currency,
      price: price, // Convert from cents to dollars for v2 design
      originalPrice: compareAtAmount ? compareAtAmount : undefined,
      imageUrl: offer.overrideImageUrl || offer.variant?.imageUrl,
      preChecked: offer.precheck,
      displayPrice: offer.displayPrice ?? true,
    };
  });

  // Handle order bump toggle using API service
  const handleOrderBumpChange = async (offerId: string, selected: boolean) => {
    if (!checkoutSessionId) {
      console.error('No checkout session ID available');
      return;
    }

    try {
      console.log('Toggling order bump:', { offerId, selected, checkoutSessionId });

      const result = await apiService.fetch<{ success: boolean; error?: any }>(
        `/api/v1/checkout-sessions/${checkoutSessionId}/toggle-order-bump`,
        {
          method: 'POST',
          body: { orderBumpOfferId: offerId, selected },
        },
      );

      if (result.success) {
        console.log('Order bump toggled successfully');
        // Notify refresh coordinator to update checkout data
        await refreshCoordinator.notifyOrderBumpChanged();
        await refresh();
      } else {
        console.error('Failed to toggle order bump:', result.error);
      }
    } catch (error) {
      console.error('Error toggling order bump:', error);
    }
  };

  return (
    offers.length > 0 && (
      <div className="space-y-4">
        <SectionHeader {...sectionHeader} />
        <div className={`space-y-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
          <OrderBumpList
            offers={convertedOffers}
            type="primary"
            onSelectionChange={handleOrderBumpChange}
            selectedOffers={getSelectedOfferIds()}
          />
        </div>
      </div>
    )
  );
};

interface SecondaryOrderBumpListProps {
  checkout: CheckoutData | undefined;
  disabled?: boolean;
  sectionHeader: SectionHeaderProps;
  refresh: () => Promise<void>;
}

export const SecondaryOrderBumpList = ({
  checkout,
  disabled,
  sectionHeader,
  refresh,
}: SecondaryOrderBumpListProps) => {
  const { locale } = useTranslation();
  const { apiService, refreshCoordinator } = useTagadaContext();
  const clubProductId = checkout?.clubProductId;
  const customerIsClubMember = checkout?.customerIsClubMember;
  const offers = useOrderBumpOffers('secondary', checkout, clubProductId, customerIsClubMember);
  const checkoutSessionId = checkout?.checkoutSession?.id;
  const currency = checkout?.summary?.currency || 'USD';

  if (!offers.length || !checkoutSessionId) return null;

  // Check which offers are selected
  const selectedLineItems = checkout?.checkoutSession?.sessionLineItems || [];
  const getSelectedOfferIds = () => {
    const selectedProductIds = selectedLineItems
      .filter((item: any) => item.isOrderBump && item.orderBumpType === 'secondary')
      .map((item: any) => item.productId);

    // Map product IDs back to offer IDs
    return offers.filter((offer) => selectedProductIds.includes(offer.productId)).map((offer) => offer.id);
  };

  // Convert real offers to OrderBumpOffer format for v2 design
  const convertedOffers: OrderBumpOffer[] = offers.map((offer) => {
    const priceOption = offer.price?.currencyOptions[currency];
    const price = priceOption?.amount || 0;
    const compareAtAmount =
      offer.displayCompareAtPrice && price && offer.compareAtPriceDiscount
        ? Math.round(price / (1 - offer.compareAtPriceDiscount / 100))
        : undefined;

    return {
      id: offer.id,
      title: offer.titleTrans[locale] || offer.product?.name || 'Order Bump',
      description: offer.descriptionTrans[locale] || offer.variant?.name || 'Add this to your order',
      price: price, // Convert from cents to dollars for v2 design
      originalPrice: compareAtAmount ? compareAtAmount : undefined,
      currency: currency,
      imageUrl: offer.overrideImageUrl || offer.variant?.imageUrl,
      preChecked: offer.precheck,
      displayPrice: offer.displayPrice ?? true,
    };
  });

  // Handle order bump toggle using API service
  const handleOrderBumpChange = async (offerId: string, selected: boolean) => {
    if (!checkoutSessionId) {
      console.error('No checkout session ID available');
      return;
    }

    try {
      console.log('Toggling order bump:', { offerId, selected, checkoutSessionId });

      const result = await apiService.fetch<{ success: boolean; error?: any }>(
        `/api/v1/checkout-sessions/${checkoutSessionId}/toggle-order-bump`,
        {
          method: 'POST',
          body: { orderBumpOfferId: offerId, selected },
        },
      );

      if (result.success) {
        console.log('Order bump toggled successfully');
        // Notify refresh coordinator to update checkout data
        await refreshCoordinator.notifyOrderBumpChanged();
        await refresh();
      } else {
        console.error('Failed to toggle order bump:', result.error);
      }
    } catch (error) {
      console.error('Error toggling order bump:', error);
    }
  };

  return (
    offers.length > 0 && (
      <div className="mt-6">
        <SectionHeader {...sectionHeader} />
        <div className={`space-y-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
          <OrderBumpList
            offers={convertedOffers}
            type="secondary"
            onSelectionChange={handleOrderBumpChange}
            selectedOffers={getSelectedOfferIds()}
          />
        </div>
      </div>
    )
  );
};

interface VipOrderBumpListProps {
  checkout: any;
  disabled?: boolean;
  sectionHeader: SectionHeaderProps;
  refresh: () => Promise<void>;
}

export const VipOrderBumpList = ({ checkout, disabled, sectionHeader, refresh }: VipOrderBumpListProps) => {
  const {
    offers,
    vipOfferIds,
    vipPreview,
    isOfferSelected,
    selectVipOffers,
    cancelVipOffers,
    isLoadingVipPreview,
  } = useVipOffersContext();
  const { refreshCoordinator } = useTagadaContext();
  const checkoutSessionId = checkout?.checkoutSession?.id;

  if (!offers.length || !checkoutSessionId) return null;

  const handleOrderBumpChange = async (selected: boolean) => {
    if (!checkoutSessionId) {
      console.error('No checkout session ID available');
      return;
    }

    try {
      await (selected ? selectVipOffers() : cancelVipOffers());
      await refreshCoordinator.notifyOrderBumpChanged();
      await refresh();
    } catch (error) {
      console.error('Error toggling VIP order bump:', error);
    }
  };

  return (
    offers.length > 0 && (
      <div className="lg:mt-6">
        <SectionHeader {...sectionHeader} />
        <div className={`space-y-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
          <div className="space-y-3">
            {offers.map((offer: any) => (
              <ClubOrderBump
                checkout={checkout}
                key={offer.id}
                discountPercentage={vipPreview?.savingsPct ?? 0}
                discountAmount={vipPreview?.savings ?? 0}
                handleToggle={(selected: boolean) => handleOrderBumpChange(selected)}
                isSelected={isOfferSelected(offer)}
                variantName={offer.variant?.name}
                isLoading={isLoadingVipPreview}
              />
            ))}
          </div>
        </div>
      </div>
    )
  );
};
