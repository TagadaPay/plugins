import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { pluginConfig } from '@/data/config';
import { formatCardNumber, formatExpiryDate } from '@/lib/utils/card-formatting';
import { focusFieldByDataAttribute, focusFirstErrorField } from '@/lib/utils/form-validation';
import {
  AddressData, // Import the comprehensive useAddress hook
  Country,
  State,
  useAddress,
  useCheckout,
  useOrderBump,
  usePayment,
  useProducts,
} from '@tagadapay/plugin-sdk';
import { Heart, Lock, Sun } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

// Note: Debug functionality is now handled by the SDK's built-in debug drawer
// Look for the orange 🐛 button in the bottom-right corner when debugMode={true}

import Footer from '@/components/Footer';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatMoney } from '@tagadapay/plugin-sdk';

interface CheckoutPageProps {
  checkoutToken: string;
}

// Define interface for checkout item data
interface CheckoutItem {
  id?: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  quantity?: number;
  unitAmount?: number;
  amount?: number;
  adjustedAmount?: number;
  currency?: string;
  isOrderBump?: boolean;
  orderBumpType?: string;
}

// Form validation schema
const checkoutFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  zipCode: z.string().min(1, 'Zip/Postal code is required'),
  cardNumber: z.string().min(15, 'Valid card number is required'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Valid expiry date (MM/YY) is required'),
  cvc: z.string().min(3, 'Valid CVC is required'),
});

