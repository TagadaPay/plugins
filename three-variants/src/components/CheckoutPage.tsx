import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { pluginConfig } from "@/data/config";
import {
  formatCardNumber,
  formatExpiryDate,
} from "@/lib/utils/card-formatting";
import {
  AddressData, // Import the comprehensive useAddress hook
  Country,
  State,
  useAddress,
  useCheckout,
  useOrderBump,
  usePayment,
  useProducts,
} from "@tagadapay/plugin-sdk";
import { Heart, Lock, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

// Note: Debug functionality is now handled by the SDK's built-in debug drawer
// Look for the orange 🐛 button in the bottom-right corner when debugMode={true}

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatMoney } from "@tagadapay/plugin-sdk";

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

// Define interface for bundle data
interface Bundle {
  id: string;
  variantId: string;
  name: string;
  quantity: number;
  totalPrice: number;
  originalPrice: number;
  images: string[];
  bestValue: boolean;
  productName: string;
  variantName: string;
  currency: string;
  dealType: string;
  isSubscription: boolean;
}

// Form validation schema - now only for card fields since address is handled by useAddress hook
const cardFormSchema = z.object({
  cardNumber: z.string().min(15, "Valid card number is required"),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Valid expiry date (MM/YY) is required"),
  cvc: z.string().min(3, "Valid CVC is required"),
});

