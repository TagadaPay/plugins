'use client';

import Checkbox from '@/components/Checkbox';
import Input from '@/components/Input';
import PhoneInput from '@/components/PhoneInput';
import Select from '@/components/Select';
import { cn } from '@/lib/utils';
import { CheckoutFormData } from '@/components/SingleStepCheckout';
import { useGeoLocationContext } from '@/contexts/GeoLocationContext';
import { PluginConfigData } from '@/types/plugin-config';
import {
  CheckoutData,
  useGoogleAutocomplete,
  useISOData,
  usePluginConfig,
  useTranslation,
  type GooglePrediction,
} from '@tagadapay/plugin-sdk/v2';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Label } from './ui/label';
import { SectionHeader } from './ui/section-header';

interface AddressSectionProps {
  register: UseFormRegister<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  checkout?: CheckoutData;
  control: Control<CheckoutFormData>;
  config?: any; // Keep for backward compatibility but won't be used
  disabled?: boolean;
  titleEditorId?: string;
  descriptionEditorId?: string;
  trigger?: UseFormTrigger<CheckoutFormData>;
  mergedEmailField?: React.ReactNode;
  /** Called after Google Places auto-fills the address fields (setValue doesn't trigger watch 'change' events) */
  onAddressAutoFilled?: () => void;
}