// Type for form data
type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export function CheckoutPage({ checkoutToken }: CheckoutPageProps) {
  /* 
    🚀 FUTURE: Complete Address Form Transformation with useAddress Hook
    
    
    ❌ CURRENT APPROACH (Manual):
    - Manual country/state data imports
    - Manual form validation with zod  
    - Manual state reset when country changes
    - Limited to basic countries/states
    - 50+ lines of form setup code
    
    ✅ NEW APPROACH (useAddress Hook):
    - One hook handles everything
    - 250+ countries with comprehensive states  
    - Built-in validation + custom rules
    - Automatic state management
    - Search functionality
    - Country restrictions support
    - 5 lines of setup code
    
    const { 
      fields, setValue, countries, states, 
      validateAll, isValid, errors,
      searchCountries, filteredCountries 
    } = useAddress({
      autoValidate: true,
      countryRestrictions: ['US', 'CA', 'GB'], // optional
    });
  */

  // Debug: Track checkoutToken changes
  // console.log(
  //   "🎯 CheckoutPage rendered with checkoutToken:",
  //   checkoutToken ? `${checkoutToken.substring(0, 8)}...` : "none"
  // );

  // Debug: Verify useOrderBump is available
  // console.log("🔍 useOrderBump available:", typeof useOrderBump === "function");

  const [selectedBundle, setSelectedBundle] = useState<string | null>(null); // Start with null, derive from data
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUserInitiatedUpdate, setIsUserInitiatedUpdate] = useState(false);

  const hasInitializedRef = useRef(false);

  // Order bump offer ID
  // EXPEDITED_SHIPPING

  const timerSeconds = 59;
  const timerMinutes = 9;
  const secondsInMinute = 60;

  // Cart reserved timer state (start at 9:59)
  const [cartTimer, setCartTimer] = useState(timerMinutes * secondsInMinute + timerSeconds); // seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cartTimer <= 0) return;
    timerRef.current = setTimeout(() => {
      setCartTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cartTimer]);

  // Format timer as mm:ss
  const formatCartTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(1, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Form setup with validation (keeping original for now, will add useAddress after checkout)
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const {
    formState: { errors },
    watch,
    setFocus,
    setValue,
  } = form;

  // Fetch products data - SDK now handles all complexity internally!
  const { error: productsError, getVariant } = useProducts({
    enabled: true,
    includeVariants: true,
    includePrices: true,
  });

  // 🚀 Payment processing using SDK
  const {
    processCardPayment,
    isLoading: isPaymentLoading,
    error: paymentError,
    clearError: clearPaymentError,
  } = usePayment();

  // Define variant mappings for different deals based on actual product data
  const createVariantMappings = () => {
    // Use configuration from data/config.ts
    const baseVariant = getVariant(pluginConfig.variants.regular);
    const bogoVariant = getVariant(pluginConfig.variants.bogo);
    const specialVariant = getVariant(pluginConfig.variants.special);

    return {
      bundle1: {
        variantId: pluginConfig.variants.regular,
        name: baseVariant?.variant.name || 'Buy 1 Regular Price',
        dealType: 'regular',
        variant: baseVariant?.variant,
        product: baseVariant?.product,
      },
      bundle2: {
        variantId: pluginConfig.variants.bogo,
        name: bogoVariant?.variant.name || 'Buy 1 Get 1 Free (BOGO)',
        dealType: 'bogo',
        variant: bogoVariant?.variant,
        product: bogoVariant?.product,
      },
      bundle3: {
        variantId: pluginConfig.variants.special,
        name: specialVariant?.variant.name || 'Buy 1 Get 2 Free',
        dealType: 'special',
        variant: specialVariant?.variant,
        product: specialVariant?.product,
      },
    };
  };

  const variantMappings = createVariantMappings();

  // Keep the TagadaPay SDK integration
  const { checkout, error, updateLineItems, updateCustomerAndSessionInfo, init } = useCheckout({
    checkoutToken, // Use the explicit token passed as prop
    autoRefresh: false, // Disable auto refresh - SDK handles bidirectional refresh automatically
  });

  // Track if we've initialized the form to prevent overwriting user input
  const hasInitializedForm = useRef(false);

  // 🚀 AUTO-SAVE: Now handled by useAddress hook automatically!

  const saveCheckoutInfo = useCallback(
    async (addressData?: AddressData) => {
      console.log(`💾 saveCheckoutInfo called with data:`, addressData);

      if (!checkout?.checkoutSession?.id) {
        console.log(`❌ Missing checkout session`);
        return;
      }

      // If no data passed, skip (this will be called from useAddress hook with data)
      if (!addressData) {
        console.log(`❌ No address data provided`);
        return;
      }

      try {
        // Enhanced validation for state field
        const enhancedAddressData = {
          ...addressData,
          state: addressData.state && addressData.state.trim() ? addressData.state.trim() : 'N/A',
        };

        console.log('🔍 Auto-save with enhanced data:', enhancedAddressData);

        // Only save if we have meaningful data (reduce the threshold to allow more auto-saves)
        if (
          !enhancedAddressData.email &&
          !enhancedAddressData.firstName &&
          !enhancedAddressData.address1 &&
          !enhancedAddressData.country
        ) {
          console.log('💾 Skipping auto-save: insufficient data');
          return;
        }

        await updateCustomerAndSessionInfo({
          customerData: {
            email: enhancedAddressData.email,
            acceptsMarketing: false, // Default value
          },
          shippingAddress: {
            firstName: enhancedAddressData.firstName,
            lastName: enhancedAddressData.lastName,
            address1: enhancedAddressData.address1,
            address2: enhancedAddressData.address2 || '',
            city: enhancedAddressData.city,
            country: enhancedAddressData.country,
            state: enhancedAddressData.state, // Already handled in enhancedAddressData
            postal: enhancedAddressData.postal,
            phone: enhancedAddressData.phone,
          },
          billingAddress: {
            firstName: enhancedAddressData.firstName,
            lastName: enhancedAddressData.lastName,
            address1: enhancedAddressData.address1,
            address2: enhancedAddressData.address2 || '',
            city: enhancedAddressData.city,
            country: enhancedAddressData.country,
            state: enhancedAddressData.state, // Already handled in enhancedAddressData
            postal: enhancedAddressData.postal,
            phone: enhancedAddressData.phone,
          },
          differentBillingAddress: false, // Using same as shipping
        });

        console.log('💾 Auto-saved checkout info successfully');
      } catch (error) {
        console.error('❌ Failed to auto-save checkout info:', error);
        // Don't show error toast for auto-save failures to avoid annoying the user
      }
    },
    [checkout?.checkoutSession?.id, updateCustomerAndSessionInfo],
  );

  // 🚀 NEW: Address form hook with comprehensive countries/states and validation
  const addressForm = useAddress({
    autoValidate: true,
    enableGooglePlaces: true,
    googlePlacesApiKey: 'AIzaSyC4uCRdDH_9A7iUmkQg4_0AGXFnK2bErQA',
    countryRestrictions: [], // Allow all countries
    onFieldsChange: saveCheckoutInfo, // Auto-save callback handled by the hook!
    debounceConfig: {
      manualInputDelay: 1200, // 1.2 seconds for typing
      googlePlacesDelay: 200, // 200ms for Google Places (faster)
      enabled: true,
    },
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postal: '',
    },
  });

  // Update address form values when checkout data loads (but don't trigger auto-save)
  useEffect(() => {
    if (checkout?.checkoutSession && !hasInitializedForm.current) {
      const session = checkout.checkoutSession;
      const customer = session.customer;
      const shipping = session.shippingAddress;

      console.log('🔄 Updating address form with checkout data:', {
        customer: customer
          ? {
              firstName: customer.firstName,
              lastName: customer.lastName,
              email: customer.email,
            }
          : null,
        shipping: shipping
          ? {
              country: shipping.country,
              address1: shipping.address1,
              city: shipping.city,
            }
          : null,
      });

      // Use setValues to update multiple fields at once (this won't trigger auto-save per field)
      addressForm.setValues({
        firstName: customer?.firstName || '',
        lastName: customer?.lastName || '',
        email: customer?.email || '',
        phone: shipping?.phone || '',
        country: shipping?.country || '',
        address1: shipping?.address1 || '',
        address2: shipping?.address2 || '',
        city: shipping?.city || '',
        state: shipping?.state || shipping?.province || '',
        postal: shipping?.postal || '',
      });

      // Mark as initialized
      hasInitializedForm.current = true;
    }
  }, [checkout?.checkoutSession, addressForm]);

  const {
    isSelected: orderBumpSelected,
    toggle: toggleOrderBumpOffer,
    savings: orderBumpSavings,
  } = useOrderBump({
    checkoutSessionId: checkout?.checkoutSession?.id,
    offerId: pluginConfig.orderBumpId,
    orderBumpType: 'vip',
    autoPreview: true,
  });

  // Get current item data from checkout
  const firstItem = checkout?.summary?.items?.[0];
  const currentVariantId = checkout?.checkoutSession?.sessionLineItems.find(
    (lineItem) => lineItem.isOrderBump === false,
  )?.variantId;

  // Create bundles based on variant mappings and checkout data
  const createBundles = (item: CheckoutItem | undefined) => {
    const currency = item?.currency || pluginConfig.defaultCurrency;

    // Get product and variant info from the actual data structure
    const productName = item?.name || 'Product';

    const originalPriceFirstBundle =
      variantMappings.bundle1.variant?.prices?.[0]?.currencyOptions?.[currency]?.amount ||
      item?.unitAmount ||
      0;

    return [
      {
        id: 'bundle1',
        variantId: variantMappings.bundle1.variantId,
        name: variantMappings.bundle1.name,
        quantity: 1,
        totalPrice:
          variantMappings.bundle1.variant?.prices?.[0]?.currencyOptions?.[currency]?.amount ||
          item?.unitAmount ||
          0,
        originalPrice:
          variantMappings.bundle1.variant?.prices?.[0]?.currencyOptions?.[currency]?.amount ||
          item?.unitAmount ||
          0,
        images: [
          variantMappings.bundle1.variant?.imageUrl ||
            item?.imageUrl ||
            '/placeholder.svg?height=60&width=60',
        ],
        bestValue: false,
        productName: variantMappings.bundle1.product?.name || productName,
        variantName: variantMappings.bundle1.variant?.name || 'Regular',
        currency,
        dealType: 'regular',
      },
      {
        id: 'bundle2',
        variantId: variantMappings.bundle2.variantId,
        name: variantMappings.bundle2.name,
        quantity: 1,
        totalPrice:
          variantMappings.bundle2.variant?.prices?.[0]?.currencyOptions?.[currency]?.amount ||
          item?.unitAmount ||
          0,
        originalPrice: originalPriceFirstBundle * 2,
        images: [
          variantMappings.bundle2.variant?.imageUrl ||
            item?.imageUrl ||
            '/placeholder.svg?height=60&width=60',
        ],
        bestValue: true,
        productName: variantMappings.bundle2.product?.name || productName,
        variantName: variantMappings.bundle2.variant?.name || 'BOGO Deal',
        currency,
        dealType: 'bogo',
      },
      {
        id: 'bundle3',
        variantId: variantMappings.bundle3.variantId,
        name: variantMappings.bundle3.name,
        quantity: 1,
        totalPrice:
          variantMappings.bundle3.variant?.prices?.[0]?.currencyOptions?.[currency]?.amount ||
          item?.unitAmount ||
          0,
        originalPrice: originalPriceFirstBundle * 3,
        images: [
          variantMappings.bundle3.variant?.imageUrl ||
            item?.imageUrl ||
            '/placeholder.svg?height=60&width=60',
        ],
        bestValue: false,
        productName: variantMappings.bundle3.product?.name || productName,
        variantName: variantMappings.bundle3.variant?.name || 'Special Deal',
        currency,
        dealType: 'special',
      },
    ];
  };

  const bundles = createBundles(firstItem);

  // Sync selected bundle with checkout session data
  useEffect(() => {
    // Don't sync during user-initiated updates to prevent race conditions
    if (isUserInitiatedUpdate) return;

    if (currentVariantId && bundles.length > 0) {
      const matchingBundle = bundles.find((bundle) => bundle.variantId === currentVariantId);

      if (matchingBundle) {
        // console.log("🔄 Syncing selected bundle:", {
        //   currentVariantId,
        //   matchingBundleId: matchingBundle.id,
        //   currentSelectedBundle: selectedBundle,
        // });

        // Only update if different from current selection
        if (matchingBundle.id !== selectedBundle) {
          setSelectedBundle(matchingBundle.id);
        }
      } else {
        // console.warn(
        //   "⚠️ No matching bundle found for variant:",
        //   currentVariantId
        // );
        // Fallback to first bundle if no match found
        if (selectedBundle === null) {
          setSelectedBundle('bundle1');
        }
      }
    } else if (selectedBundle === null && bundles.length > 0) {
      // Initial fallback when no checkout data is available yet
      // console.log(
      //   "🔄 Setting initial bundle to bundle1 (no checkout data yet)"
      // );
      setSelectedBundle('bundle1');
    }
  }, [currentVariantId, bundles.length, isUserInitiatedUpdate]); // Removed selectedBundle from deps to prevent loops

  // Debug effect to track data loading
  useEffect(() => {
    // console.log("📊 Checkout data status:", {
    //   hasCheckout: !!checkout,
    //   hasCheckoutSession: !!checkout?.checkoutSession,
    //   currentVariantId,
    //   selectedBundle,
    //   bundlesCount: bundles.length,
    //   isUserInitiatedUpdate,
    //   checkoutToken,
    //   // orderBumpSelected,
    //   // orderBumpSavings,
    //   error: error?.message,
    //   productsError: productsError?.message,
    //   // orderBumpPreviewSavings removed - using orderBumpSavings instead
    // });
  }, [
    checkout,
    currentVariantId,
    selectedBundle,
    bundles.length,
    isUserInitiatedUpdate,
    checkoutToken,
    // orderBumpSelected,
    // orderBumpSavings,
    error,
    productsError,
  ]);

  // Initialize checkout programmatically when no token is provided
  useEffect(() => {
    // console.log("🔄 Checkout initialization check:", {
    //   hasCheckoutToken: !!checkoutToken,
    //   hasCheckoutData: !!checkout,
    //   hasInitFunction: !!init,
    //   hasInitialized: hasInitializedRef.current,
    //   checkoutTokenPreview: checkoutToken
    //     ? `${checkoutToken.substring(0, 8)}...`
    //     : "none",
    // });

    if (!checkoutToken && !checkout && init && !hasInitializedRef.current) {
      // console.log(
      //   "🚀 Initializing new checkout session (no token provided)..."
      // );
      hasInitializedRef.current = true;

      // Initialize with the first available variant from mappings
      const firstVariant = variantMappings.bundle1;
      if (firstVariant?.variantId) {
        init({
          storeId: pluginConfig.storeId,
          lineItems: [
            {
              variantId: firstVariant.variantId,
              quantity: 1,
            },
          ],
        }).catch(() => {
          // console.error("❌ Failed to initialize checkout:", error);
          hasInitializedRef.current = false; // Reset on error to allow retry
        });
      }
    } else if (checkoutToken) {
      // console.log(
      //   "✅ CheckoutToken provided - skipping init(), auto-load should handle it"
      // );
    }
  }, [checkoutToken, checkout, init, variantMappings]);

  // Pre-fill form with existing checkout data when available
  useEffect(() => {
    if (
      checkout?.checkoutSession &&
      (checkout.checkoutSession.customer || checkout.checkoutSession.shippingAddress)
    ) {
      const customer = checkout.checkoutSession.customer;
      const shippingAddress = checkout.checkoutSession.shippingAddress;

      form.reset({
        firstName: customer?.firstName || shippingAddress?.firstName || '',
        lastName: customer?.lastName || shippingAddress?.lastName || '',
        email: customer?.email || '',
        phone: customer?.phone || shippingAddress?.phone || '',
        country: shippingAddress?.country || '',
        address: shippingAddress?.address1 || shippingAddress?.address || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || shippingAddress?.province || '',
        zipCode: shippingAddress?.postal || shippingAddress?.zipCode || shippingAddress?.zip || '',
        // Keep card fields empty for security
        cardNumber: '',
        expiryDate: '',
        cvc: '',
      });
    }
  }, [checkout?.checkoutSession, form.reset]);

  // Clear payment errors when user starts typing in card fields
  useEffect(() => {
    if (paymentError && (watch('cardNumber') || watch('expiryDate') || watch('cvc'))) {
      clearPaymentError();
    }
  }, [watch('cardNumber'), watch('expiryDate'), watch('cvc'), paymentError, clearPaymentError]);

  // Payment handler with comprehensive validation and error focus
  const handlePayment = async () => {
    console.log('💳 Payment button clicked - starting validation...');

    // Step 1: Validate address form first (using useAddress hook)
    const addressValid = addressForm.validateAll();
    console.log('📍 Address validation result:', addressValid);
    console.log(
      '📍 Address errors:',
      Object.fromEntries(
        Object.entries(addressForm.fields)
          .map(([key, field]) => [key, field.error])
          .filter(([, error]) => error),
      ),
    );

    // Step 2: Validate ONLY card form fields (not address fields)
    const cardValid = await form.trigger(['cardNumber', 'expiryDate', 'cvc']);
    console.log('💳 Card validation result:', cardValid);

    // Extract only card-related errors for focus logic
    const cardErrors = {
      cardNumber: errors.cardNumber,
      expiryDate: errors.expiryDate,
      cvc: errors.cvc,
    };
    console.log('💳 Card errors only:', cardErrors);

    // Step 3: Focus on first error field if validation fails
    if (!addressValid || !cardValid) {
      console.log('❌ Validation failed, focusing first error...');
      // Use imported focus utility
      await focusFirstErrorField({
        addressValid,
        cardValid,
        addressErrors: Object.fromEntries(
          Object.entries(addressForm.fields)
            .map(([key, field]) => [key, field.error])
            .filter(([, error]) => error),
        ),
        cardErrors: cardErrors, // Only card errors now
        setFocus,
        toast,
      });
      return;
    }

    console.log('✅ All validation passed, proceeding with payment...');

    // Make sure checkout session is ready
    if (!checkout?.checkoutSession?.id || !updateCustomerAndSessionInfo) {
      toast.error('Checkout session not ready. Please try again.');
      return;
    }

    // Get validated data from both forms
    const addressData = addressForm.getAddressObject();

    // 🐛 DEBUG: Check actual field values vs getAddressObject in payment handler
    console.log('🔍 DEBUG PAYMENT: Field values:', {
      country: addressForm.fields.country.value,
      state: addressForm.fields.state.value,
      stateIsEmpty: !addressForm.fields.state.value,
      stateLength: addressForm.fields.state.value?.length,
      availableStates: addressForm.states?.length || 0,
      countryName: addressForm.countries.find((c) => c.code === addressForm.fields.country.value)?.name,
      stateName: addressForm.states.find((s) => s.code === addressForm.fields.state.value)?.name,
      getAddressObjectCountry: addressData.country,
      getAddressObjectState: addressData.state,
      fullAddressData: addressData,
    });

    // ✅ Use getAddressObject() - now fixed and working correctly
    const paymentAddressData = addressForm.getAddressObject();

    // Enhanced validation for state field
    const enhancedPaymentData = {
      ...paymentAddressData,
      state:
        paymentAddressData.state && paymentAddressData.state.trim() ? paymentAddressData.state.trim() : 'N/A',
    };

    console.log('✅ PAYMENT Using getAddressObject() - FIXED:', {
      originalState: paymentAddressData.state,
      enhancedState: enhancedPaymentData.state,
      country: enhancedPaymentData.country,
      countryName: addressForm.countries.find((c) => c.code === enhancedPaymentData.country)?.name,
    });

    // Handle state requirement validation for specific countries
    const isStateRequired =
      addressForm.states.length > 0 || ['US', 'CA', 'GB'].includes(enhancedPaymentData.country);
    if (isStateRequired && !enhancedPaymentData.state?.trim()) {
      toast.error('Please enter a state/province for the selected country.');
      // Use imported focus utility for state field
      focusFieldByDataAttribute('state');
      return;
    }

    try {
      // ✅ NO REDUNDANT SAVE: Auto-save keeps data up-to-date
      // Data is already saved via saveCheckoutInfo (triggered by useAddress hook)
      console.log('✅ Proceeding with payment (auto-save keeps data current)');

      // Process payment using validated card data
      const cardData = form.getValues();
      await processCardPayment(
        checkout.checkoutSession.id,
        {
          cardNumber: cardData.cardNumber.replace(/\s+/g, ''), // Remove spaces
          expiryDate: cardData.expiryDate,
          cvc: cardData.cvc,
        },
        {
          enableThreeds: true,
          initiatedBy: 'customer', // SDK now defaults to customer
          source: 'checkout', // Source is checkout for plugin usage
          onSuccess: () => {
            toast.success('Payment successful! 🎉');

            // Show success message with payment details
            const amount =
              checkout?.summary?.currency ||
              pluginConfig.defaultCurrency +
                ' ' +
                ((checkout?.summary?.totalAdjustedAmount || 0) / 100).toFixed(2);

            toast.success(`Payment of ${amount} completed successfully! Your order is being processed.`, {
              duration: 5000,
            });
          },
          onFailure: (errorMsg) => {
            toast.error(`Payment failed: ${errorMsg}`);
          },
          onRequireAction: () => {
            toast.loading('Please complete the additional security verification...');
          },
        },
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      toast.error(errorMsg);
    }
  };

  // Instant bundle change with background update - now switches variants instead of quantities
  const handleBundleChange = async (bundleId: string) => {
    const selectedBundleData = bundles.find((bundle) => bundle.id === bundleId);

    if (!selectedBundleData) return;

    // Check if checkout session is available
    if (!checkout?.checkoutSession?.id || !updateLineItems) {
      // console.warn("Checkout session not ready, cannot update line items");
      return;
    }

    // console.log("🎯 User changing bundle:", {
    //   from: selectedBundle,
    //   to: bundleId,
    //   variantId: selectedBundleData.variantId,
    // });

    // Mark as user-initiated update to prevent sync interference
    setIsUserInitiatedUpdate(true);

    // Update UI immediately
    setSelectedBundle(bundleId);

    // Update in background - switch to different variant
    setIsUpdating(true);
    try {
      const lineItems = [
        {
          variantId: selectedBundleData.variantId,
          quantity: 1, // Always quantity 1 since the deal is in the variant price
        },
      ];

      // console.log("🎯 lineItems", lineItems);

      await updateLineItems(lineItems);
    } catch {
      // Revert on error
      setSelectedBundle(selectedBundle);
      // console.error("Failed to switch variant:", error);
      toast.error('Failed to update selection. Please try again.');
    } finally {
      setIsUpdating(false);
      setIsUserInitiatedUpdate(false); // Clear flag after update completes
    }
  };

  // Handle order bump toggle
  const handleOrderBumpToggle = async (selected: boolean) => {
    try {
      const result = await toggleOrderBumpOffer(selected);

      if (result.success) {
        // SDK automatically handles bidirectional refresh - no manual refresh needed! 🎉
        const message = selected ? 'Order bump added!' : 'Order bump removed!';
        toast.success(message);
      } else {
        toast.error('Failed to update order bump. Please try again.');
      }
    } catch {
      // console.error("Failed to toggle order bump:", error);
      toast.error('Failed to update order bump. Please try again.');
    }
  };

  // Show error state for products
  if (productsError) {
    // console.warn("Products loading error:", productsError);
    // Continue with fallback data instead of blocking
  }

  // Only show error state for critical checkout errors (not loading state)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="mb-4 text-xl font-semibold text-red-600">Checkout Error</h1>
            <p className="mb-4 text-gray-600">{error.message || String(error)}</p>
            <p className="text-sm text-gray-500">Please refresh the page to try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Safety check: Ensure addressForm.fields is defined
  if (!addressForm || !addressForm.fields) {
    console.error('❌ useAddress hook failed to initialize properly');
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600"></div>
          <p className="text-gray-600">Loading address form...</p>
        </div>
      </div>
    );
  }

  // Show loading indicator for payment processing
  const isLoading = isPaymentLoading || isUpdating || !checkout?.checkoutSession?.id;

  return (
    <div className="bg-[#f5f3f0] font-sans">
      <header className="bg-brand-green-dark p-2 text-center text-white">
        <div className="flex items-center justify-center gap-2">
          <Sun className="h-6 w-6 text-yellow-400" />
          <p className="font-bold">Flash SALE</p>
        </div>
        <p className="text-sm">
          Enjoy a flash discount with <span className="font-bold">FREE SHIPPING</span>. Limited inventory.{' '}
          <span className="underline">Sell Out Risk High.</span>
        </p>
      </header>

      <div className="bg-white py-4">
        <div className="container mx-auto flex items-center justify-between px-2 sm:px-4">
          {pluginConfig.branding.storeName}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-700 sm:text-sm">SECURE CHECKOUT</p>
              <p className="text-xs font-bold text-gray-700 sm:text-sm">CONTACT US:</p>
              <p className="text-xs text-gray-500">{pluginConfig.branding.supportEmail}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-2 py-6 sm:px-4 md:px-8 lg:px-12 xl:px-24">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-5">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-3">
            <div className="text-brand-green-dark flex items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-100 p-2 text-center text-sm font-semibold sm:p-3 sm:text-base">
              <img src="/worldwide-shipping.webp" alt="Worldwide Shipping" width={32} height={32} />
              FREE Shipping WORLDWIDE!
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-100 p-2 text-center text-sm font-semibold text-red-700 sm:p-3 sm:text-base">
              ⚠️ ONLY {formatCartTimer(cartTimer)} LEFT - Cart expires soon!
            </div>

            {/* Step 1 */}
            <div
              className={`space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-opacity duration-300 sm:space-y-5 sm:p-6 ${
                isLoading ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      1
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 sm:text-xl">PICK YOUR BUNDLE DISCOUNT</h2>
                  </div>
                  <p className="text-sm text-gray-600 sm:text-base">Buy multiple units and save even more!</p>
                </div>
              </div>
              <div className="flex justify-between px-2 text-xs font-semibold text-gray-500 sm:px-4 sm:text-sm">
                <span>Product</span>
                <span>Price</span>
              </div>

              {/* Show loading state while selectedBundle is null */}
              {selectedBundle === null ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  <p className="ml-2 text-gray-600">Loading bundles...</p>
                </div>
              ) : (
                <RadioGroup
                  value={selectedBundle}
                  onValueChange={handleBundleChange}
                  className="space-y-2 sm:space-y-3"
                >
                  {bundles.map((bundle) => (
                    <Label
                      key={bundle.id}
                      htmlFor={bundle.id}
                      className={`relative flex cursor-pointer items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 sm:gap-4 sm:p-5 ${
                        selectedBundle === bundle.id
                          ? 'scale-[1.02] transform border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {bundle.bestValue && (
                        <div className="absolute -right-3 -top-3 z-10">
                          <span className="animate-pulse rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                            🔥 BEST VALUE
                          </span>
                        </div>
                      )}
                      <RadioGroupItem value={bundle.id} id={bundle.id} />
                      <div className="flex items-center gap-1 sm:gap-2">
                        {bundle.images.map((src, index) => (
                          <img
                            key={`${bundle.id}-image-${index}-${src}`}
                            src={src || '/placeholder.svg'}
                            alt={bundle.name}
                            width={40}
                            height={40}
                            className="rounded sm:h-[60px] sm:w-[60px]"
                          />
                        ))}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold sm:text-lg">{bundle.name}</p>
                        <p className="text-xs text-gray-600 sm:text-sm">{bundle.productName}</p>
                        {bundle.variantName && <p className="text-xs text-gray-500">{bundle.variantName}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-red-600 line-through sm:text-sm">
                          {formatMoney(
                            Number(bundle.originalPrice) || 0,
                            String(bundle.currency || pluginConfig.defaultCurrency),
                          )}
                        </p>
                        <p className="text-xs text-gray-500">same as</p>
                        <p className="text-brand-green-dark text-lg font-bold sm:text-xl">
                          {formatMoney(
                            Number(bundle.totalPrice) || 0,
                            String(bundle.currency || pluginConfig.defaultCurrency),
                          )}
                        </p>
                        <p className="text-xs font-semibold text-green-600">+ FREE SHIPPING</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </div>

            <p className="text-center text-sm font-bold text-red-600 sm:text-base">
              Order now... only 15 left in stock
            </p>

            <div
              className={`relative cursor-pointer select-none rounded-xl border-2 p-4 shadow-lg transition-all duration-300 sm:p-6 ${
                orderBumpSelected
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-green-200'
                  : 'hover:to-orange-150 border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-200 hover:from-orange-100 hover:shadow-xl'
              }`}
              onClick={() => handleOrderBumpToggle(!orderBumpSelected)}
            >
              {orderBumpSavings && (
                <div className="absolute -right-3 -top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  {(() => {
                    // For now, use a fixed 10% OFF as shown in the user's example
                    // TODO: Use actual savingsPct when available from SDK
                    return '10% OFF';
                  })()}
                </div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className="flex h-6 w-6 items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    id="order-bump"
                    checked={orderBumpSelected}
                    onCheckedChange={handleOrderBumpToggle}
                    className={`h-5 w-5 border-2 transition-all duration-200 ${
                      orderBumpSelected
                        ? 'border-green-500 bg-green-500 data-[state=checked]:bg-green-500'
                        : 'border-orange-500 hover:border-orange-600 data-[state=checked]:bg-orange-500'
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={`rounded-full p-1 ${orderBumpSelected ? 'bg-green-500' : 'bg-orange-500'}`}
                    >
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <span
                      className={`text-sm font-bold uppercase tracking-wide ${
                        orderBumpSelected ? 'text-green-700' : 'text-orange-700'
                      }`}
                    >
                      🎯 VIP Exclusive Offer
                    </span>
                    {orderBumpSelected && (
                      <span className="ml-auto rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                        ✓ ADDED
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-gray-900 sm:text-lg">🔥 VIP Club</h4>
                    <p className="text-sm leading-relaxed text-gray-700">
                      Unlock your <span className="font-semibold text-orange-600">VIP membership</span> and
                      get an immediate discount
                      {orderBumpSavings && (
                        <span className="font-bold text-green-600">
                          {' '}
                          of{' '}
                          {formatMoney(
                            orderBumpSavings,
                            checkout?.summary?.currency || pluginConfig.defaultCurrency,
                          )}
                        </span>
                      )}{' '}
                      on your entire order, plus exclusive access to member-only deals!
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-gray-600 sm:grid-cols-2">
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        <span>Immediate discount applied</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        <span>VIP member benefits</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        <span>Priority customer support</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        <span>Exclusive future offers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 - Customer Information */}
            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:space-y-5 sm:p-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  2
                </div>
                <h2 className="text-lg font-bold text-gray-800 sm:text-xl">CUSTOMER INFORMATION</h2>
              </div>
              {/* 🚀 NEW: Using useAddress hook for cleaner form handling */}
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <Input
                    value={addressForm.fields.firstName.value}
                    onChange={(e) => addressForm.setValue('firstName', e.target.value)}
                    placeholder="First Name*"
                    className={`h-12 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      addressForm.fields.firstName.error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                        : ''
                    }`}
                    data-address-field="firstName"
                  />
                  {addressForm.fields.firstName.error && (
                    <p className="mt-1 text-sm text-red-600">{addressForm.fields.firstName.error}</p>
                  )}
                </div>
                <div>
                  <Input
                    value={addressForm.fields.lastName.value}
                    onChange={(e) => addressForm.setValue('lastName', e.target.value)}
                    placeholder="Last Name*"
                    className={`h-12 rounded-md border-gray-400 text-base ${
                      addressForm.fields.lastName.error ? 'border-red-500' : ''
                    }`}
                    data-address-field="lastName"
                  />
                  {addressForm.fields.lastName.error && (
                    <p className="mt-1 text-sm text-red-600">{addressForm.fields.lastName.error}</p>
                  )}
                </div>
                <div>
                  <Input
                    value={addressForm.fields.email.value}
                    onChange={(e) => addressForm.setValue('email', e.target.value)}
                    type="email"
                    placeholder="Email Address*"
                    className={`h-12 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      addressForm.fields.email.error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                        : ''
                    }`}
                    data-address-field="email"
                  />
                  {addressForm.fields.email.error && (
                    <p className="mt-1 text-sm text-red-600">{addressForm.fields.email.error}</p>
                  )}
                </div>
                <div>
                  <Input
                    value={addressForm.fields.phone.value}
                    onChange={(e) => addressForm.setValue('phone', e.target.value)}
                    type="tel"
                    placeholder="Phone number*"
                    className={`h-12 rounded-md border-gray-400 text-base ${
                      addressForm.fields.phone.error ? 'border-red-500' : ''
                    }`}
                    data-address-field="phone"
                  />
                  {addressForm.fields.phone.error && (
                    <p className="mt-1 text-sm text-red-600">{addressForm.fields.phone.error}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  3
                </div>
                <h2 className="text-lg font-bold text-gray-800 sm:text-xl">SHIPPING INFORMATION</h2>
              </div>
              {/* 
                🚀 NEW: With useAddress hook, this would be much simpler:
                
                const { 
                  fields, 
                  setValue, 
                  countries, 
                  filteredCountries, 
                  searchCountries,
                  states,
                  validateAll,
                  isValid,
                  errors 
                } = useAddress();
                
                Then just use: fields.country.value, setValue('country', value), etc.
                With built-in search, validation, and 250+ countries + states!
              */}
              <div className="space-y-3">
                <div>
                  {/* 🚀 NEW: Google Places autocomplete powered address input */}
                  <Input
                    ref={addressForm.addressRef}
                    value={addressForm.addressInputValue}
                    onChange={(e) => {
                      console.log(`📝 Manual address typing: ${e.target.value}`);
                      if (addressForm.handleAddressChange) {
                        addressForm.handleAddressChange(e);
                      }
                    }}
                    onBlur={() => {}}
                    placeholder="Street address*"
                    className={`h-12 rounded-md border-gray-400 text-base ${
                      addressForm.fields.address1.error ? 'border-red-500' : ''
                    }`}
                    data-address-field="address1"
                  />

                  {addressForm.fields.address1.error && (
                    <p className="mt-1 text-sm text-red-600">{addressForm.fields.address1.error}</p>
                  )}
                </div>
                <div>
                  {/* 🚀 NEW: Using addressForm.countries instead of manual import */}
                  <Combobox
                    options={addressForm.countries.map((c: Country) => ({
                      value: c.code,
                      label: c.name,
                    }))}
                    value={addressForm.fields.country.value}
                    onValueChange={(value) => {
                      // console.log("🌍 Country selected:", value);
                      // console.log("🏛️ Available states for country:", addressForm.states.length);
                      addressForm.setValue('country', value);
                    }}
                    placeholder="Country*"
                    error={!!addressForm.fields.country.error}
                    data-address-field="country"
                  />
                  {addressForm.fields.country.error && (
                    <p className="mt-1 text-sm text-red-600">{addressForm.fields.country.error}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <Input
                      value={addressForm.fields.city.value}
                      onChange={(e) => addressForm.setValue('city', e.target.value)}
                      placeholder="City*"
                      className={`h-12 rounded-md border-gray-400 text-base ${
                        addressForm.fields.city.error ? 'border-red-500' : ''
                      }`}
                      data-address-field="city"
                    />
                    {addressForm.fields.city.error && (
                      <p className="mt-1 text-sm text-red-600">{addressForm.fields.city.error}</p>
                    )}
                  </div>
                  <div>
                    {/* 🚀 NEW: Using addressForm.states with automatic filtering by country */}
                    {addressForm.states.length > 0 ? (
                      <Combobox
                        options={addressForm.states.map((s: State) => ({
                          value: s.code,
                          label: s.name,
                        }))}
                        value={addressForm.fields.state.value}
                        onValueChange={(value) => {
                          addressForm.setValue('state', value);
                        }}
                        placeholder="State / Province*"
                        error={!!addressForm.fields.state.error}
                        data-address-field="state"
                      />
                    ) : (
                      <Input
                        value={addressForm.fields.state.value}
                        onChange={(e) => {
                          addressForm.setValue('state', e.target.value);
                        }}
                        placeholder={`State / Province* (${
                          addressForm.fields.country.value
                            ? `No states defined for ${addressForm.fields.country.value}`
                            : 'Enter manually'
                        })`}
                        className={`h-12 rounded-md border-gray-400 text-base ${
                          addressForm.fields.state.error ? 'border-red-500' : ''
                        }`}
                        data-address-field="state"
                      />
                    )}
                    {addressForm.fields.state.error && (
                      <p className="mt-1 text-sm text-red-600">{addressForm.fields.state.error}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      value={addressForm.fields.postal.value}
                      onChange={(e) => addressForm.setValue('postal', e.target.value)}
                      placeholder="Zip / Postcode*"
                      className={`h-12 rounded-md border-gray-400 text-base ${
                        addressForm.fields.postal.error ? 'border-red-500' : ''
                      }`}
                      data-address-field="postal"
                    />
                    {addressForm.fields.postal.error && (
                      <p className="mt-1 text-sm text-red-600">{addressForm.fields.postal.error}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-5 lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6">
              <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-800">SECURE PAYMENT</h3>
              </div>
              <p className="mb-4 flex items-center gap-2 text-xs text-gray-500 sm:mb-5 sm:text-sm">
                <Lock className="h-4 w-4 text-green-600" />
                All transactions are secure and encrypted.
              </p>

              {/* Payment Error Display */}
              {paymentError && (
                <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 sm:mb-4">
                  <p className="text-xs text-red-600 sm:text-sm">{paymentError}</p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-t-lg border bg-gray-50 p-2 sm:p-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500 sm:h-4 sm:w-4" />
                  <span className="text-sm font-semibold sm:text-base">Credit/Debit Card</span>
                </div>
                <div className="flex gap-1">
                  <img
                    src="/brandnetwork/visa.svg"
                    alt="Visa"
                    width={30}
                    height={18}
                    className="sm:h-[22px] sm:w-[35px]"
                  />
                  <img
                    src="/brandnetwork/mastercard.svg"
                    alt="Mastercard"
                    width={30}
                    height={18}
                    className="sm:h-[22px] sm:w-[35px]"
                  />
                  <img
                    src="/brandnetwork/amex.svg"
                    alt="Amex"
                    width={30}
                    height={18}
                    className="sm:h-[22px] sm:w-[35px]"
                  />
                  <img
                    src="/brandnetwork/discover.svg"
                    alt="Discover"
                    width={30}
                    height={18}
                    className="sm:h-[22px] sm:w-[35px]"
                  />
                </div>
              </div>
              <div className="space-y-3 rounded-b-lg border border-t-0 p-4 sm:space-y-4 sm:p-6">
                <div>
                  <Input
                    value={watch('cardNumber')}
                    placeholder="Card number*"
                    className={`h-12 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      errors.cardNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
                    }`}
                    maxLength={19}
                    onChange={(e) => setValue('cardNumber', formatCardNumber(e.target.value))}
                    data-card-field="cardNumber"
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      value={watch('expiryDate')}
                      placeholder="MM/YY*"
                      className={`h-12 rounded-md border-gray-400 text-base ${
                        errors.expiryDate ? 'border-red-500' : ''
                      }`}
                      maxLength={5}
                      onChange={(e) => setValue('expiryDate', formatExpiryDate(e.target.value))}
                      data-card-field="expiryDate"
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      value={watch('cvc')}
                      placeholder="CVC*"
                      className={`h-12 rounded-md border-gray-400 text-base ${
                        errors.cvc ? 'border-red-500' : ''
                      }`}
                      maxLength={4}
                      onChange={(e) => setValue('cvc', e.target.value.replace(/\D/g, ''))}
                      data-card-field="cvc"
                    />
                    {errors.cvc && <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>}
                  </div>
                </div>
              </div>
              <Button
                className={`bg-brand-yellow mt-4 w-full py-6 text-xl font-bold text-black hover:bg-yellow-500 sm:mt-6 sm:py-8 sm:text-2xl ${
                  isPaymentLoading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                onClick={handlePayment}
                disabled={isPaymentLoading}
                style={{ minHeight: '64px' }}
              >
                {isPaymentLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-black sm:h-6 sm:w-6"></div>
                    PROCESSING...
                  </div>
                ) : (
                  'COMPLETE PURCHASE'
                )}
              </Button>
              <div className="mt-3 space-y-2 text-center">
                <p className="text-xs font-medium text-gray-500">
                  TRY IT RISK FREE! - 90 DAY MONEY BACK GUARANTEE!
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <Lock className="h-3 w-3 text-green-600" />
                  <span>SSL Secured</span>
                  <span>•</span>
                  <span>256-bit Encryption</span>
                  <span>•</span>
                  <span>Norton Verified</span>
                </div>
              </div>
              <p className="my-3 text-center text-xs text-gray-500 sm:my-4">
                By completing the payment, the client is in agreement with our Terms of Service and Refund
                Policy.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <img
                  src="/brandnetwork/paypal.svg"
                  alt="PayPal"
                  width={50}
                  height={16}
                  className="sm:h-[20px] sm:w-[60px]"
                />
                <img
                  src="/brandnetwork/visa.svg"
                  alt="Visa"
                  width={32}
                  height={16}
                  className="sm:h-[20px] sm:w-[40px]"
                />
                <img
                  src="/brandnetwork/mastercard.svg"
                  alt="Mastercard"
                  width={32}
                  height={16}
                  className="sm:h-[20px] sm:w-[40px]"
                />
                <img
                  src="/brandnetwork/amex.svg"
                  alt="Amex"
                  width={32}
                  height={16}
                  className="sm:h-[20px] sm:w-[40px]"
                />
                <img
                  src="/brandnetwork/discover.svg"
                  alt="Discover"
                  width={50}
                  height={16}
                  className="sm:h-[20px] sm:w-[60px]"
                />
              </div>
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-gray-600 sm:mt-4 sm:text-sm">
                <Lock className="h-3 w-3 text-green-600 sm:h-4 sm:w-4" />
                Secure 256-bit SSL encryption
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4 sm:gap-4">
              <img
                src="https://img.funnelish.com/9938/69802/1678959839-op.webp"
                alt="90 Day Guarantee"
                width={80}
                height={80}
                className="sm:h-[100px] sm:w-[100px]"
              />
              <div>
                <h4 className="text-base font-bold text-green-800 sm:text-lg">90 DAYS GUARANTEE</h4>
                <p className="text-xs text-green-700 sm:text-sm">
                  If you are not completely thrilled with your purchase - we are offering you a 90 day
                  guarantee on all purchases. Simply contact our customer support for a full refund or
                  replacement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
