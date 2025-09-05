import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  formatCardNumber,
  formatExpiryDate,
} from "@/lib/utils/card-formatting";
import { PluginConfig } from "@/src/types/plugin-config";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatMoney,
  useCheckout,
  useGoogleAutocomplete,
  useISOData,
  useOrderBump,
  usePayment,
  usePluginConfig,
  useProducts,
  type GooglePrediction,
} from "@tagadapay/plugin-sdk/react";
import { Lock } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

// Custom CardRadioGroupItem component

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
  productName: string;
  variantName: string;
  currency: string;
  dealType: string;
  bestSelling: boolean;
  bestValue: boolean;
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

type CheckoutPageProps = {
  checkoutToken: string;
};

export default function CheckoutPage({ checkoutToken }: CheckoutPageProps) {
  const [isInitFailed, setIsInitFailed] = useState(false);
  const { config: pluginConfig, storeId } = usePluginConfig<PluginConfig>();

  const [selectedBundle, setSelectedBundle] = useState<string | null>(null); // Start with null, derive from data
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUserInitiatedUpdate, setIsUserInitiatedUpdate] = useState(false);

  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!paymentSectionRef.current) return;

      const rect = paymentSectionRef.current.getBoundingClientRect();
    };

    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

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

  // ✅ MEMOIZE: Create variant mappings once and memoize
  const variantMappings = useMemo(() => {
    const baseVariant = getVariant(pluginConfig.variants.regular);
    const bogoVariant = getVariant(pluginConfig.variants.bogo);
    const specialVariant = getVariant(pluginConfig.variants.special);

    return {
      bundle1: {
        quantity: 1,
        variantId: pluginConfig.variants.regular,
        name: baseVariant?.variant.name || "Buy 1 Regular Price",
        dealType: "regular",
        variant: baseVariant?.variant,
        product: baseVariant?.product,
      },
      bundle2: {
        quantity: 3,
        variantId: pluginConfig.variants.bogo,
        name: bogoVariant?.variant.name || "Buy 1 Get 1 Free (BOGO)",
        dealType: "bogo",
        variant: bogoVariant?.variant,
        product: bogoVariant?.product,
      },
      bundle3: {
        quantity: 5,
        variantId: pluginConfig.variants.special,
        name: specialVariant?.variant.name || "Buy 1 Get 2 Free",
        dealType: "special",
        variant: specialVariant?.variant,
        product: specialVariant?.product,
      },
    };
  }, [getVariant]); // Only depend on getVariant function

  // Keep the TagadaPay SDK integration
  const {
    checkout,
    error,
    updateLineItems,
    updateCustomerAndSessionInfo,
    init,
    isLoading: isCheckoutLoading,
  } = useCheckout({
    checkoutToken, // Use the explicit token passed as prop
  });

  const {
    predictions,
    searchPlaces,
    getPlaceDetails,
    extractAddressComponents,
    clearPredictions,
  } = useGoogleAutocomplete({
    apiKey: pluginConfig.googleApiKey,
    language: "en",
  });

  // Track if we've initialized the form to prevent overwriting user input
  const hasInitializedForm = useRef(false);

  // 🚀 AUTO-SAVE: Now handled by useAddress hook automatically!

  // Google Autocomplete state and handlers
  const { countries, getRegions, mapGoogleToISO } = useISOData();

  // State for address autocomplete
  const [addressInput, setAddressInput] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableStates, setAvailableStates] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);

  const saveCheckoutInfo = useCallback(
    async (addressData: CheckoutFormData) => {
      if (!checkout?.checkoutSession?.id) {
        return;
      }

      // If no data passed, skip (this will be called from useAddress hook with data)
      if (!addressData) {
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

        // Only save if we have meaningful data (reduce the threshold to allow more auto-saves)
        if (
          !enhancedAddressData.email &&
          !enhancedAddressData.firstName &&
          !enhancedAddressData.address1 &&
          !enhancedAddressData.country
        ) {
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
      } catch (error) {
        console.error("❌ Failed to auto-save checkout info:", error);
        // Don't show error toast for auto-save failures to avoid annoying the user
      }
    },
    [checkout?.checkoutSession?.id, updateCustomerAndSessionInfo]
  );

  // 🚀 NEW: Address form hook with comprehensive countries/states and validation

  const checkoutFormSchema = z.object({
    // Personal information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone number is required"),

    // Address information
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Province is required"),
    postal: z.string().min(1, "Postal code is required"),
    country: z.string().min(2, "Country is required"),

    // Card information
    cardNumber: z
      .string()
      .min(15, "Valid card number is required")
      .transform((val) => val.replace(/\s/g, "")),
    expiryDate: z
      .string()
      .regex(/^\d{2}\/\d{2}$/, "Valid expiry date (MM/YY) is required"),
    cvc: z.string().min(3, "Valid CVC is required"),
  });

  type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postal: "",
      country: "",
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

  // Auto-save form data when fields change with 2-second debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const subscription = watch((value) => {
      // Clear any existing timeout
      clearTimeout(timeoutId);

      // Only save if we have meaningful data
      if (
        value.firstName ||
        value.lastName ||
        value.email ||
        value.phone ||
        value.address1 ||
        value.country
      ) {
        // Debounce the save call by 2 seconds
        timeoutId = setTimeout(() => {
          saveCheckoutInfo(value as CheckoutFormData);
        }, 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [watch, saveCheckoutInfo]);

  // Prefill form with checkout session data when it loads
  useEffect(() => {
    if (checkout?.checkoutSession && !hasInitializedForm.current) {
      const session = checkout.checkoutSession;
      const customer = session.customer;
      const shipping = session.shippingAddress;

      // Use setValue to update multiple fields at once (this won't trigger auto-save per field)
      form.setValue("firstName", customer?.firstName || "");
      form.setValue("lastName", customer?.lastName || "");
      form.setValue("email", customer?.email || "");
      form.setValue("phone", shipping?.phone || "");
      form.setValue("country", shipping?.country || "");
      form.setValue("address1", shipping?.address1 || "");
      form.setValue("address2", shipping?.address2 || "");
      form.setValue("city", shipping?.city || "");
      form.setValue("state", shipping?.state || shipping?.province || "");
      form.setValue("postal", shipping?.postal || "");

      // Mark as initialized
      hasInitializedForm.current = true;
    }
  }, [checkout?.checkoutSession, form]);

  // ✅ FIXED: Update address form values when checkout data loads (but don't trigger auto-save)
  // useEffect(() => {
  //   if (checkout?.checkoutSession && !hasInitializedForm.current && addressForm) {
  //     const session = checkout.checkoutSession;
  //     const customer = session.customer;
  //     const shipping = session.shippingAddress;

  //     // Use setValues to update multiple fields at once (this won't trigger auto-save per field)
  //     .setValues({
  //       firstName: customer?.firstName || '',
  //       lastName: customer?.lastName || '',
  //       email: customer?.email || '',
  //       phone: shipping?.phone || '',
  //       country: shipping?.country || '',
  //       address1: shipping?.address1 || '',
  //       address2: shipping?.address2 || '',
  //       city: shipping?.city || '',
  //       state: shipping?.state || shipping?.province || '',
  //       postal: shipping?.postal || '',
  //     });

  //     // Mark as initialized
  //     hasInitializedForm.current = true;
  //   }
  // }, [checkout?.checkoutSession, addressForm]);

  // ✅ FIXED: Added addressForm back but with proper guard

  // Note: Auto-save is now handled directly by the useAddress hook!
  // No need for complex detection logic - the hook calls saveCheckoutInfo
  // automatically when fields change (both manual and Google Places)

  // Watch country changes to update available states
  const watchedCountry = watch("country");

  useEffect(() => {
    if (watchedCountry) {
      setSelectedCountry(watchedCountry);
      setIsCountrySelected(true);

      const states = getRegions(watchedCountry);
      const mappedStates = states.map((state: any) => ({
        code: state.iso,
        name: state.name,
      }));
      setAvailableStates(mappedStates || []);

      // Clear dependent fields when country changes
      const currentState = watch("state");
      if (
        currentState &&
        !mappedStates?.find((s: any) => s.code === currentState)
      ) {
        setValue("state", "");
      }

      // Clear address fields when country changes to force re-entry with new country restriction
      setValue("address1", "");
      setValue("city", "");
      setValue("postal", "");
      setAddressInput("");
      setShowPredictions(false);
    } else {
      setIsCountrySelected(false);
      setSelectedCountry("");
      setAvailableStates([]);
    }
  }, [watchedCountry, getRegions, setValue, watch]);

  // ✅ REAL SDK ORDER BUMP HOOK - Uses proper API routing via SDK toggleOrderBump method

  // Address autocomplete handlers
  const handleAddressInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isCountrySelected) {
        return; // Don't allow address input without country selection
      }

      const value = e.target.value;
      setAddressInput(value);
      setValue("address1", value);

      if (value.length >= 3 && selectedCountry) {
        searchPlaces(value, selectedCountry);
        setShowPredictions(true);
      } else {
        setShowPredictions(false);
        clearPredictions();
      }
    },
    [
      searchPlaces,
      setValue,
      selectedCountry,
      isCountrySelected,
      clearPredictions,
    ]
  );

  const handlePredictionSelect = useCallback(
    async (prediction: GooglePrediction) => {
      setAddressInput(prediction.description);
      setShowPredictions(false);

      // Get detailed place information
      const placeDetails = await getPlaceDetails(prediction.place_id);

      if (placeDetails) {
        const extracted = extractAddressComponents(placeDetails);

        // Update form with extracted address components
        const address1 = `${extracted.streetNumber} ${extracted.route}`.trim();
        setValue("address1", address1);
        setValue("city", extracted.locality);
        setValue("postal", extracted.postalCode);

        // Use mapGoogleToISO to properly convert Google state to ISO format
        const mappedState = mapGoogleToISO(
          extracted.administrativeAreaLevel1,
          extracted.administrativeAreaLevel1Long,
          selectedCountry
        );

        if (mappedState) {
          setValue("state", mappedState.iso);
        } else {
          setValue("state", extracted.administrativeAreaLevel1);
        }

        // Only update country if it matches the selected country (for consistency)
        if (extracted.country === selectedCountry) {
          setValue("country", extracted.country);
        }
      }
    },
    [
      getPlaceDetails,
      extractAddressComponents,
      setValue,
      selectedCountry,
      mapGoogleToISO,
    ]
  );

  // Handle country selection change with user feedback
  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const countryCode = e.target.value;
      setValue("country", countryCode);

      if (countryCode && !isCountrySelected) {
        // Show a helpful message when country is first selected
        toast.success("Great! Now you can enter your address details below.");
      }
    },
    [setValue, isCountrySelected]
  );

  const { isSelected, toggle } = useOrderBump({
    offerId: pluginConfig.upsellId,
    orderBumpType: "primary",
    checkoutSessionId: checkout?.checkoutSession?.id,
    autoPreview: true,
  });

  // Get current item data from checkout
  const firstItem = checkout?.summary?.items?.[0];
  const currentVariantId = checkout?.checkoutSession?.sessionLineItems.find(
    (lineItem) => lineItem.isOrderBump === false
  )?.variantId;

  // ✅ MEMOIZE: Helper function to get price for variant
  const getPriceForVariant = useCallback(
    (variantId: string, currency: string) => {
      const priceMapping =
        pluginConfig.prices[variantId as keyof typeof pluginConfig.prices];
      if (!priceMapping) return 0;

      const priceId = priceMapping;

      // Find the variant data to get price info
      const variantData = Object.values(variantMappings).find(
        (v) => v.variantId === variantId
      );
      const price = variantData?.variant?.prices?.find((p) => p.id === priceId);

      return price?.currencyOptions?.[currency]?.amount || 0;
    },
    [variantMappings]
  );

  // ✅ MEMOIZE: Create bundles based on variant mappings and checkout data
  const createBundles = useCallback(
    (item: CheckoutItem | undefined): Bundle[] => {
      const currency = item?.currency || pluginConfig.defaultCurrency;
      const productName = item?.name || "Product";

      return [
        {
          id: "bundle1",
          variantId: variantMappings.bundle1.variantId,
          name: variantMappings.bundle1.name,
          quantity: variantMappings.bundle1.quantity,
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
          productName: variantMappings.bundle1.product?.name || productName,
          variantName: variantMappings.bundle1.variant?.name || "Regular",
          currency,
          dealType: "regular",
          bestValue: false,
          bestSelling: false,
        },
        {
          id: "bundle2",
          variantId: variantMappings.bundle2.variantId,
          name: variantMappings.bundle2.name,
          quantity: variantMappings.bundle2.quantity,
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
          bestSelling: true,
        },
        {
          id: "bundle3",
          variantId: variantMappings.bundle3.variantId,
          name: variantMappings.bundle3.name,
          quantity: variantMappings.bundle3.quantity,
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
          bestSelling: false,
        },
      ];
    },
    [variantMappings, getPriceForVariant]
  );

  // Recalculate bundles when subscription state changes
  const bundles = useMemo(
    () => createBundles(firstItem),
    [firstItem, , variantMappings, getPriceForVariant]
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
      setSelectedBundle("bundle3");
    }
  }, [currentVariantId, bundles.length]); // ✅ FIXED: Added selectedBundle back to deps

  // ✅ FIXED: Initialize checkout programmatically when no token is provided
  useEffect(() => {
    if (
      !checkoutToken &&
      !checkout &&
      init &&
      !hasInitializedRef.current &&
      isInitFailed === false
    ) {
      hasInitializedRef.current = true;

      // Initialize with the third bundle variant from mappings (Best Value)
      const thirdVariant = variantMappings.bundle3;
      if (thirdVariant?.variantId) {
        init({
          storeId,
          lineItems: [
            {
              variantId: thirdVariant.variantId,
              quantity: thirdVariant.quantity,
            },
          ],
        }).catch(() => {
          setIsInitFailed(true);
        });
      }
    }
  }, [checkoutToken, checkout, init, variantMappings.bundle3.variantId]); // ✅ FIXED: Only depend on specific property

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
    // Step 1: Validate address form first (using useAddress hook)
    const addressValid = form.trigger([
      "firstName",
      "lastName",
      "email",
      "phone",
      "address1",
      "country",
      "city",
      "state",
      "postal",
    ]);
    // Step 2: Validate ONLY card form fields (not address fields)
    const cardValid = await form.trigger(["cardNumber", "expiryDate", "cvc"]);

    // Extract only card-related errors for focus logic
    const cardErrors = {
      cardNumber: errors.cardNumber,
      expiryDate: errors.expiryDate,
      cvc: errors.cvc,
    };

    // Step 3: Focus on first error field if validation fails
    if (!addressValid || !cardValid) {
      // Enhanced error focusing logic
      // Priority order: firstName, lastName, email, phone, address1, country, city, state, postal, cardNumber, expiryDate, cvc
      const addressFieldPriority: (keyof CheckoutFormData)[] = [
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

      let firstErrorField: string | number | null = null;

      // Check address form errors first (higher priority)
      for (const fieldName of addressFieldPriority) {
        if (errors[fieldName]) {
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

    // Make sure checkout session is ready
    if (!checkout?.checkoutSession?.id || !updateCustomerAndSessionInfo) {
      toast.error("Checkout session not ready. Please try again.");
      return;
    }

    // Get validated data from both forms
    const addressData = form.getValues();

    // ✅ Use getAddressObject() - now fixed and working correctly
    const paymentAddressData = form.getValues();

    // Enhanced validation for state field
    const enhancedPaymentData = {
      ...paymentAddressData,
      state:
        paymentAddressData.state && paymentAddressData.state.trim()
          ? paymentAddressData.state.trim()
          : "N/A",
    };

    // Handle state requirement validation for specific countries
    const isStateRequired = ["US", "CA", "GB"].includes(
      enhancedPaymentData.country
    );
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

  const originalPricePerUnit = bundles[0]?.originalPrice || 0;

  console.log(bundles);

  // Debounced updateLineItems function to prevent excessive API calls
  const debouncedUpdateLineItems = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (lineItems: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (!checkout?.checkoutSession?.id || !updateLineItems) {
            console.warn(
              "Checkout session not ready, cannot update line items"
            );
            return;
          }

          try {
            await updateLineItems(lineItems);
          } catch (error) {
            console.error("❌ Debounced update failed:", error);
            // Don't show toast here as this is a background sync
          }
        }, 1500); // 500ms delay
      };
    })(),
    [checkout?.checkoutSession?.id, updateLineItems]
  );

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
    const priceId = priceMapping;

    if (!priceId) {
      console.error("No price found for variant:", variantId, "subscription:");
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
          quantity: selectedBundleData.quantity, // Always quantity 1 since the deal is in the variant price
        },
      ];

      // Use debounced update instead of immediate update
      debouncedUpdateLineItems(lineItems);

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
    }
  };

  // Show error state for products
  if (productsError) {
    // console.warn("Products loading error:", productsError);
    // Continue with fallback data instead of blocking
  }

  // Only show error state for critical checkout errors (not loading state)
  if (error || isInitFailed) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="mb-4 text-xl font-semibold text-red-600">
              Checkout Error
            </h1>
            {error && (
              <p className="mb-4 text-gray-600">
                {error.message || String(error)}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Please refresh the page to try again.
            </p>
            <p className="text-sm text-gray-500">
              Please refresh the page to try again. If it doesn't work, contact
              support at {pluginConfig.contactEmail}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Safety check: Ensure form is defined
  if (!form) {
    console.error("❌ useAddress hook failed to initialize properly");
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
  const isLoading =
    isPaymentLoading || isUpdating || !checkout?.checkoutSession?.id;

  if (!checkoutToken && !checkout) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <svg
          className="mb-2 h-8 w-8 animate-spin text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span className="text-sm text-gray-500">Loading checkout...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={pluginConfig.logoUrl}
                alt={pluginConfig.companyName}
                className="h-8 w-auto"
              />
            </div>
            <img
              src="/ssl-secure.webp"
              alt={pluginConfig.header?.sslBadgeText || "SSL Secure"}
              className="h-12 w-auto"
            />
            <div className="text-right">
              <p className="text-[25px] font-bold leading-[37.5px] text-[rgb(48,48,48)]">
                <strong>
                  {pluginConfig.header?.contactUsLabel || "Contact Us:"}
                </strong>
              </p>
              <p className="font-normal text-slate-900">
                {pluginConfig.contactEmail}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="mx-auto mt-5 max-w-[1170px] border-[2.4px] border-dashed border-black bg-white"
        style={{ boxShadow: "none" }}
      >
        <div className="flex flex-col items-center justify-between p-5 lg:flex-row">
          {/* Left: Product Image and Icons */}
          <div className="flex w-full flex-shrink-0 flex-col items-center lg:w-[45%]">
            <img
              src="/product-pic.png"
              alt="Bottle"
              className="ratio-square z-10 max-w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2"
            />
          </div>

          {/* Right: Text Content */}
          <div className="flex w-full flex-col items-start lg:w-[55%]">
            <div className="box-border block whitespace-break-spaces break-words text-center font-['Roboto','Arial',sans-serif] text-[24px] font-bold leading-[40px] text-[#303030] sm:text-[40px]">
              {pluginConfig.hero.title}
            </div>
            <ul className="mt-6 space-y-4">
              {pluginConfig.hero.subtitles.map((subtitle, idx) => (
                <li className="flex items-center" key={idx}>
                  <span className="font-['Roboto'] text-[22px] text-[rgb(48,48,48)]">
                    ✅{" "}
                    <strong className="font-bold leading-[22px]">
                      {subtitle.strong}
                    </strong>
                    <span className="font-normal leading-[22px]">
                      {": "}
                      {subtitle.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1170px] px-0 py-8 sm:py-10 md:py-12">
        <div className="w-full min-w-0 overflow-x-auto">
          <div className="grid min-w-0 max-w-full gap-4 lg:grid-cols-2">
            {/* Step 1: Package Selection */}
            <Card className="w-full min-w-0 rounded-none border-0 shadow-lg">
              <CardHeader className="rounded-none px-2.5">
                {/* Discount badge and text in a row, matching screenshot */}
                <div className="flex w-full min-w-0 items-center gap-1 py-2">
                  <div className="flex flex-shrink-0 items-center justify-center">
                    <div className="size-25 flex flex-col items-center justify-center rounded-full bg-red-600 text-4xl font-extrabold text-white shadow-lg">
                      {pluginConfig.discountPercentage}%
                      <span className="block text-4xl font-bold leading-none">
                        OFF
                      </span>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col justify-center text-center">
                    <p className="text-2xl font-extrabold leading-[24px] leading-tight text-red-600">
                      {(
                        pluginConfig.texts?.discountApplied ||
                        "Your {discount}% OFF Discount Has Been Applied"
                      ).replace(
                        "{discount}",
                        String(pluginConfig.discountPercentage)
                      )}
                    </p>
                    <p className="mt-1 text-2xl font-semibold leading-[24px] text-gray-800">
                      {pluginConfig.texts?.bulkDiscountNotice ||
                        "Your Order Qualifies for Bulk Discount."}
                    </p>
                  </div>
                </div>
                <CardTitle className="mt-[30px] border-b border-[rgb(220,220,220)] p-[5px] text-[22px] font-bold leading-[24px]">
                  {pluginConfig.steps?.step1Title ||
                    "STEP 1: SELECT ORDER QUANTITY"}
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full rounded-none p-3 pt-0">
                <div className="space-y-4 overflow-hidden">
                  {bundles.map((bundle) => (
                    <div
                      onClick={() => {
                        handleBundleChange(bundle.id);
                      }}
                      key={bundle.id}
                      id={bundle.id}
                      className={cn(
                        "relative mb-2.5 flex w-full cursor-pointer flex-row items-center gap-1 rounded-none border border-gray-300 bg-white p-4 shadow-sm transition-all last:mb-0 hover:bg-slate-50 max-sm:px-0.5 sm:gap-4",
                        {
                          "bg-[rgb(254,197,0)] hover:bg-[rgb(254,197,0)]/80":
                            bundle.bestSelling,
                        }
                      )}
                      style={{ minWidth: 0 }}
                    >
                      {/* BEST SELLING / BEST VALUE badge */}

                      {/* Custom Radio Button */}
                      <label className="flex flex-shrink-0 cursor-pointer select-none items-center">
                        <input
                          type="radio"
                          checked={selectedBundle === bundle.id}
                          onChange={() => handleBundleChange(bundle.id)}
                          className="sr-only"
                          aria-label={`Select ${bundle.quantity} ${bundle.productName}`}
                        />
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                            selectedBundle === bundle.id
                              ? "border-blue-500 bg-white"
                              : "border-gray-400 bg-white"
                          }`}
                        >
                          {selectedBundle === bundle.id && (
                            <span className="block h-3 w-3 rounded-full bg-blue-500" />
                          )}
                        </span>
                      </label>
                      {/* Product Image */}
                      <img
                        src={bundle.images[0]}
                        alt={bundle.productName}
                        className="h-16 w-16 max-w-[4rem] flex-shrink-0 rounded-none border border-gray-200 bg-white object-contain max-sm:mr-2"
                        style={{ height: "4rem", width: "4rem", minWidth: 0 }}
                      />
                      {/* Product Info */}
                      <div className="flex w-full flex-col gap-1">
                        {(bundle.bestSelling || bundle.bestValue) && (
                          <span className="w-fit rounded-none bg-red-600 px-2.5 py-px text-xs font-bold uppercase text-white shadow">
                            {bundle.bestSelling
                              ? pluginConfig.labels?.bestSelling ||
                                "BEST SELLING"
                              : pluginConfig.labels?.bestValue || "BEST VALUE"}
                          </span>
                        )}
                        <div className="flex w-full flex-row items-center gap-2">
                          <div className="flex flex-1 flex-col items-start gap-2">
                            <span className="break-words text-lg font-normal text-gray-900">
                              {bundle.quantity} {bundle.productName}
                              {bundle.quantity > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex flex-wrap items-center gap-2 break-words text-right text-lg font-bold text-gray-900">
                              {formatMoney(bundle.totalPrice)}{" "}
                              {pluginConfig.labels?.each || "Each"}
                            </div>
                            {bundle.id === "bundle1" && (
                              <span className="flex items-center text-right text-xs font-semibold text-yellow-700">
                                {pluginConfig.labels?.starterDoseOnly ||
                                  "⚠️ Starter dose only"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* TUDCA Add-on */}
            <div className="w-full min-w-0 space-y-4 border-[9.6px] border-[rgb(48,48,48)] sm:space-y-6 md:space-y-8">
              {/* Contact Form */}
              <Card className="mb-5 w-full gap-5 rounded-none shadow-lg">
                <CardHeader className="rounded-none px-3">
                  <CardTitle className="border-b border-[rgb(220,220,220)] p-[5px] text-[22px] font-bold leading-[24px]">
                    {pluginConfig.steps?.step2Title ||
                      "STEP 2: CONTACT INFORMATION"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="w-full space-y-4 rounded-none p-3 pt-0">
                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex w-full flex-col gap-2">
                      <Input
                        id="firstName"
                        placeholder={
                          pluginConfig.placeholders?.firstName ||
                          "Enter your first name"
                        }
                        value={watch("firstName")}
                        onChange={(e) => setValue("firstName", e.target.value)}
                        className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                          errors.firstName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <Input
                        id="lastName"
                        placeholder={
                          pluginConfig.placeholders?.lastName ||
                          "Enter your last name"
                        }
                        value={watch("lastName")}
                        onChange={(e) => setValue("lastName", e.target.value)}
                        className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                          errors.lastName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder={
                        pluginConfig.placeholders?.email ||
                        "Enter your email address"
                      }
                      value={watch("email")}
                      onChange={(e) => setValue("email", e.target.value)}
                      className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={
                        pluginConfig.placeholders?.phone ||
                        "Enter your phone number"
                      }
                      value={watch("phone")}
                      onChange={(e) => setValue("phone", e.target.value)}
                      className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {pluginConfig.labels?.requiredFieldNote ||
                      "* Required fields"}
                  </p>

                  {/* Testimonials section styled like screenshot */}
                  <div className="mt-10 w-full">
                    <h3 className="mb-2 text-center text-2xl font-extrabold leading-tight text-gray-900">
                      {pluginConfig.faqTitle}
                    </h3>
                    <hr className="mb-2.5 border-t-2 border-black" />
                    <div className="w-full space-y-6">
                      {pluginConfig.testimonials.map((testimonial, index) => (
                        <div
                          key={index}
                          className="mb-2.5 flex w-full flex-row items-start gap-4 rounded-none border border-gray-300 bg-white p-4 shadow-sm last:mb-0"
                        >
                          <img
                            src={testimonial.imageUrl}
                            alt={testimonial.name}
                            className="h-12 w-12 max-w-full rounded-full object-cover"
                            style={{ minWidth: 0 }}
                          />
                          <div className="w-full flex-1">
                            <div className="mb-1 flex items-center gap-2 sm:flex-row">
                              {/* Green Trustpilot-style badge */}
                              <img
                                src="/review-stars.webp"
                                alt="5 star review"
                                width={70}
                                height={13}
                                className="h-[13px] w-[70px] max-w-full"
                              />
                              <span className="ml-2 font-bold text-gray-900">
                                {testimonial.name}
                              </span>
                            </div>
                            <p className="whitespace-pre-line text-[15px] leading-snug text-gray-900">
                              {testimonial.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card className="mb-5 rounded-none shadow-lg">
                <CardHeader className="rounded-none px-3">
                  <CardTitle className="border-b border-[rgb(220,220,220)] p-[5px] text-[22px] font-bold leading-[24px]">
                    {pluginConfig.steps?.step3Title ||
                      "STEP 3: SHIPPING INFORMATION"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-3 pt-0">
                  {/* Country Selection - Must be first */}
                  <div className="flex flex-col gap-2">
                    <Combobox
                      options={Object.values(countries).map((country: any) => ({
                        value: country.iso,
                        label: country.name,
                      }))}
                      value={watch("country")}
                      onValueChange={(countryCode: string) => {
                        setValue("country", countryCode);
                        if (countryCode && !isCountrySelected) {
                          toast.success(
                            "Great! Now you can enter your address details below."
                          );
                        }
                      }}
                      placeholder={
                        pluginConfig.placeholders?.stateSelect ||
                        "Select Country"
                      }
                      error={!!errors.country}
                      disabled={false}
                      className="h-14"
                    />
                    {errors.country && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                  {/* Helpful message when no country is selected */}
                  {!isCountrySelected && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg
                            className="mt-0.5 h-5 w-5 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm leading-relaxed text-blue-800">
                            {pluginConfig.texts?.countryHelp ||
                              "Please select your country first. This will enable address autocomplete and ensure accurate shipping options."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Address fields - Disabled until country is selected */}
                  <div
                    className={`space-y-4 ${
                      !isCountrySelected ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <Input
                          id="address1"
                          value={addressInput}
                          onChange={handleAddressInputChange}
                          disabled={!isCountrySelected}
                          placeholder={
                            isCountrySelected
                              ? pluginConfig.placeholders
                                  ?.address1WhenCountrySelected ||
                                "Start typing your address..."
                              : pluginConfig.placeholders
                                  ?.address1WhenNoCountry ||
                                "Please select country first"
                          }
                          className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                            errors.address1
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : ""
                          }`}
                        />

                        {/* Google Autocomplete Predictions */}
                        {showPredictions &&
                          predictions.length > 0 &&
                          isCountrySelected && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                              {predictions.map((prediction) => (
                                <button
                                  key={prediction.place_id}
                                  type="button"
                                  onClick={() =>
                                    handlePredictionSelect(prediction)
                                  }
                                  className="w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                                >
                                  <div className="text-sm font-medium">
                                    {
                                      prediction.structured_formatting
                                        ?.main_text
                                    }
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {
                                      prediction.structured_formatting
                                        ?.secondary_text
                                    }
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                      {errors.address1 && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.address1.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Input
                        id="address2"
                        value={watch("address2")}
                        onChange={(e) => setValue("address2", e.target.value)}
                        disabled={!isCountrySelected}
                        placeholder={
                          pluginConfig.placeholders?.address2 ||
                          "Apartment, suite, etc."
                        }
                        className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                          errors.address2
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                      />
                      {errors.address2 && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.address2.message}
                        </p>
                      )}
                    </div>

                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex w-full flex-col gap-2">
                        <Input
                          id="city"
                          value={watch("city")}
                          onChange={(e) => setValue("city", e.target.value)}
                          disabled={!isCountrySelected}
                          placeholder={
                            pluginConfig.placeholders?.city || "Enter city"
                          }
                          className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                            errors.city
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : ""
                          }`}
                        />
                        {errors.city && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        {availableStates.length > 0 ? (
                          <Combobox
                            options={availableStates.map((state) => ({
                              value: state.code,
                              label: state.name,
                            }))}
                            value={watch("state")}
                            onValueChange={(stateCode: string) =>
                              setValue("state", stateCode)
                            }
                            placeholder={
                              pluginConfig.placeholders?.stateSelect ||
                              "Select State/Province"
                            }
                            error={!!errors.state}
                            disabled={!isCountrySelected}
                            className="h-14"
                          />
                        ) : (
                          <Input
                            value={watch("state")}
                            onChange={(e) => setValue("state", e.target.value)}
                            disabled={!isCountrySelected}
                            placeholder={
                              isCountrySelected
                                ? pluginConfig.placeholders
                                    ?.stateInputWhenCountrySelected ||
                                  "Enter state/province"
                                : pluginConfig.placeholders
                                    ?.stateInputWhenNoCountry ||
                                  "Select country first"
                            }
                            className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                              errors.state
                                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                : ""
                            }`}
                          />
                        )}
                        {errors.state && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex w-full flex-col gap-2">
                        <Input
                          value={watch("postal")}
                          onChange={(e) => setValue("postal", e.target.value)}
                          disabled={!isCountrySelected}
                          placeholder={
                            pluginConfig.placeholders?.postal ||
                            "Zip / Postcode*"
                          }
                          data-address-field="postal"
                          className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                            errors.postal
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : ""
                          }`}
                        />
                        {errors.postal && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.postal.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>{" "}
                  {/* Close address fields container */}
                  <p className="mt-2 text-sm text-slate-600">
                    {pluginConfig.labels?.requiredFieldNote ||
                      "* Required fields"}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="mb-5 rounded-none shadow-lg">
                <CardHeader className="rounded-none px-3">
                  <CardTitle className="border-b border-[rgb(220,220,220)] p-[5px] text-[22px] font-bold leading-[24px]">
                    {pluginConfig.steps?.step4Title || "STEP 4: PAYMENT METHOD"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="w-full space-y-4 p-3 pt-0">
                  <p className="xs:flex-row mb-4 flex flex-col items-center gap-2 text-sm text-slate-600">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    {pluginConfig.texts?.paymentSecure ||
                      "All transactions are secure and encrypted with 256-bit SSL."}
                  </p>
                  <div className="mb-0 flex w-full flex-wrap items-center justify-between rounded-t-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="h-3 w-3 shrink-0 rounded-full bg-blue-600"></div>
                      <span className="truncate whitespace-nowrap text-sm font-medium">
                        {pluginConfig.labels?.cardMethod || "Credit/Debit Card"}
                      </span>
                    </div>
                    <div className="flex min-w-0 max-w-full gap-1 overflow-x-auto">
                      <img
                        src="/brandnetwork/visa.svg"
                        alt="Visa"
                        width={60}
                        height={36}
                        className="h-[36px] w-auto min-w-0 max-w-[60px]"
                      />
                      <img
                        src="/brandnetwork/mastercard.svg"
                        alt="Mastercard"
                        width={60}
                        height={36}
                        className="h-[36px] w-auto min-w-0 max-w-[60px]"
                      />
                      <img
                        src="/brandnetwork/amex.svg"
                        alt="Amex"
                        width={60}
                        height={36}
                        className="h-[36px] w-auto min-w-0 max-w-[60px]"
                      />
                      <img
                        src="/brandnetwork/discover.svg"
                        alt="Discover"
                        width={60}
                        height={36}
                        className="h-[36px] w-auto min-w-0 max-w-[60px]"
                      />
                    </div>
                  </div>
                  <div className="w-full space-y-4 rounded-b-lg border border-t-0 border-gray-200 p-3 sm:p-4">
                    <div className="w-full">
                      <Input
                        value={watch("cardNumber")}
                        placeholder={
                          pluginConfig.placeholders?.cardNumber ||
                          "Card number*"
                        }
                        className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                          errors.cardNumber
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                        maxLength={19}
                        onChange={(e) =>
                          setValue(
                            "cardNumber",
                            formatCardNumber(e.target.value)
                          )
                        }
                        data-card-field="cardNumber"
                      />
                      {errors.cardNumber && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.cardNumber.message}
                        </p>
                      )}
                    </div>
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="w-full">
                        <Input
                          value={watch("expiryDate")}
                          placeholder={
                            pluginConfig.placeholders?.expiryDate || "MM/YY*"
                          }
                          className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                            errors.expiryDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : ""
                          }`}
                          maxLength={5}
                          onChange={(e) =>
                            setValue(
                              "expiryDate",
                              formatExpiryDate(e.target.value)
                            )
                          }
                          data-card-field="expiryDate"
                        />
                        {errors.expiryDate && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.expiryDate.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full">
                        <Input
                          value={watch("cvc")}
                          placeholder={pluginConfig.placeholders?.cvc || "CVC*"}
                          className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
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
                  {/* Payment Error Display */}
                  {paymentError && (
                    <div className="w-full rounded-lg border border-red-300 bg-red-50 p-3 sm:p-4">
                      <p className="text-sm text-red-600">{paymentError}</p>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-slate-600">
                    {pluginConfig.labels?.requiredFieldNote ||
                      "* Required fields"}
                  </p>
                </CardContent>
              </Card>

              {/* Order Summary */}
              {/* 
            To ensure the order bump is clickable (not just the checkbox), 
            but avoid double-calling handleOrderBumpToggle, 
            we attach the handler to the Card and prevent the checkbox click from bubbling up.
          */}
              <Card className="rounded-none shadow-lg">
                <CardHeader className="rounded-none px-3">
                  <CardTitle className="border-b border-[rgb(220,220,220)] p-[5px] text-[22px] font-bold leading-[24px]">
                    {pluginConfig.steps?.step5Title || "STEP 5: ORDER SUMMARY"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-3 pt-0">
                  <Card
                    // Prevent double-calling by only toggling on Card click, not on checkbox or label
                    onClick={() => {
                      toggle();
                    }}
                    className="rounded-none border-2 border-dashed border-[rgb(253,204,94)] py-0 shadow-lg"
                  >
                    <CardContent className="p-[15px]">
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="tudca"
                              checked={isSelected}
                              readOnly
                              // Prevent Card onClick from firing when clicking the checkbox
                            />
                            <div
                              className="text-lg font-semibold"
                              // Prevent Card onClick from firing when clicking the label
                            >
                              {pluginConfig.orderBump?.title}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="mt-2 space-y-2">
                              <p className="text-sm text-slate-600">
                                {pluginConfig.orderBump?.description}
                              </p>
                              <p className="text-sm font-medium text-yellow-600">
                                {pluginConfig.orderBump?.callToActionText}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Summary Header */}
                  {checkout?.summary?.items &&
                    checkout.summary.items.length > 0 && (
                      <div className="w-full rounded-lg bg-slate-50 p-2 sm:p-3">
                        <p className="text-sm font-medium text-slate-700">
                          {checkout.summary.items.length} item
                          {checkout.summary.items.length !== 1 ? "s" : ""} in
                          your order
                        </p>
                      </div>
                    )}

                  <div className="flex w-full min-w-0 justify-between overflow-x-auto text-sm font-semibold text-slate-600">
                    <span className="truncate">
                      {pluginConfig.labels?.product || "Product"}
                    </span>
                    <span className="truncate">Price</span>
                  </div>
                  <Separator />

                  {/* Cart Items */}
                  {checkout?.summary?.items &&
                  checkout.summary.items.length > 0 ? (
                    <div className="w-full space-y-2 relative">
                      {isCheckoutLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/60 -m-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-b-gray-900"></div>
                        </div>
                      )}
                      {checkout.summary.items
                        .sort((a, b) => {
                          // Get variant IDs from config in the order we want them
                          const configVariantIds = Object.values(
                            pluginConfig.variants
                          );

                          // Get the variant ID from each item
                          const aVariantId = (a as any).variantId;
                          const bVariantId = (b as any).variantId;

                          const aIndex = configVariantIds.indexOf(aVariantId);
                          const bIndex = configVariantIds.indexOf(bVariantId);

                          // If both variants are in config, sort by their config order
                          if (aIndex !== -1 && bIndex !== -1) {
                            return aIndex - bIndex;
                          }

                          // If only one is in config, prioritize it
                          if (aIndex !== -1 && bIndex === -1) return -1;
                          if (bIndex !== -1 && aIndex === -1) return 1;

                          // If neither is in config, maintain original order
                          return 0;
                        })
                        .map((item, index) => (
                          <div
                            key={item.id}
                            className={cn(
                              "xs:flex-row flex w-full flex-col items-start justify-between border-b border-slate-100 pb-3 last:border-b-0",
                              {
                                "border-b-0 pb-0":
                                  index >= checkout.summary.items.length - 1,
                              }
                            )}
                          >
                            <div className="w-full flex-1">
                              <div className="xs:flex-row xs:space-x-3 flex w-full flex-col items-start space-x-0">
                                <div className="w-full flex-1">
                                  <p className="text-base font-semibold leading-tight text-slate-900">
                                    {(item as any)?.variant.name || "Product"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="xs:w-auto w-full flex-shrink-0 text-right">
                              <p className="font-semibold text-slate-900">
                                {formatMoney(item.adjustedAmount)}
                              </p>
                              {item.adjustedAmount !== item.amount && (
                                <p className="text-sm text-slate-500 line-through">
                                  {formatMoney(item.amount)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-between py-4">
                      <span className="text-slate-600">
                        {pluginConfig.labels?.noItemsInCart ||
                          "No items in cart"}
                      </span>
                      <span className="text-slate-600">{formatMoney(0)}</span>
                    </div>
                  )}

                  <Separator />

                  {/* Adjustments (Promotions, Taxes, etc.) */}
                  {checkout?.summary?.adjustments &&
                    checkout.summary.adjustments.length > 0 && (
                      <>
                        {checkout.summary.adjustments.map(
                          (adjustment, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-slate-600">
                                {adjustment.description}
                              </span>
                              <span
                                className={
                                  adjustment.amount < 0
                                    ? "text-green-600"
                                    : "text-slate-900"
                                }
                              >
                                {adjustment.amount < 0 ? "-" : ""}
                                {formatMoney(Math.abs(adjustment.amount))}
                              </span>
                            </div>
                          )
                        )}
                        <Separator />
                      </>
                    )}

                  {/* Subtotal */}
                  {checkout?.summary?.totalAmount !==
                    checkout?.summary?.totalAdjustedAmount && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {pluginConfig.labels?.subtotal || "Subtotal"}
                        </span>
                        <span className="text-slate-900">
                          {formatMoney(checkout?.summary?.totalAmount || 0)}
                        </span>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Total */}
                  <div className="flex justify-between text-xl font-bold">
                    <span>{pluginConfig.labels?.total || "Total"}</span>
                    <span>
                      {formatMoney(checkout?.summary?.totalAdjustedAmount || 0)}
                    </span>
                  </div>

                  {/* Currency and Savings Info */}
                  {checkout?.summary?.totalPromotionAmount &&
                  checkout.summary.totalPromotionAmount > 0 ? (
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="text-sm font-medium text-green-700">
                        🎉 You saved{" "}
                        {formatMoney(checkout.summary.totalPromotionAmount)}!
                      </p>
                    </div>
                  ) : null}

                  <Button
                    className="h-fit w-full rounded bg-[rgb(27,177,42)] px-[30px] py-[15px] text-lg font-semibold text-white transition-colors hover:bg-[rgb(27,177,42)]/80"
                    onClick={handlePayment}
                    disabled={isPaymentLoading}
                  >
                    {isPaymentLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                        {pluginConfig.buttons?.processingPayment ||
                          "Processing Payment..."}
                      </div>
                    ) : (
                      pluginConfig.buttons?.payCta || "YES! Send Me My Products"
                    )}
                  </Button>

                  <img
                    src="/60-day-guarantee.webp"
                    alt="60 Day Satisfaction Guarantee"
                    width={348}
                    height={206}
                    className="ratio-[348/206] mx-auto max-w-full rounded-none"
                  />

                  <div className="text-center">
                    <p className="text-2xl leading-[28.8px] text-[rgb(48,48,48)]">
                      <strong>
                        {pluginConfig.satisfactionGuarantee.strong}
                      </strong>{" "}
                      {pluginConfig.satisfactionGuarantee.text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Contact Information & Testimonials */}
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="mx-auto mt-5 mt-8 w-full max-w-[1170px] gap-0 rounded-none shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-[30px] font-bold text-[rgb(48,48,48)]">
            {pluginConfig.labels?.faqSectionTitle ||
              "Frequently Asked Questions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full overflow-x-auto p-3 py-0 sm:p-4 sm:py-0 md:p-6 md:py-0">
          <div className="w-full min-w-0 space-y-4">
            {pluginConfig.faqs.map((faq, index) => (
              <div key={index} className="w-full min-w-0">
                <div className="w-full min-w-0 truncate rounded-none bg-[rgb(40,40,40)] px-4 py-2 text-lg font-semibold text-white">
                  {faq.question}
                </div>
                <div className="mt-2.5 w-full min-w-0 rounded-none bg-white p-2.5 pl-[50px] text-[16px] text-[rgb(48,48,48)]">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-8 w-full space-y-4 text-center text-slate-600 sm:mt-10 md:mt-12">
        <div className="flex w-full justify-center gap-2 text-[18px] text-slate-600">
          <a href="#" className="hover:text-slate-900">
            {pluginConfig.footer?.termsLabel || "Terms & Conditions"}
          </a>
          <span>|</span>
          <a href="#" className="hover:text-slate-900">
            {pluginConfig.footer?.privacyLabel || "Privacy Policy"}
          </a>
          <span>|</span>
          <a href="#" className="hover:text-slate-900">
            {pluginConfig.footer?.returnsLabel || "Returns"}
          </a>
        </div>
        <p className="w-full pb-2.5 text-[12px] text-[rgb(157,159,162)]">
          {pluginConfig.disclaimer}
        </p>
      </footer>
    </div>
  );
}
