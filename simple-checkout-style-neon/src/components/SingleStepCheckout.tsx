import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Label } from './ui/label';

import { AddressSection } from '@/components/AddressSection';
import { BottomLinks } from '@/components/BottomLinks';
import BrandedVipOffer from '@/components/BrandedVipOffer';
import ExpressCheckoutButtons from '@/components/ExpressCheckoutButtons';
import Input from '@/components/Input';
import LoadingSpinner from '@/components/LoadingSpinner';
import { OrderSummary } from '@/components/OrderSummary';
import PaymentButtonsSection from '@/components/PaymentButtonsSection';
import PaymentProcessingOverlay from '@/components/PaymentProcessingOverlay';
import Scarcity from '@/components/Scarcity';
import Sections from '@/components/Sections';
import { GeoLocationProvider, useGeoLocationContext } from '@/contexts/GeoLocationContext';
import { usePaymentMethod } from '@/contexts/PaymentMethods';
import { VipOffersProvider } from '@/contexts/VipOffersContext';
import { useIsTablet } from '@/hooks/useIsTablet';
import { useIsThreedsActive } from '@/hooks/useIsThreedsActive';
import { createCheckoutFormSchema } from '@/lib/checkout-schema';
import { cn, getColorOpacityFromCSSVar } from '@/lib/utils';
import { PaymentType } from '@/types/payment-type';
import { PluginConfigData } from '@/types/plugin-config';
import { zodResolver } from '@hookform/resolvers/zod';
import type { WhopCheckoutHandle, WhopPayment } from '@tagadapay/plugin-sdk/v2';
import {
  ExpressPaymentMethodsProvider,
  FunnelActionType,
  useApplePayCheckout,
  useCheckout,
  useFunnel,
  useGooglePayCheckout,
  useISOData,
  usePayment,
  usePixelTracking,
  usePluginConfig,
  useShippingRates,
  useStepConfig,
  useTagadaContext,
  useTranslation,
  WhopCheckout,
} from '@tagadapay/plugin-sdk/v2';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { HiPayCheckout, HiPayCheckoutHandle } from './HiPayCheckout';
import { ZelleCheckout, ZelleCheckoutHandle } from './ZelleCheckout';
import { CustomPaymentCheckout, CustomPaymentCheckoutHandle } from './CustomPaymentCheckout';
import { PrimaryOrderBumpList, SecondaryOrderBumpList, VipOrderBumpList } from './OrderBump';
import { PaymentSection } from './PaymentSection';
import { ShippingRates } from './ShippingRates';
import { TopBar } from './TopBar';
import { Checkbox } from './ui/checkbox';
import { SectionHeader } from './ui/section-header';

// Form schema matching the original design

export type CheckoutFormData = z.infer<ReturnType<typeof createCheckoutFormSchema>>;

interface SingleStepCheckoutProps {
  checkoutToken?: string;
}