export function AddressSection({
  register,
  watch,
  setValue,
  errors,
  checkout,
  control,
  disabled = false,
  titleEditorId,
  descriptionEditorId,
  trigger,
  mergedEmailField,
  onAddressAutoFilled,
}: AddressSectionProps) {
  const { t, locale } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();
  const { data: geoData } = useGeoLocationContext();
  const { countries, getRegions, mapGoogleToISO } = useISOData(locale as any);
  const [addressInput, setAddressInput] = useState('');
  const [showPredictions, setShowPredictions] = useState(false);
  const [availableStates, setAvailableStates] = useState<Array<{ code: string; name: string }>>([]);
  const [availableBillingStates, setAvailableBillingStates] = useState<Array<{ code: string; name: string }>>(
    [],
  );

  const isDigitalProduct = config?.addressSettings?.digitalProduct;

  const isCountryAccepted = useCallback(
    (countryCode: string) => {
      if (!config?.shippingRateSettings?.countryRestrictionsFromShippingRates) return true;

      const availableCountries = config?.shippingRateSettings?.availableShippingCountries;
      if (availableCountries && availableCountries.length > 0) {
        return availableCountries.includes(countryCode);
      }
      return true;
    },
    [
      config?.shippingRateSettings?.countryRestrictionsFromShippingRates,
      config?.shippingRateSettings?.availableShippingCountries,
    ],
  );

  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const predictionsContainerRef = useRef<HTMLDivElement>(null);

  // Close predictions on click outside
  useEffect(() => {
    if (!showPredictions) return;
    const handler = (e: MouseEvent) => {
      if (predictionsContainerRef.current && !predictionsContainerRef.current.contains(e.target as Node)) {
        setShowPredictions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPredictions]);
  const googleMapsApiKey = 'AIzaSyDFokrk2tb_QKFdODaW_33oFLk7aO6HOow';

  const googleAutocomplete = useGoogleAutocomplete({
    apiKey: googleMapsApiKey || '',
    language: 'en',
    defer: true,
  });
  const isBillingDifferent = watch('isBillingDifferent');
  const showBillingAddressText = watch('showBillingAddress');

  // Track if we've already prefilled to prevent infinite loops
  const hasPrefilledRef = useRef(false);

  // Prefill form values from checkout session
  useEffect(() => {
    if (checkout?.checkoutSession && !hasPrefilledRef.current) {
      hasPrefilledRef.current = true;
      const { customer, shippingAddress, billingAddress } = checkout.checkoutSession;

      // Prefill customer email
      if (customer?.email) {
        setValue('email', customer.email);
      }

      // Prefill shipping address
      if (shippingAddress) {
        if (shippingAddress.country) {
          setAvailableStates(getAvailableStates(shippingAddress.country));
          setValue('shippingAddress.country', shippingAddress.country);
        }
        if (shippingAddress.firstName) setValue('shippingAddress.firstName', shippingAddress.firstName);
        if (shippingAddress.lastName) setValue('shippingAddress.lastName', shippingAddress.lastName);
        if (shippingAddress.address1) {
          setValue('shippingAddress.address1', shippingAddress.address1);
          setAddressInput(shippingAddress.address1);
        }
        if (shippingAddress.address2) setValue('shippingAddress.address2', shippingAddress.address2);
        if (shippingAddress.city) setValue('shippingAddress.city', shippingAddress.city);
        if (shippingAddress.state) setValue('shippingAddress.state', shippingAddress.state);
        if (shippingAddress.postal) setValue('shippingAddress.postal', shippingAddress.postal);
        if (shippingAddress.phone) setValue('shippingAddress.phone', shippingAddress.phone);
      }

      // Prefill billing address if different
      if (
        billingAddress &&
        (billingAddress.firstName !== shippingAddress?.firstName ||
          billingAddress.lastName !== shippingAddress?.lastName ||
          billingAddress.address1 !== shippingAddress?.address1 ||
          billingAddress.city !== shippingAddress?.city ||
          billingAddress.country !== shippingAddress?.country ||
          billingAddress.state !== shippingAddress?.state ||
          billingAddress.postal !== shippingAddress?.postal)
      ) {
        setValue('isBillingDifferent', true);
        // Prefill billing address fields
        if (billingAddress.country) {
          setAvailableBillingStates(getAvailableStates(billingAddress.country));
          setValue('billingAddress.country', billingAddress.country);
        }
        if (billingAddress.firstName) setValue('billingAddress.firstName', billingAddress.firstName);
        if (billingAddress.lastName) setValue('billingAddress.lastName', billingAddress.lastName);
        if (billingAddress.address1) setValue('billingAddress.address1', billingAddress.address1);
        if (billingAddress.address2) setValue('billingAddress.address2', billingAddress.address2);
        if (billingAddress.city) setValue('billingAddress.city', billingAddress.city);
        if (billingAddress.state) setValue('billingAddress.state', billingAddress.state);
        if (billingAddress.postal) setValue('billingAddress.postal', billingAddress.postal);
        if (billingAddress.phone) setValue('billingAddress.phone', billingAddress.phone);

      }
    }
  }, [checkout?.checkoutSession, setValue]); // Only depend on checkout session and setValue

  // Watch country changes to update available states
  const watchedCountry = watch('shippingAddress.country');
  const currentState = watch('shippingAddress.state');
  const isCountrySelected = !!watchedCountry;
  const watchedBillingCountry = watch('billingAddress.country');
  const isBillingCountrySelected = !!watchedBillingCountry;
  const previousCountryRef = useRef<string>('');
  const previousBillingCountryRef = useRef<string>('');

  // Prefill country: forced config country > geolocation (session is handled by prefill effect above)
  const forcedCountry = config?.addressSettings?.forcedCountry;
  useEffect(() => {
    const fallbackCountry = forcedCountry || geoData?.country_code;
    if (fallbackCountry) {
      if (!watchedCountry) {
        console.log('setting shipping country', fallbackCountry, forcedCountry ? '(forced)' : '(geo)');
        setValue('shippingAddress.country', fallbackCountry);
      }
      if (!watchedBillingCountry) {
        console.log('setting billing country', fallbackCountry, forcedCountry ? '(forced)' : '(geo)');
        setValue('billingAddress.country', fallbackCountry);
      }
    }
  }, [geoData, forcedCountry, setValue]);

  useEffect(() => {
    if (watchedCountry && !isCountryAccepted(watchedCountry)) {
      setValue('shippingAddress.country', '');
    }
    if (watchedBillingCountry && !isCountryAccepted(watchedBillingCountry)) {
      setValue('billingAddress.country', '');
    }
  }, [watchedCountry, watchedBillingCountry, isCountryAccepted]);

  const getAvailableStates = useCallback(
    (country: string) => {
      const states = getRegions(country);
      const mappedStates = states.map((state: { iso: string; name: string }) => ({
        code: state.iso,
        name: state.name,
      }));
      return mappedStates;
    },
    [getRegions],
  );

  useEffect(() => {
    if (watchedCountry && watchedCountry !== previousCountryRef.current) {
      previousCountryRef.current = watchedCountry;

      const states = getAvailableStates(watchedCountry);
      setAvailableStates(states);

      if (currentState && !states?.find((s: { code: string }) => s.code === currentState)) {
        setValue('shippingAddress.state', '');
      }

      // Clear address predictions when country changes
      googleAutocomplete.clearPredictions();
      setShowPredictions(false);
    }
  }, [watchedCountry, getRegions, watch, setValue, googleAutocomplete]);

  // Watch billing country changes to update available billing states
  useEffect(() => {
    if (watchedBillingCountry && watchedBillingCountry !== previousBillingCountryRef.current) {
      previousBillingCountryRef.current = watchedBillingCountry;

      const billingStates = getAvailableStates(watchedBillingCountry);
      setAvailableBillingStates(billingStates);

      const currentBillingState = watch('billingAddress.state');
      if (
        currentBillingState &&
        !billingStates?.find((s: { code: string }) => s.code === currentBillingState)
      ) {
        setValue('billingAddress.state', '');
      }
    }
  }, [watchedBillingCountry, getRegions, watch, setValue]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string, country: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (query.length >= 3 && country) {
          setIsSearching(true);
          try {
            googleAutocomplete.searchPlaces(query, country);
            setShowPredictions(true);
          } catch (error) {
            console.error('Error searching places:', error);
          } finally {
            setIsSearching(false);
          }
        } else {
          googleAutocomplete.clearPredictions();
          setShowPredictions(false);
          setIsSearching(false);
        }
      }, 300); // 300ms debounce delay
    },
    [googleAutocomplete],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleAddressInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAddressInput(value);
      setValue('shippingAddress.address1', value);

      if (!isCountrySelected) {
        googleAutocomplete.clearPredictions();
        setShowPredictions(false);
        return;
      }

      // Use debounced search instead of immediate API call
      debouncedSearch(value, watchedCountry);
    },
    [isCountrySelected, watchedCountry, debouncedSearch, setValue, googleAutocomplete],
  );

  const handlePredictionSelect = useCallback(
    async (prediction: GooglePrediction) => {
      try {
        setIsSearching(true);
        setShowPredictions(false);

        const place = await googleAutocomplete.getPlaceDetails(prediction.place_id);
        if (!place) return;

        const extracted = googleAutocomplete.extractAddressComponents(place);
        const formated = googleAutocomplete.extractFormattedAddress(place);

        // Map Google state to ISO region
        const isoRegion = mapGoogleToISO(
          extracted.administrativeAreaLevel1 ?? '',
          extracted.administrativeAreaLevel1Long ?? '',
          watchedCountry ?? '',
        );

        if (formated.address1) {
          setAddressInput(formated.address1);
        }
        // Batch update form values with options to trigger watch
        setValue('shippingAddress.state', isoRegion?.iso || formated.state, { shouldDirty: true, shouldTouch: true });
        setValue('shippingAddress.country', formated.country, { shouldDirty: true, shouldTouch: true });
        setValue('shippingAddress.city', formated.city, { shouldDirty: true, shouldTouch: true });
        setValue('shippingAddress.postal', formated.postal, { shouldDirty: true, shouldTouch: true });
        setValue('shippingAddress.address1', formated.address1, { shouldDirty: true, shouldTouch: true });

        // Manually trigger validation/update after all values are set
        if (trigger) {
          await trigger([
            'shippingAddress.address1',
            'shippingAddress.city',
            'shippingAddress.state',
            'shippingAddress.postal',
            'shippingAddress.country',
          ]);
        }

        // Notify parent to update customer info (setValue doesn't fire watch 'change' events)
        try { onAddressAutoFilled?.(); } catch { /* fire-and-forget */ }
      } catch (error) {
        console.error('Error handling prediction selection:', error);
        toast.error(
          t(config?.checkout?.errors?.failedToLoadAddressDetails, 'Failed to load address details'),
        );
      } finally {
        setIsSearching(false);
      }
    },
    [watchedCountry, googleAutocomplete, mapGoogleToISO, setValue, trigger, onAddressAutoFilled],
  );

  // Expose methods to parent component

  return (
    <div className="space-y-4">
      {!isDigitalProduct &&
        <>
          <SectionHeader
            step={1}
            eyebrowLabel="Delivery"
            title={t(config?.checkout?.delivery?.title, 'Where should we send it?')}
            description={t(
              config?.checkout?.delivery?.description,
              "Enter the address where you'd like your order delivered.",
            )}
            titleEditorId={titleEditorId}
            descriptionEditorId={descriptionEditorId}
          />

          <Select
            name="shippingAddress.country"
            control={control}
            disabled={disabled}
            searchable
            searchPlaceholder={t(config?.checkout?.delivery?.countrySearchPlaceholder, 'Search country...')}
            placeholder={t(config?.checkout?.delivery?.countryPlaceholder, 'Country/Region')}
            editor-id="config.checkout.delivery.countryPlaceholder config.shippingRateSettings.countryRestrictionsFromShippingRates"
            choices={Object.values(countries)
              .filter(
                (country: { iso: string; name: string }) =>
                  country.iso && country.iso.trim() !== '' && isCountryAccepted(country.iso),
              )
              .map((country: { iso: string; name: string }) => ({ value: country.iso, label: country.name }))}
            error={errors.shippingAddress?.country?.message as string}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="text"
                placeholder={t(config?.checkout?.delivery?.firstNamePlaceholder, 'First name')}
                autoComplete="given-name"
                editor-id="config.checkout.delivery.firstNamePlaceholder"
                error={errors.shippingAddress?.firstName?.message as string | undefined}
                disabled={disabled}
                {...register('shippingAddress.firstName')}
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder={t(config?.checkout?.delivery?.lastNamePlaceholder, 'Last name')}
                autoComplete="family-name"
                editor-id="config.checkout.delivery.lastNamePlaceholder"
                error={errors.shippingAddress?.lastName?.message as string | undefined}
                disabled={disabled}
                {...register('shippingAddress.lastName')}
              />
            </div>
          </div>

          <div className="relative" ref={predictionsContainerRef}>
            <Input
              type="text"
              ref={register('shippingAddress.address1').ref}
              placeholder={
                isCountrySelected
                  ? t(config?.checkout?.delivery?.addressPlaceholder, 'Address')
                  : t(config?.checkout?.delivery?.addressPlaceholderNoCountry, 'Please select a country first')
              }
              autoComplete="street-address"
              value={addressInput}
              onChange={handleAddressInputChange}
              onBlur={() => { setTimeout(() => setShowPredictions(false), 200); }}
              disabled={disabled || !isCountrySelected}
              name="shippingAddress.address1"
              editor-id="config.checkoutSettings.requireAddressNumber config.checkout.delivery.addressPlaceholder config.checkout.delivery.addressPlaceholderNoCountry"
              error={errors.shippingAddress?.address1?.message as string | undefined}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border border-[var(--line)] border-t-[var(--ink-700)]"></div>
              </div>
            )}

            {/* Google Suggestions */}
            {showPredictions && googleAutocomplete.predictions.length > 0 && isCountrySelected && (
              <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)]">
                {googleAutocomplete.predictions.map((prediction, index) => (
                  <div
                    key={prediction.place_id || index}
                    onClick={() => handlePredictionSelect(prediction)}
                    className="cursor-pointer border-b border-[var(--line)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--surface-alt)]"
                  >
                    <div className="text-[13.5px] font-medium text-[var(--ink-900)]">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </div>
                    <div className="text-[12px] text-[var(--ink-500)]">
                      {prediction.structured_formatting?.secondary_text || ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            disabled={disabled || !isCountrySelected}
            type="text"
            placeholder={t(config?.checkout?.delivery?.apartmentPlaceholder, 'Apartment, suite, etc. (optional)')}
            editor-id="config.checkout.delivery.apartmentPlaceholder"
            error={errors.shippingAddress?.address2?.message as string | undefined}
            {...register('shippingAddress.address2')}
          />

          <div className={cn('grid grid-cols-1 gap-3', config?.addressSettings?.hideStateSelector || (isCountrySelected && availableStates.length === 0) ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
            <div>
              <Input
                disabled={disabled || !isCountrySelected}
                type="text"
                placeholder={t(config?.checkout?.delivery?.cityPlaceholder, 'City')}
                autoComplete="address-level2"
                editor-id="config.checkout.delivery.cityPlaceholder"
                error={errors.shippingAddress?.city?.message as string | undefined}
                {...register('shippingAddress.city')}
              />
            </div>
            {!config?.addressSettings?.hideStateSelector && (!isCountrySelected || availableStates.length > 0) && (
              <div>
                <Select
                  name="shippingAddress.state"
                  control={control}
                  disabled={disabled || !isCountrySelected}
                  placeholder={t(config?.checkout?.delivery?.statePlaceholder, 'State')}
                  editor-id="config.checkout.delivery.statePlaceholder"
                  choices={availableStates
                    .filter((state) => state.code && state.code.trim() !== '')
                    .map((state) => ({ value: state.code, label: state.name }))}
                  error={errors.shippingAddress?.state?.message as string}
                />
              </div>
            )}
            <div>
              <Input
                disabled={disabled || !isCountrySelected}
                type="text"
                placeholder={t(config?.checkout?.delivery?.zipPlaceholder, 'ZIP code')}
                autoComplete="postal-code"
                editor-id="config.checkout.delivery.zipPlaceholder"
                error={errors.shippingAddress?.postal?.message as string | undefined}
                {...register('shippingAddress.postal')}
              />
            </div>
          </div>
          <div editor-id="config.checkoutSettings.requireValidPhoneNumber config.checkoutSettings.requirePhone">
            <Controller
              name="shippingAddress.phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  placeholder={t(config?.checkout?.delivery?.phonePlaceholder, 'Phone')}
                  editor-id="config.checkout.delivery.phonePlaceholder"
                  disabled={disabled}
                  error={errors.shippingAddress?.phone?.message as string | undefined}
                  {...field}
                />
              )}
            />
          </div>

          {/* Merged email field after phone (when Contact & Delivery are merged) */}
          {mergedEmailField && (
            <div editor-id="config.checkoutSettings.mergeContactAndDelivery">
              {mergedEmailField}
            </div>
          )}

          <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
            <div className="flex items-center space-x-2">
              <Checkbox name="isBillingDifferent" control={control} disabled={disabled} />
              <Label
                htmlFor="isBillingDifferent"
                className="cursor-pointer text-sm"
                editor-id="config.checkout.delivery.billingDifferentLabel"
              >
                {t(
                  config?.checkout?.delivery?.billingDifferentLabel,
                  'My billing address is different from my shipping address',
                )}
              </Label>
            </div>
          </div>
        </>}

      {/* Merged email field for digital products (no shipping section) */}
      {isDigitalProduct && mergedEmailField && (
        <div editor-id="config.checkoutSettings.mergeContactAndDelivery">
          {mergedEmailField}
        </div>
      )}

      {/* Billing Address Form */}
      {(isDigitalProduct || isBillingDifferent) && (
        <div className={`space-y-4 border-t pt-6 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
          <h3 className="text-lg font-medium" editor-id="config.checkout.delivery.billingTitle">
            {t(config?.checkout?.delivery?.billingTitle, 'Billing address')}
          </h3>

          {
            (showBillingAddressText || !isDigitalProduct) &&
            <Select
              name="billingAddress.country"
              control={control}
              disabled={disabled}
              searchable
              searchPlaceholder={t(config?.checkout?.delivery?.countrySearchPlaceholder, 'Search country...')}
              placeholder={t(config?.checkout?.delivery?.countryPlaceholder, 'Country/Region')}
              editor-id="config.checkout.delivery.countryPlaceholder"
              choices={Object.values(countries)
                .filter((country: { iso: string; name: string }) => country.iso && country.iso.trim() !== '')
                .map((country: { iso: string; name: string }) => ({ value: country.iso, label: country.name }))}
              error={errors.billingAddress?.country?.message as string}
            />}

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder={t(config?.checkout?.delivery?.firstNamePlaceholder, 'First name')}
              autoComplete="billing given-name"
              editor-id="config.checkout.delivery.firstNamePlaceholder"
              error={errors.billingAddress?.firstName?.message as string | undefined}
              disabled={disabled}
              {...register('billingAddress.firstName')}
            />
            <Input
              type="text"
              placeholder={t(config?.checkout?.delivery?.lastNamePlaceholder, 'Last name')}
              autoComplete="billing family-name"
              editor-id="config.checkout.delivery.lastNamePlaceholder"
              error={errors.billingAddress?.lastName?.message as string | undefined}
              disabled={disabled}
              {...register('billingAddress.lastName')}
            />
          </div>

          {(showBillingAddressText || !isDigitalProduct) && <>        <Input
            type="text"
            placeholder={t(config?.checkout?.delivery?.addressPlaceholder, 'Address')}
            autoComplete="billing street-address"
            editor-id="config.checkout.delivery.addressPlaceholder"
            error={errors.billingAddress?.address1?.message as string | undefined}
            disabled={disabled}
            {...register('billingAddress.address1')}
          />

            <Input
              type="text"
              placeholder={t(
                config?.checkout?.delivery?.apartmentPlaceholder,
                'Apartment, suite, etc. (optional)',
              )}
              autoComplete="billing address-line2"
              editor-id="config.checkout.delivery.apartmentPlaceholder"
              error={errors.billingAddress?.address2?.message as string | undefined}
              disabled={disabled}
              {...register('billingAddress.address2')}
            />

            <div className={cn('grid grid-cols-1 gap-3', config?.addressSettings?.hideStateSelector || (isBillingCountrySelected && availableBillingStates.length === 0) ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
              <Input
                type="text"
                placeholder={t(config?.checkout?.delivery?.cityPlaceholder, 'City')}
                autoComplete="billing address-level2"
                editor-id="config.checkout.delivery.cityPlaceholder"
                error={errors.billingAddress?.city?.message as string | undefined}
                disabled={disabled}
                {...register('billingAddress.city')}
              />
              {!config?.addressSettings?.hideStateSelector && (!isBillingCountrySelected || availableBillingStates.length > 0) && (
                <Select
                  name="billingAddress.state"
                  control={control}
                  disabled={disabled || !isBillingCountrySelected}
                  placeholder={t(config?.checkout?.delivery?.statePlaceholder, 'State')}
                  editor-id="config.checkout.delivery.statePlaceholder"
                  choices={availableBillingStates
                    .filter((state) => state.code && state.code.trim() !== '')
                    .map((state) => ({ value: state.code, label: state.name }))}
                  error={errors.billingAddress?.state?.message as string}
                />
              )}

              <Input
                type="text"
                placeholder={t(config?.checkout?.delivery?.zipPlaceholder, 'ZIP code')}
                autoComplete="billing postal-code"
                editor-id="config.checkout.delivery.zipPlaceholder"
                error={errors.billingAddress?.postal?.message as string | undefined}
                disabled={disabled}
                {...register('billingAddress.postal')}
              />
            </div></>}
          <div>
            <Controller
              name="billingAddress.phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  placeholder={t(config?.checkout?.delivery?.phonePlaceholder, 'Phone')}
                  editor-id="config.checkout.delivery.phonePlaceholder"
                  disabled={disabled}
                  error={errors.billingAddress?.phone?.message as string | undefined}
                  {...field}
                />
              )}
            />
          </div>
          {isDigitalProduct && <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
            <div className="flex items-center space-x-2">
              <Checkbox name="showBillingAddress" control={control} disabled={disabled} />
              <Label
                htmlFor="showBillingAddress"
                className="cursor-pointer text-sm"
                editor-id="config.checkout.delivery.showBillingAddressText"
              >
                {t(
                  config?.checkout?.delivery?.showBillingAddressText,
                  'Show advanced billing address fields',
                )}
              </Label>
            </div>
          </div>}
        </div>
      )}
    </div>
  );
}
