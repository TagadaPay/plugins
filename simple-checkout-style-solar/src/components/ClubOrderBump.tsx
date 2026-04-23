'use client';

import { cn } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { CheckoutData, formatMoney, usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { HandCoinsIcon } from 'lucide-react';

interface ClubOrderBumpProps {
  variantName: string;
  discountPercentage: number;
  discountAmount: number;
  checkout: CheckoutData | undefined;
  handleToggle: (selected: boolean) => void;
  isSelected: boolean;
  isLoading?: boolean;
}

export function ClubOrderBump({
  variantName,
  discountPercentage,
  discountAmount,
  handleToggle,
  isSelected,
  isLoading,
  checkout,
}: ClubOrderBumpProps) {
  const currency = checkout?.summary?.currency;
  const { t, locale } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();
  return (
    <div className="relative mt-6">
      <div
        className={cn('group relative rounded-lg border-2 p-4 transition-all duration-200', {
          'border-green-200 bg-green-50 hover:bg-green-100': isSelected,
          'cursor-pointer border-amber-200 bg-amber-50 hover:bg-amber-100': !isSelected,
          'cursor-default border-[var(--border-color)] bg-[var(--background-color)] hover:bg-[var(--background-color)]': isLoading,
        })}
        onClick={() => !isSelected && handleToggle(true)}
      >
        {/* Discount tag */}
        <div className="absolute -right-2 -top-2 z-10">
          <div
            className={cn(
              'flex items-center justify-center rounded-full px-2 py-1 text-xs font-bold text-white shadow-md',
              {
                'bg-amber-600': !isSelected,
                'bg-green-600': isSelected,
                'h-6 min-w-12 animate-pulse bg-gray-500': isLoading,
              },
            )}
          >
            {!!!isLoading && `-${discountPercentage}%`}
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-between gap-2">
          <div>
            {isLoading ? (
              <>
                <div className="mb-1 h-5 w-32 animate-pulse rounded bg-[var(--background-color-hover)]" />
                <div className="h-4 w-48 animate-pulse rounded bg-[var(--background-color-hover)]" />
              </>
            ) : (
              <>
                <h3
                  className={cn(
                    'mb-1 text-base font-semibold',
                    isSelected ? 'text-green-800' : 'text-amber-800 group-hover:text-amber-900',
                  )}
                >
                  {`${variantName}${isSelected ? ` ${t(config?.checkout?.orderBumps?.appliedText, 'Applied')}` : ''}`}
                </h3>
                <p
                  className={cn(
                    'text-sm',
                    isSelected ? 'mb-3 text-green-700' : 'text-amber-700 group-hover:text-amber-800',
                  )}
                >
                  {isSelected
                    ? t(
                      config?.checkout?.orderBumps?.enjoyDiscountText,
                      "Enjoy {amount} OFF on your first order. Don't miss this exclusive welcome offer!",
                    ).replace('{amount}', formatMoney(discountAmount, currency, locale))
                    : t(config?.checkout?.orderBumps?.youSaveText, 'You save {amount} on your order').replace(
                      '{amount}',
                      formatMoney(discountAmount, currency, locale),
                    )}
                </p>
              </>
            )}

            {!isLoading && isSelected && (
              <>
                <div className="space-y-2">
                  <h4
                    className={cn(
                      'text-base font-semibold',
                      isSelected ? 'text-green-800' : 'text-amber-800',
                    )}
                  >
                    {t(config?.checkout?.orderBumps?.congratulationsText, 'Congratulations')}
                  </h4>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      isSelected ? 'text-green-700' : 'text-amber-700',
                    )}
                  >
                    {t(
                      config?.checkout?.orderBumps?.savedInstantlyText,
                      "You just saved instantly on your order! You've also unlocked exclusive discounts on premium products with {variantName}.",
                      { variantName },
                    )}
                  </p>
                </div>

                <button
                  className="mt-3 text-sm text-green-700 hover:text-green-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(false);
                  }}
                >
                  {t(config?.checkout?.orderBumps?.cancelText, 'Cancel {variantName}').replace(
                    '{variantName}',
                    variantName,
                  )}
                </button>
              </>
            )}
          </div>
          {!isSelected && !isLoading && (
            <HandCoinsIcon className="size-5 animate-bounce text-amber-500 group-hover:text-amber-600" />
          )}
        </div>
      </div>
    </div>
  );
}