function SingleStepCheckoutInner({ checkoutToken }: SingleStepCheckoutProps) {
  // Form ID must be called at the top level (React Hook rules)
  const formId = useId();

  // Get funnel context (initialized by TagadaProvider)
  // - Auto-detects funnelId from URL query param (?funnelId=xxx)
  // - Session managed by TagadaProvider
  const { next, isNavigating } = useFunnel();
  const { t, locale } = useTranslation();
  const { getRegions } = useISOData(locale as any);
  const { config, loading: configLoading } = usePluginConfig<PluginConfigData>();
  const isDigitalProduct = config?.addressSettings?.digitalProduct || false;
  const { paymentSetupConfig } = useStepConfig();
  const { track, pixelsInitialized } = usePixelTracking();
  const isTablet = useIsTablet();
  const hasTrackedCheckoutRef = useRef(false);
  const lastTrackedCheckoutSessionIdRef = useRef<string | undefined>(undefined);

  const getDesktopMarginClasses = (position: 'left' | 'right') => {
    const marginLevel = config?.layout?.desktopMargin || 'medium';
    switch (marginLevel) {
      case 'small':
        return position === 'left' ? 'lg:ml-4 xl:ml-8' : 'lg:mr-4 xl:mr-8';
      case 'medium':
        return position === 'left' ? 'lg:ml-8 xl:ml-16 2xl:mr-24' : 'lg:mr-8 xl:mr-16 2xl:mr-24';
      case 'large':
        return position === 'left' ? 'lg:ml-16 xl:ml-32 2xl:ml-48' : 'lg:mr-16 xl:mr-32 2xl:mr-48';
      default:
        return position === 'left' ? 'lg:ml-8 xl:ml-16 2xl:ml-24' : 'lg:mr-8 xl:mr-16 2xl:mr-24';
    }
  };

  // Get desktop padding classes based on config
  const getDesktopPaddingClasses = () => {
    const marginLevel = config?.layout?.desktopMargin || 'medium';
    switch (marginLevel) {
      case 'small':
        return 'lg:px-8 lg:py-8';
      case 'large':
        return 'lg:px-16 lg:py-16';
      case 'medium':
      default:
        return 'lg:px-12 lg:py-12';
    }
  };

  // Get max width classes based on config
  const getMaxWidthClasses = () => {
    const marginLevel = config?.layout?.desktopMargin || 'medium';
    switch (marginLevel) {
      case 'small':
        return 'max-w-2xl';
      case 'medium':
        return 'max-w-2xl';
      case 'large':
        return 'max-w-4xl';
      default:
        return 'max-w-2xl';
    }
  };

  // Get sticky classes based on config
  const getStickyClasses = () => {
    const stickyOrderSummary = config?.layout?.stickyOrderSummary ?? false;
    return stickyOrderSummary
      ? 'lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto sticky-sidebar-scroll'
      : '';
  };

  // Initialize checkout session
  const {
    checkout,
    updateCustomerAndSessionInfo,
    isLoading: checkoutLoading,
    error: checkoutError,
    refresh,
    updateLineItems,
  } = useCheckout({
    checkoutToken,
    messages: {
      sessionTimeout: t(config?.checkout?.errors?.sessionTimeout, 'Session initialization timeout. Please refresh the page and try again.'),
      initFailed: t(config?.checkout?.errors?.initFailed, 'Failed to initialize checkout resource'),
      noCheckoutSession: t(config?.checkout?.errors?.noCheckoutSession, 'No checkout session available'),
    },
  });

  // Payment processing with universal callbacks
  const {
    processCardPayment,
    processApmPayment,
    isLoading: isPaymentLoading,
    error: paymentError,
    clearError: clearPaymentError,
  } = usePayment({
    // Universal success handler - works for both immediate AND post-redirect (3DS, etc.)
    // SDK handles funnel session synchronization automatically via waitForSession option
    onPaymentCompleted: async (payment, metadata) => {
      console.log('🎉 [Checkout] onPaymentCompleted triggered!', {
        paymentId: payment.id,
        status: payment.status,
        isRedirectReturn: metadata.isRedirectReturn,
      });

      toast.success('Payment successful!');

      // Extract order from payment or metadata (for navigation purposes)
      const order = metadata.order || payment.order;

      // Purchase tracking is handled on the ThankYou page for reliability
      // (page navigation can cause events to be lost if fired here)

      console.log('🚀 [Checkout] Triggering funnel navigation...', {
        type: 'PAYMENT_SUCCESS',
        paymentId: payment.id,
        orderId: order?.id,
      });

      try {
        // Trigger funnel navigation with wait logic for redirects
        await next(
          {
            type: FunnelActionType.PAYMENT_SUCCESS,
            data: {
              paymentId: payment.id,
              payment: {
                id: payment.id,
                status: payment.status,
              },
              order: order
                ? {
                  id: order.id,
                  amount: order.amount,
                  currency: order.currency,
                }
                : undefined,
              resources: {
                order: order
                  ? {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                  }
                  : undefined,
                // Emitting 'mainOrder' to allow specific reference in receipt pages
                mainOrder: order
                  ? {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                  }
                  : undefined,
                payment: {
                  id: payment.id,
                  status: payment.status,
                },
                checkout: {
                  id: metadata.checkoutSessionId || checkout?.checkoutSession?.id || '',
                  token: checkoutToken || '',
                  selectedPresentmentCurrency: checkout?.checkoutSession?.selectedPresentmentCurrency || '',
                },
              },
            },
          },
          {
            // ✅ Critical: Wait for session if returning from redirect
            waitForSession: metadata.isRedirectReturn,
          },
        );

        console.log('✅ [Checkout] Funnel navigation triggered successfully');
      } catch (error) {
        console.error('❌ [Checkout] Funnel navigation failed:', error);
        toast.error('Navigation failed - please refresh the page');
      }
    },

    // Universal failure handler
    onPaymentFailed: async (errorMessage, metadata) => {
      console.error('❌ [Checkout] onPaymentFailed triggered:', {
        error: errorMessage,
        isRedirectReturn: metadata.isRedirectReturn,
      });

      toast.error(t(config?.checkout?.errors?.paymentFailed, errorMessage || 'Payment failed'));

      // Could trigger funnel failure flow if needed
      // await next({ type: FunnelActionType.PAYMENT_FAILED, ... });
    },
  });

  // Apple Pay checkout (for form payment flow)
  const { handleApplePayClick } = useApplePayCheckout({
    checkout,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: async (result: { payment: any; order?: any }) => {
      toast.success('Payment successful!');
      console.log('result', result);
      console.log(
        'checkout?.checkoutSession?.selectedPresentmentCurrency',
        checkout?.checkoutSession?.selectedPresentmentCurrency,
      );

      // Trigger funnel navigation - orchestrator will handle redirect to /post or /thankyou
      await next({
        type: FunnelActionType.PAYMENT_SUCCESS,
        data: {
          paymentId: result.payment.id,
          payment: {
            id: result.payment.id,
            status: result.payment.status,
          },
          order: result.order
            ? {
              id: result.order.id,
              amount: result.order.amount,
              currency: result.order.currency,
            }
            : undefined,
          resources: {
            order: result.order
              ? {
                id: result.order.id,
                amount: result.order.amount,
                currency: result.order.currency,
              }
              : undefined,
            // Emitting 'mainOrder' to allow specific reference in receipt pages
            mainOrder: result.order
              ? {
                id: result.order.id,
                amount: result.order.amount,
                currency: result.order.currency,
              }
              : undefined,
            payment: {
              id: result.payment.id,
              status: result.payment.status,
            },
            checkout: {
              id: checkout?.checkoutSession?.id || '',
              token: checkoutToken || '',
              selectedPresentmentCurrency: checkout?.checkoutSession?.selectedPresentmentCurrency,
            },
          },
        },
      });
    },

    onError: async (error: string) => {
      // Handle payment failure - trigger funnel failure flow
      toast.error(t(config?.checkout?.errors?.paymentFailed, error || 'Payment failed'));
      console.error('❌ Apple Pay payment failed:', error);

      // Trigger funnel failure flow - orchestrator will handle retry or error page
      await next({
        type: FunnelActionType.PAYMENT_FAILED,
        data: {
          error: {
            message: error,
          },
        },
      });
    },
  });

  // Google Pay checkout (for form payment flow)
  const { handleGooglePayClick } = useGooglePayCheckout({
    checkout,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: async (result: { payment: any; order?: any }) => {
      toast.success('Payment successful!');
      console.log('Google Pay result', result);

      // Trigger funnel navigation - orchestrator will handle redirect to /post or /thankyou
      await next({
        type: FunnelActionType.PAYMENT_SUCCESS,
        data: {
          paymentId: result.payment.id,
          payment: {
            id: result.payment.id,
            status: result.payment.status,
          },
          order: result.order
            ? {
              id: result.order.id,
              amount: result.order.amount,
              currency: result.order.currency,
            }
            : undefined,
          resources: {
            order: result.order
              ? {
                id: result.order.id,
                amount: result.order.amount,
                currency: result.order.currency,
              }
              : undefined,
            mainOrder: result.order
              ? {
                id: result.order.id,
                amount: result.order.amount,
                currency: result.order.currency,
              }
              : undefined,
            payment: {
              id: result.payment.id,
              status: result.payment.status,
            },
            checkout: {
              id: checkout?.checkoutSession?.id || '',
              token: checkoutToken || '',
              selectedPresentmentCurrency: checkout?.checkoutSession?.selectedPresentmentCurrency,
            },
          },
        },
      });
    },

    onError: async (error: string) => {
      // Handle payment failure - trigger funnel failure flow
      toast.error(t(config?.checkout?.errors?.paymentFailed, error || 'Payment failed'));
      console.error('❌ Google Pay payment failed:', error);

      // Trigger funnel failure flow - orchestrator will handle retry or error page
      await next({
        type: FunnelActionType.PAYMENT_FAILED,
        data: {
          error: {
            message: error,
          },
        },
      });
    },
  });

  const shippingRatesResult = useShippingRates({
    enabled: !configLoading && !isDigitalProduct,
    checkout,
  });

  const {
    shippingRates,
    selectedRate: selectedShippingRate,
    refetch: refetchShippingRates,
    previewRates,
    previewedRates,
    selectRate,
  } = shippingRatesResult;

  // Check if checkout is completed (order already paid)
  const isCheckoutCompleted = checkout?.checkoutSession?.status === 'checkout_completed';
  const disableCheckout = isCheckoutCompleted;

  // Get API service for payment method redirects
  const { apiService } = useTagadaContext();

  // Whop checkout ref
  const whopCheckoutRef = useRef<WhopCheckoutHandle>(null);
  const [isWhopPaymentLoading, setIsWhopPaymentLoading] = useState(false);

  // 3DS detection for payment processing overlay
  const { isThreedsActive, wasThreedsTriggered } = useIsThreedsActive(isPaymentLoading || isWhopPaymentLoading);

  // HiPay checkout ref
  const hipayCheckoutRef = useRef<HiPayCheckoutHandle>(null);
  const [isHiPayLoading, setIsHiPayLoading] = useState(false);

  // Zelle checkout ref
  const zelleCheckoutRef = useRef<ZelleCheckoutHandle>(null);
  const [isZelleLoading, setIsZelleLoading] = useState(false);

  // Custom payment checkout ref
  const customPaymentCheckoutRef = useRef<CustomPaymentCheckoutHandle>(null);
  const [isCustomPaymentLoading, setIsCustomPaymentLoading] = useState(false);
  const [isCryptoLoading, setIsCryptoLoading] = useState(false);

  // State management
  const isPrecheckMarketing = config?.checkoutSettings?.precheckMarketing ?? false;
  const showMarketingCheckbox = config?.checkoutSettings?.showMarketingCheckbox ?? true;
  const mergeContactAndDelivery = config?.checkoutSettings?.mergeContactAndDelivery ?? false;

  // Form setup
  const formSchema = createCheckoutFormSchema(t, config, getRegions);
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      shippingAddress: {
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        country: '',
        state: '',
        postal: '',
        phone: '',
      },
      billingAddress: {
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        country: '',
        state: '',
        postal: '',
        phone: '',
      },
      paymentMethod: PaymentType.CREDIT_CARD,
      cardNumber: '',
      expirationDate: '',
      securityCode: '',
      shippingRateId: '',
      emailForOffers: isPrecheckMarketing,
    },
  });

  const selectedPaymentMethod = usePaymentMethod();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = form;

  // Track InitiateCheckout event when checkout data is available
  useEffect(() => {
    const checkoutSessionId = checkout?.checkoutSession?.id;
    const items = checkout?.summary?.items || [];
    const itemsLength = items.length;

    // Debug logging
    console.log('[InitiateCheckout] Tracking check:', {
      pixelsInitialized,
      hasTracked: hasTrackedCheckoutRef.current,
      checkoutSessionId,
      lastTrackedSessionId: lastTrackedCheckoutSessionIdRef.current,
      hasItems: itemsLength > 0,
      itemsLength,
    });

    // Skip if conditions not met
    if (
      !pixelsInitialized ||
      !checkoutSessionId ||
      itemsLength === 0 ||
      hasTrackedCheckoutRef.current ||
      lastTrackedCheckoutSessionIdRef.current === checkoutSessionId
    ) {
      return;
    }

    const orderSummary = checkout.summary;

    // Prepare checkout event parameters
    const checkoutParams = {
      content_type: 'product',
      contents: orderSummary.items.map((item) => ({
        content_id: `${item.productId}-${item.variantId || ''}`,
        content_type: 'product',
        content_name: item.orderLineItemProduct?.name || '',
        content_category: 'checkout',
        quantity: item.quantity,
        price: item.adjustedAmount, // In minor units
        original_price: item.amount, // In minor units
        currency: item.currency || orderSummary.currency,
        description: item.orderLineItemVariant?.name || '',
      })),
      content_ids: orderSummary.items.map((item) => `${item.productId}-${item.variantId || ''}`),
      currency: orderSummary.currency,
      value: orderSummary.totalAdjustedAmount, // In minor units
      num_items: orderSummary.items.reduce((sum, item) => sum + item.quantity, 0),
      delivery_category: 'home_delivery',
      shipping: orderSummary.shippingCost || 0,
      tax: orderSummary.totalTaxAmount || 0,
      subtotal: orderSummary.subtotalAdjustedAmount || 0,
      total_discount: orderSummary.totalPromotionAmount || 0,
    };

    // Track checkout event
    if (checkoutParams.contents.length > 0) {
      console.log('[InitiateCheckout] Tracking event:', checkoutParams);
      track('InitiateCheckout', checkoutParams);
      hasTrackedCheckoutRef.current = true;
      lastTrackedCheckoutSessionIdRef.current = checkoutSessionId;
    }
  }, [checkout?.checkoutSession?.id, checkout?.summary?.items?.length, pixelsInitialized, track]);

  // Reset tracking flags when checkout session changes
  useEffect(() => {
    const currentSessionId = checkout?.checkoutSession?.id;
    if (currentSessionId !== lastTrackedCheckoutSessionIdRef.current) {
      hasTrackedCheckoutRef.current = false;
      lastTrackedCheckoutSessionIdRef.current = undefined;
    }
  }, [checkout?.checkoutSession?.id]);

  // Update form when shipping rate is selected
  useEffect(() => {
    if (isDigitalProduct) return;
    if (selectedShippingRate?.id) {
      setValue('shippingRateId', selectedShippingRate.id, { shouldValidate: true });
    } else {
      setValue('shippingRateId', '', { shouldValidate: true });
    }
  }, [selectedShippingRate?.id, setValue, isDigitalProduct]);

  // Handle immediate form update when rate is selected
  const handleShippingRateSelect = useCallback(
    (rateId: string) => {
      setValue('shippingRateId', rateId, { shouldValidate: true });
    },
    [setValue],
  );

  // Watch for form's shipping country and trigger preview rates on initial load
  const watchedShippingCountry = watch('shippingAddress.country');
  const watchedEmail = watch('email');
  const watchedShippingRateId = watch('shippingRateId');

  // Look up rate amount immediately from local list (avoids 2s debounce + network lag)
  const effectiveShippingCost = useMemo(() => {
    if (!watchedShippingRateId) return selectedShippingRate?.amount ?? 0;
    const allRates = shippingRates ?? previewedRates ?? [];
    const matched = allRates.find((r) => r.id === watchedShippingRateId);
    return matched?.amount ?? selectedShippingRate?.amount ?? 0;
  }, [watchedShippingRateId, shippingRates, previewedRates, selectedShippingRate?.amount]);

  const hasPreviewedInitialRatesRef = useRef(false);

  // Get geolocation data for auto-selecting country
  const { countryCode: geoCountry } = useGeoLocationContext();

  // Auto-select shipping rate by geolocation country on initial load
  // This works for all checkout sessions (preview or not)
  const hasTriggeredPreviewRef = useRef(false);
  const hasAutoSelectedRateRef = useRef(false);

  // Step 1: Trigger preview rates fetch using session country, forced country, or geo country
  const forcedCountry = config?.addressSettings?.forcedCountry;
  useEffect(() => {
    if (isDigitalProduct) return;
    if (
      checkout?.checkoutSession?.id &&
      !hasTriggeredPreviewRef.current
    ) {
      // Priority: 1) session shipping country > 2) forced country from config > 3) geolocation
      const sessionCountry = checkout?.checkoutSession?.shippingAddress?.country;
      const country = sessionCountry || forcedCountry || geoCountry;
      if (!country) return;

      const source = sessionCountry ? 'session' : forcedCountry ? 'forced config' : 'geo';
      console.log('[SingleStepCheckout] 🚚 Fetching shipping rates for country:', country, `(from ${source})`);
      hasTriggeredPreviewRef.current = true;
      hasPreviewedInitialRatesRef.current = true;

      // Set form country if not from session (session prefill is handled by AddressSection)
      if (!sessionCountry) {
        setValue('shippingAddress.country', country);
      }

      // Fetch rates for display
      previewRates(country);
    }
  }, [checkout?.checkoutSession?.id, geoCountry, setValue, previewRates, isDigitalProduct]);

  // Step 2: Select a rate once preview rates are loaded
  // Priority: 1) existing checkoutSession.shippingRateId, 2) highlighted rate, 3) first rate
  useEffect(() => {
    if (isDigitalProduct) return;
    if (
      previewedRates?.length &&
      !hasAutoSelectedRateRef.current &&
      hasTriggeredPreviewRef.current &&
      !checkoutLoading &&
      checkout // Wait for checkout to be loaded
    ) {
      hasAutoSelectedRateRef.current = true;

      const existingRateId = checkout?.checkoutSession?.shippingRateId;
      const hasShippingAddress = !!checkout?.checkoutSession?.shippingAddress?.country;

      // Priority 1: Use existing shipping rate from checkout session if it's in the list
      if (existingRateId) {
        const existingRateInList = previewedRates.find((r: { id: string }) => r.id === existingRateId);
        if (existingRateInList) {
          console.log('[SingleStepCheckout] ✅ Using existing shipping rate from session:', existingRateId);
          // Only call selectRate if we have a shipping address (can save to backend)
          // No refresh needed - selectRate handles state updates
          if (hasShippingAddress) {
            selectRate(existingRateId);
          }
          return;
        }
        console.log('[SingleStepCheckout] ⚠️ Existing rate not in list, will auto-select');
      }

      // Priority 2: Select highlighted rate, or Priority 3: first rate
      const rateToSelect = previewedRates.find((r: { highlighted?: boolean }) => r.highlighted) || previewedRates[0];
      if (rateToSelect) {
        console.log('[SingleStepCheckout] ✅ Auto-selecting shipping rate:', rateToSelect.id);
        // Only call selectRate if we have a shipping address (can save to backend)
        // Otherwise, ShippingRates component handles local UI selection
        // No refresh needed - selectRate handles state updates
        if (hasShippingAddress) {
          selectRate(rateToSelect.id);
        }
      }
    }
  }, [previewedRates, checkout, checkoutLoading, selectRate, isDigitalProduct]);

  useEffect(() => {
    if (isDigitalProduct) return;
    // Preview shipping rates when country is selected but no email yet
    // This shows rates before user commits to the checkout
    if (
      watchedShippingCountry &&
      !watchedEmail?.trim() &&
      !hasPreviewedInitialRatesRef.current &&
      checkout?.checkoutSession?.id
    ) {
      hasPreviewedInitialRatesRef.current = true;
      previewRates(watchedShippingCountry);
    }
  }, [watchedShippingCountry, watchedEmail, checkout?.checkoutSession?.id, previewRates, isDigitalProduct]);

  // Watch for shipping address changes in checkout session and refetch shipping rates
  // Use subtotalAdjustedAmount (before shipping) to avoid triggering on shipping rate changes
  const shippingAddress = checkout?.checkoutSession?.shippingAddress;
  const subtotalAdjustedAmount = checkout?.summary?.subtotalAdjustedAmount;
  const fieldsToCheck = [shippingAddress?.country, subtotalAdjustedAmount].join('-');
  const previousFieldsToCheckRef = useRef<string>('');

  useEffect(() => {
    if (isDigitalProduct) return;
    if ((!shippingAddress && !subtotalAdjustedAmount) || !checkout?.checkoutSession?.id) return;

    // Create a string representation of the current shipping address for comparison

    // Only refetch if address has actually changed and we have a checkout session

    if (fieldsToCheck !== previousFieldsToCheckRef.current && previousFieldsToCheckRef.current !== '') {
      // Debounce the refetch to avoid too many API calls
      const timeoutId = setTimeout(() => {
        refetchShippingRates();
        refresh();
      }, 1000); // 1 second debounce
      previousFieldsToCheckRef.current = fieldsToCheck;

      return () => clearTimeout(timeoutId);
    }
    previousFieldsToCheckRef.current = fieldsToCheck;

    // Update the previous address reference
  }, [fieldsToCheck, refetchShippingRates, checkout?.checkoutSession?.id, isDigitalProduct]);

  // Update emailForOffers when config loads or changes
  useEffect(() => {
    if (isPrecheckMarketing !== undefined) {
      setValue('emailForOffers', isPrecheckMarketing);
    }
  }, [isPrecheckMarketing, setValue]);

  const updateCustomerInfos = useCallback(
    async (data: CheckoutFormData) => {
      // Get billing data from AddressSection component
      const billingDifferent = data.isBillingDifferent || false;
      const digitalProduct = config.addressSettings?.digitalProduct || false;


      // Update customer and session info
      return await updateCustomerAndSessionInfo({
        customerData: {
          email: data.email,
          acceptsMarketing: data.emailForOffers ?? false,
        },
        shippingAddress: digitalProduct ? data.billingAddress : data.shippingAddress,
        billingAddress: digitalProduct ? data.billingAddress : billingDifferent ? data.billingAddress : data.shippingAddress,
        differentBillingAddress: billingDifferent,
      });
    },
    [updateCustomerAndSessionInfo],
  );

  // Debounced auto-update on relevant field changes using watch
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const countryFields = ['shippingAddress.country', 'billingAddress.country'];
    const instantUpdateFields = [
      'shippingAddress.country',
      'billingAddress.country',
      'shippingAddress.state',
      'billingAddress.state',
    ];
    const relevantFields = [
      'email',
      'shippingAddress.firstName',
      'shippingAddress.lastName',
      'shippingAddress.address1',
      'shippingAddress.address2',
      'shippingAddress.city',
      'shippingAddress.country',
      'shippingAddress.state',
      'shippingAddress.postal',
      'shippingAddress.phone',
      'billingAddress.firstName',
      'billingAddress.lastName',
      'billingAddress.address1',
      'billingAddress.address2',
      'billingAddress.city',
      'billingAddress.country',
      'billingAddress.state',
      'billingAddress.postal',
      'billingAddress.phone',
    ];

    const subscription = watch((_, { name, type }) => {
      if (!name || !relevantFields.includes(name)) return;
      if (type !== 'change') return;

      const values = getValues();
      const hasEmail = !!values.email?.trim();

      // If country changes and no email, preview shipping rates without updating session
      if (countryFields.includes(name) && !hasEmail) {
        const countryCode = name === 'shippingAddress.country'
          ? values.shippingAddress?.country
          : values.billingAddress?.country;
        if (countryCode) {
          previewRates(countryCode);
        }
        return;
      }

      if (instantUpdateFields.includes(name)) {
        return updateCustomerInfos(values);
      }
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => updateCustomerInfos(getValues()), 600);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [watch, getValues, updateCustomerInfos, previewRates]);

  // Whop payment handlers
  const handleWhopPaymentCompleted = useCallback(
    async (payment: WhopPayment) => {
      setIsWhopPaymentLoading(false);
      toast.success('Payment successful!');

      const order = payment.order;

      try {
        await next(
          {
            type: FunnelActionType.PAYMENT_SUCCESS,
            data: {
              paymentId: payment.id,
              payment: {
                id: payment.id,
                status: payment.status,
              },
              order: order
                ? {
                  id: order.id,
                  amount: order.amount,
                  currency: order.currency,
                }
                : undefined,
              resources: {
                order: order
                  ? {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                  }
                  : undefined,
                mainOrder: order
                  ? {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                  }
                  : undefined,
                payment: {
                  id: payment.id,
                  status: payment.status,
                },
                checkout: {
                  id: checkout?.checkoutSession?.id || '',
                  token: checkoutToken || '',
                  selectedPresentmentCurrency:
                    checkout?.checkoutSession?.selectedPresentmentCurrency || '',
                },
              },
            },
          },
        );
      } catch (error) {
        console.error('Funnel navigation failed after Whop payment:', error);
        toast.error('Navigation failed - please refresh the page');
      }
    },
    [next, checkout, checkoutToken],
  );

  const handleWhopPaymentFailed = useCallback(
    (errorMessage: string) => {
      setIsWhopPaymentLoading(false);
      toast.error(t(config?.checkout?.errors?.paymentFailed, errorMessage || 'Payment failed'));
    },
    [t, config],
  );

  // HiPay payment handlers
  const handleHiPayPaymentCompleted = useCallback(
    async (payment: Record<string, unknown>) => {
      setIsHiPayLoading(false);
      toast.success('Payment successful!');
      const paymentId = payment?.id as string | undefined;
      const status = payment?.status as string | undefined;
      if (!paymentId) return;
      try {
        await next({
          type: FunnelActionType.PAYMENT_SUCCESS,
          data: {
            paymentId,
            payment: { id: paymentId, status: status ?? 'succeeded' },
            resources: {
              checkout: {
                id: checkout?.checkoutSession?.id || '',
                token: checkoutToken || '',
                selectedPresentmentCurrency:
                  checkout?.checkoutSession?.selectedPresentmentCurrency || '',
              },
            },
          },
        });
      } catch (error) {
        console.error('Funnel navigation failed after HiPay payment:', error);
        toast.error('Navigation failed - please refresh the page');
      }
    },
    [next, checkout, checkoutToken],
  );

  const handleHiPayPaymentFailed = useCallback(
    (errorMessage: string) => {
      setIsHiPayLoading(false);
      toast.error(t(config?.checkout?.errors?.paymentFailed, errorMessage || 'Payment failed'));
    },
    [t, config],
  );

  // Zelle payment handlers
  const handleZellePaymentCompleted = useCallback(
    async (result: { orderId: string; paymentId: string; orderNumber: string }) => {
      setIsZelleLoading(false);
      try {
        await next({
          type: FunnelActionType.PAYMENT_SUCCESS,
          data: {
            paymentId: result.paymentId,
            orderId: result.orderId,
            payment: { id: result.paymentId, status: 'on_hold' },
            resources: {
              checkout: {
                id: checkout?.checkoutSession?.id || '',
                token: checkoutToken || '',
                selectedPresentmentCurrency:
                  checkout?.checkoutSession?.selectedPresentmentCurrency || '',
              },
            },
          },
        });
      } catch (error) {
        console.error('Funnel navigation failed after Zelle payment:', error);
        toast.error('Navigation failed - please refresh the page');
      }
    },
    [next, checkout, checkoutToken],
  );

  const handleZellePaymentFailed = useCallback(
    (errorMessage: string) => {
      setIsZelleLoading(false);
      toast.error(t(config?.checkout?.errors?.paymentFailed, errorMessage || 'Payment failed'));
    },
    [t, config],
  );

  // Custom payment handlers
  const handleCustomPaymentCompleted = useCallback(
    async (result: { orderId: string; paymentId: string; orderNumber: string }) => {
      setIsCustomPaymentLoading(false);
      try {
        await next({
          type: FunnelActionType.PAYMENT_SUCCESS,
          data: {
            paymentId: result.paymentId,
            orderId: result.orderId,
            payment: { id: result.paymentId, status: 'on_hold' },
            resources: {
              checkout: {
                id: checkout?.checkoutSession?.id || '',
                token: checkoutToken || '',
                selectedPresentmentCurrency:
                  checkout?.checkoutSession?.selectedPresentmentCurrency || '',
              },
            },
          },
        });
      } catch (error) {
        console.error('Funnel navigation failed after custom payment:', error);
        toast.error('Navigation failed - please refresh the page');
      }
    },
    [next, checkout, checkoutToken],
  );

  const handleCustomPaymentFailed = useCallback(
    (errorMessage: string) => {
      setIsCustomPaymentLoading(false);
      toast.error(t(config?.checkout?.errors?.paymentFailed, errorMessage || 'Payment failed'));
    },
    [t, config],
  );

  // Form submission

  // Helper function to check if value is defined
  const isDefined = <T,>(value: T | undefined | null): value is T => {
    return value !== undefined && value !== null;
  };

  const onSubmit = async (data: CheckoutFormData) => {
    console.log('onSubmit', data);
    clearPaymentError();

    // Prevent submission if checkout is already completed
    if (disableCheckout) {
      toast.error(
        t(config?.checkout?.errors?.checkoutAlreadyCompleted, 'This order has already been paid for'),
      );
      return;
    }

    try {
      if (!checkout) {
        toast.error(
          t(config?.checkout?.errors?.checkoutSessionNotInitialized, 'Checkout session not initialized'),
        );
        return;
      }
      // Process payment
      await updateCustomerInfos(data);

      if (!checkout.checkoutSession?.id) {
        toast.error(t(config?.checkout?.errors?.checkoutSessionNotReady, 'Checkout session not ready'));
        return;
      }

      const checkoutSessionId = checkout.checkoutSession.id;

      // Handle different payment methods based on selectedPaymentMethod
      if (selectedPaymentMethod.type === 'bridge') {
        const response = await apiService.fetch<{ url: string | null }>(
          `/api/v1/checkout-sessions/${checkoutSessionId}/bridge-link`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
          },
        );
        if (isDefined(response.url)) {
          window.location.href = response.url;
          return;
        }
      } else if (selectedPaymentMethod.type === 'klarna') {
        const url = new URL(window.location.toString());
        url.searchParams.set('sessionId', checkoutSessionId);
        url.searchParams.set('paymentAction', 'requireAction');
        url.searchParams.set('paymentActionStatus', 'completed');

        const response = await apiService.fetch<{ url: string | null }>(
          `/api/v1/checkout-sessions/${checkoutSessionId}/klarna-payment`,
          {
            method: 'POST',
            body: JSON.stringify({ url: url.toString() }),
            headers: { 'content-type': 'application/json' },
          },
        );
        if (isDefined(response.url)) {
          window.location.href = response.url;
          return;
        }
      } else if (selectedPaymentMethod.type === 'paypal') {
        const url = new URL(window.location.toString());
        url.searchParams.set('sessionId', checkoutSessionId);
        url.searchParams.set('paymentAction', 'requireAction');
        url.searchParams.set('paymentActionStatus', 'completed');

        const response = await apiService.fetch<{ url: string | null }>(
          `/api/v1/checkout-sessions/${checkoutSessionId}/paypal-payment`,
          {
            method: 'POST',
            body: JSON.stringify({ url: url.toString() }),
            headers: { 'content-type': 'application/json' },
          },
        );
        if (isDefined(response.url)) {
          window.location.href = response.url;
          return;
        }
      } else if (selectedPaymentMethod.type === 'oceanpayment') {
        const response = await apiService.fetch<{ url: string | null }>(
          `/api/v1/checkout-sessions/${checkoutSessionId}/oceanpayment-link`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
          },
        );
        if (isDefined(response.url)) {
          window.location.href = response.url;
          return;
        }
      } else if (selectedPaymentMethod.type === 'crypto') {
        setIsCryptoLoading(true);
        try {
          const cryptoInfo = selectedPaymentMethod.informations as { provider?: string } | null;
          const response = await apiService.fetch<{ paymentUrl: string | null }>(
            '/api/v1/crypto/create-payment',
            {
              method: 'POST',
              body: JSON.stringify({
                checkoutSessionId,
                returnUrl: window.location.href,
                ...(cryptoInfo?.provider ? { provider: cryptoInfo.provider } : {}),
              }),
              headers: { 'content-type': 'application/json' },
            },
          );
          if (isDefined(response.paymentUrl)) {
            window.location.href = response.paymentUrl;
            return;
          }
        } catch {
          setIsCryptoLoading(false);
          throw new Error('Failed to create crypto payment');
        }
      } else if (selectedPaymentMethod.type === 'whop') {
        // Whop payment is handled by the WhopCheckout component via ref
        setIsWhopPaymentLoading(true);
        await whopCheckoutRef.current?.submit();
        return;
      } else if (selectedPaymentMethod.type === 'hipay') {
        setIsHiPayLoading(true);
        await hipayCheckoutRef.current?.submit();
        return;
      } else if (selectedPaymentMethod.type === 'zelle') {
        setIsZelleLoading(true);
        await zelleCheckoutRef.current?.submit();
        return;
      } else if (selectedPaymentMethod.type?.startsWith('custom_payment:')) {
        setIsCustomPaymentLoading(true);
        await customPaymentCheckoutRef.current?.submit();
        return;
      } else if (selectedPaymentMethod.type === 'apple_pay') {
        handleApplePayClick();
        return;
      } else if (selectedPaymentMethod.type === 'google_pay') {
        handleGooglePayClick();
        return;
      } else {
        // Check if this is an APM payment (any provider)
        const isAPM = selectedPaymentMethod.type?.startsWith('apm_') ?? false;

        if (isAPM && selectedPaymentMethod.informations) {
          // For APM payments, use dedicated APM payment hook
          const apmInfo = selectedPaymentMethod.informations as any;
          console.log('[SingleStepCheckout] APM payment info:', apmInfo);
          console.log('[SingleStepCheckout] processorId:', apmInfo.processorId, 'apmType:', apmInfo.apmType);
          await processApmPayment(checkoutSessionId, {
            processorId: apmInfo.processorId,
            paymentMethod: apmInfo.apmType,
          });
        } else {
          // For regular credit card payments
          // Success/failure callbacks are handled at hook level (see usePayment initialization above)
          await processCardPayment(checkoutSessionId, {
            cardNumber: data.cardNumber || '',
            expiryDate: data.expirationDate || '',
            cvc: data.securityCode || '',
          });
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(t(config?.checkout?.errors?.checkoutError, 'An error occurred during checkout'));
    }
  };

  if (configLoading) {
    return <LoadingSpinner text={t(config?.checkout?.loading?.checkoutLoading, 'Loading checkout...')} />;
  }

  const stickyClasses = getStickyClasses();
  const hasStickyPaymentButtons = config?.layout?.stickyPaymentButtons ?? false;

  return (
    <div
      className={cn(
        'checkout-container relative min-h-[100svh]',
        hasStickyPaymentButtons
          ? 'pb-[calc(var(--sticky-payment-footer-height,0px)+env(safe-area-inset-bottom,0px)+1rem)] lg:pb-0'
          : null,
      )}
      editor-id="config.branding.backgroundColor config.branding.textColor"
    >
      {/* Payment Processing Overlay */}
      <PaymentProcessingOverlay
        visible={isPaymentLoading || isWhopPaymentLoading || isHiPayLoading || isZelleLoading || isCustomPaymentLoading || isCryptoLoading}
        isNavigating={isNavigating}
        isThreedsActive={isThreedsActive || wasThreedsTriggered}
      />

      {/* Top Bar */}
      <TopBar />

      {/* Mobile Header - Now hidden since we have TopBar */}
      <div className="hidden">
        <h1 className="text-center text-xl font-semibold" editor-id="config.checkout.checkoutTitle">
          {t(config?.checkout?.title, 'Checkout')}
        </h1>
      </div>

      <VipOffersProvider checkout={checkout}>
        <div className={`grid grid-cols-1 lg:grid-cols-2`}>
          {/* Form Section */}
          <div
            className={`bg-[var(--background-color)] order-2 ${getDesktopMarginClasses('left')} lg:order-1`}
          >
            <form
              id={formId}
              onSubmit={handleSubmit(onSubmit)}
              className={`mx-auto ${getMaxWidthClasses()} space-y-6 px-4 py-8 sm:px-6 lg:py-12 ${getDesktopPaddingClasses()}`}
            >
              {/* Checkout scarcity timer */}
              <Scarcity configKey="checkoutScarcity" />
              <div className="space-y-12">
                {/* Express Checkout */}
                {config?.checkoutSettings?.showExpressCheckout !== false && checkout && (
                  <ExpressPaymentMethodsProvider
                    checkout={checkout}
                    customerId={checkout.checkoutSession?.customerId}
                    paymentSetupConfig={paymentSetupConfig}
                  >
                    <ExpressCheckoutButtons checkout={checkout} />
                  </ExpressPaymentMethodsProvider>
                )}

                {/* Email + Marketing checkbox (reusable block for Contact or merged Delivery) */}
                {(() => {
                  const emailFieldJSX = (
                    <div className={`space-y-3 ${disableCheckout ? 'pointer-events-none opacity-60' : ''}`}>
                      <Input
                        type="email"
                        placeholder={t(config?.checkout?.contact?.emailPlaceholder, 'Email')}
                        autoComplete="email"
                        disabled={disableCheckout}
                        {...register('email')}
                        error={errors.email?.message}
                        editor-id="config.checkout.contact.emailPlaceholder"
                      />
                      {showMarketingCheckbox && (
                        <div
                          className="flex items-center space-x-2"
                          editor-id="config.checkoutSettings.precheckMarketing config.checkoutSettings.showMarketingCheckbox"
                        >
                          <Controller
                            name="emailForOffers"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="email-offers"
                                checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                                disabled={disableCheckout}
                              />
                            )}
                          />
                          <Label
                            htmlFor="email-offers"
                            className="cursor-pointer text-sm"
                            editor-id="config.checkout.contact.emailOffersLabel"
                          >
                            {t(config?.checkout?.contact?.emailOffersLabel, 'Email me with news and offers')}
                          </Label>
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <>
                      {/* Contact - hidden when merged with delivery */}
                      {!mergeContactAndDelivery && (
                        <div className="space-y-4" editor-id="config.checkoutSettings.mergeContactAndDelivery">
                          <SectionHeader
                            eyebrowLabel="Contact"
                            title={t(config?.checkout?.contact?.title, "What's your email?")}
                            description={t(
                              config?.checkout?.contact?.description,
                              "We'll send you order updates and receipts here.",
                            )}
                            titleEditorId="config.checkout.contact.title"
                            descriptionEditorId="config.checkout.contact.description"
                          />
                          {emailFieldJSX}
                        </div>
                      )}

                      {/* Delivery */}
                      <AddressSection
                        control={control}
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        checkout={checkout || undefined}
                        config={config}
                        disabled={disableCheckout}
                        titleEditorId="config.checkout.delivery.title config.checkout.delivery.billingTitle config.addressSettings.digitalProduct"
                        descriptionEditorId="config.checkout.delivery.description config.addressSettings.digitalProduct"
                        mergedEmailField={mergeContactAndDelivery ? emailFieldJSX : undefined}
                        onAddressAutoFilled={() => updateCustomerInfos(getValues())}
                      />
                    </>
                  );
                })()}

                {/* Shipping Method */}
                {!isDigitalProduct && config?.shippingRateSettings?.displayShippingRate && (
                  <ShippingRates
                    {...shippingRatesResult}
                    refresh={refresh}
                    validationError={errors.shippingRateId?.message}
                    onRateSelect={handleShippingRateSelect}
                    disabled={disableCheckout}
                    isCheckoutLoading={checkoutLoading || !checkout}
                    hasCountrySelected={!!watchedShippingCountry}
                    existingShippingRateId={checkout?.checkoutSession?.shippingRateId}
                  />
                )}

                {/* Payment */}
                <PaymentSection
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  checkoutSessionId={checkout?.checkoutSession.id || ''}
                  disabled={disableCheckout}
                  presentmentCurrency={checkout?.summary?.currency ?? checkout?.checkoutSession?.selectedPresentmentCurrency}
                  hasRecurringItem={checkout?.summary?.items?.some((item) => item.recurring) ?? false}
                  orderAmountCents={checkout?.summary?.totalAdjustedAmount}
                />

                {/* Whop Checkout - renders embed when Whop is the active payment method */}
                {selectedPaymentMethod.type === 'whop' &&
                  checkout?.checkoutSession?.id &&
                  checkout?.checkoutSession?.storeId && (
                    <WhopCheckout
                      ref={whopCheckoutRef}
                      checkoutSessionId={checkout.checkoutSession.id}
                      storeId={checkout.checkoutSession.storeId}
                      customerEmail={watch('email')}
                      shippingAddress={watch('shippingAddress')}
                      orderItemsCount={checkout?.summary?.items?.length}
                      orderTotalAmount={checkout?.summary?.totalAdjustedAmount}
                      onPaymentCompleted={handleWhopPaymentCompleted}
                      onPaymentFailed={handleWhopPaymentFailed}
                    />
                  )}

                {/* HiPay Checkout - renders when HiPay is the selected payment method */}
                {watch('paymentMethod') === 'hipay' &&
                  checkout?.checkoutSession?.id &&
                  checkout?.checkoutSession?.storeId && (
                    <HiPayCheckout
                      ref={hipayCheckoutRef}
                      checkoutSessionId={checkout.checkoutSession.id}
                      storeId={checkout.checkoutSession.storeId}
                      onPaymentCompleted={handleHiPayPaymentCompleted}
                      onPaymentFailed={handleHiPayPaymentFailed}
                      applePayConfig={
                        checkout?.summary?.totalAdjustedAmount != null && checkout?.summary?.currency
                          ? {
                            storeName: checkout?.checkoutSession?.store?.name ?? 'Store',
                            currency: checkout.summary.currency,
                            totalAmount: checkout.summary.totalAdjustedAmount,
                            countryCode: checkout?.checkoutSession?.shippingAddress?.country ?? 'US',
                          }
                          : undefined
                      }
                    />
                  )}

                {/* Zelle Checkout - renders when Zelle is the selected payment method */}
                {watch('paymentMethod') === 'zelle' && checkout?.checkoutSession?.id && (
                  <ZelleCheckout
                    ref={zelleCheckoutRef}
                    checkoutSessionId={checkout.checkoutSession.id}
                    instructionsMessage={null}
                    setLoading={setIsZelleLoading}
                    onPaymentCompleted={handleZellePaymentCompleted}
                    onPaymentFailed={handleZellePaymentFailed}
                    getCheckoutErrorMessage={() =>
                      t(config?.checkout?.errors?.paymentFailed, 'Payment failed')
                    }
                  />
                )}

                {/* Custom Payment Checkout - renders when a custom_payment method is selected */}
                {watch('paymentMethod')?.startsWith('custom_payment:') && checkout?.checkoutSession?.id && (
                  <CustomPaymentCheckout
                    ref={customPaymentCheckoutRef}
                    checkoutSessionId={checkout.checkoutSession.id}
                    integrationId={selectedPaymentMethod?.informations?.integrationId ?? watch('paymentMethod').slice('custom_payment:'.length)}
                    checkoutInstructions={null}
                    setLoading={setIsCustomPaymentLoading}
                    onPaymentCompleted={handleCustomPaymentCompleted}
                    onPaymentFailed={handleCustomPaymentFailed}
                    getCheckoutErrorMessage={() =>
                      t(config?.checkout?.errors?.paymentFailed, 'Payment failed')
                    }
                  />
                )}

                {/* Complete Order */}
                <div className="space-y-4">
                  {paymentError && (
                    <div
                      className={cn(
                        'rounded-lg border border-red-200 bg-red-50 p-4 transition-all',
                        {
                          'mt-2 h-fit': paymentError,
                          'mt-0 h-0': !paymentError,
                        },
                      )}
                      role="alert"
                    >
                      <p className="text-sm font-medium text-red-800">
                        {t(
                          config?.checkout?.errors?.paymentFailedSuggestion,
                          'Payment could not be processed. Please try with another card or payment method.',
                        )}
                      </p>
                      <p className="mt-2 text-xs text-red-600">
                        {paymentError?.message ?? String(paymentError)}
                      </p>
                    </div>
                  )}
                  {disableCheckout && !isPaymentLoading && !isWhopPaymentLoading && !isHiPayLoading && !isZelleLoading && !isCustomPaymentLoading && (
                    <div
                      className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm transition-all"
                      role="alert"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-emerald-900">
                          {t(config?.checkout?.errors?.checkoutCompletedTitle, 'Checkout Completed')}
                        </span>
                        <span className="mt-1 text-emerald-800">
                          {t(
                            config?.checkout?.errors?.checkoutAlreadyCompleted,
                            'This order has already been paid for',
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Terms and Conditions */}
                  {config?.checkoutSettings?.requireTerms && (
                    <div className={`space-y-2 ${disableCheckout ? 'pointer-events-none opacity-60' : ''}`}>
                      <div
                        editor-id="config.checkoutSettings.requireTerms"
                        className="flex items-start gap-3 rounded-lg border border-[var(--border-color)] bg-gray-50/50 p-3 transition-colors hover:border-gray-300"
                        style={{
                          backgroundColor: getColorOpacityFromCSSVar("border-color", 20),
                        }}
                      >
                        <Controller
                          name="acceptTerms"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="accept-terms"
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 flex-shrink-0"
                              disabled={disableCheckout}
                            />
                          )}
                        />
                        <Label
                          editor-id="config.checkout.orderCompletion.termsLabel"
                          htmlFor="accept-terms"
                          className={cn(
                            'cursor-pointer text-base leading-snug lg:text-sm lg:leading-relaxed',
                            {
                              'text-red-600': errors.acceptTerms,
                            },
                          )}
                        >
                          {t(
                            config?.checkout?.orderCompletion?.termsLabel,
                            'I accept the <terms>terms and conditions</terms><general> and general conditions</general>',
                            {
                              terms: (children) =>
                                config?.links?.termsOfServiceUrl ? (
                                  <a
                                    editor-id="config.links.termsOfServiceUrl"
                                    href={config?.links?.termsOfServiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline hover:no-underline"
                                  >
                                    {children}
                                  </a>
                                ) : (
                                  <span className="text-primary">{children}</span>
                                ),
                              general: (children) =>
                                config?.links?.generalConditionsUrl ? (
                                  <>
                                    {' and '}
                                    <a
                                      editor-id="config.links.generalConditionsUrl"
                                      href={config?.links?.generalConditionsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary underline hover:no-underline"
                                    >
                                      {children}
                                    </a>
                                  </>
                                ) : null,
                            },
                          )}
                        </Label>
                      </div>
                      {errors.acceptTerms && (
                        <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>
                      )}
                    </div>
                  )}
                  <PaymentButtonsSection
                    isSubmitting={isSubmitting}
                    isPaymentLoading={isPaymentLoading || isWhopPaymentLoading || isHiPayLoading || isZelleLoading || isCustomPaymentLoading || isCryptoLoading}
                    isNavigating={isNavigating}
                    disabled={disableCheckout}
                  />
                </div>

                {config?.checkout?.orderBumps?.vipType === 'branded' && (
                  <BrandedVipOffer
                    refresh={refresh}
                    updateLineItems={updateLineItems}
                    checkout={checkout}
                  />
                )}

                {/* Primary Order Bumps */}
                <PrimaryOrderBumpList
                  checkout={checkout}
                  disabled={disableCheckout || isSubmitting || isPaymentLoading || isWhopPaymentLoading || isHiPayLoading || isCustomPaymentLoading}
                  sectionHeader={{
                    title: t(config?.checkout?.orderBumps?.title, 'Add to your order'),
                    description: t(
                      config?.checkout?.orderBumps?.description,
                      'Enhance your purchase with these popular add-ons.',
                    ),
                    spacing: 'compact',
                    titleEditorId: 'config.checkout.orderBumps.title',
                    descriptionEditorId: 'config.checkout.orderBumps.description',
                  }}
                  refresh={refresh}
                />
              </div>
              <Sections type="mobile" />
              <BottomLinks />
            </form>
          </div>

          {/* Order Summary */}
          <div
            className={`bg-[var(--checkout-order-summary-bg)] order-1 border-b border-[var(--border-color)] lg:order-2 lg:border-b-0 lg:border-l ${stickyClasses} `}
            editor-id="config.orderSummarySettings.backgroundColor config.orderSummarySettings.opacity config.branding.borderColor"
          >
            {isTablet && (
              <OrderSummary
                checkout={checkout}
                shippingCost={effectiveShippingCost}
                isLoading={checkoutLoading}
                error={checkoutError}
                refresh={refresh}
                disabled={disableCheckout}
              />
            )}
            <div className={`p-4 sm:p-6 ${getDesktopPaddingClasses()} ${getDesktopMarginClasses('right')}`}>
              {/* Backend not available yet */}
              {/* <OfferProgress /> */}
              {!isTablet && (
                <OrderSummary
                  checkout={checkout}
                  shippingCost={effectiveShippingCost}
                  isLoading={checkoutLoading}
                  error={checkoutError}
                  refresh={refresh}
                  disabled={disableCheckout}
                />
              )}
              {/* Secondary Order Bumps in sidebar */}
              <SecondaryOrderBumpList
                checkout={checkout}
                disabled={disableCheckout || isSubmitting || isPaymentLoading || isWhopPaymentLoading || isHiPayLoading}
                sectionHeader={{
                  title: t(config?.checkout?.orderBumps?.secondaryTitle, 'Recommended add-ons'),
                  description: t(
                    config?.checkout?.orderBumps?.secondaryDescription,
                    'Complete your order with these popular additions.',
                  ),
                  titleClassName: 'text-base font-medium',
                  spacing: 'compact',
                  titleEditorId: 'config.checkout.orderBumps.secondaryTitle',
                  descriptionEditorId: 'config.checkout.orderBumps.secondaryDescription',
                }}
                refresh={refresh}
              />
              {config?.checkout?.orderBumps?.vipType === 'default' && (
                <VipOrderBumpList
                  checkout={checkout}
                  disabled={disableCheckout || isSubmitting || isPaymentLoading || isWhopPaymentLoading || isHiPayLoading}
                  sectionHeader={{
                    title: t(config?.checkout?.orderBumps?.vipTitle, 'Club offer'),
                    description: t(
                      config?.checkout?.orderBumps?.vipDescription,
                      'Join our club and save money on your order.',
                    ),
                    titleClassName: 'text-base font-medium',
                    spacing: 'compact',
                    titleEditorId: 'config.checkout.orderBumps.vipTitle',
                    descriptionEditorId: 'config.checkout.orderBumps.vipDescription',
                  }}
                  refresh={refresh}
                />
              )}
              <Sections type="desktop" />
            </div>
          </div>
          {/* Close grid container */}
        </div>
        {config?.layout?.stickyPaymentButtons && (
          <PaymentButtonsSection
            isSticky={true}
            isSubmitting={isSubmitting}
            isPaymentLoading={isPaymentLoading || isWhopPaymentLoading || isHiPayLoading || isZelleLoading || isCustomPaymentLoading || isCryptoLoading}
            formId={formId}
            isNavigating={isNavigating}
            disabled={disableCheckout}
          />
        )}
      </VipOffersProvider>

      {/* Debug Configurator */}
    </div>
  );
}

// Wrapper component that provides GeoLocation context
export function SingleStepCheckout(props: SingleStepCheckoutProps) {
  return (
    <GeoLocationProvider>
      <SingleStepCheckoutInner {...props} />
    </GeoLocationProvider>
  );
}
