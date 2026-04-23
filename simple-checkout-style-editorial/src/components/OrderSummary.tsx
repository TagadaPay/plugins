import DiscountCodes from '@/components/DiscountCodes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, getCartCustomAttributes } from '@/lib/utils';
import { LineItemProperties } from './LineItemProperties';
import { PluginConfigData } from '@/types/plugin-config';
import {
  CheckoutData,
  formatMoney,
  TranslateFunction,
  usePluginConfig,
  useTranslation,
} from '@tagadapay/plugin-sdk/v2';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { SectionHeader } from './ui/section-header';
import { Separator } from './ui/separator';

// Special component for club products - matches CMS OrderSummary
const ClubItem = React.memo(
  ({ item, currency, config, t, locale }: { item: any; currency: string; config?: any; t: TranslateFunction; locale: string }) => {
    // Helper function to get interval text
    const getIntervalText = (interval: 'day' | 'week' | 'month' | 'year' | undefined | null, count = 1) => {
      if (!interval) return '';
      const pluralSuffix = count > 1 ? 's' : '';
      return `${interval}${pluralSuffix}`;
    };

    return (
      <div className="mb-3 pt-3">
        <div className="mb-2 border-t border-[var(--line)] pt-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--ink-400)]" editor-id="config.checkout.orderSummary.membershipText">
              {t(config?.checkout?.orderSummary?.membershipText, 'Membership')}
            </span>
            <span className="text-[10px] text-[var(--ink-400)]">
              {item.recurring && config?.checkoutSettings?.hideRecurringPrices !== true &&
                (item.subscriptionSettings?.trial ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex cursor-help items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="inline-block h-3 w-3 text-[var(--ink-400)]"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" editor-id="config.checkout.orderSummary.trialThenEveryText">
                      {t(
                        config?.checkout?.orderSummary?.trialThenEveryText,
                        'Trial then {price} every {count} {interval}',
                        {
                          price: formatMoney(item.amount, currency, locale),
                          count: item.intervalCount || 1,
                          interval: getIntervalText(item.interval, item.intervalCount || 1)
                        }
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span editor-id="config.checkout.orderSummary.renewsEveryText">
                    {t(
                      config?.checkout?.orderSummary?.renewsEveryText,
                      'Renews {count} {interval}',
                      {
                        count: item.intervalCount || 1,
                        interval: getIntervalText(item.interval, item.intervalCount || 1)
                      }
                    )}
                  </span>
                ))}
            </span>
          </div>
        </div>

        <div className="flex">
          {item.orderLineItemVariant?.imageUrl && (
            <div className="mr-3 h-12 w-12 shrink-0 overflow-hidden rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)]">
              <img
                src={item.orderLineItemVariant.imageUrl}
                alt={item.orderLineItemProduct?.name || ''}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-1 justify-between">
            <div>
              <h3 className="text-[13.5px] font-medium text-[var(--ink-900)]">{item.orderLineItemProduct?.name}</h3>
              {item.orderLineItemVariant?.name && (
                <p className="text-[12px] text-[var(--ink-500)]">{item.orderLineItemVariant.name}</p>
              )}
            </div>
            <div className="text-right">
              <h3 className="money text-[13.5px] font-medium text-[var(--ink-900)]" editor-id="config.checkout.shipping.freeText">
                {item.subscriptionSettings?.trial || item.adjustedAmount === 0
                  ? t(config?.checkout?.shipping?.freeText, 'Free')
                  : formatMoney(item.adjustedAmount, currency, locale)}
              </h3>
              {item.adjustedAmount !== item.amount &&
                !item.subscriptionSettings?.trial &&
                item.adjustedAmount !== 0 && (
                  <span className="money text-[12px] text-[var(--ink-400)] line-through">
                    {formatMoney(item.amount, currency, locale)}
                  </span>
                )}
            </div>
          </div>
        </div>

        {item.recurring && !item.subscriptionSettings?.trial && config?.checkoutSettings?.hideRecurringPrices !== true && (
          <div className="mt-1">
            <span className="group relative text-xs text-[var(--ink-500)]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="size-4 fill-[var(--ink-500)] text-[var(--surface)]" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    Every {item.intervalCount || 1} {getIntervalText(item.interval, item.intervalCount || 1)}
                  </div>
                </TooltipContent>
              </Tooltip>
            </span>
          </div>
        )}
      </div>
    );
  },
);

ClubItem.displayName = 'ClubItem';

interface OrderSummaryProps {
  checkout?: CheckoutData | null;
  shippingCost: number;
  isLoading?: boolean;
  error?: Error | null;
  refresh: () => Promise<void>;
  disabled?: boolean;
}

export function OrderSummary({
  checkout,
  shippingCost,
  isLoading = false,
  error = null,
  refresh,
  disabled = false,
}: OrderSummaryProps) {
  const { config } = usePluginConfig<PluginConfigData>();
  const { t, locale } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(
    () => config?.checkoutSettings?.orderSummaryOpenByDefault ?? false,
  );

  useEffect(() => {
    if (typeof config?.checkoutSettings?.orderSummaryOpenByDefault === 'boolean') {
      setIsExpanded(config.checkoutSettings.orderSummaryOpenByDefault);
    }
  }, [config?.checkoutSettings?.orderSummaryOpenByDefault]);

  // Extract real data from checkout or provide defaults - using same keys as CMS OrderSummary
  const summary = checkout?.summary;
  const currency = summary?.currency || 'USD';
  const items = summary?.items || [];
  const clubProductId = checkout?.clubProductId || null;

  const cartCustomAttributes = useMemo(
    () => getCartCustomAttributes(checkout?.checkoutSession?.metadata),
    [checkout?.checkoutSession?.metadata?.cartCustomAttributes],
  );

  // Use the same property names as CMS OrderSummary - cast to any to access extended properties
  const summaryData = summary;
  const totalAdjustedAmount = summaryData?.totalAdjustedAmount || 0;
  const subtotalAdjustedAmount = summaryData?.subtotalAdjustedAmount || 0;
  const totalPromotionAmount = summaryData?.totalPromotionAmount || 0;
  const totalTaxAmount = summaryData?.totalTaxAmount || 0;
  const summaryShippingCost = summaryData?.shippingCost || 0;
  const shippingCostIsFree = summaryData?.shippingCostIsFree || false;
  const adjustments = summaryData?.adjustments || [];

  // Use shipping cost from summary if available, otherwise fallback to prop
  const actualShippingCost = summaryShippingCost || shippingCost;

  // Final total (totalAdjustedAmount should already include everything)
  const total = totalAdjustedAmount;

  // Separate regular items and club items (same logic as CMS)
  const { clubItems, regularItems } = useMemo(() => {
    if (!items || !clubProductId) {
      return { clubItems: [], regularItems: items };
    }

    return items.reduce(
      (acc, item) => {
        if (item.productId === clubProductId) {
          acc.clubItems.push(item);
        } else {
          acc.regularItems.push(item);
        }
        return acc;
      },
      { clubItems: [] as typeof items, regularItems: [] as typeof items },
    );
  }, [items, clubProductId]);

  // Calculate recurring groups (same logic as CMS)
  const recurringGroups = useMemo(() => {
    return items
      .filter((item) => item.recurring)
      .reduce(
        (groups, item) => {
          const key = `${item.interval}_${item.intervalCount}`;
          if (!groups[key]) {
            groups[key] = {
              interval: item.interval || 'month',
              intervalCount: item.intervalCount || 1,
              total: 0,
              adjustedTotal: 0,
            };
          }
          groups[key].total += item.amount;
          groups[key].adjustedTotal += item.adjustedAmount;
          return groups;
        },
        {} as Record<
          string,
          {
            interval: string;
            intervalCount: number;
            total: number;
            adjustedTotal: number;
          }
        >,
      );
  }, [items]);

  const hasRecurringItems = Object.keys(recurringGroups).length > 0;

  // Helper function to get interval text (same as CMS)
  const getIntervalText = (interval: string, count: number) => {
    const pluralSuffix = count > 1 ? 's' : '';
    return `${interval}${pluralSuffix}`;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="w-full animate-pulse max-lg:p-6 max-lg:pb-0 max-md:p-4">
      <div className="space-y-4">
        {/* Mobile/Desktop skeleton */}
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-[4px] bg-[var(--surface-sunk)] lg:h-20 lg:w-20"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-[var(--background-color)]"></div>
                <div className="h-3 w-1/2 rounded bg-[var(--background-color)]"></div>
              </div>
              <div className="h-4 w-16 rounded bg-[var(--background-color)]"></div>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border-color)] pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-[var(--background-color)]"></div>
              <div className="h-4 w-16 rounded bg-[var(--background-color)]"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded bg-[var(--background-color)]"></div>
              <div className="h-4 w-12 rounded bg-[var(--background-color)]"></div>
            </div>
            <div className="flex justify-between border-t border-[var(--border-color)] pt-2">
              <div className="h-5 w-12 rounded bg-[var(--background-color)]"></div>
              <div className="h-5 w-20 rounded bg-[var(--background-color)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="rounded-[4px] border border-[var(--danger)] bg-[var(--surface)] p-4 max-lg:m-6 max-lg:mb-0 max-md:m-4">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]"></div>
        <h3
          className="text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--danger)]"
          editor-id="config.checkout.errors.errorLoadingOrderSummary"
        >
          {t(config?.checkout?.errors?.errorLoadingOrderSummary, 'Error loading order summary')}
        </h3>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-700)]" editor-id="config.checkout.errors.unableToLoadOrderInfo">
        {error?.message ||
          t(
            config?.checkout?.errors?.unableToLoadOrderInfo,
            'Unable to load order information. Please try again.',
          )}
      </p>
    </div>
  );

  const mobileToggleShowText = t(config?.checkout?.orderSummary?.mobileToggleShowText, 'Show order summary');
  const mobileToggleHideText = t(config?.checkout?.orderSummary?.mobileToggleHideText, 'Hide order summary');
  const recurringEveryText = t(config?.checkout?.orderSummary?.recurringEveryText, 'Recurring every');
  const isDigitalProduct = config?.addressSettings?.digitalProduct || false;

  // Show loading state
  if (isLoading && !checkout) {
    return <LoadingSkeleton />;
  }

  // Show error state
  if (error) {
    return <ErrorState />;
  }

  return (
    <div
      className="w-full"
      editor-id="config.layout.stickyOrderSummary config.checkoutSettings.orderSummaryOpenByDefault"
    >
      {/* Mobile Collapsible Summary */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between border-b border-[var(--line-strong)] bg-[var(--checkout-order-summary-bg)] px-4 py-3.5"
        >
          <div className="flex items-center gap-2 text-[var(--ink-700)]">
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span
              className="text-[12px] font-medium uppercase tracking-[0.12em]"
              editor-id="config.checkout.orderSummary.mobileToggleShowText config.checkout.orderSummary.mobileToggleHideText"
            >
              {isExpanded ? mobileToggleHideText : mobileToggleShowText}
            </span>
          </div>
          <div className="money text-[16px] font-medium text-[var(--text-color)]">{formatMoney(total, currency, locale)}</div>
        </button>

        {isExpanded && (
          <div className="border-[var(--border-color)] border-b bg-[var(--background-color)] p-4">
            <div className="space-y-4">
              {/* Regular Items */}
              {regularItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        item.orderLineItemVariant?.imageUrl ||
                        item.variant?.imageUrl ||
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjNmNGY2IiByeD0iOCIvPgo8ZyBvcGFjaXR5PSIwLjUiPgo8cGF0aCBmaWxsPSIjZDFkNWRiIiBkPSJNMjAgMjBoMjR2MjRIMjB6Ii8+CjxwYXRoIGZpbGw9IiM5Y2EzYWYiIGQ9Ik0yNCAyOGgxNnYySDI0ek0yNCAzMmgxMnYySDI0ek0yNCAzNmg4djJIMjR6Ii8+CjwvZz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMyIgZmlsbD0iIzZiNzI4MCIvPgo8L3N2Zz4K'
                      }
                      alt={item.orderLineItemProduct?.name || item.product?.name || 'Product'}
                      className="h-14 w-14 rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] object-cover"
                      width={56}
                      height={56}
                    />
                    <span className="money absolute right-0 top-0 z-20 flex h-4 min-w-[16px] -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-[var(--primary-color)] px-1 text-[10px] font-semibold leading-none text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--text-color)] truncate text-sm font-medium">
                      {item.orderLineItemProduct?.name || item.product?.name}
                    </p>
                    <p className="text-[var(--text-secondary-color)] text-xs">
                      {item.orderLineItemVariant?.name || item.variant?.name}
                    </p>
                    {(config?.checkoutSettings?.showLineItemProperties ?? true) && (
                      <LineItemProperties item={item} />
                    )}
                    {item.recurring && config?.checkoutSettings?.hideRecurringPrices !== true && (
                      <p
                        className="text-[var(--text-secondary-color)] mt-1 text-xs"
                        editor-id="config.checkout.orderSummary.recurringEveryText"
                      >
                        {recurringEveryText} {item.intervalCount || 1} {item.interval}
                      </p>
                    )}
                  </div>
                  <div className="money text-[13.5px] font-medium text-[var(--text-color)]">
                    {formatMoney(item.adjustedAmount, currency, locale)}
                  </div>
                </div>
              ))}

              {/* Club Items */}
              {clubItems.length > 0 && (
                <div className="mt-3">
                  {clubItems.map((item) => (
                    <ClubItem key={item.id} item={item} currency={currency} config={config} t={t} locale={locale} />
                  ))}
                </div>
              )}

              {/* Cart Custom Attributes */}
              {(config?.checkoutSettings?.showCartCustomAttributes ?? true) && cartCustomAttributes.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-[var(--line)] pt-3">
                  {cartCustomAttributes.map((attr, index: number) => (
                    <div key={index} className="flex justify-between text-[13px]">
                      <span className="text-[var(--text-secondary-color)]">{String(attr.name ?? '')}</span>
                      <span className="text-right font-medium text-[var(--text-color)]">{String(attr.value ?? '')}</span>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Discount Code */}
              <DiscountCodes checkout={checkout} refresh={refresh} />

              <Separator />

              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between font-medium">
                  <span
                    className="text-[var(--text-secondary-color)]"
                    editor-id="config.checkout.orderSummary.subtotalText config.checkout.orderSummary.itemsText config.checkout.orderSummary.itemText"
                  >
                    {t(config?.checkout?.orderSummary?.subtotalText, 'Subtotal')} · {items.length}{' '}
                    {items.length > 1
                      ? t(config?.checkout?.orderSummary?.itemsText, 'items')
                      : t(config?.checkout?.orderSummary?.itemText, 'item')}
                  </span>
                  <span className="money text-[var(--text-color)]">{formatMoney(subtotalAdjustedAmount, currency, locale)}</span>
                </div>

                {/* Recurring totals */}
                {hasRecurringItems &&
                  Object.values(recurringGroups).map((group) => {
                    const hasTrialInGroup = items.some(
                      (item: any) =>
                        item.interval === group.interval &&
                        item.intervalCount === group.intervalCount &&
                        item.subscriptionSettings?.trial,
                    );

                    return (
                      <div
                        key={`${group.interval}_${group.intervalCount}`}
                        className={cn('flex justify-between text-xs', {
                          hidden: config?.checkoutSettings?.hideRecurringPrices === true,
                        })}
                        editor-id="config.checkoutSettings.hideRecurringPrices"
                      >
                        <span
                          className="text-[var(--text-secondary-color)]"
                          editor-id="config.checkout.orderSummary.recurringTotalText config.checkout.orderSummary.everyText"
                        >
                          {t(config?.checkout?.orderSummary?.recurringTotalText, 'Recurring total')} (
                          {t(config?.checkout?.orderSummary?.everyText, 'every')} {group.intervalCount}{' '}
                          {getIntervalText(group.interval, group.intervalCount)})
                        </span>
                        <div className="text-right">
                          <div className="text-[var(--text-secondary-color)]">
                            {hasTrialInGroup
                              ? formatMoney(group.total, currency, locale)
                              : formatMoney(group.adjustedTotal, currency, locale)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Promotions/Discounts */}
                {totalPromotionAmount > 0 && (
                  <>
                    <div className="flex justify-between text-[13px] font-medium">
                      <span
                        className="text-[var(--text-secondary-color)]"
                        editor-id="config.checkout.orderSummary.totalSavingsText"
                      >
                        {t(config?.checkout?.orderSummary?.totalSavingsText, 'Total Savings')}
                      </span>
                      <span className="money text-[var(--success)]">
                        −{formatMoney(Math.abs(totalPromotionAmount), currency, locale)}
                      </span>
                    </div>
                    {adjustments && adjustments.filter((adj: any) => adj.type === 'Promotion').length > 0 && (
                      <div className="ml-4 space-y-1">
                        {adjustments
                          .filter((adj: any) => adj.type === 'Promotion')
                          .map((adjustment: any, index: number) => (
                            <div key={index} className="flex justify-between text-[12px]">
                              <span className="text-[var(--text-secondary-color)]">{adjustment.description}</span>
                              <span className="money text-[var(--success)]">
                                −{formatMoney(Math.abs(adjustment.amount), currency, locale)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}

                {!isDigitalProduct && <div className="flex justify-between text-[13px]">
                  <span
                    className="text-[var(--text-secondary-color)]"
                    editor-id="config.checkout.orderSummary.shippingText"
                  >
                    {t(config?.checkout?.orderSummary?.shippingText, 'Shipping')}
                  </span>
                  <span className="money text-[var(--text-color)]" editor-id="config.checkout.shipping.freeText">
                    {shippingCostIsFree
                      ? t(config?.checkout?.shipping?.freeText, 'Free')
                      : formatMoney(actualShippingCost, currency, locale)}
                  </span>
                </div>}
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-secondary-color)]" editor-id="config.checkout.orderSummary.taxText">
                    {t(config?.checkout?.orderSummary?.taxText, 'Estimated taxes')}
                  </span>
                  <span className="money text-[var(--text-color)]">{formatMoney(totalTaxAmount, currency, locale)}</span>
                </div>
              </div>

              <div className="h-px bg-[var(--line-strong)]" />

              <div className="flex items-baseline justify-between pt-1">
                <span
                  className="eyebrow"
                  editor-id="config.checkout.orderSummary.totalText"
                >
                  {t(config?.checkout?.orderSummary?.totalText, 'Total')}
                </span>
                <span className="money text-[17px] font-medium text-[var(--text-color)]">{formatMoney(total, currency, locale)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Summary */}
      <div className="hidden lg:block">
        <div className="space-y-7">
          {/* Editorial hero total — invoice/receipt feel, mono tabular numerics */}
          <div className="border-b border-[var(--line-strong)] pb-6">
            <span
              className="eyebrow"
              editor-id="config.checkout.orderSummary.title"
            >
              <span className="eyebrow-step">SUM</span>
              {t(config?.checkout?.orderSummary?.totalText, 'Amount due')}
            </span>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="money-hero text-[44px] leading-none text-[var(--text-color)]">
                {formatMoney(total, currency, locale)}
              </span>
              <span
                className="money text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary-color)]"
              >
                {currency}
              </span>
            </div>
            <p
              className="mt-3 max-w-[42ch] text-[13px] leading-[1.55] text-[var(--text-secondary-color)]"
              style={{ fontFamily: 'var(--font-body)' }}
              editor-id="config.checkout.orderSummary.description"
            >
              {t(
                config?.checkout?.orderSummary?.description,
                'Itemized breakdown below. Tax and shipping recalculated as you fill the form.',
              )}
            </p>
          </div>

          {/* Regular Products */}
          <div className="space-y-4">
            {regularItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      item.orderLineItemVariant?.imageUrl ||
                      item.variant?.imageUrl ||
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjNmNGY2IiByeD0iOCIvPgo8ZyBvcGFjaXR5PSIwLjUiPgo8cGF0aCBmaWxsPSIjZDFkNWRiIiBkPSJNMjAgMjBoMjR2MjRIMjB6Ii8+CjxwYXRoIGZpbGw9IiM5Y2EzYWYiIGQ9Ik0yNCAyOGgxNnYySDI0ek0yNCAzMmgxMnYySDI0ek0yNCAzNmg4djJIMjR6Ii8+CjwvZz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMyIgZmlsbD0iIzZiNzI4MCIvPgo8L3N2Zz4K'
                    }
                    alt={item.orderLineItemProduct?.name || item.product?.name || 'Product'}
                    className="h-16 w-16 rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] object-cover"
                  />
                  <span className="money absolute right-0 top-0 z-20 flex h-5 min-w-[20px] -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-[var(--primary-color,var(--brand))] px-1.5 text-[11px] font-semibold leading-none text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14.5px] font-medium leading-tight text-[var(--ink-900)]">
                    {item.orderLineItemProduct?.name || item.product?.name}
                  </h3>
                  <p className="mt-1 text-[12.5px] text-[var(--text-secondary-color)]">
                    {item.orderLineItemVariant?.name || item.variant?.name}
                  </p>
                  {(config?.checkoutSettings?.showLineItemProperties ?? true) && (
                    <LineItemProperties item={item} />
                  )}
                  {item.recurring && config?.checkoutSettings?.hideRecurringPrices !== true && (
                    <p
                      className="text-[var(--text-secondary-color)] mt-1 text-xs"
                      editor-id="config.checkout.orderSummary.recurringEveryText"
                    >
                      {recurringEveryText} {item.intervalCount || 1} {item.interval}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="money text-[var(--text-color)] text-[15px] font-medium">
                    {formatMoney(item.adjustedAmount, currency, locale)}
                  </div>

                  {item.adjustedAmount !== item.amount && (
                    <div className="money text-[var(--text-secondary-color)] flex items-center gap-1 text-[13px] line-through">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="size-4 fill-[var(--ink-500)] text-[var(--surface)]" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-col gap-1">
                            {item.adjustments.map((adj) => {
                              const promotionCode = checkout?.availablePromotions.find(
                                (promotion) => promotion.id === adj.sourceId,
                              );
                              return (
                                <div key={adj.id}>
                                  <span>
                                    -{formatMoney(adj.amount, currency, locale)} {promotionCode?.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      {formatMoney(item.amount, currency, locale)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Club Items */}
          {clubItems.length > 0 && (
            <div className="mt-3">
              {clubItems.map((item) => (
                <ClubItem key={item.id} item={item} currency={currency} config={config} t={t} locale={locale} />
              ))}
            </div>
          )}

          {/* Cart Custom Attributes */}
          {(config?.checkoutSettings?.showCartCustomAttributes ?? true) && cartCustomAttributes.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-[var(--border-color)] pt-4" editor-id="config.checkoutSettings.showCartCustomAttributes">
              {cartCustomAttributes.map((attr, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary-color)]">{String(attr.name ?? '')}</span>
                  <span className="text-right text-[var(--text-color)] font-medium">{String(attr.value ?? '')}</span>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Discount Code */}
          <DiscountCodes checkout={checkout} refresh={refresh} disabled={disabled} />

          <Separator />

          {/* Totals */}
          <div className="space-y-3">
            <div className="flex justify-between text-base font-semibold">
              <span
                className="text-[var(--text-secondary-color)]"
                editor-id="config.checkout.orderSummary.subtotalText config.checkout.orderSummary.itemsText config.checkout.orderSummary.itemText"
              >
                {t(config?.checkout?.orderSummary?.subtotalText, 'Subtotal')} - {items.length}{' '}
                {items.length > 1
                  ? t(config?.checkout?.orderSummary?.itemsText, 'items')
                  : t(config?.checkout?.orderSummary?.itemText, 'item')}
              </span>
              <span className="text-[var(--text-color)]">{formatMoney(subtotalAdjustedAmount, currency, locale)}</span>
            </div>

            {/* Recurring totals */}
            {hasRecurringItems &&
              Object.values(recurringGroups).map((group) => {
                const hasTrialInGroup = items.some(
                  (item: any) =>
                    item.interval === group.interval &&
                    item.intervalCount === group.intervalCount &&
                    item.subscriptionSettings?.trial,
                );

                return (
                  <div
                    key={`${group.interval}_${group.intervalCount}`}
                    className={cn('flex justify-between text-xs', {
                      hidden: config?.checkoutSettings?.hideRecurringPrices === true,
                    })}
                  >
                    <span className="text-[var(--text-secondary-color)]">
                      {t(config?.checkout?.orderSummary?.recurringTotalText, 'Recurring total')} (
                      {t(config?.checkout?.orderSummary?.everyText, 'every')} {group.intervalCount}{' '}
                      {getIntervalText(group.interval, group.intervalCount)})
                    </span>
                    <div className="text-right">
                      <div className="text-[var(--text-secondary-color)]">
                        {hasTrialInGroup
                          ? formatMoney(group.total, currency, locale)
                          : formatMoney(group.adjustedTotal, currency, locale)}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Promotions/Discounts */}
            {totalPromotionAmount > 0 && (
              <>
                <div className="flex justify-between text-base font-medium">
                  <span
                    className="text-[var(--text-secondary-color)]"
                    editor-id="config.checkout.orderSummary.totalSavingsText"
                  >
                    {t(config?.checkout?.orderSummary?.totalSavingsText, 'Total Savings')}
                  </span>
                  <span className="text-green-600">
                    -{formatMoney(Math.abs(totalPromotionAmount), currency, locale)}
                  </span>
                </div>
                {adjustments && adjustments.filter((adj: any) => adj.type === 'Promotion').length > 0 && (
                  <div className="ml-4 space-y-2">
                    {adjustments
                      .filter((adj: any) => adj.type === 'Promotion')
                      .map((adjustment: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-[var(--text-secondary-color)]">{adjustment.description}</span>
                          <span className="text-green-600">
                            -{formatMoney(Math.abs(adjustment.amount), currency, locale)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}

            {!isDigitalProduct && <div className="flex justify-between text-[14px]">
              <span className="text-[var(--text-secondary-color)]">
                {t(config?.checkout?.orderSummary?.shippingText, 'Shipping')}
              </span>
              <span className="money text-[var(--text-color)]">
                {shippingCostIsFree
                  ? t(config?.checkout?.shipping?.freeText, 'Free')
                  : formatMoney(actualShippingCost, currency, locale)}
              </span>
            </div>}
            <div className="flex justify-between text-[14px]">
              <span className="text-[var(--text-secondary-color)]">
                {t(config?.checkout?.orderSummary?.taxText, 'Estimated taxes')}
              </span>
              <span className="money text-[var(--text-color)]">{formatMoney(totalTaxAmount, currency, locale)}</span>
            </div>
          </div>

          <div className="h-px bg-[var(--line-strong)]" />

          <div className="flex items-baseline justify-between">
            <span
              className="eyebrow"
              editor-id="config.checkout.orderSummary.totalText"
            >
              {t(config?.checkout?.orderSummary?.totalText, 'Total')}
            </span>
            <span className="money text-[18px] font-medium text-[var(--text-color)]">
              <span className="money mr-2 text-[12px] font-normal uppercase tracking-[0.12em] text-[var(--text-secondary-color)]">{currency}</span>
              {formatMoney(total, currency, locale)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
