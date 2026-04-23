import LoadingSpinner from '@/components/LoadingSpinner';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MOCK_PREVIEW_ORDER } from '@/data/mockOrder';
import { cn, getCartCustomAttributes } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import {
  formatMoney,
  isDraftMode,
  OrderLineItem,
  useCurrency,
  useISOData,
  useOrder,
  usePixelTracking,
  usePluginConfig,
  useTranslation
} from '@tagadapay/plugin-sdk/v2';
import { CreditCard, HelpCircle, Package, Truck } from 'lucide-react';
import React, { FC, memo, useEffect, useMemo, useRef } from 'react';
// Typed slice of useISOData's return to avoid reaching into SDK internals.
type ISOCountries = ReturnType<typeof useISOData>['countries'];
type ISOGetRegions = ReturnType<typeof useISOData>['getRegions'];
import { CustomManualThankYouContent, type ManualPaymentSnapshot } from './CustomManualThankYouContent';
import { LineItemProperties } from './LineItemProperties';
import ThankYouHeader from './ThankYouHeader';
import { ZellePaymentInstructions, ZellePaymentStatusBadge } from './ZelleThankYouContent';

interface ThankYouProps {
  orderId: string;
}

// Type definitions
interface Address {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal?: string;
  country?: string;
  phone?: string;
}

// ClubItem Component - Special styling for membership products
const ClubItem = memo(({ item, currency }: { item: OrderLineItem; currency: string }) => {
  const { t, locale } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  // Helper function to get interval text
  const getIntervalText = (interval: any, count = 1) => {
    if (!interval) return '';
    const pluralSuffix = count > 1 ? 's' : '';
    return `${interval}${pluralSuffix}`;
  };

  return (
    <div className="border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5 mb-3 rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-[10px] font-medium uppercase tracking-wider text-[var(--primary-color)]"
          editor-id="config.thankYou.membership"
        >
          {t(config?.thankYou?.membership, 'Membership')}
        </span>
        <span className="group relative text-[10px] text-[var(--text-secondary-color)]">
          {item.recurring &&
            (item.subscriptionSettings?.trial ? (
              <span className="flex cursor-help items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="inline-block h-3 w-3 text-[var(--text-secondary-color)]" />
                  </TooltipTrigger>
                  <TooltipContent editor-id="config.thankYou.trialThenText">
                    {t(config?.thankYou?.trialThenText, 'Trial then {price} every {count} {interval}', {
                      price: formatMoney(item.amount, item.currency || currency, locale),
                      count: item.intervalCount || 1,
                      interval: getIntervalText(item.interval, item.intervalCount || 1),
                    })}
                  </TooltipContent>
                </Tooltip>
              </span>
            ) : (
              <span editor-id="config.thankYou.renews">
                {`${t(config?.thankYou?.renews, 'Renews')} ${item.intervalCount || 1} ${getIntervalText(item.interval, item.intervalCount || 1)}`}
              </span>
            ))}
        </span>
      </div>

      <div className="flex">
        {item.orderLineItemVariant?.imageUrl && (
          <div className="mr-3 h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(var(--background-color)]">
            <img
              src={item.orderLineItemVariant.imageUrl}
              alt={item.orderLineItemProduct?.name || ''}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 justify-between">
          <div>
            <h3 className="font-medium text-[var(--text-color)]">{item.orderLineItemProduct?.name}</h3>
            {item.orderLineItemVariant?.name && (
              <p className="text-xs text-[var(--text-secondary-color)]">{item.orderLineItemVariant.name}</p>
            )}
          </div>
          <div className="text-right">
            <h3
              className="font-medium text-[var(--text-color)]"
              editor-id={
                item.subscriptionSettings?.trial || item.adjustedAmount === 0
                  ? 'config.thankYou.free'
                  : undefined
              }
            >
              {item.subscriptionSettings?.trial || item.adjustedAmount === 0
                ? t(config?.thankYou?.free, 'Free')
                : formatMoney(item.adjustedAmount, item.currency || currency, locale)}
            </h3>
            {item.adjustedAmount !== item.amount &&
              !item.subscriptionSettings?.trial &&
              item.adjustedAmount !== 0 && (
                <span className="text-sm text-[var(--text-secondary-color)] line-through">
                  {formatMoney(item.amount, item.currency || currency, locale)}
                </span>
              )}
          </div>
        </div>
      </div>

      {item.recurring && !item.subscriptionSettings?.trial && (
        <div className="mt-2">
          <span className="text-xs text-[var(--text-secondary-color)]">
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="inline-block h-3 w-3 cursor-help text-[var(--text-secondary-color)]" />
              </TooltipTrigger>
              <TooltipContent editor-id="config.thankYou.everyText">
                {t(config?.thankYou?.everyText, 'Every {count} {interval}', {
                  count: item.intervalCount || 1,
                  interval: getIntervalText(item.interval, item.intervalCount || 1),
                })}
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
      )}
    </div>
  );
});

ClubItem.displayName = 'ClubItem';

// AddressCard Component - Displays shipping or billing address
const AddressCard: FC<{
  title: string;
  icon: React.ElementType;
  address?: Address;
  countries: ISOCountries;
  getRegions: ISOGetRegions;
}> = memo(({ title, icon: Icon, address, countries, getRegions }) => {
  if (!address) return null;

  const countryName = address.country
    ? Object.values(countries).find((c) => c.iso === address.country)?.name || address.country
    : '';
  const stateName = address.country && address.state
    ? getRegions(address.country).find((r) => r.iso === address.state)?.name || address.state
    : address.state || '';

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(var(--background-color)] p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--text-secondary-color)]" />
        <h3 className="text-base font-medium text-[var(--text-color)]">{title}</h3>
      </div>
      <div className="space-y-1 text-sm">
        <p className="font-medium text-[var(--text-color)]">
          {address.firstName} {address.lastName}
        </p>
        {address.address1 && <p className="text-[var(--text-secondary-color)]">{address.address1}</p>}
        {address.address2 && <p className="text-[var(--text-secondary-color)]">{address.address2}</p>}
        {(stateName || address.postal) && <p className="text-[var(--text-secondary-color)]">
          {address.city}
          {stateName && `, ${stateName}`} {address.postal}
        </p>}
        {countryName && <p className="text-[var(--text-secondary-color)]">{countryName}</p>}
        {address.phone && <p className="text-[var(--text-secondary-color)]">{address.phone}</p>}
      </div>
    </div>
  );
});