// Type for card form data only
type CardFormData = z.infer<typeof cardFormSchema>;

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
  const [subscribeAndSave, setSubscribeAndSave] = useState(true); // Default to subscription for savings

  // 📱 Mobile sticky button state
  const [showStickyButton, setShowStickyButton] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const hasInitializedRef = useRef(false);

  // Order bump offer ID
  // EXPEDITED_SHIPPING
  const ORDER_BUMP_EXPEDITED_SHIPPING_OFFER_ID =
    "up_sell_ob_offer_96fd2c7c5b73";

  const timerSeconds = 59;
  const timerMinutes = 9;
  const secondsInMinute = 60;

  // Cart reserved timer state (start at 9:59)
  const [cartTimer, setCartTimer] = useState(
    timerMinutes * secondsInMinute + timerSeconds
  ); // seconds
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
      .padStart(1, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 📱 Mobile sticky button visibility logic
  useEffect(() => {
    const handleScroll = () => {
      if (!paymentSectionRef.current) return;

      const rect = paymentSectionRef.current.getBoundingClientRect();
      const isPaymentSectionVisible =
        rect.top < window.innerHeight && rect.bottom > 0;

      // Show sticky button when payment section is not visible and we're on mobile
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      setShowStickyButton(isMobile && !isPaymentSectionVisible);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Card form setup - address form is handled by useAddress hook below
  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvc: "",
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
        name: baseVariant?.variant.name || "Buy 1 Regular Price",
        dealType: "regular",
        variant: baseVariant?.variant,
        product: baseVariant?.product,
      },
      bundle2: {
        variantId: pluginConfig.variants.bogo,
        name: bogoVariant?.variant.name || "Buy 1 Get 1 Free (BOGO)",
        dealType: "bogo",
        variant: bogoVariant?.variant,
        product: bogoVariant?.product,
      },
      bundle3: {
        variantId: pluginConfig.variants.special,
        name: specialVariant?.variant.name || "Buy 1 Get 2 Free",
        dealType: "special",
        variant: specialVariant?.variant,
        product: specialVariant?.product,
      },
    };
  };

  const variantMappings = createVariantMappings();

  // Keep the TagadaPay SDK integration
  const {
    checkout,
    error,
    updateLineItems,
    updateCustomerAndSessionInfo,
    init,
  } = useCheckout({
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
          state:
            addressData.state && addressData.state.trim()
              ? addressData.state.trim()
              : "N/A",
        };

        console.log("🔍 Auto-save with enhanced data:", enhancedAddressData);

        // Only save if we have meaningful data (reduce the threshold to allow more auto-saves)
        if (
          !enhancedAddressData.email &&
          !enhancedAddressData.firstName &&
          !enhancedAddressData.address1 &&
          !enhancedAddressData.country
        ) {
          console.log("💾 Skipping auto-save: insufficient data");
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
            address2: enhancedAddressData.address2 || "",
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
            address2: enhancedAddressData.address2 || "",
            city: enhancedAddressData.city,
            country: enhancedAddressData.country,
            state: enhancedAddressData.state, // Already handled in enhancedAddressData
            postal: enhancedAddressData.postal,
            phone: enhancedAddressData.phone,
          },
          differentBillingAddress: false, // Using same as shipping
        });

        console.log("💾 Auto-saved checkout info successfully");
      } catch (error) {
        console.error("❌ Failed to auto-save checkout info:", error);
        // Don't show error toast for auto-save failures to avoid annoying the user
      }
    },
    [checkout?.checkoutSession?.id, updateCustomerAndSessionInfo]
  );

  // 🚀 NEW: Address form hook with comprehensive countries/states and validation
  const addressForm = useAddress({
    autoValidate: true,
    enableGooglePlaces: true,
    googlePlacesApiKey: "AIzaSyC4uCRdDH_9A7iUmkQg4_0AGXFnK2bErQA",
    countryRestrictions: [], // Allow all countries
    onFieldsChange: saveCheckoutInfo, // Auto-save callback handled by the hook!
    debounceConfig: {
      manualInputDelay: 1200, // 1.2 seconds for typing
      googlePlacesDelay: 200, // 200ms for Google Places (faster)
      enabled: true,
    },
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postal: "",
    },
  });

  // Update address form values when checkout data loads (but don't trigger auto-save)
  useEffect(() => {
    if (checkout?.checkoutSession && !hasInitializedForm.current) {
      const session = checkout.checkoutSession;
      const customer = session.customer;
      const shipping = session.shippingAddress;

      console.log("🔄 Updating address form with checkout data:", {
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
        firstName: customer?.firstName || "",
        lastName: customer?.lastName || "",
        email: customer?.email || "",
        phone: shipping?.phone || "",
        country: shipping?.country || "",
        address1: shipping?.address1 || "",
        address2: shipping?.address2 || "",
        city: shipping?.city || "",
        state: shipping?.state || shipping?.province || "",
        postal: shipping?.postal || "",
      });

      // Mark as initialized
      hasInitializedForm.current = true;
    }
  }, [checkout?.checkoutSession, addressForm]);

  // Note: Auto-save is now handled directly by the useAddress hook!
  // No need for complex detection logic - the hook calls saveCheckoutInfo
  // automatically when fields change (both manual and Google Places)

  // ✅ REAL SDK ORDER BUMP HOOK - Uses proper API routing via SDK toggleOrderBump method
  // const {
  //   isSelected: orderBumpSelected,
  //   savings: orderBumpSavings,
  //   toggle: toggleOrderBumpOffer,
  // } = useOrderBump({
  //   checkoutSessionId: checkout?.checkoutSession?.id,
  //   offerId: ORDER_BUMP_OFFER_ID,
  //   orderBumpType: "vip",
  //   autoPreview: true,
  // });

  const {
    isSelected: orderBumpExpeditedShippingSelected,
    toggle: toggleOrderBumpExpeditedShippingOffer,
  } = useOrderBump({
    checkoutSessionId: checkout?.checkoutSession?.id,
    offerId: ORDER_BUMP_EXPEDITED_SHIPPING_OFFER_ID,
    orderBumpType: "primary",
    autoPreview: false,
  });

  // Get current item data from checkout
  const firstItem = checkout?.summary?.items?.[0];
  const currentVariantId = checkout?.checkoutSession?.sessionLineItems.find(
    (lineItem) => lineItem.isOrderBump === false
  )?.variantId;

  // Helper function to get the correct price based on subscription state
  const getPriceForVariant = (variantId: string, currency: string) => {
    const priceMapping =
      pluginConfig.prices[variantId as keyof typeof pluginConfig.prices];
    if (!priceMapping) return 0;

    const priceId = subscribeAndSave
      ? priceMapping.recurring
      : priceMapping.oneTime;

    // Find the variant data to get price info
    const variantData = Object.values(variantMappings).find(
      (v) => v.variantId === variantId
    );
    const price = variantData?.variant?.prices?.find((p) => p.id === priceId);

    return price?.currencyOptions?.[currency]?.amount || 0;
  };

  // Create bundles based on variant mappings and checkout data
  const createBundles = (item: CheckoutItem | undefined): Bundle[] => {
    const currency = item?.currency || pluginConfig.defaultCurrency;

    // Get product and variant info from the actual data structure
    const productName = item?.name || "Product";

    return [
      {
        id: "bundle1",
        variantId: variantMappings.bundle1.variantId,
        name: variantMappings.bundle1.name,
        quantity: 2,
        totalPrice: getPriceForVariant(
          variantMappings.bundle1.variantId,
          currency
        ),
        originalPrice: getPriceForVariant(
          variantMappings.bundle1.variantId,
          currency
        ),
        images: [
          variantMappings.bundle1.variant?.imageUrl ||
            item?.imageUrl ||
            "/placeholder.svg?height=60&width=60",
        ],
        bestValue: false,
        productName: variantMappings.bundle1.product?.name || productName,
        variantName: variantMappings.bundle1.variant?.name || "Regular",
        currency,
        dealType: "regular",
        isSubscription: subscribeAndSave,
      },
      {
        id: "bundle2",
        variantId: variantMappings.bundle2.variantId,
        name: variantMappings.bundle2.name,
        quantity: 3,
        totalPrice: getPriceForVariant(
          variantMappings.bundle2.variantId,
          currency
        ),
        originalPrice:
          getPriceForVariant(variantMappings.bundle2.variantId, currency) * 2,
        images: [
          variantMappings.bundle2.variant?.imageUrl ||
            item?.imageUrl ||
            "/placeholder.svg?height=60&width=60",
        ],
        bestValue: false,
        productName: variantMappings.bundle2.product?.name || productName,
        variantName: variantMappings.bundle2.variant?.name || "BOGO Deal",
        currency,
        dealType: "bogo",
        isSubscription: subscribeAndSave,
      },
      {
        id: "bundle3",
        variantId: variantMappings.bundle3.variantId,
        name: variantMappings.bundle3.name,
        quantity: 5,
        totalPrice: getPriceForVariant(
          variantMappings.bundle3.variantId,
          currency
        ),
        originalPrice:
          getPriceForVariant(variantMappings.bundle3.variantId, currency) * 3,
        images: [
          variantMappings.bundle3.variant?.imageUrl ||
            item?.imageUrl ||
            "/placeholder.svg?height=60&width=60",
        ],
        bestValue: true,
        productName: variantMappings.bundle3.product?.name || productName,
        variantName: variantMappings.bundle3.variant?.name || "Special Deal",
        currency,
        dealType: "special",
        isSubscription: subscribeAndSave,
      },
    ];
  };

  // Recalculate bundles when subscription state changes
  const bundles = useMemo(
    () => createBundles(firstItem),
    [firstItem, subscribeAndSave]
  );

  // Sync selected bundle with checkout session data
  useEffect(() => {
    // Don't sync during user-initiated updates to prevent race conditions
    if (isUserInitiatedUpdate) return;

    if (currentVariantId && bundles.length > 0) {
      const matchingBundle = bundles.find(
        (bundle: Bundle) => bundle.variantId === currentVariantId
      );

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
        // Fallback to third bundle if no match found
        if (selectedBundle === null) {
          setSelectedBundle("bundle3");
        }
      }
    } else if (selectedBundle === null && bundles.length > 0) {
      // Initial fallback when no checkout data is available yet
      // console.log(
      //   "🔄 Setting initial bundle to bundle3 (no checkout data yet)"
      // );
      setSelectedBundle("bundle3");
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

      // Initialize with the third bundle variant from mappings (Best Value)
      const thirdVariant = variantMappings.bundle3;
      if (thirdVariant?.variantId) {
        init({
          storeId: pluginConfig.storeId,
          lineItems: [
            {
              variantId: thirdVariant.variantId,
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

  // Clear payment errors when user starts typing in card fields
  useEffect(() => {
    if (
      paymentError &&
      (watch("cardNumber") || watch("expiryDate") || watch("cvc"))
    ) {
      clearPaymentError();
    }
  }, [
    watch("cardNumber"),
    watch("expiryDate"),
    watch("cvc"),
    paymentError,
    clearPaymentError,
  ]);

  // Payment handler with comprehensive validation and error focus
  const handlePayment = async () => {
    console.log("💳 Payment button clicked - starting validation...");

    // Step 1: Validate address form first (using useAddress hook)
    const addressValid = addressForm.validateAll();
    console.log("📍 Address validation result:", addressValid);
    console.log(
      "📍 Address errors:",
      Object.fromEntries(
        Object.entries(addressForm.fields)
          .map(([key, field]) => [key, field.error])
          .filter(([, error]) => error)
      )
    );

    // Step 2: Validate ONLY card form fields (not address fields)
    const cardValid = await form.trigger(["cardNumber", "expiryDate", "cvc"]);
    console.log("💳 Card validation result:", cardValid);

    // Extract only card-related errors for focus logic
    const cardErrors = {
      cardNumber: errors.cardNumber,
      expiryDate: errors.expiryDate,
      cvc: errors.cvc,
    };
    console.log("💳 Card errors only:", cardErrors);

    // Step 3: Focus on first error field if validation fails
    if (!addressValid || !cardValid) {
      console.log("❌ Validation failed, focusing first error...");

      // Enhanced error focusing logic
      // Priority order: firstName, lastName, email, phone, address1, country, city, state, postal, cardNumber, expiryDate, cvc
      const addressFieldPriority: (keyof typeof addressForm.fields)[] = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "address1",
        "country",
        "city",
        "state",
        "postal",
      ];

      const cardFieldPriority: (keyof CardFormData)[] = [
        "cardNumber",
        "expiryDate",
        "cvc",
      ];

      let firstErrorField: string | null = null;

      // Check address form errors first (higher priority)
      for (const fieldName of addressFieldPriority) {
        if (addressForm.fields[fieldName]?.error) {
          firstErrorField = fieldName;
          break;
        }
      }

      // If no address errors, check card form errors
      if (!firstErrorField) {
        for (const fieldName of cardFieldPriority) {
          if (cardErrors[fieldName]) {
            firstErrorField = fieldName;
            break;
          }
        }
      }

      // Focus the first error field
      if (firstErrorField) {
        console.log(`🎯 Focusing first error field: ${firstErrorField}`);

        // Scroll to field and focus
        const scrollToField = () => {
          // Try data attribute selector first (for address fields)
          let fieldElement = document.querySelector(
            `[data-address-field="${firstErrorField}"]`
          ) as HTMLElement;

          // If not found, try card field selector
          if (!fieldElement) {
            fieldElement = document.querySelector(
              `[data-card-field="${firstErrorField}"]`
            ) as HTMLElement;
          }

          if (fieldElement) {
            // Scroll to the field with offset for mobile
            const yOffset = window.innerWidth < 768 ? -120 : -80; // More offset on mobile for sticky elements
            const y =
              fieldElement.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;

            window.scrollTo({ top: y, behavior: "smooth" });

            // Focus the field after scroll
            setTimeout(() => {
              fieldElement.focus();

              // Additional blur/focus cycle for better mobile keyboard activation
              if (window.innerWidth < 768) {
                setTimeout(() => {
                  fieldElement.blur();
                  setTimeout(() => fieldElement.focus(), 50);
                }, 100);
              }
            }, 300);
          }
        };

        // For card fields, use react-hook-form's setFocus as backup
        if (cardFieldPriority.includes(firstErrorField as keyof CardFormData)) {
          setFocus(firstErrorField as keyof CardFormData);
          // Also scroll to the field
          setTimeout(scrollToField, 100);
        } else {
          // For address fields, scroll directly
          scrollToField();
        }

        // Show error toast with field name
        const fieldDisplayNames: Record<string, string> = {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email Address",
          phone: "Phone Number",
          address1: "Street Address",
          country: "Country",
          city: "City",
          state: "State/Province",
          postal: "Zip/Postal Code",
          cardNumber: "Card Number",
          expiryDate: "Expiry Date",
          cvc: "CVC",
        };

        const displayName =
          fieldDisplayNames[firstErrorField] || firstErrorField;
        toast.error(`Please check the ${displayName} field`);
      } else {
        toast.error("Please check all required fields");
      }

      return;
    }

    console.log("✅ All validation passed, proceeding with payment...");

    // Make sure checkout session is ready
    if (!checkout?.checkoutSession?.id || !updateCustomerAndSessionInfo) {
      toast.error("Checkout session not ready. Please try again.");
      return;
    }

    // Get validated data from both forms
    const addressData = addressForm.getAddressObject();

    // 🐛 DEBUG: Check actual field values vs getAddressObject in payment handler
    console.log("🔍 DEBUG PAYMENT: Field values:", {
      country: addressForm.fields.country.value,
      state: addressForm.fields.state.value,
      stateIsEmpty: !addressForm.fields.state.value,
      stateLength: addressForm.fields.state.value?.length,
      availableStates: addressForm.states?.length || 0,
      countryName: addressForm.countries.find(
        (c) => c.code === addressForm.fields.country.value
      )?.name,
      stateName: addressForm.states.find(
        (s) => s.code === addressForm.fields.state.value
      )?.name,
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
        paymentAddressData.state && paymentAddressData.state.trim()
          ? paymentAddressData.state.trim()
          : "N/A",
    };

    console.log("✅ PAYMENT Using getAddressObject() - FIXED:", {
      originalState: paymentAddressData.state,
      enhancedState: enhancedPaymentData.state,
      country: enhancedPaymentData.country,
      countryName: addressForm.countries.find(
        (c) => c.code === enhancedPaymentData.country
      )?.name,
    });

    // Handle state requirement validation for specific countries
    const isStateRequired =
      addressForm.states.length > 0 ||
      ["US", "CA", "GB"].includes(enhancedPaymentData.country);
    if (isStateRequired && !enhancedPaymentData.state?.trim()) {
      toast.error("Please enter a state/province for the selected country.");
      // Focus state field
      const stateField = document.querySelector(
        `[data-address-field="state"]`
      ) as HTMLElement;
      if (stateField) {
        const yOffset = window.innerWidth < 768 ? -120 : -80;
        const y =
          stateField.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        setTimeout(() => stateField.focus(), 300);
      }
      return;
    }

    try {
      // ✅ NO REDUNDANT SAVE: Auto-save keeps data up-to-date
      // Data is already saved via saveCheckoutInfo (triggered by useAddress hook)
      console.log("✅ Proceeding with payment (auto-save keeps data current)");

      // Process payment using validated card data (address data handled by useAddress hook)
      const cardData = form.getValues();
      await processCardPayment(
        checkout.checkoutSession.id,
        {
          cardNumber: cardData.cardNumber.replace(/\s+/g, ""), // Remove spaces
          expiryDate: cardData.expiryDate,
          cvc: cardData.cvc,
        },
        {
          enableThreeds: true,
          initiatedBy: "customer", // SDK now defaults to customer
          source: "checkout", // Source is checkout for plugin usage
          onSuccess: () => {
            toast.success("Payment successful! 🎉");

            // Show success message with payment details
            const amount =
              checkout?.summary?.currency ||
              pluginConfig.defaultCurrency +
                " " +
                ((checkout?.summary?.totalAdjustedAmount || 0) / 100).toFixed(
                  2
                );

            toast.success(
              `Payment of ${amount} completed successfully! Your order is being processed.`,
              {
                duration: 5000,
              }
            );
          },
          onFailure: (errorMsg) => {
            toast.error(`Payment failed: ${errorMsg}`);
          },
          onRequireAction: () => {
            toast.loading(
              "Please complete the additional security verification..."
            );
          },
        }
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  // Instant bundle change with background update - now switches variants instead of quantities
  const handleBundleChange = async (bundleId: string) => {
    const selectedBundleData = bundles.find(
      (bundle: Bundle) => bundle.id === bundleId
    );

    if (!selectedBundleData) return;

    // Store the previous selection for potential rollback
    const previousSelection = selectedBundle;

    // 🚀 INSTANT UI UPDATE - Update immediately for responsive feel
    setSelectedBundle(bundleId);
    console.log(`🎯 Instantly switched UI to: ${bundleId}`);

    // Check if checkout session is available
    if (!checkout?.checkoutSession?.id || !updateLineItems) {
      console.warn(
        "Checkout session not ready, cannot update line items in background"
      );
      // Keep the UI updated even if we can't sync to backend yet
      return;
    }

    // Get the appropriate price ID based on subscription preference
    const variantId = selectedBundleData.variantId;
    const priceMapping =
      pluginConfig.prices[variantId as keyof typeof pluginConfig.prices];
    const priceId = subscribeAndSave
      ? priceMapping?.recurring
      : priceMapping?.oneTime;

    if (!priceId) {
      console.error(
        "No price found for variant:",
        variantId,
        "subscription:",
        subscribeAndSave
      );
      // Revert UI on critical error
      setSelectedBundle(previousSelection);
      toast.error("Price not available for this option. Please try again.");
      return;
    }

    // Mark as user-initiated update to prevent sync interference
    setIsUserInitiatedUpdate(true);

    // 🔄 BACKGROUND PROCESSING - Update backend without blocking UI
    setIsUpdating(true);

    try {
      const lineItems = [
        {
          variantId: selectedBundleData.variantId,
          priceId, // Pass the specific price ID for subscription or one-time
          quantity: 1, // Always quantity 1 since the deal is in the variant price
        },
      ];

      console.log("🔄 Background update started for:", bundleId, lineItems);

      // Perform the background update
      await updateLineItems(lineItems);

      console.log("✅ Background update completed successfully for:", bundleId);

      // Optional: Show subtle success feedback (not intrusive)
      // toast.success("Selection updated", { duration: 1500 });
    } catch (error) {
      console.error("❌ Background update failed for:", bundleId, error);

      // 🔄 ROLLBACK ON ERROR - Revert to previous selection
      setSelectedBundle(previousSelection);

      // Show error feedback
      toast.error("Failed to update selection. Please try again.");
    } finally {
      setIsUpdating(false);
      setIsUserInitiatedUpdate(false); // Clear flag after update completes
      console.log("🏁 Background update process completed for:", bundleId);
    }
  };

  // Handle subscription checkbox change
  const handleSubscriptionChange = async (checked: boolean) => {
    // Store the previous state for potential rollback
    const previousState = subscribeAndSave;

    // 🚀 INSTANT UI UPDATE - Update immediately for responsive feel
    setSubscribeAndSave(checked);
    console.log(
      `🎯 Instantly switched subscription to: ${
        checked ? "enabled" : "disabled"
      }`
    );

    // If we have a selected bundle, update it with the new pricing in background
    if (selectedBundle && checkout?.checkoutSession?.id && updateLineItems) {
      const selectedBundleData = bundles.find(
        (bundle: Bundle) => bundle.id === selectedBundle
      );
      if (!selectedBundleData) return;

      const variantId = selectedBundleData.variantId;
      const priceMapping =
        pluginConfig.prices[variantId as keyof typeof pluginConfig.prices];
      const priceId = checked ? priceMapping?.recurring : priceMapping?.oneTime;

      if (!priceId) {
        console.error(
          "No price found for variant:",
          variantId,
          "subscription:",
          checked
        );
        // Revert UI on critical error
        setSubscribeAndSave(previousState);
        toast.error("Price not available for this option. Please try again.");
        return;
      }

      // 🔄 BACKGROUND PROCESSING - Update backend without blocking UI
      setIsUpdating(true);

      try {
        const lineItems = [
          {
            variantId: selectedBundleData.variantId,
            priceId,
            quantity: 1,
          },
        ];

        console.log("🔄 Background subscription update started:", {
          checked,
          priceId,
        });

        // Perform the background update
        await updateLineItems(lineItems);

        console.log("✅ Background subscription update completed successfully");

        // Show success feedback
        const message = checked
          ? "Switched to subscription pricing! 💰"
          : "Switched to one-time purchase pricing.";
        toast.success(message, { duration: 2000 });
      } catch (error) {
        console.error("❌ Background subscription update failed:", error);

        // 🔄 ROLLBACK ON ERROR - Revert to previous state
        setSubscribeAndSave(previousState);

        // Show error feedback
        toast.error("Failed to update pricing. Please try again.");
      } finally {
        setIsUpdating(false);
        console.log("🏁 Background subscription update process completed");
      }
    } else {
      console.log(
        "🔄 Subscription state updated, no background sync needed yet"
      );
    }
  };

  // Handle order bump toggle
  const handleOrderBumpToggle = async (selected: boolean) => {
    console.log(
      `🎯 Instantly toggling order bump to: ${
        selected ? "selected" : "deselected"
      }`
    );

    // 🔄 BACKGROUND PROCESSING - Update backend without blocking UI
    try {
      const result = await toggleOrderBumpExpeditedShippingOffer(selected);

      if (result.success) {
        console.log("✅ Order bump background update completed successfully");

        // SDK automatically handles bidirectional refresh - no manual refresh needed! 🎉
        const message = selected
          ? "Expedited shipping added!"
          : "Expedited shipping removed!";
        toast.success(message, { duration: 2000 });
      } else {
        console.error("❌ Order bump update failed:", result);
        toast.error("Failed to update expedited shipping. Please try again.");
      }
    } catch (error) {
      console.error("❌ Order bump toggle failed:", error);
      toast.error("Failed to update expedited shipping. Please try again.");
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
            <h1 className="mb-4 text-xl font-semibold text-red-600">
              Checkout Error
            </h1>
            <p className="mb-4 text-gray-600">
              {error.message || String(error)}
            </p>
            <p className="text-sm text-gray-500">
              Please refresh the page to try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Safety check: Ensure addressForm.fields is defined
  if (!addressForm || !addressForm.fields) {
    console.error("❌ useAddress hook failed to initialize properly");
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading address form...</p>
        </div>
      </div>
    );
  }

  // Show loading indicator for payment processing
  const isLoading =
    isPaymentLoading || isUpdating || !checkout?.checkoutSession?.id;

  return (
    <div className="bg-gray-50 font-sans pb-20 lg:pb-0">
      <header className="bg-slate-800 p-3 text-center text-white">
        <div className="flex items-center justify-center gap-2">
          <Sun className="h-5 w-5 text-amber-400" />
          <p className="font-semibold">Limited Time Offer</p>
        </div>
        <p className="text-sm opacity-90">
          Enjoy a limited discount with{" "}
          <span className="font-semibold">FREE SHIPPING</span>. Limited
          inventory. <span className="underline">Sell Out Risk High.</span>
        </p>
      </header>

      <div className="bg-white py-4 border-b border-gray-100">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4">
          {pluginConfig.branding.storeLogo ? (
            <img
              src={pluginConfig.branding.storeLogo}
              alt={pluginConfig.branding.storeName}
              className="h-12 sm:h-16"
              style={{ maxWidth: "250px" }}
            />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Tagada
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                Pay
              </span>
            </span>
          )}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                <Lock className="h-3 w-3 text-emerald-600" />
                <p className="text-xs font-medium text-gray-700 sm:text-sm">
                  Secure Checkout
                </p>
              </div>
              <p className="text-xs text-gray-600 sm:text-sm">
                Support: {pluginConfig.branding.supportEmail}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-3 py-6 sm:px-4 md:px-8 lg:px-12 xl:px-24">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-5">
          {/* Left Column */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-3">
            <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800 sm:p-4 sm:text-base">
              <img
                src="/worldwide-shipping.webp"
                alt="Worldwide Shipping"
                width={28}
                height={28}
              />
              FREE Worldwide Shipping Included
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4 text-center text-sm font-medium text-orange-800 sm:p-4 sm:text-base">
              <img src="/warning.webp" alt="Warning" width={18} height={18} />
              Limited Time: Cart expires in {formatCartTimer(cartTimer)}
            </div>

            {/* Step 1 */}
            <div
              className={`space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-opacity duration-300 sm:space-y-6 sm:p-6 ${
                isLoading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <h2 className="text-lg font-semibold sm:text-xl text-gray-900">
                      Select Your Package
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 sm:text-base">
                    Choose the package that best fits your needs
                  </p>
                </div>
              </div>

              {/* Subscription Checkbox */}
              <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-4 mb-4">
                <Checkbox
                  id="subscribe-and-save"
                  checked={subscribeAndSave}
                  onCheckedChange={(checked) =>
                    handleSubscriptionChange(Boolean(checked))
                  }
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="subscribe-and-save"
                    className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-emerald-600">💰</span>
                    Subscribe & Save Money
                  </Label>
                </div>
              </div>
              <div className="flex justify-between px-2 text-xs font-medium text-gray-600 sm:px-4 sm:text-sm">
                <span>Package Details</span>
                <span>Price Per Unit</span>
              </div>

              {/* Show loading state while selectedBundle is null */}
              {selectedBundle === null ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="ml-2 text-gray-600">Loading packages...</p>
                </div>
              ) : (
                <RadioGroup
                  value={selectedBundle}
                  onValueChange={handleBundleChange}
                  className="space-y-4 sm:space-y-5"
                >
                  {bundles.map((bundle: Bundle) => (
                    <Label
                      key={bundle.id}
                      htmlFor={bundle.id}
                      className={`relative flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2 transition-all duration-200 sm:gap-3 sm:p-3 touch-manipulation ${
                        selectedBundle === bundle.id
                          ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
                      }`}
                    >
                      {bundle.bestValue && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <span className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm border border-emerald-500">
                            ⭐ Best Value
                          </span>
                        </div>
                      )}
                      <RadioGroupItem
                        value={bundle.id}
                        id={bundle.id}
                        className="border-2 w-5 h-5"
                      />
                      <div className="flex items-center gap-1 sm:gap-2">
                        {bundle.images.map((src: string, index: number) => (
                          <img
                            key={`${bundle.id}-image-${index}-${src}`}
                            src={src || "/placeholder.svg"}
                            alt={bundle.name}
                            width={80}
                            height={80}
                            className="rounded-md border border-gray-100 h-[80px] w-[80px] sm:h-[100px] sm:w-[100px]"
                          />
                        ))}
                      </div>
                      <div className="flex-grow">
                        <p className="text-base font-semibold sm:text-lg text-gray-900">
                          {bundle.name}
                        </p>
                        <p className="text-sm text-gray-600 sm:text-base">
                          {bundle.productName}
                        </p>
                        {bundle.variantName && (
                          <p className="text-xs text-gray-500 sm:text-sm">
                            {bundle.variantName}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold sm:text-2xl text-emerald-700">
                          {formatMoney(
                            Math.round(
                              (Number(bundle.totalPrice) || 0) / bundle.quantity
                            ),
                            String(
                              bundle.currency || pluginConfig.defaultCurrency
                            )
                          )}
                        </p>
                        <p className="text-sm text-gray-500">per unit</p>
                        <p className="text-sm font-medium text-emerald-600">
                          + Free Shipping
                        </p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </div>

            <p className="text-center text-sm font-medium text-orange-700 sm:text-base bg-orange-50 border border-orange-200 rounded-lg py-3">
              Limited stock: Only 15 units remaining
            </p>

            {/* Expedited Shipping Order Bump Section */}
            <div
              className={`relative rounded-xl border-2 p-5 transition-all duration-300 shadow-sm cursor-pointer select-none sm:p-6 touch-manipulation ${
                orderBumpExpeditedShippingSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-200"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:shadow-sm active:scale-[0.98]"
              }`}
              onClick={() =>
                handleOrderBumpToggle(!orderBumpExpeditedShippingSelected)
              }
            >
              <div className="absolute -top-2 -right-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Add-on
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="flex h-7 w-7 items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    id="order-bump-expedited-shipping"
                    checked={orderBumpExpeditedShippingSelected}
                    onCheckedChange={(checked) =>
                      handleOrderBumpToggle(!!checked)
                    }
                    className={`h-6 w-6 border-2 transition-all duration-200 ${
                      orderBumpExpeditedShippingSelected
                        ? "border-emerald-500 bg-emerald-500 data-[state=checked]:bg-emerald-500"
                        : "border-slate-400 hover:border-slate-500 data-[state=checked]:bg-slate-500"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={`rounded-full p-1 ${
                        orderBumpExpeditedShippingSelected
                          ? "bg-emerald-500"
                          : "bg-slate-500"
                      }`}
                    >
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <span
                      className={`text-base font-semibold tracking-wide ${
                        orderBumpExpeditedShippingSelected
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      🚚 Expedited Shipping
                    </span>
                    {orderBumpExpeditedShippingSelected && (
                      <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                        ✓ Added
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      ⚡ Get Your Order Faster
                    </h4>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Upgrade to{" "}
                      <span className="font-medium text-slate-700">
                        Expedited Shipping
                      </span>{" "}
                      and receive your order in record time.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Priority order processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Faster delivery times</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Tracking included</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Dedicated shipping support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 - Customer Information */}
            <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:space-y-6 sm:p-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <h2 className="text-lg font-semibold sm:text-xl text-gray-900">
                  Customer Information
                </h2>
              </div>
              {/* 🚀 NEW: Using useAddress hook for cleaner form handling */}
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <Input
                    value={addressForm.fields.firstName.value}
                    onChange={(e) =>
                      addressForm.setValue("firstName", e.target.value)
                    }
                    placeholder="First Name*"
                    className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                      addressForm.fields.firstName.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                    data-address-field="firstName"
                  />
                  {addressForm.fields.firstName.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.firstName.error}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    value={addressForm.fields.lastName.value}
                    onChange={(e) =>
                      addressForm.setValue("lastName", e.target.value)
                    }
                    placeholder="Last Name*"
                    className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                      addressForm.fields.lastName.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                    data-address-field="lastName"
                  />
                  {addressForm.fields.lastName.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.lastName.error}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    value={addressForm.fields.email.value}
                    onChange={(e) =>
                      addressForm.setValue("email", e.target.value)
                    }
                    type="email"
                    placeholder="Email Address*"
                    className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                      addressForm.fields.email.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                    data-address-field="email"
                  />
                  {addressForm.fields.email.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.email.error}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    value={addressForm.fields.phone.value}
                    onChange={(e) =>
                      addressForm.setValue("phone", e.target.value)
                    }
                    type="tel"
                    placeholder="Phone number*"
                    className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                      addressForm.fields.phone.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                    data-address-field="phone"
                  />
                  {addressForm.fields.phone.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.phone.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mt-6">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <h2 className="text-lg font-semibold sm:text-xl text-gray-900">
                  Shipping Information
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  {/* 🚀 NEW: Google Places autocomplete powered address input */}
                  <Input
                    ref={addressForm.addressRef}
                    value={addressForm.addressInputValue}
                    onChange={(e) => {
                      console.log(
                        `📝 Manual address typing: ${e.target.value}`
                      );
                      if (addressForm.handleAddressChange) {
                        addressForm.handleAddressChange(e);
                      }
                    }}
                    onBlur={() => {}}
                    placeholder="Street address*"
                    className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                      addressForm.fields.address1.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                    data-address-field="address1"
                  />

                  {addressForm.fields.address1.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.address1.error}
                    </p>
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
                      addressForm.setValue("country", value);
                    }}
                    placeholder="Country*"
                    error={!!addressForm.fields.country.error}
                    data-address-field="country"
                  />
                  {addressForm.fields.country.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.country.error}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Input
                      value={addressForm.fields.city.value}
                      onChange={(e) =>
                        addressForm.setValue("city", e.target.value)
                      }
                      placeholder="City*"
                      className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                        addressForm.fields.city.error
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                      data-address-field="city"
                    />
                    {addressForm.fields.city.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.city.error}
                      </p>
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
                          addressForm.setValue("state", value);
                        }}
                        placeholder="State / Province*"
                        error={!!addressForm.fields.state.error}
                        data-address-field="state"
                      />
                    ) : (
                      <Input
                        value={addressForm.fields.state.value}
                        onChange={(e) => {
                          addressForm.setValue("state", e.target.value);
                        }}
                        placeholder={`State / Province* (${
                          addressForm.fields.country.value
                            ? `No states defined for ${addressForm.fields.country.value}`
                            : "Enter manually"
                        })`}
                        className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                          addressForm.fields.state.error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                        data-address-field="state"
                      />
                    )}
                    {addressForm.fields.state.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.state.error}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      value={addressForm.fields.postal.value}
                      onChange={(e) =>
                        addressForm.setValue("postal", e.target.value)
                      }
                      placeholder="Zip / Postcode*"
                      className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                        addressForm.fields.postal.error
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                      data-address-field="postal"
                    />
                    {addressForm.fields.postal.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.postal.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-2">
            <div
              ref={paymentSectionRef}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Secure Payment
                </h3>
              </div>
              <p className="mb-5 text-sm text-gray-600 flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                All transactions are secure and encrypted with 256-bit SSL.
              </p>

              {/* Payment Error Display */}
              {paymentError && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4">
                  <p className="text-sm text-red-600">{paymentError}</p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-t-lg border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-600 sm:h-4 sm:w-4" />
                  <span className="text-sm font-medium sm:text-base">
                    Credit/Debit Card
                  </span>
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
              <div className="space-y-4 rounded-b-lg border border-t-0 border-gray-200 p-4 sm:p-5">
                <div>
                  <Input
                    value={watch("cardNumber")}
                    placeholder="Card number*"
                    className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                      errors.cardNumber
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                    maxLength={19}
                    onChange={(e) =>
                      setValue("cardNumber", formatCardNumber(e.target.value))
                    }
                    data-card-field="cardNumber"
                  />
                  {errors.cardNumber && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.cardNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={watch("expiryDate")}
                      placeholder="MM/YY*"
                      className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                        errors.expiryDate
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                      maxLength={5}
                      onChange={(e) =>
                        setValue("expiryDate", formatExpiryDate(e.target.value))
                      }
                      data-card-field="expiryDate"
                    />
                    {errors.expiryDate && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.expiryDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      value={watch("cvc")}
                      placeholder="CVC*"
                      className={`h-14 rounded-lg border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all ${
                        errors.cvc
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                      maxLength={4}
                      onChange={(e) =>
                        setValue("cvc", e.target.value.replace(/\D/g, ""))
                      }
                      data-card-field="cvc"
                    />
                    {errors.cvc && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.cvc.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 mt-5 w-full py-7 text-lg font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md sm:mt-6 sm:py-8 sm:text-xl touch-manipulation ${
                  isPaymentLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={handlePayment}
                disabled={isPaymentLoading}
                style={{ minHeight: "72px" }}
              >
                {isPaymentLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white sm:h-6 sm:w-6"></div>
                    Processing Payment...
                  </div>
                ) : (
                  "Complete Purchase"
                )}
              </Button>
              <div className="mt-4 space-y-3 text-center">
                <p className="text-sm text-gray-600 font-medium">
                  90-Day Money Back Guarantee
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  <span>SSL Secured</span>
                  <span>•</span>
                  <span>256-bit Encryption</span>
                  <span>•</span>
                  <span>Norton Verified</span>
                </div>
              </div>
              <p className="my-4 text-center text-xs text-gray-500">
                By completing the payment, you agree to our Terms of Service and
                Refund Policy.
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
              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-500 sm:text-sm">
                <Lock className="h-3 w-3 text-emerald-600 sm:h-4 sm:w-4" />
                Secure 256-bit SSL encryption
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <img
                src="https://img.funnelish.com/9938/69802/1678959839-op.webp"
                alt="90 Day Guarantee"
                width={80}
                height={80}
                className="sm:h-[100px] sm:w-[100px]"
              />
              <div>
                <h4 className="text-base font-semibold sm:text-lg text-emerald-800">
                  90-Day Money Back Guarantee
                </h4>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  If you are not completely satisfied with your purchase, we
                  offer a 90-day guarantee on all purchases. Simply contact our
                  customer support for a full refund or replacement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 📱 Mobile Sticky Payment Button */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
          <div className="p-4">
            <div className="flex items-center justify-center gap-2 mb-3 text-xs text-gray-600">
              <span className="text-emerald-600 font-medium">
                FREE Shipping
              </span>
              <span>•</span>
              <span>90-Day Guarantee</span>
              <span>•</span>
              <span>SSL Secured</span>
            </div>
            <Button
              className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-full py-4 text-lg font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation ${
                isPaymentLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={handlePayment}
              disabled={isPaymentLoading}
              style={{ minHeight: "56px" }}
            >
              {isPaymentLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Complete Purchase
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <footer className="mt-8 bg-gray-100 py-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-12 xl:px-24">
          <div className="text-center">
            <div className="mb-6">
              <img
                src="/logo-nbackground.png"
                alt={pluginConfig.branding.storeName}
                className="mx-auto h-10 sm:h-12"
                style={{ maxWidth: "240px" }}
              />
            </div>
            <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600 sm:gap-6">
              <a
                href="#terms"
                className="hover:text-blue-600 transition-colors"
              >
                Terms & Conditions
              </a>
              <a
                href="#privacy"
                className="hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#wireless"
                className="hover:text-blue-600 transition-colors"
              >
                Wireless Policy
              </a>
            </div>
            <div className="text-center text-sm leading-relaxed text-gray-600">
              <p className="mb-2">
                © 2025 / {pluginConfig.branding.storeName} / All rights
                reserved.
              </p>
              <p className="text-base font-medium">
                {pluginConfig.branding.supportEmail}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
