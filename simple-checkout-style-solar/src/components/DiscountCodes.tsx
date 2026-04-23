import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import {
  CheckoutData,
  formatMoney,
  useDiscounts,
  usePluginConfig,
  useTranslation,
} from '@tagadapay/plugin-sdk/v2';
import { Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

enum DiscountType {
  PERCENTAGE = 'percentage',
  AMOUNT = 'amount',
}

type DiscountCodesProps = {
  checkout: CheckoutData | null | undefined;
  refresh: () => Promise<void>;
  disabled?: boolean;
};

function DiscountCodes({ checkout, refresh, disabled = false }: DiscountCodesProps) {
  const { t, locale } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const { appliedDiscounts, isApplying, applyDiscountCode, removeDiscount, error, clearError } = useDiscounts(
    {
      sessionId: checkout?.checkoutSession?.id,
    },
  );
  const [promotionCode, setPromotionCode] = useState('');
  const [removingDiscountIds, setRemovingDiscountIds] = useState<Set<string>>(new Set());
  const [exitingDiscounts, setExitingDiscounts] = useState<typeof appliedDiscounts>([]);
  // Store discount amounts to persist them during animations
  const [discountAmountsCache, setDiscountAmountsCache] = useState<
    Map<string, Array<{ type: DiscountType; value: number; id: string }>>
  >(new Map());
  // Store the original order of exiting discounts (promotionId -> original index)
  const [exitingDiscountOrder, setExitingDiscountOrder] = useState<Map<string, number>>(new Map());
  const appliedDiscountCodes = appliedDiscounts?.filter((discount) => discount.promotionCodeId) || [];

  // Merge current discounts with exiting ones, preserving original order
  const displayedDiscountCodes = useMemo(() => {
    if (!exitingDiscounts || exitingDiscounts.length === 0) {
      return appliedDiscountCodes;
    }

    const allDiscounts = [...appliedDiscountCodes];
    const exitingItems = exitingDiscounts.filter(
      (discount) => discount.promotionCodeId && !appliedDiscountCodes.find((d) => d.id === discount.id),
    );

    // Insert exiting discounts at their original positions
    // Sort by original index to insert in correct order
    const sortedExiting = exitingItems
      .map((discount) => ({
        discount,
        originalIndex: exitingDiscountOrder.get(discount.promotion.id) ?? Infinity,
      }))
      .sort((a, b) => a.originalIndex - b.originalIndex);

    // Insert from highest index to lowest to avoid index shifting issues
    for (let i = sortedExiting.length - 1; i >= 0; i--) {
      const { discount, originalIndex } = sortedExiting[i];
      // Clamp index to valid range
      const insertIndex = Math.min(originalIndex, allDiscounts.length);
      allDiscounts.splice(insertIndex, 0, discount);
    }

    return allDiscounts;
  }, [appliedDiscountCodes, exitingDiscounts, exitingDiscountOrder]);

  const clearErrorAndErrorCode = () => {
    clearError();
    setErrorCode(null);
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        clearErrorAndErrorCode();
      }, 3000);
    }
  }, [error, errorCode]);

  const handleApplyPromotionCode = async () => {
    if (disabled) return;
    clearErrorAndErrorCode();
    if (!promotionCode.trim()) return;
    await applyDiscountCode(promotionCode.trim()).then((e) => {
      if (e?.error) {
        setErrorCode(e.error);
      }
    });
    await refresh();
    setPromotionCode('');
  };

  const handleRemoveDiscount = async (discountId: string) => {
    if (disabled) return;
    setRemovingDiscountIds((prev) => new Set(prev).add(discountId));

    // Store the discount that's being removed so it stays visible during exit animation
    const discountToRemove = appliedDiscountCodes.find((d) => d.promotion.id === discountId);
    if (discountToRemove) {
      // Store the original index to preserve position during exit animation
      const originalIndex = appliedDiscountCodes.findIndex((d) => d.promotion.id === discountId);
      if (originalIndex !== -1) {
        setExitingDiscountOrder((prev) => {
          const newMap = new Map(prev);
          newMap.set(discountId, originalIndex);
          return newMap;
        });
      }

      // Store the current amounts before removal so they persist during exit animation
      const currency = checkout?.summary?.currency || 'USD';
      const currentAmounts = getDiscountAmounts(discountId, currency);
      if (currentAmounts && currentAmounts.length > 0) {
        setDiscountAmountsCache((prev) => {
          const newMap = new Map(prev);
          newMap.set(discountId, currentAmounts);
          return newMap;
        });
      }
      setExitingDiscounts((prev) => [...(prev || []), discountToRemove]);
    }

    try {
      await removeDiscount(discountId);
      await refresh();

      // Remove from exiting list after a brief delay to trigger exit animation
      // The delay ensures React has processed the refresh update first
      // This causes the item to be removed from displayedDiscountCodes,
      // which AnimatePresence will detect and animate out
      setTimeout(() => {
        setExitingDiscounts((prev) => prev?.filter((d) => d.promotion.id !== discountId) || []);
        setExitingDiscountOrder((prev) => {
          const newMap = new Map(prev);
          newMap.delete(discountId);
          return newMap;
        });
        // Clean up the cache after animation completes
        setTimeout(() => {
          setDiscountAmountsCache((prev) => {
            const newMap = new Map(prev);
            newMap.delete(discountId);
            return newMap;
          });
        }, 250);
      }, 10);
    } finally {
      setRemovingDiscountIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(discountId);
        return newSet;
      });
    }
  };

  // Get discount amounts from checkout adjustments
  const getDiscountAmounts = (discountId: string, currency: string) => {
    // Check cache first (for exiting discounts)
    const cached = discountAmountsCache.get(discountId);
    if (cached) {
      return cached;
    }

    // Otherwise get from checkout
    const adjustment = checkout?.availablePromotions?.find((adj) => adj.id === discountId);

    // Only show actions that actually impact the current cart:
    // - LineItemAdjustment: only if targetProductId matches a cart item
    // - OrderAdjustment/ShippingAdjustment: always show (cart-level)
    // Then deduplicate by type+value so e.g. two matching -25% product actions show "-25%" once
    const cartProductIds = new Set(
      checkout?.summary?.items?.map((item: any) => item.productId) || [],
    );
    const seen = new Set<string>();
    const amounts = adjustment?.actions
      .filter((action: any) => {
        if (action.type === 'OrderAdjustment' || action.type === 'ShippingAdjustment') return true;
        if (action.targetProductId) return cartProductIds.has(action.targetProductId);
        return true; // no target = applies broadly
      })
      .map((action) => {
        if (action.adjustmentAmount) {
          const amount = action.adjustmentAmount?.[currency]?.amount || 0;
          if (amount === 0) return undefined;
          const key = `${DiscountType.AMOUNT}:${amount}`;
          if (seen.has(key)) return undefined;
          seen.add(key);
          return {
            value: amount,
            type: DiscountType.AMOUNT,
            id: action.id,
          };
        } else if (action.adjustmentPercentage) {
          const value = action.adjustmentPercentage || 0;
          const key = `${DiscountType.PERCENTAGE}:${value}`;
          if (seen.has(key)) return undefined;
          seen.add(key);
          return { value, type: DiscountType.PERCENTAGE, id: action.id };
        }
      })
      .filter((action) => action !== undefined) as
      | Array<{ type: DiscountType; value: number; id: string }>
      | undefined;

    // Cache the amounts if they exist
    if (amounts && amounts.length > 0) {
      setDiscountAmountsCache((prev) => {
        const newMap = new Map(prev);
        newMap.set(discountId, amounts);
        return newMap;
      });
    }

    return amounts;
  };

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder={t(config?.checkout?.discountCodes?.placeholder, 'Discount code')}
          value={promotionCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromotionCode(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
            e.key === 'Enter' && !disabled && handleApplyPromotionCode()
          }
          disabled={disabled}
          className="h-12 flex-1 text-base"
          editor-id="config.checkout.discountCodes.placeholder"
        />
        <Button
          variant="outline"
          onClick={handleApplyPromotionCode}
          disabled={disabled || !promotionCode.trim() || isApplying}
          className="h-12 px-6"
          editor-id="config.checkout.discountCodes.applyText config.checkout.discountCodes.applyingText"
        >
          {isApplying
            ? t(config?.checkout?.discountCodes?.applyingText, 'Applying...')
            : t(config?.checkout?.discountCodes?.applyText, 'Apply')}
        </Button>
      </div>
      {error && (
        <p
          className={cn(
            'rounded-[4px] border border-[var(--danger)] bg-[var(--surface)] p-2 text-[12.5px] text-[var(--danger)] transition-all',
            {
              'mt-2 h-fit': error,
              'mt-0 h-0': !error,
            },
          )}
          role="alert"
        >
          {error.message}
        </p>
      )}
      {errorCode && (
        <p
          className={cn(
            'rounded-[4px] border border-[var(--danger)] bg-[var(--surface)] p-2 text-[12.5px] text-[var(--danger)] transition-all',
            {
              'mt-2 h-fit': errorCode,
              'mt-0 h-0': !errorCode,
            },
          )}
          role="alert"
        >
          {errorCode}
        </p>
      )}
      {displayedDiscountCodes.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {displayedDiscountCodes
            .filter((discount) => discount.promotionCodeId)
            .map((discount) => {
              const currency = checkout?.summary?.currency || 'USD';
              const discountAmounts = getDiscountAmounts(discount.promotion.id, currency);
              const isExiting = !appliedDiscountCodes.find((d) => d.id === discount.id);
              const isRemoving = removingDiscountIds.has(discount.promotion.id);

              return (
                <div
                  key={discount.id}
                  className="flex w-fit shrink-0 items-center justify-between gap-0.5 rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] py-1.5 pl-3 pr-1.5 animate-[fadeScaleIn_0.2s_ease-out]"
                >
                  <div className="flex flex-1 items-center gap-1.5">
                    <div className="text-[12.5px] font-medium uppercase tracking-[0.06em] text-[var(--ink-900)]">{discount.promotion.name}</div>
                    {discountAmounts &&
                      discountAmounts.map(({ type, value, id }) => {
                        return (
                          <div
                            key={id}
                            className="money text-[12.5px] font-medium text-[var(--success)] animate-[fadeSlideIn_0.15s_ease-out]"
                          >
                            −{type === DiscountType.PERCENTAGE ? `${value}%` : formatMoney(Math.abs(value), currency, locale)}
                          </div>
                        );
                      })}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDiscount(discount.promotion.id)}
                    disabled={disabled || isRemoving || isExiting}
                    className="size-7 p-0 text-[var(--ink-400)] hover:bg-transparent hover:text-[var(--danger)]"
                  >
                    {isRemoving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default DiscountCodes;