AddressCard.displayName = 'AddressCard';

// ContinueShoppingButton Component
const ContinueShoppingButton: FC<{ returnUrl: string }> = memo(({ returnUrl }) => {
  const { config } = usePluginConfig<PluginConfigData>();
  const { t } = useTranslation();
  return (
    <Button
      onClick={() => (window.location.href = returnUrl)}
      className="hover:bg-[var(--primary-color)]/90 w-full bg-[var(--primary-color)] text-[var(--text-color-on-primary)]"
      size="lg"
    >
      <span editor-id="config.thankYou.continueShopping">
        {t(config?.thankYou?.continueShopping, 'Continue Shopping')}
      </span>
    </Button>
  );
});

ContinueShoppingButton.displayName = 'ContinueShoppingButton';

// Loading Component
function PageLoading() {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();
  return <LoadingSpinner text={t(config?.thankYou?.loadingText, 'Loading order details...')} />;
}

// Main ThankYou Component
export default function ThankYou({ orderId }: ThankYouProps) {
  const { order: fetchedOrder, isLoading, refresh } = useOrder({
    orderId,
    enabled: Boolean(orderId) && orderId !== 'preview',
  });

  // In local Vite dev mode, force mock so `/thankyou/preview` renders
  // a complete UI without needing a real order. In production builds
  // this collapses to the original isDraftMode() check.
  const isLocalDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV === true;
  const useMockData = (isDraftMode() || isLocalDev) && !fetchedOrder && (!orderId || orderId === 'preview' || !isLoading);
  const order = useMockData ? MOCK_PREVIEW_ORDER : fetchedOrder;
  const { t, locale } = useTranslation();
  const { config: pluginConfig } = usePluginConfig<PluginConfigData>();
  const currencyData = useCurrency();
  const currency = currencyData.code;
  const isDigitalProduct = pluginConfig?.addressSettings?.digitalProduct || false;
  const { countries, getRegions } = useISOData();

  // Add delayed refetch for related orders
  useEffect(() => {
    if (!useMockData && order?.id) {
      const timer = setTimeout(() => {
        void refresh();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [order?.id, refresh, useMockData]);


  const presentmentCurrency = order?.checkoutSession?.selectedPresentmentCurrency || order?.customer?.currency;
  const currentSummary = order?.summaries?.find((summary) => summary.currency === presentmentCurrency) || order?.summaries?.find((summary) => summary.currency === currency) || order?.summaries?.[0];

  // All orders data (main + related) - each with their own items and summary
  const allOrdersData = useMemo(() => {
    const orders: Array<{
      id: string;
      items: OrderLineItem[];
      summary: typeof currentSummary;
    }> = [];

    // Add main order
    if (order?.id) {
      let mainItems = (order.items ?? []).filter((item) => item.currency === presentmentCurrency);
      if (pluginConfig?.checkoutSettings?.hideRecurringPrices) {
        mainItems = mainItems.filter((item) => !item.recurring);
      }
      orders.push({
        id: order.id,
        items: mainItems,
        summary: currentSummary,
      });
    }

    // Add each related order separately
    if (order?.relatedOrders && order.relatedOrders.length > 0) {
      order.relatedOrders.forEach((relatedOrder) => {
        let filteredItems = (relatedOrder.items ?? []).filter((item) => item.currency === presentmentCurrency);
        if (pluginConfig?.checkoutSettings?.hideRecurringPrices) {
          filteredItems = filteredItems.filter((item) => !item.recurring);
        }
        const summary = relatedOrder.summaries?.find((s) => s.currency === presentmentCurrency) || relatedOrder.summaries?.find((s) => s.currency === currency) || relatedOrder.summaries?.[0];
        orders.push({
          id: relatedOrder.id,
          items: filteredItems,
          summary,
        });
      });
    }

    return orders;
  }, [order?.id, order?.items, order?.relatedOrders, currentSummary, pluginConfig, currency]);

  // Calculate combined totals of all orders
  const combinedTotals = useMemo(() => {
    return allOrdersData.reduce(
      (acc, orderData) => {
        const summary = orderData.summary;
        return {
          subtotal: acc.subtotal + (summary?.subtotalAdjustedAmount || 0),
          total: acc.total + (summary?.totalAdjustedAmount || 0),
          totalPromotionAmount: acc.totalPromotionAmount + (summary?.totalPromotionAmount || 0),
        };
      },
      { subtotal: 0, total: 0, totalPromotionAmount: 0 },
    );
  }, [allOrdersData]);

  const cartCustomAttributes = useMemo(
    () => getCartCustomAttributes(order?.metadata),
    [order?.metadata?.cartCustomAttributes],
  );

  // Helper function to separate regular items and club items
  const separateClubItems = (items: OrderLineItem[]) => {
    if (!items || !order?.metadata?.clubProductId) {
      return { clubItems: [] as OrderLineItem[], regularItems: items };
    }

    return items.reduce(
      (acc, item) => {
        if (item.productId === order.metadata?.clubProductId) {
          acc.clubItems.push(item);
        } else {
          acc.regularItems.push(item);
        }
        return acc;
      },
      { clubItems: [] as OrderLineItem[], regularItems: [] as OrderLineItem[] },
    );
  };

  // Pixel tracking for Purchase event
  const { track, pixelsInitialized } = usePixelTracking();
  const hasTrackedPurchaseRef = useRef(false);

  // Track Purchase event on thank you page load
  useEffect(() => {
    if (
      useMockData ||
      !pixelsInitialized ||
      hasTrackedPurchaseRef.current ||
      !order?.items?.length ||
      !order.currency ||
      order.paidAmount == null
    ) {
      return;
    }

    const items = order.items;
    const currency = order.currency;

    const purchaseParams = {
      content_type: 'product',
      contents: items.map((item) => ({
        content_id: `${item.productId}-${item.variantId || ''}`,
        content_type: 'product',
        content_name: item.orderLineItemVariant?.name || item.orderLineItemProduct?.name || '',
        content_category: 'purchase',
        quantity: item.quantity,
        price: item.adjustedAmount,
        currency,
      })),
      content_ids: items.map((item) => `${item.productId}-${item.variantId || ''}`),
      currency,
      value: order.paidAmount,
      transaction_id: order.id,
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    };

    console.log('[ThankYou] Tracking Purchase event:', purchaseParams);
    track('Purchase', purchaseParams);
    hasTrackedPurchaseRef.current = true;
  }, [useMockData, pixelsInitialized, order, track]);

  // Set window.TagadaPay for custom scripts
  useEffect(() => {
    if (useMockData || !order?.items || !order.currency || !order.paidAmount) {
      return;
    }

    // @ts-expect-error Adding global variable for custom scripts
    window.TagadaPay = {
      order: {
        id: order.id,
        paidAmount: formatMoney(order.paidAmount, order.currency, locale),
        paidCurrency: order.currency,
      },
    };
  }, [order, locale, useMockData]);

  if (!useMockData && (isLoading || !order || !orderId)) {
    return <PageLoading />;
  }

  // At this point order is guaranteed to be defined (either mock data or fetched)
  if (!order) return <PageLoading />;

  // Show pending payment variant for Zelle payments that haven't succeeded yet
  const isZellePayment = order.payments?.some(
    (p) => String(p.metadata?.createdBy ?? '').includes('zelle') && p.status !== 'succeeded',
  );

  // Custom payment — multiple instances, matched by createdBy containing 'custom_payment'
  const pendingCustomPayment = order.payments?.find(
    (p) => String(p.metadata?.createdBy ?? '').includes('custom_payment') && p.status !== 'succeeded',
  );
  const isCustomPayment = !!pendingCustomPayment;
  const manualSnapshot = pendingCustomPayment?.metadata?.manualPaymentSnapshot as ManualPaymentSnapshot | undefined;
  const isPendingManual = isZellePayment || isCustomPayment;

  const orderNumber = order.orderNumber;

  const hasMultipleOrders = allOrdersData.length > 1;

  return (
    <div className="bg-[var(--background-color)] min-h-screen">
      {/* Top Bar */}
      <TopBar
        onGoToShop={() => {
          const returnUrl = order?.checkoutSession?.returnUrl;
          if (returnUrl) {
            window.location.href = returnUrl;
          } else {
            window.history.back();
          }
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <ThankYouHeader
          isZellePayment={isPendingManual}
          orderNumber={order.orderNumber}
          customPaymentSnapshot={isCustomPayment ? manualSnapshot : undefined}
        />

        {/* Main layout with 2-column grid */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content area - grows to fill available space */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Zelle Payment Instructions */}
            {isZellePayment && (
              <ZellePaymentInstructions orderNumber={orderNumber.toString()} customerEmail={order.customer?.email} />
            )}

            {/* Custom Payment Instructions */}
            {isCustomPayment && manualSnapshot && (
              <CustomManualThankYouContent
                snapshot={manualSnapshot}
                orderNumber={orderNumber.toString()}
                customerEmail={order.customer?.email}
              />
            )}

            {/* Addresses */}
            <div className="space-y-4">
              <SectionHeader
                title={t(pluginConfig?.thankYou?.address, 'Address')}
                spacing="compact"
                titleEditorId="config.thankYou.shippingAddress"
              />
              <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", isDigitalProduct ? 'md:grid-cols-1' : '')}>
                {!isDigitalProduct && <AddressCard
                  title={t(pluginConfig?.thankYou?.shippingAddress, 'Shipping Address')}
                  icon={Truck}
                  address={order.shippingAddress}
                  countries={countries}
                  getRegions={getRegions}
                />}
                <AddressCard
                  title={t(pluginConfig?.thankYou?.billingAddress, 'Billing Address')}
                  icon={CreditCard}
                  address={order.billingAddress}
                  countries={countries}
                  getRegions={getRegions}
                />
              </div>
            </div>

            {/* Customer Information */}
            {order.customer && (
              <div className="space-y-4">
                <SectionHeader
                  title={t(pluginConfig?.thankYou?.customerDetails, 'Customer Details')}
                  spacing="compact"
                  titleEditorId="config.thankYou.customerDetails"
                />
                <div className="rounded-lg border border-[var(--border-color)] bg-[var(var(--background-color)] p-4 shadow-sm">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-[var(--text-secondary-color)]" editor-id="config.thankYou.email">
                        {t(pluginConfig?.thankYou?.email, 'Email')}
                      </dt>
                      <dd className="mt-1 text-sm text-[var(--text-color)]">{order.customer.email}</dd>
                    </div>
                    {order.customer.firstName && (
                      <div>
                        <dt
                          className="text-sm font-medium text-[var(--text-secondary-color)]"
                          editor-id="config.thankYou.firstName"
                        >
                          {t(pluginConfig?.thankYou?.firstName, 'First Name')}
                        </dt>
                        <dd className="mt-1 text-sm text-[var(--text-color)]">{order.customer.firstName}</dd>
                      </div>
                    )}
                    {order.customer.lastName && (
                      <div>
                        <dt
                          className="text-sm font-medium text-[var(--text-secondary-color)]"
                          editor-id="config.thankYou.lastName"
                        >
                          {t(pluginConfig?.thankYou?.lastName, 'Last Name')}
                        </dt>
                        <dd className="mt-1 text-sm text-[var(--text-color)]">{order.customer.lastName}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar - fixed width on desktop */}
          <div className="w-full lg:w-[384px] lg:shrink-0">
            <div className="sticky top-8">
              <SectionHeader
                title={t(pluginConfig?.thankYou?.orderDetails, 'Order Details')}
                spacing="compact"
                titleEditorId="config.thankYou.orderDetails"
              />
              <div
                className={`rounded-lg border border-[var(--border-color)] bg-[var(var(--background-color)] p-4 shadow-sm ${hasMultipleOrders ? 'space-y-4' : ''}`}
              >
                {/* All Orders - each in its own subcard only if multiple orders */}
                {allOrdersData.map((orderData) => {
                  const { clubItems, regularItems } = separateClubItems(orderData.items);

                  if (regularItems.length === 0 && clubItems.length === 0) {
                    return null;
                  }

                  // If there's only one order, render directly without subcard wrapper

                  const content = (
                    <>
                      {/* Order ID Header - only show if multiple orders */}
                      {hasMultipleOrders && (
                        <div className="mb-3">
                          <span className="text-xs text-[var(--text-secondary-color)]" editor-id="config.thankYou.orderNumber">
                            {t(pluginConfig?.thankYou?.orderNumber, 'Order')} #
                            {orderData.id.replace('order_', '')}
                          </span>
                        </div>
                      )}

                      {/* Regular Items */}
                      {regularItems.length > 0 && (
                        <div className="divide-y divide-gray-200">
                          {regularItems.map((item) => (
                            <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                              <div className="relative h-14 w-14 flex-shrink-0">
                                <div className="h-full w-full overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(var(--background-color)]">
                                  {item.orderLineItemVariant?.imageUrl ? (
                                    <img
                                      src={item.orderLineItemVariant.imageUrl}
                                      alt={item.orderLineItemProduct?.name || ''}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Package className="h-5 w-5 text-[var(--text-secondary-color)]" />
                                    </div>
                                  )}
                                </div>
                                {item.quantity > 1 && (
                                  <span className="absolute right-0 top-0 z-10 flex h-5 w-5 -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-gray-600 bg-opacity-75 text-xs font-bold text-white shadow-sm">
                                    {item.quantity}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-1 justify-between">
                                <div>
                                  <h4 className="text-sm font-medium text-[var(--text-primary-color)]">
                                    {item.orderLineItemProduct?.name}
                                  </h4>
                                  {item.orderLineItemVariant?.name && (
                                    <p className="text-xs text-[var(--text-secondary-color)]">{item.orderLineItemVariant.name}</p>
                                  )}
                                  {(pluginConfig?.checkoutSettings?.showLineItemProperties ?? true) && (
                                    <LineItemProperties item={item} />
                                  )}
                                </div>
                                <div className="text-right">
                                  <h4 className="text-sm font-medium text-[var(--text-primary-color)]">
                                    {formatMoney(item.adjustedAmount, item.currency || currency, locale)}
                                  </h4>
                                  {item.adjustedAmount !== item.amount && (
                                    <span className="text-xs text-[var(--text-secondary-color)] line-through">
                                      {formatMoney(item.amount, item.currency || currency, locale)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Club Items with special styling */}
                      {clubItems.length > 0 && (
                        <div className={regularItems.length > 0 ? 'mt-3' : ''}>
                          {clubItems.map((item) => (
                            <ClubItem key={item.id} item={item} currency={item.currency || currency} />
                          ))}
                        </div>
                      )}

                      {/* Cart Custom Attributes */}
                      {(pluginConfig?.checkoutSettings?.showCartCustomAttributes ?? true) && cartCustomAttributes.length > 0 && (
                        <div className="mt-3 space-y-1 border-t border-[var(--border-color)] pt-3">
                          {cartCustomAttributes.map((attr: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-[var(--text-secondary-color)]">{String(attr.name ?? '')}</span>
                              <span className="text-right font-medium text-[var(--text-color)]">{String(attr.value ?? '')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Order Summary */}
                      {orderData.summary && (
                        <div className="mt-4 border-t border-[var(--border-color)] pt-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-[var(--text-secondary-color)]" editor-id="config.thankYou.subtotal">
                                {t(pluginConfig?.thankYou?.subtotal, 'Subtotal')}
                              </span>
                              <span className="font-medium">
                                {formatMoney(orderData.summary.subtotalAdjustedAmount || 0, orderData.summary.currency || currency, locale)}
                              </span>
                            </div>

                            {orderData.summary.shippingCost && !isDigitalProduct ? (
                              <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary-color)]" editor-id="config.thankYou.shipping">
                                  {t(pluginConfig?.thankYou?.shipping, 'Shipping')}
                                </span>
                                <span>
                                  {orderData.summary.shippingCostIsFree ? (
                                    <span editor-id="config.thankYou.free">
                                      {t(pluginConfig?.thankYou?.free, 'Free')}
                                    </span>
                                  ) : (
                                    formatMoney(orderData.summary.shippingCost, orderData.summary.currency || currency, locale)
                                  )}
                                </span>
                              </div>
                            ) : null}

                            {orderData.summary.totalTaxAmount ? (
                              <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary-color)]" editor-id="config.thankYou.tax">
                                  {t(pluginConfig?.thankYou?.tax, 'Tax')}
                                </span>
                                <span>{formatMoney(orderData.summary.totalTaxAmount, orderData.summary.currency || currency, locale)}</span>
                              </div>
                            ) : null}

                            {/* Promotions/Discounts */}
                            {orderData.summary?.totalPromotionAmount > 0 && (
                              <>
                                <div className="flex justify-between text-sm font-medium">
                                  <span
                                    className="text-[var(--text-secondary-color)]"
                                    editor-id="config.checkout.orderSummary.totalSavingsText"
                                  >
                                    {t(
                                      pluginConfig?.checkout?.orderSummary?.totalSavingsText,
                                      'Total Savings',
                                    )}
                                  </span>
                                </div>
                                <div className="ml-4 space-y-1">
                                  {(orderData.summary?.adjustments || [])
                                    ?.filter((adj: any) => adj.type === 'Promotion')
                                    .map((adjustment: any, index: number) => (
                                      <div key={index} className="flex justify-between text-xs">
                                        <span className="text-[var(--text-secondary-color)]">{adjustment.description}</span>
                                        <span className="text-green-600">
                                          {formatMoney(Math.abs(adjustment.amount), orderData.summary?.currency || currency, locale)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}

                            <div className="mt-3 border-t border-[var(--border-color)] pt-3">
                              <div className="flex justify-between text-sm font-semibold">
                                <span editor-id="config.thankYou.total">
                                  {t(pluginConfig?.thankYou?.total, 'Total')}
                                </span>
                                <span>
                                  {formatMoney(orderData.summary.totalAdjustedAmount || 0, orderData.summary.currency || currency, locale)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );

                  // Wrap in subcard only if multiple orders
                  if (hasMultipleOrders) {
                    return (
                      <div key={orderData.id} className="rounded-lg border border-[var(--border-color)] bg-[var(--offer-card-bg)] p-3">
                        {content}
                      </div>
                    );
                  }

                  // Single order - render directly without subcard wrapper
                  return <React.Fragment key={orderData.id}>{content}</React.Fragment>;
                })}

                {/* Combined Totals - only show if more than one order */}
                {allOrdersData.length > 1 && (
                  <div className="mt-4 space-y-2 border-t border-[var(--border-color)] pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary-color)]" editor-id="config.thankYou.subtotal">
                        {t(pluginConfig?.thankYou?.subtotal, 'Subtotal')}
                      </span>
                      <span className="font-medium">
                        {formatMoney(combinedTotals.subtotal, allOrdersData[0]?.summary?.currency || currency, locale)}
                      </span>
                    </div>
                    {/* Combined Promotions/Discounts */}
                    {combinedTotals.totalPromotionAmount > 0 && (
                      <>
                        <div className="flex justify-between text-sm font-medium">
                          <span
                            className="text-[var(--text-secondary-color)]"
                            editor-id="config.checkout.orderSummary.totalSavingsText"
                          >
                            {t(pluginConfig?.checkout?.orderSummary?.totalSavingsText, 'Total Savings')}
                          </span>
                          <span className="text-green-600">
                            {formatMoney(combinedTotals.totalPromotionAmount, allOrdersData[0]?.summary?.currency || currency, locale)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-base font-bold">
                      <span editor-id="config.thankYou.total">
                        {t(pluginConfig?.thankYou?.total, 'Total')}
                      </span>
                      <span>{formatMoney(combinedTotals.total, allOrdersData[0]?.summary?.currency || currency, locale)}</span>
                    </div>
                  </div>
                )}

                {/* Zelle payment status badge */}
                {isZellePayment && <ZellePaymentStatusBadge />}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping button */}
        {order.checkoutSession?.returnUrl && (
          <div className="mt-10 flex justify-center">
            <div className="w-full max-w-md">
              <ContinueShoppingButton returnUrl={order.checkoutSession.returnUrl} />
            </div>
          </div>
        )}

        {/* Bottom Links */}
        {pluginConfig?.links?.bottomLinks && pluginConfig.links.bottomLinks.length > 0 && (
          <>
            <Separator className="my-8" />
            <div className="flex flex-wrap justify-center gap-4">
              {pluginConfig.links.bottomLinks.map((link, index) => (
                <a
                  className="text-sm text-[var(--text-secondary-color)] underline hover:text-[var(--text-color)]"
                  href={link.url}
                  key={`${link.url}-${index}`}
                  editor-id={`config.links.bottomLinks.${index}.label`}
                >
                  {t(link.label)}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
