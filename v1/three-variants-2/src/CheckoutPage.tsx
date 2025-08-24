import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { pluginConfig } from "@/data/config";
import { cn } from "@/lib/utils";
import {
  formatCardNumber,
  formatExpiryDate,
} from "@/lib/utils/card-formatting";
import Logo from "@/src/Logo";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddressData,
  Country,
  formatMoney,
  State,
  useAddress,
  useCheckout,
  useOrderBump,
  usePayment,
  useProducts,
} from "@tagadapay/plugin-sdk";
import { Check, ChevronDown, Lock, Shield, Star } from "lucide-react";
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

  // ✅ FIXED: Update address form values when checkout data loads (but don't trigger auto-save)
  useEffect(() => {
    if (
      checkout?.checkoutSession &&
      !hasInitializedForm.current &&
      addressForm
    ) {
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
  }, [checkout?.checkoutSession, addressForm]); // ✅ FIXED: Added addressForm back but with proper guard

  // Note: Auto-save is now handled directly by the useAddress hook!
  // No need for complex detection logic - the hook calls saveCheckoutInfo
  // automatically when fields change (both manual and Google Places)

  // ✅ REAL SDK ORDER BUMP HOOK - Uses proper API routing via SDK toggleOrderBump method
  const {
    isSelected: orderBumpSelected,
    savings: orderBumpSavings,
    toggle: toggleOrderBumpOffer,
  } = useOrderBump({
    checkoutSessionId: checkout?.checkoutSession?.id,
    offerId: pluginConfig.orderBumpId,
    orderBumpType: "primary",
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
  }, [currentVariantId, bundles.length]); // ✅ FIXED: Added selectedBundle back to deps

  // ✅ FIXED: Initialize checkout programmatically when no token is provided
  useEffect(() => {
    if (!checkoutToken && !checkout && init && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Initialize with the third bundle variant from mappings (Best Value)
      const thirdVariant = variantMappings.bundle3;
      if (thirdVariant?.variantId) {
        init({
          storeId: pluginConfig.storeId,
          lineItems: [
            {
              variantId: thirdVariant.variantId,
              quantity: thirdVariant.quantity,
            },
          ],
        }).catch(() => {
          hasInitializedRef.current = false; // Reset on error to allow retry
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

  const originalPricePerUnit = bundles[0]?.originalPrice || 0;
  console.log(originalPricePerUnit);

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
            console.log(
              "🔄 Debounced update started for line items:",
              lineItems
            );
            await updateLineItems(lineItems);
            console.log("✅ Debounced update completed successfully");
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

      console.log("🔄 Background update started for:", bundleId, lineItems);

      console.log("lineItems", lineItems);

      // Use debounced update instead of immediate update
      debouncedUpdateLineItems(lineItems);

      console.log("✅ Background update queued (debounced) for:", bundleId);

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

  // Handle order bump toggle
  const handleOrderBumpToggle = async (selected: boolean) => {
    console.log(
      `🎯 Instantly toggling order bump to: ${
        selected ? "selected" : "deselected"
      }`
    );

    // 🔄 BACKGROUND PROCESSING - Update backend without blocking UI
    try {
      const result = await toggleOrderBumpOffer(selected);

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
  const testimonials = [
    {
      name: "Ana (Growth Engineer)",
      rating: 5,
      text: "We shipped a fully branded checkout in under a day. The Tagada plugin-sdk handled payments, taxes, and order bumps out of the box.",
    },
    {
      name: "Marcus (Founder)",
      rating: 5,
      text: "Switching to the Tagada plugin-sdk cut our integration time by 80%. Apple Pay and Google Pay just worked across browsers.",
    },
    {
      name: "Priya (Frontend Lead)",
      rating: 5,
      text: "The SDK is truly white-label. We matched our brand styles and components without touching backend payment flows.",
    },
  ];

  const faqs = [
    {
      question: "How fast can I integrate the Tagada plugin-sdk?",
      answer:
        "Most teams embed the SDK and ship a branded checkout in hours, not weeks. Use our examples and CLI to scaffold quickly.",
    },
    {
      question: "Is it fully white-label?",
      answer:
        "Yes. You control branding, copy, and UI while the SDK securely manages payment flows, tokens, and session state.",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "Cards (Visa, Mastercard, Amex, Discover), Apple Pay, Google Pay, and more via the TagadaPay rails.",
    },
    {
      question: "Do I need my own backend?",
      answer:
        "No. The SDK abstracts secure payment handling and checkout sessions. You can go frontend-only or bring your own APIs.",
    },
    {
      question: "Does it support multi-currency and taxes?",
      answer:
        "Yes. Multi-currency pricing, regional formats, and tax adjustments are supported through the checkout session.",
    },
  ];

  const primaryColor = "rgb(11, 34, 125)";
  const primaryColorLight = "rgba(11, 34, 125, 0.1)";
  const primaryColorHover = "rgb(8, 25, 95)";

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
              <Logo />
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <Shield className="mr-1 h-3 w-3" />
                SSL SECURE
              </Badge>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-slate-600">Contact Us:</p>
              <p className="font-semibold text-slate-900">
                {pluginConfig.branding.supportEmail}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="py-8 text-white sm:py-12 md:py-16 lg:py-20"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, rgb(8, 25, 95), rgb(5, 15, 65))`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-6 sm:space-y-8 max-w-full overflow-x-hidden">
              <div className="space-y-3 sm:space-y-4">
                <Badge
                  className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base lg:text-lg whitespace-normal break-words"
                  style={{
                    backgroundColor: "white",
                    color: primaryColor,
                  }}
                >
                  5,000+ teams ship checkouts faster with Tagada plugin-sdk
                </Badge>
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words max-w-full">
                  Whitelabel Checkout powered by Tagada plugin-sdk
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3 flex-wrap">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400 sm:mt-1 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold sm:text-base break-words">
                      Drop-in SDK, secure by default:
                    </p>
                    <p className="text-xs text-blue-100 sm:text-sm lg:text-base break-words">
                      Embed a fully managed checkout with PCI-aware flows,
                      tokenized cards, and 3-D Secure support.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3 flex-wrap">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400 sm:mt-1 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold sm:text-base break-words">
                      100% white-label and customizable:
                    </p>
                    <p className="text-xs text-blue-100 sm:text-sm lg:text-base break-words">
                      Use your own brand, copy, and UI components. Keep full
                      control of UX—let the SDK handle payments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3 flex-wrap">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400 sm:mt-1 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold sm:text-base break-words">
                      Integrate in minutes:
                    </p>
                    <p className="text-xs text-blue-100 sm:text-sm lg:text-base break-words">
                      Starter templates, API docs, and a CLI help you launch
                      fast.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3 flex-wrap">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400 sm:mt-1 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold sm:text-base break-words">
                      Modern payment methods:
                    </p>
                    <p className="text-xs text-blue-100 sm:text-sm lg:text-base break-words">
                      Apple Pay, Google Pay, and major cards with global
                      support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-first flex justify-center lg:order-last">
              <div className="relative w-full h-full max-w-[400px]">
                <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl"></div>
                <img
                  src="/white-label-product.png"
                  alt={`${pluginConfig.branding.storeName} Product`}
                  className="relative z-10 mx-auto ratio-square w-full h-auto "
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discount Banner */}
      <div
        className="py-4 text-white"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${primaryColorHover})`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-4 py-2 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-2xl font-extrabold text-white drop-shadow-sm">
                55% OFF Discount Activated!
              </p>
              <p className="mt-1 text-base font-medium text-blue-100">
                Bulk Savings Applied Automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:px-8">
        <div className="grid gap-6 sm:gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Order Form */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Step 1: Package Selection */}
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-lg sm:text-xl">
                  STEP 1: SELECT ORDER QUANTITY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="space-y-4">
                  {bundles.map((bundle) => (
                    <div
                      onClick={() => {
                        handleBundleChange(bundle.id);
                      }}
                      key={bundle.id}
                      id={bundle.id}
                      className={`relative aspect-auto h-auto w-full shrink-0 cursor-pointer rounded-lg border-2 p-3 transition-all sm:p-4 ${
                        selectedBundle === bundle.id
                          ? "border-slate-200 hover:border-slate-300"
                          : "border-slate-200 hover:border-slate-300"
                      } ${bundle.bestValue ? "ring-2 ring-yellow-400" : ""}`}
                      style={{
                        borderColor:
                          selectedBundle === bundle.id
                            ? primaryColor
                            : undefined,
                        backgroundColor:
                          selectedBundle === bundle.id
                            ? primaryColorLight
                            : undefined,
                      }}
                    >
                      {(bundle.bestSelling || bundle.bestValue) && (
                        <Badge className="absolute -top-2 left-4 z-10 bg-yellow-400 text-yellow-900">
                          {bundle.bestSelling ? "BEST SELLING" : "BEST VALUE"}
                        </Badge>
                      )}
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="cursor-pointer text-lg font-semibold">
                                {bundle.quantity}x Tagada plugin-sdk Whitelabel
                                Checkout
                                {bundle.quantity > 1 ? "s" : ""}
                              </Label>
                              <p className="text-sm text-slate-600">
                                {bundle.variantName}
                              </p>
                              {/* {bundle. && (
                                <p className="text-sm font-semibold text-green-600">
                                  {bundle.savings}
                                </p>
                              )} */}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">
                                {formatMoney(bundle.totalPrice)}
                              </p>
                              <p className="text-sm text-slate-500 line-through">
                                {bundle.totalPrice != originalPricePerUnit &&
                                  formatMoney(originalPricePerUnit)}
                              </p>
                              <p className="text-sm text-slate-600">Each</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* TUDCA Add-on */}
          </div>

          {/* Contact Information & Testimonials */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-lg sm:text-xl">
                  STEP 2: CONTACT INFORMATION
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-4 md:p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName" className="mb-1">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={addressForm.fields.firstName.value}
                      onChange={(e) =>
                        addressForm.setValue("firstName", e.target.value)
                      }
                      className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        addressForm.fields.firstName.error
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                    />
                    {addressForm.fields.firstName.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.firstName.error}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName" className="mb-1">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={addressForm.fields.lastName.value}
                      onChange={(e) =>
                        addressForm.setValue("lastName", e.target.value)
                      }
                      className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        addressForm.fields.lastName.error
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                    />
                    {addressForm.fields.lastName.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.lastName.error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="mb-1">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={addressForm.fields.email.value}
                    onChange={(e) =>
                      addressForm.setValue("email", e.target.value)
                    }
                    className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      addressForm.fields.email.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                  />
                  {addressForm.fields.email.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.email.error}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="mb-1">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={addressForm.fields.phone.value}
                    onChange={(e) =>
                      addressForm.setValue("phone", e.target.value)
                    }
                    className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      addressForm.fields.phone.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                  />
                  {addressForm.fields.phone.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.phone.error}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">* Required fields</p>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-lg sm:text-xl">
                  STEP 3: SHIPPING INFORMATION
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address1" className="mb-1">
                    Street Address *
                  </Label>
                  <Input
                    id="address1"
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
                    placeholder="Enter your street address"
                    className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      addressForm.fields.address1?.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                  />
                  {addressForm.fields.address1?.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.address1.error}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address2" className="mb-1">
                    Apartment, suite, etc. (optional)
                  </Label>
                  <Input
                    id="address2"
                    value={addressForm.fields.address2.value}
                    onChange={(e) =>
                      addressForm.setValue("address2", e.target.value)
                    }
                    placeholder="Apartment, suite, etc."
                    className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      addressForm.fields.address2.error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                  />
                  {addressForm.fields.address2.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {addressForm.fields.address2.error}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="city" className="mb-1">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={addressForm.fields.city.value}
                      onChange={(e) =>
                        addressForm.setValue("city", e.target.value)
                      }
                      placeholder="Enter city"
                      className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        addressForm.fields.city.error
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                    />
                    {addressForm.fields.city.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.city.error}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="state" className="mb-1">
                      State / Province *
                    </Label>
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
                        className="h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        data-address-field="state"
                        className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                          addressForm.fields.state.error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                      />
                    )}
                    {addressForm.fields.state.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.state.error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="postal" className="mb-1">
                      ZIP / Postal Code *
                    </Label>
                    <Input
                      value={addressForm.fields.postal.value}
                      onChange={(e) =>
                        addressForm.setValue("postal", e.target.value)
                      }
                      placeholder="Zip / Postcode*"
                      data-address-field="postal"
                      className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        addressForm.fields.postal.error
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                    />
                    {addressForm.fields.postal.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.postal.error}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="country" className="mb-1">
                      Country *
                    </Label>
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
                      className="h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    {addressForm.fields.country.error && (
                      <p className="mt-2 text-sm text-red-600">
                        {addressForm.fields.country.error}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">* Required fields</p>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-lg sm:text-xl">
                  STEP 4: PAYMENT METHOD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-4 md:p-6">
                <p className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  All transactions are secure and encrypted with 256-bit SSL.
                </p>

                <div className="mb-0 flex flex-wrap items-center justify-between rounded-t-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 shrink-0 rounded-full bg-blue-600"></div>
                    <span className="whitespace-nowrap text-sm font-medium">
                      Credit/Debit Card
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <img
                      src="/brandnetwork/visa.svg"
                      alt="Visa"
                      width={60}
                      height={36}
                      className="h-[36px] w-[60px]"
                    />
                    <img
                      src="/brandnetwork/mastercard.svg"
                      alt="Mastercard"
                      width={60}
                      height={36}
                      className="h-[36px] w-[60px]"
                    />
                    <img
                      src="/brandnetwork/amex.svg"
                      alt="Amex"
                      width={60}
                      height={36}
                      className="h-[36px] w-[60px]"
                    />
                    <img
                      src="/brandnetwork/discover.svg"
                      alt="Discover"
                      width={60}
                      height={36}
                      className="h-[36px] w-[60px]"
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-b-lg border border-t-0 border-gray-200 p-3 sm:p-4">
                  <div>
                    <Label htmlFor="cardNumber" className="mb-1">
                      Card Number *
                    </Label>
                    <Input
                      value={watch("cardNumber")}
                      placeholder="Card number*"
                      className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
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
                      <Label htmlFor="expiryDate" className="mb-1">
                        Expiry Date *
                      </Label>
                      <Input
                        value={watch("expiryDate")}
                        placeholder="MM/YY*"
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

                    <div>
                      <Label htmlFor="cvc" className="mb-1">
                        CVC *
                      </Label>
                      <Input
                        value={watch("cvc")}
                        placeholder="CVC*"
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
                  <div className="rounded-lg border border-red-300 bg-red-50 p-3 sm:p-4">
                    <p className="text-sm text-red-600">{paymentError}</p>
                  </div>
                )}

                <p className="mt-2 text-sm text-slate-600">* Required fields</p>
              </CardContent>
            </Card>

            {/* Order Summary */}
            {/* 
              To ensure the order bump is clickable (not just the checkbox), 
              but avoid double-calling handleOrderBumpToggle, 
              we attach the handler to the Card and prevent the checkbox click from bubbling up.
            */}
            <Card
              className="shadow-lg"
              onClick={() => handleOrderBumpToggle(!orderBumpSelected)}
              style={{ cursor: "pointer" }}
            >
              <CardHeader className="bg-slate-50">
                <CardTitle className="text-lg sm:text-xl">
                  STEP 5: ORDER SUMMARY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-4 md:p-6">
                <Card className="border-yellow-200 shadow-lg">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="tudca"
                            checked={orderBumpSelected}
                            readOnly
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label
                            htmlFor="tudca"
                            className="cursor-pointer text-lg font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🛒 Supercharge My order with super product
                          </Label>
                        </div>
                        <div className="flex-1">
                          <div className="mt-2 space-y-2">
                            {/* <p className="font-semibold" style={{ color: primaryColor }}>
                              One Time Offer{' '}
                              <span className="">
                                {formatMoney(
                                  orderBumpData?.variant.prices[0].currencyOptions['USD'].amount
                                    ? orderBumpSavings
                                      ? orderBumpData?.variant.prices[0].currencyOptions['USD'].amount +
                                        orderBumpSavings
                                      : orderBumpData?.variant.prices[0].currencyOptions['USD'].amount
                                    : 0,
                                )}
                              </span>{' '}
                              <span className="font-normal text-slate-600 line-through">
                                {formatMoney(
                                  orderBumpData?.variant.prices[0].currencyOptions['USD'].amount || 0,
                                )}
                              </span>
                              :{' '}
                              <span className="font-normal text-slate-600">
                                Optional expedited processing available.
                              </span>
                            </p> */}
                            <p className="text-sm text-slate-600">
                              Add expedited processing to speed up order
                              handling and delivery.
                            </p>
                            <p className="text-sm font-medium text-yellow-600">
                              👉 Add it now at HALF OFF — only on this page!
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
                    <div className="rounded-lg bg-slate-50 p-2 sm:p-3">
                      <p className="text-sm font-medium text-slate-700">
                        {checkout.summary.items.length} item
                        {checkout.summary.items.length !== 1 ? "s" : ""} in your
                        order
                      </p>
                    </div>
                  )}

                <div className="flex justify-between text-sm font-semibold text-slate-600">
                  <span>Product</span>
                  <span>Price</span>
                </div>
                <Separator />

                {/* Cart Items */}
                {checkout?.summary?.items &&
                checkout.summary.items.length > 0 ? (
                  checkout.summary.items
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
                          "flex items-start justify-between border-b border-slate-100 pb-3 last:border-b-0",
                          {
                            "border-b-0 pb-0":
                              index >= checkout.summary.items.length - 1,
                          }
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={(item as any)?.variant.name}
                                className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-base font-semibold leading-tight text-slate-900">
                                {(item as any)?.variant.name || "Product"}
                              </p>
                              {item.description && (
                                <p className="mt-1 text-sm text-slate-600">
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-1 flex items-center gap-2">
                                <p className="text-sm text-slate-500">
                                  Qty: {item.quantity} ×{" "}
                                  {formatMoney(item.unitAmount)}
                                </p>
                                {item.isOrderBump && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Order Bump
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
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
                    ))
                ) : (
                  <div className="flex items-center justify-between py-4">
                    <span className="text-slate-600">No items in cart</span>
                    <span className="text-slate-600">{formatMoney(0)}</span>
                  </div>
                )}

                <Separator />

                {/* Adjustments (Promotions, Taxes, etc.) */}
                {checkout?.summary?.adjustments &&
                  checkout.summary.adjustments.length > 0 && (
                    <>
                      {checkout.summary.adjustments.map((adjustment, index) => (
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
                      ))}
                      <Separator />
                    </>
                  )}

                {/* Subtotal */}
                {checkout?.summary?.totalAmount !==
                  checkout?.summary?.totalAdjustedAmount && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="text-slate-900">
                        {formatMoney(checkout?.summary?.totalAmount || 0)}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Total */}
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
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
                  className="w-full py-4 text-lg font-semibold text-white transition-colors"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primaryColorHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = primaryColor;
                  }}
                  onClick={handlePayment}
                  disabled={isPaymentLoading}
                >
                  {isPaymentLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    "COMPLETE MY ORDER"
                  )}
                </Button>

                <div className="flex justify-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>McAfee SECURE</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Norton</span>
                  </div>
                </div>
                <p className="text-center text-sm text-slate-600">
                  🔒 Secure 256-bit SSL encryption
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <img
                    src="/brandnetwork/visa.svg"
                    alt="Visa"
                    width={32}
                    height={16}
                    className="h-4 w-8"
                  />
                  <img
                    src="/brandnetwork/mastercard.svg"
                    alt="Mastercard"
                    width={32}
                    height={16}
                    className="h-4 w-8"
                  />
                  <img
                    src="/brandnetwork/amex.svg"
                    alt="Amex"
                    width={32}
                    height={16}
                    className="h-4 w-8"
                  />
                  <img
                    src="/brandnetwork/discover.svg"
                    alt="Discover"
                    width={32}
                    height={16}
                    className="h-4 w-8"
                  />
                </div>
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  Secure 256-bit SSL encryption
                </p>

                <div className="flex justify-center">
                  <img
                    src="/satisfaction-guarantee-badge.png"
                    alt="100% Satisfaction Guarantee"
                    className="h-20 w-20"
                  />
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold">
                    60 DAY SATISFACTION GUARANTEE:
                  </p>
                  <p className="text-sm text-slate-600">
                    If you are not completely thrilled with the Tagada
                    plugin-sdk, we'll make it right.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  What Teams Are Saying About the Tagada plugin-sdk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="border-b border-slate-200 pb-4 last:border-b-0"
                  >
                    <div className="mb-2 flex items-center space-x-3">
                      <img
                        src={`/customer-avatar.png?height=40&width=40&query=customer avatar ${testimonial.name}`}
                        alt={testimonial.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-green-500 text-green-500"
                              />
                            ))}
                          </div>
                          <span className="font-semibold">
                            {testimonial.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{testimonial.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8 shadow-lg sm:mt-10 md:mt-12">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Collapsible key={index}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-slate-800 p-3 text-white transition-colors hover:bg-slate-700 sm:p-4">
                    <span className="text-left font-semibold">
                      {faq.question}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="rounded-b-lg bg-slate-50 p-3 sm:p-4">
                    <p className="text-slate-700">{faq.answer}</p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-8 space-y-4 text-center text-sm text-slate-600 sm:mt-10 md:mt-12">
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-slate-900">
              Terms & Conditions
            </a>
            <span>|</span>
            <a href="#" className="hover:text-slate-900">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-slate-900">
              Returns
            </a>
          </div>
          <p>
            * By filling out the field, you consent for{" "}
            {pluginConfig.branding.storeName} to use automated technology,
            including texts and prerecorded messages, to contact you at the
            number and email provided about Tagada plugin-sdk updates and
            offers.
          </p>
        </footer>
      </div>
    </div>
  );
}
