import { cn } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import {
  formatMoney,
  usePluginConfig,
  UseShippingRatesQueryResult,
  useTranslation,
} from '@tagadapay/plugin-sdk/v2';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { SectionHeader } from './ui/section-header';

interface ShippingRatesProps extends UseShippingRatesQueryResult {
  refresh: () => Promise<void>;
  validationError?: string;
  onRateSelect?: (rateId: string) => void;
  disabled?: boolean;
  /** Loading state for overall checkout session */
  isCheckoutLoading?: boolean;
  /** Whether a country has been selected (expecting rates to load) */
  hasCountrySelected?: boolean;
  /** Existing shipping rate ID from checkout session (prioritized over auto-select) */
  existingShippingRateId?: string | null;
}

export function ShippingRates({
  shippingRates,
  selectedRate,
  selectRate,
  refresh,
  isLoading,
  validationError,
  onRateSelect,
  disabled = false,
  previewedRates,
  isPreviewLoading,
  isCheckoutLoading = false,
  hasCountrySelected = false,
  existingShippingRateId,
}: ShippingRatesProps) {
  const { t, locale } = useTranslation();
  const [localSelectedRate, setLocalSelectedRate] = useState<string | null>(selectedRate?.id || null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasPersistedPreselectionRef = useRef(false);
  const isUserActionRef = useRef(false);
  const { config } = usePluginConfig<PluginConfigData>();

  // Use preview rates when actual rates are not available yet
  const displayRates = shippingRates?.length ? shippingRates : previewedRates;
  const isPreviewMode = !shippingRates?.length && !!previewedRates?.length;

  // Reset persistence flag when checkout session's shipping rate changes (backend state changed)
  useEffect(() => {
    hasPersistedPreselectionRef.current = false;
  }, [existingShippingRateId]);
  // Show loading if: actively loading OR checkout loading OR (country selected but no rates yet - means rates are about to be fetched)
  const isAwaitingRates = hasCountrySelected && !displayRates?.length && !isLoading && !isPreviewLoading;
  const showLoading = isLoading || isPreviewLoading || isCheckoutLoading || isAwaitingRates;

  // Debounced function to persist selection to backend
  const debouncedHandleSelectRate = useCallback(
    (rateId: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer - selectRate handles its own state updates, no need for refresh()
      debounceTimerRef.current = setTimeout(() => {
        selectRate(rateId);
      }, 2000);
    },
    [selectRate],
  );

  // Handle local selection with immediate UI update and debounced real update
  const handleLocalSelectRate = useCallback(
    (rateId: string) => {
      // Mark as user action to prevent preselection effect from calling backend directly
      isUserActionRef.current = true;
      setLocalSelectedRate(rateId);
      // Immediately notify parent component for form validation
      onRateSelect?.(rateId);
      // Debounced backend call - UI updates instantly, backend syncs in background
      debouncedHandleSelectRate(rateId);
    },
    [debouncedHandleSelectRate, onRateSelect],
  );

  useEffect(() => {
    if (selectedRate) {
      setLocalSelectedRate(selectedRate.id);
    }
  }, [selectedRate]);

  // Preselect rate: prioritize existing checkout session rate, then highlighted, then first
  // Persist to backend on auto-selection (not on user clicks - those use debounced handler)
  useEffect(() => {
    if (!displayRates?.length) return;

    // Wait for checkout to load before auto-selecting (so we know the existing rate)
    if (isCheckoutLoading) return;

    // If this effect was triggered by a user action, skip backend call
    // The debounced handler in handleLocalSelectRate will handle it
    const isUserAction = isUserActionRef.current;
    isUserActionRef.current = false; // Reset for next time

    // Priority 1: Use existing rate from checkout session if it's in the list
    // But don't override if user just made a selection (isUserAction or hasPersistedPreselection)
    if (existingShippingRateId && !isUserAction && !hasPersistedPreselectionRef.current) {
      const existingRateInList = displayRates.find((rate) => rate.id === existingShippingRateId);
      if (existingRateInList) {
        // Only update UI if different from current selection
        if (localSelectedRate !== existingShippingRateId) {
          setLocalSelectedRate(existingShippingRateId);
          onRateSelect?.(existingShippingRateId);
        }
        // Backend already has this rate, no need to persist
        return;
      }
    }

    const currentSelectionInList = displayRates.some((rate) => rate.id === localSelectedRate);

    // If current local selection is valid (and no existing rate to prioritize), keep it
    if (localSelectedRate && currentSelectionInList) {
      // If user action, mark as "persisted" to prevent subsequent effect runs from calling backend
      // The debounced handler will handle the actual backend call
      if (isUserAction) {
        hasPersistedPreselectionRef.current = true;
        return;
      }
      // Persist to backend only if:
      // - Haven't already persisted
      // - Backend doesn't have this rate yet
      if (!hasPersistedPreselectionRef.current && localSelectedRate !== existingShippingRateId) {
        hasPersistedPreselectionRef.current = true;
        selectRate(localSelectedRate);
      }
      return;
    }

    // Priority 2: Select highlighted rate, or fallback to first rate
    const highlightedRate = displayRates.find((rate) => rate.highlighted);
    const rateToSelect = highlightedRate || displayRates[0];

    setLocalSelectedRate(rateToSelect.id);
    onRateSelect?.(rateToSelect.id);

    // Persist to backend (this is auto-selection, not user action)
    if (!hasPersistedPreselectionRef.current && rateToSelect.id !== existingShippingRateId) {
      hasPersistedPreselectionRef.current = true;
      selectRate(rateToSelect.id);
    }
  }, [displayRates, localSelectedRate, existingShippingRateId, onRateSelect, isCheckoutLoading, selectRate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Skeleton component for loading state
  const ShippingRateSkeleton = () => (
    <div className="flex animate-pulse items-center justify-between rounded-lg border border-[var(--border-color)] p-4">
      <div className="flex items-center space-x-3">
        <div className="h-4 w-4 rounded-full bg-[var(--background-color-hover)]"></div>
        <div>
          <div className="mb-2 h-4 w-32 rounded bg-[var(--background-color-hover)]"></div>
          <div className="h-3 w-24 rounded bg-[var(--background-color-hover)]"></div>
        </div>
      </div>
      <div className="h-4 w-16 rounded bg-[var(--background-color-hover)]"></div>
    </div>
  );

  return (
    <div
      className={cn('space-y-4')}
      editor-id="config.shippingRateSettings.displayShippingRate config.shippingRateSettings.requireShippingRate"
    >
      <SectionHeader
        step={2}
        eyebrowLabel="Shipping"
        title={t(config?.checkout?.shipping?.title, 'How fast do you need it?')}
        description={t(
          config?.checkout?.shipping?.description,
          "Choose how you'd like to receive your order.",
        )}
        titleEditorId="config.checkout.shipping.title"
        descriptionEditorId="config.checkout.shipping.description"
      />
      {showLoading && !displayRates?.length ? (
        // Show skeleton loading state while fetching rates
        <div className="space-y-3">
          <ShippingRateSkeleton />
          <ShippingRateSkeleton />
        </div>
      ) : !displayRates?.length ? (
        // Show empty state only after loading is complete and no rates available
        <div className="text-muted-foreground" editor-id="config.checkout.shipping.noRatesText">
          {t(config?.checkout?.shipping?.noRatesText, 'No shipping methods are available for your country.')}
        </div>
      ) : (
        <>
          <RadioGroup
            disabled={disabled || showLoading}
            value={localSelectedRate || ''}
            onValueChange={handleLocalSelectRate}
            className={`relative flex flex-col gap-2 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
          >
            {/* Show actual or preview shipping rates */}
            <div className="space-y-3">
                {displayRates?.map((method, index) => (
                  <div
                    key={method.id}
                    className="animate-[fadeSlideUp_0.3s_ease-out_both]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Label
                      htmlFor={method.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between overflow-hidden rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] p-4 transition-colors duration-100 hover:border-[var(--ink-500)]',
                      )}
                    >
                      <div className="flex w-full items-center space-x-3">
                        <RadioGroupItem disabled={disabled || showLoading} value={method.id} id={method.id} />
                        {method.icon && (
                          <img
                            src={method.icon}
                            alt={`${method.shippingRateName} icon`}
                            className="h-6 w-6 object-contain"
                          />
                        )}
                        <div className="flex flex-wrap items-center gap-x-3">
                          <div className="font-medium">{method.shippingRateName}</div>
                          <div className="text-muted-foreground text-sm">{method.description}</div>
                        </div>
                      </div>
                      {method.isFree ? (
                        <div
                          className="ml-1 font-medium text-green-700"
                          editor-id="config.checkout.shipping.freeText"
                        >
                          {t(config?.checkout?.shipping?.freeText, 'Free')}
                        </div>
                      ) : (
                        <div className="ml-1 font-medium">
                          {formatMoney(method.amount, method.currency, locale)}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
            </div>
          </RadioGroup>
        </>
      )}
      {validationError && !showLoading && <p className="text-xs text-red-600">{validationError}</p>}
    </div>
  );
}

export default ShippingRates;
