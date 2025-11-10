import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatCardNumber,
  formatExpiryDate,
} from "@/lib/utils/card-formatting";
import { GlobeIcon, Heart, Lock, Sun, ThumbsUp, TruckIcon } from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

// Note: Debug functionality is now handled by the SDK's built-in debug drawer
// Look for the orange 🐛 button in the bottom-right corner when debugMode={true}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/utils";
import { PluginConfig } from "@/types/plugin-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatMoney } from "@tagadapay/plugin-sdk";
import {
  useCheckout,
  useFunnel,
  useGeoLocation,
  useGoogleAutocomplete,
  useISOData,
  useOrderBump,
  usePayment,
  usePluginConfig,
  useProducts,
  useTranslation,
  type GooglePrediction,
} from "@tagadapay/plugin-sdk/v2";

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
}

// Form validation schema - now only for card fields since address is handled by useAddress hook
const cardFormSchema = z.object({
  cardNumber: z.string().min(15, "Valid card number is required"),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Valid expiry date (MM/YY) is required"),
  cvc: z.string().min(3, "Valid CVC is required"),
});

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

// Type for card form data only
type CardFormData = z.infer<typeof cardFormSchema>;

export function CheckoutPage({ checkoutToken }: CheckoutPageProps) {
  const [isInitFailed, setIsInitFailed] = useState(false);
  const {
    checkout,
    init,
    updateCustomerAndSessionInfo,
    updateLineItems,
    error,
  } = useCheckout({
    checkoutToken,
  });
  const { t } = useTranslation();
  const { next, initializeSession } = useFunnel({
    enabled: true,
  });
  const { data } = useGeoLocation();

  // Prefill country in form based on geolocation data

  const [selectedBundle, setSelectedBundle] = useState<string | null>(null); // Start with null, derive from data
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUserInitiatedUpdate, setIsUserInitiatedUpdate] = useState(false);
  const [pendingVariantId, setPendingVariantId] = useState<string | null>(null);
  const [pendingSubscriptionState, setPendingSubscriptionState] = useState<
    boolean | null
  >(null);
  const [subscribeAndSave, setSubscribeAndSave] = useState<boolean>(false);

  // 📱 Mobile sticky button state
  const [showStickyButton, setShowStickyButton] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const hasInitializedRef = useRef(false);

  const timerSeconds = 59;
  const timerMinutes = 9;
  const secondsInMinute = 60;
  const limitedStockCount = 15;

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

  const { config: pluginConfig, storeId } = usePluginConfig<PluginConfig>();
  const storeName = t(pluginConfig.branding.storeName);
  const companyName = t(pluginConfig.branding.companyName);
  const currentYear = new Date().getFullYear().toString();

  // Card form setup - address form is handled by useAddress hook below
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
    getValues,
  } = form;

  // Fetch products data - SDK now handles all complexity internally!
  const {
    error: productsError,
    getVariant,
    isLoading: isProductsLoading,
  } = useProducts({
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
    const baseVariant = getVariant(pluginConfig.variants.regular);
    const bogoVariant = getVariant(pluginConfig.variants.bogo);
    const specialVariant = getVariant(pluginConfig.variants.special);

    return {
      bundle1: {
        variantId: pluginConfig.variants.regular,
        name:
          baseVariant?.variant.name ||
          t(pluginConfig.content.checkout.packages.fallbackBundleRegular),
        dealType: "regular",
        variant: baseVariant?.variant,
        product: baseVariant?.product,
      },
      bundle2: {
        variantId: pluginConfig.variants.bogo,
        name:
          bogoVariant?.variant.name ||
          t(pluginConfig.content.checkout.packages.fallbackBundleBogo),
        dealType: "bogo",
        variant: bogoVariant?.variant,
        product: bogoVariant?.product,
      },
      bundle3: {
        variantId: pluginConfig.variants.special,
        name:
          specialVariant?.variant.name ||
          t(pluginConfig.content.checkout.packages.fallbackBundleSpecial),
        dealType: "special",
        variant: specialVariant?.variant,
        product: specialVariant?.product,
      },
    };
  };

  const variantMappings = createVariantMappings();

  // Track if we've initialized the form to prevent overwriting user input
  const hasInitializedForm = useRef(false);

  // Update address form values when checkout data loads (but don't trigger auto-save)
  useEffect(() => {
    if (checkout?.checkoutSession && !hasInitializedForm.current) {
      const session = checkout.checkoutSession;
      const customer = session.customer;
      const shipping = session.shippingAddress;

      // Use setValue to update multiple fields at once
      form.setValue("firstName", customer?.firstName || "");
      form.setValue("lastName", customer?.lastName || "");
      form.setValue("email", customer?.email || "");
      form.setValue("phone", shipping?.phone || "");
      form.setValue("country", data?.country_code || shipping?.country || "");
      form.setValue("address1", shipping?.address1 || "");
      form.setValue("address2", shipping?.address2 || "");
      form.setValue("city", shipping?.city || "");
      form.setValue("state", shipping?.state || shipping?.province || "");
      form.setValue("postal", shipping?.postal || "");

      // Mark as initialized
      hasInitializedForm.current = true;
    }
  }, [checkout?.checkoutSession, form, data?.country_code]);

  // Note: Auto-save is now handled directly by the useAddress hook!
  // No need for complex detection logic - the hook calls saveCheckoutInfo
  // automatically when fields change (both manual and Google Places)

  const { isSelected: orderBumpSelected, toggle: toggleOrderBumpOffer } =
    useOrderBump({
      checkoutToken: checkoutToken,
      offerId: pluginConfig.orderBumpId,
    });

  // Get current item data from checkout
  const firstItem = checkout?.summary?.items?.[0];
  const sessionLineItems = checkout?.checkoutSession?.sessionLineItems;
  const currentVariantId = sessionLineItems?.find(
    (lineItem: any) => lineItem.isOrderBump === false
  )?.variantId;

  useEffect(() => {
    if (isUpdating && pendingSubscriptionState !== null) {
      return;
    }

    const primaryLineItem = sessionLineItems?.find(
      (lineItem: any) => lineItem?.isOrderBump === false
    );

    if (!primaryLineItem) {
      return;
    }

    const variantId: string | undefined = primaryLineItem?.variantId;

    if (!variantId) {
      return;
    }

    const priceMapping =
      pluginConfig.prices[variantId as keyof typeof pluginConfig.prices];

    if (!priceMapping) {
      return;
    }

    const currentPriceId =
      (primaryLineItem as any)?.priceId ??
      (primaryLineItem as any)?.price?.id ??
      (primaryLineItem as any)?.price?.priceId;

    if (!currentPriceId) {
      return;
    }

    const desiredState =
      priceMapping.recurring && currentPriceId === priceMapping.recurring
        ? true
        : priceMapping.oneTime && currentPriceId === priceMapping.oneTime
        ? false
        : null;

    if (desiredState === null) {
      return;
    }

    if (pendingSubscriptionState !== null) {
      if (desiredState === pendingSubscriptionState) {
        if (subscribeAndSave !== desiredState) {
          setSubscribeAndSave(desiredState);
        }
        setPendingSubscriptionState(null);
      }
      return;
    }

    if (desiredState !== subscribeAndSave) {
      setSubscribeAndSave(desiredState);
    }
  }, [
    sessionLineItems,
    pluginConfig,
    isUpdating,
    subscribeAndSave,
    pendingSubscriptionState,
  ]);

  // Helper function: resolve priceId based on mode (one-time vs subscription)
  // Helper function to get display amount by variant and currency based on current mode
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

  const handleOrderBumpToggle = async (selected: boolean) => {
    // 🔄 BACKGROUND PROCESSING - Update backend without blocking UI
    try {
      const result = await toggleOrderBumpOffer(selected);

      if (result.success) {
        console.log("✅ Order bump background update completed successfully");

        // SDK automatically handles bidirectional refresh - no manual refresh needed! 🎉
        const message = selected
          ? String(t(pluginConfig.content.checkout.toasts.orderBumpAdded, ""))
          : String(
              t(pluginConfig.content.checkout.toasts.orderBumpRemoved, "")
            );
        toast.success(message, { duration: 2000 });
      } else {
        console.error("❌ Order bump update failed:", result);
        toast.error(
          String(t(pluginConfig.content.checkout.toasts.orderBumpFailed, ""))
        );
      }
    } catch (error) {
      console.error("❌ Order bump toggle failed:", error);
      toast.error(
        String(t(pluginConfig.content.checkout.toasts.orderBumpFailed, ""))
      );
    }
  };

  // Create bundles based on variant mappings and checkout data
  const createBundles = (item: CheckoutItem | undefined): Bundle[] => {
    const currency = item?.currency || pluginConfig.defaultCurrency;

    // Get product and variant info from the actual data structure
    const productName =
      item?.name ||
      t(pluginConfig.content.checkout.packages.fallbackProductName);

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
        images:
          (variantMappings.bundle1.variant?.imageUrl && [
            variantMappings.bundle1.variant?.imageUrl,
          ]) ||
          (item?.imageUrl && [item?.imageUrl]) ||
          [],
        bestValue: false,
        productName: variantMappings.bundle1.product?.name || productName,
        variantName:
          variantMappings.bundle1.variant?.name ||
          t(pluginConfig.content.checkout.packages.fallbackVariantRegular),
        currency,
        dealType: "regular",
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
        images:
          (variantMappings.bundle2.variant?.imageUrl && [
            variantMappings.bundle2.variant?.imageUrl,
          ]) ||
          (item?.imageUrl && [item?.imageUrl]) ||
          [],
        bestValue: false,
        productName: variantMappings.bundle2.product?.name || productName,
        variantName:
          variantMappings.bundle2.variant?.name ||
          t(pluginConfig.content.checkout.packages.fallbackVariantBogo),
        currency,
        dealType: "bogo",
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
        images:
          (variantMappings.bundle3.variant?.imageUrl && [
            variantMappings.bundle3.variant?.imageUrl,
          ]) ||
          (item?.imageUrl && [item?.imageUrl]) ||
          [],
        bestValue: true,
        productName: variantMappings.bundle3.product?.name || productName,
        variantName:
          variantMappings.bundle3.variant?.name ||
          t(pluginConfig.content.checkout.packages.fallbackVariantSpecial),
        currency,
        dealType: "special",
      },
    ];
  };

  const basePrice =
    getPriceForVariant(
      variantMappings.bundle1.variantId,
      pluginConfig.defaultCurrency
    ) / 2;

  // Recalculate bundles when subscription state changes
  const bundles = useMemo(
    () => createBundles(firstItem),
    [firstItem, subscribeAndSave]
  );

  // Sync selected bundle with checkout session data
  useEffect(() => {
    // While we are waiting for the checkout to reflect the requested change,
    // keep the optimistic UI state and avoid resyncing to stale backend data.
    if (isUserInitiatedUpdate) {
      if (pendingVariantId && currentVariantId === pendingVariantId) {
        setIsUserInitiatedUpdate(false);
        setPendingVariantId(null);
      }
      return;
    }

    if (currentVariantId && bundles.length > 0) {
      const matchingBundle = bundles.find(
        (bundle: Bundle) => bundle.variantId === currentVariantId
      );

      if (matchingBundle) {
        if (matchingBundle.id !== selectedBundle) {
          setSelectedBundle(matchingBundle.id);
        }
      } else if (selectedBundle === null) {
        setSelectedBundle("bundle3");
      }
    } else if (selectedBundle === null && bundles.length > 0) {
      setSelectedBundle("bundle3");
    }
  }, [
    currentVariantId,
    bundles.length,
    isUserInitiatedUpdate,
    pendingVariantId,
    selectedBundle,
  ]); // Carefully manage deps to avoid sync loops

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
        toast.error(
          String(t(pluginConfig.content.checkout.toasts.pricingUnavailable, ""))
        );
        return;
      }

      // 🔄 BACKGROUND PROCESSING - Update backend without blocking UI
      setIsUpdating(true);
      setPendingSubscriptionState(checked);

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
          ? String(
              t(pluginConfig.content.checkout.toasts.subscriptionEnabled, "")
            )
          : String(
              t(pluginConfig.content.checkout.toasts.subscriptionDisabled, "")
            );
        toast.success(message, { duration: 2000 });
      } catch (error) {
        console.error("❌ Background subscription update failed:", error);

        // 🔄 ROLLBACK ON ERROR - Revert to previous state
        setSubscribeAndSave(previousState);
        setPendingSubscriptionState(null);

        // Show error feedback
        toast.error(
          String(t(pluginConfig.content.checkout.toasts.subscriptionFailed, ""))
        );
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

    if (
      !checkoutToken &&
      !checkout &&
      init &&
      !hasInitializedRef.current &&
      isInitFailed === false
    ) {
      // console.log(
      //   "🚀 Initializing new checkout session (no token provided)..."
      // );
      hasInitializedRef.current = true;

      // Initialize with the third bundle variant from mappings (Best Value)
      const thirdVariant = variantMappings.bundle3;
      initializeSession();
      if (thirdVariant?.variantId) {
        init({
          storeId: storeId,
          lineItems: [
            {
              variantId: thirdVariant.variantId,
              quantity: 1,
            },
          ],
        }).catch(() => {
          setIsInitFailed(true);
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

    // Step 1: Validate address form first (using React Hook Form)
    const addressValid = await form.trigger([
      "firstName",
      "lastName",
      "email",
      "phone",
      "address1",
      "address2",
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
      console.log("❌ Validation failed, focusing first error...");

      // Enhanced error focusing logic
      // Priority order: firstName, lastName, email, phone, address1, country, city, state, postal, cardNumber, expiryDate, cvc
      const addressFieldPriority: string[] = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "address1",
        "address2",
        "country",
        "city",
        "state",
        "postal",
        "cardNumber",
        "expiryDate",
        "cvc",
      ];

      const cardFieldPriority: (keyof CardFormData)[] = [
        "cardNumber",
        "expiryDate",
        "cvc",
      ];

      let firstErrorField: string | null = null;

      // Check address form errors first (higher priority)
      for (const fieldName of addressFieldPriority) {
        if (errors[fieldName as keyof typeof errors]) {
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
          firstName: t(pluginConfig.content.checkout.fieldLabels.firstName),
          lastName: t(pluginConfig.content.checkout.fieldLabels.lastName),
          email: t(pluginConfig.content.checkout.fieldLabels.email),
          phone: t(pluginConfig.content.checkout.fieldLabels.phone),
          address1: t(pluginConfig.content.checkout.fieldLabels.address1),
          country: t(pluginConfig.content.checkout.fieldLabels.country),
          city: t(pluginConfig.content.checkout.fieldLabels.city),
          state: t(pluginConfig.content.checkout.fieldLabels.state),
          postal: t(pluginConfig.content.checkout.fieldLabels.postal),
          cardNumber: t(pluginConfig.content.checkout.fieldLabels.cardNumber),
          expiryDate: t(pluginConfig.content.checkout.fieldLabels.expiryDate),
          cvc: t(pluginConfig.content.checkout.fieldLabels.cvc),
        };

        const displayName =
          fieldDisplayNames[firstErrorField] || firstErrorField;
        toast.error(
          String(
            t(pluginConfig.content.checkout.toasts.validationField, "", {
              field: displayName,
            })
          )
        );
      } else {
        toast.error(
          String(t(pluginConfig.content.checkout.toasts.validationGeneric, ""))
        );
      }

      return;
    }

    console.log("✅ All validation passed, proceeding with payment...");

    // Make sure checkout session is ready
    if (!checkout?.checkoutSession?.id || !updateCustomerAndSessionInfo) {
      toast.error(
        String(t(pluginConfig.content.checkout.toasts.checkoutNotReady, ""))
      );
      return;
    }

    // Get validated data from the form
    const formData = form.getValues();

    // 🐛 DEBUG: Check actual field values
    console.log("🔍 DEBUG PAYMENT: Field values:", {
      country: formData.country,
      state: formData.state,
      stateIsEmpty: !formData.state,
      stateLength: formData.state?.length,
      fullFormData: formData,
    });

    // Enhanced validation for state field
    const enhancedPaymentData = {
      ...formData,
      state:
        formData.state && formData.state.trim() ? formData.state.trim() : "N/A",
    };

    console.log("✅ PAYMENT Using form data:", {
      originalState: formData.state,
      enhancedState: enhancedPaymentData.state,
      country: enhancedPaymentData.country,
    });

    // Handle state requirement validation for specific countries
    const isStateRequired = ["US", "CA", "GB"].includes(
      enhancedPaymentData.country
    );
    if (isStateRequired && !enhancedPaymentData.state?.trim()) {
      toast.error(
        String(t(pluginConfig.content.checkout.toasts.stateMissing, ""))
      );
      // Focus state field
      setFocus("state");
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
            toast.success(
              String(t(pluginConfig.content.checkout.toasts.paymentSuccess, ""))
            );

            // Show success message with payment details
            const currency =
              checkout?.summary?.currency || pluginConfig.defaultCurrency;
            const amountValue = `${currency} ${(
              (checkout?.summary?.totalAdjustedAmount || 0) / 100
            ).toFixed(2)}`;

            console.log("paymentSuccess", amountValue);

            toast.success(
              String(
                t(
                  pluginConfig.content.checkout.toasts.paymentSuccessDetailed,
                  "",
                  { amount: amountValue }
                )
              ),
              {
                duration: 5000,
              }
            );
          },
          onFailure: (errorMsg) => {
            toast.error(
              String(
                t(
                  pluginConfig.content.checkout.toasts.paymentFailedWithReason,
                  "",
                  { reason: errorMsg }
                )
              )
            );
          },
          onRequireAction: () => {
            toast.loading(
              String(
                t(
                  pluginConfig.content.checkout.toasts
                    .paymentVerificationRequired,
                  ""
                )
              )
            );
          },
        }
      ).then((amountValue) => {
        console.log("paymentSuccess", amountValue);
        next({
          type: "paymentSuccess",
          data: {
            amount: amountValue.payment,
          },
        });
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : null;
      toast.error(
        String(
          errorMsg
            ? t(
                pluginConfig.content.checkout.toasts.paymentFailedWithReason,
                "",
                { reason: errorMsg }
              )
            : t(pluginConfig.content.checkout.toasts.paymentFailed, "")
        )
      );
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

    const variantId = selectedBundleData.variantId;
    const priceMapping =
      pluginConfig.prices[variantId as keyof typeof pluginConfig.prices];
    const priceId = subscribeAndSave
      ? priceMapping?.recurring
      : priceMapping?.oneTime;

    if (!priceId) {
      // Revert UI on critical error
      setSelectedBundle(previousSelection);
      toast.error(
        String(t(pluginConfig.content.checkout.toasts.pricingUnavailable, ""))
      );
      return;
    }

    // Mark as user-initiated update to prevent sync interference
    setPendingVariantId(selectedBundleData.variantId);
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
      setPendingVariantId(null);
      setIsUserInitiatedUpdate(false);

      // Show error feedback
      toast.error(
        String(t(pluginConfig.content.checkout.toasts.selectionFailed, ""))
      );
    } finally {
      setIsUpdating(false);
      console.log("🏁 Background update process completed for:", bundleId);
    }
  };

  const {
    predictions,
    isScriptLoaded,
    searchPlaces,
    getPlaceDetails,
    extractAddressComponents,
    clearPredictions,
  } = useGoogleAutocomplete({
    apiKey: pluginConfig.googleApiKey,
    language: "en",
  });

  // 🚀 NEW: Address form hook with comprehensive countries/states and validation
  const { countries, getRegions, mapGoogleToISO } = useISOData();

  // State for address autocomplete
  const [addressInput, setAddressInput] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableStates, setAvailableStates] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);

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
        toast.success(
          String(
            t(
              pluginConfig.content.checkout.shippingInformation.countryToast,
              ""
            )
          )
        );
      }
    },
    [setValue, isCountrySelected]
  );

  const saveCheckoutInfo = useCallback(
    async (addressData: CheckoutFormData) => {
      if (!addressData) {
        return;
      }

      if (!checkout?.checkoutSession?.id) {
        console.debug("⏳ Skipping auto-save: checkout session not ready yet.");
        return;
      }

      if (typeof updateCustomerAndSessionInfo !== "function") {
        console.warn(
          "⚠️ Skipping auto-save: updateCustomerAndSessionInfo is not available."
        );
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

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save form data when fields change with 2-second debounce
  useEffect(() => {
    const relevantFields: Array<keyof CheckoutFormData> = [
      "email",
      "firstName",
      "lastName",
      "phone",
      "address1",
      "address2",
      "city",
      "country",
      "state",
      "postal",
    ];

    const subscription = watch((_, { name, type }) => {
      if (!name || type !== "change") {
        return;
      }

      if (!relevantFields.includes(name as keyof CheckoutFormData)) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const currentValues = getValues();
        saveCheckoutInfo(currentValues as CheckoutFormData);
      }, 600);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [watch, getValues, saveCheckoutInfo]);

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
              {t(pluginConfig.content.checkout.errors.genericTitle)}
            </h1>
            {error && (
              <p className="mb-4 text-gray-600">
                {error.message || String(error)}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {t(pluginConfig.content.checkout.errors.genericDescription, "", {
                supportEmail: pluginConfig.branding.supportEmail,
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading indicator for payment processing
  const isLoading =
    isPaymentLoading || isUpdating || !checkout?.checkoutSession?.id;

  return (
    <div className="bg-gray-50 pb-20 font-sans lg:pb-0">
      <header className="bg-slate-800 p-3 text-center text-white">
        <div className="flex items-center justify-center gap-2">
          <Sun className="h-5 w-5 text-amber-400" />
          <p className="font-semibold">
            {t(pluginConfig.content.checkout.banner.title)}
          </p>
        </div>
        <p className="text-sm opacity-90">
          {t(pluginConfig.content.checkout.banner.descriptionPrefix)}{" "}
          <span className="font-semibold">
            {t(pluginConfig.content.checkout.banner.freeShippingHighlight)}
          </span>{" "}
          {t(pluginConfig.content.checkout.banner.descriptionSuffix)}{" "}
          <span className="underline">
            {t(pluginConfig.content.checkout.banner.sellOutRisk)}
          </span>
        </p>
      </header>

      <div className="border-b border-gray-100 bg-white py-4">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4">
          <img
            src={pluginConfig.branding.logoUrl}
            alt={storeName}
            className="h-12 sm:h-16 max-w-[250px]"
          />
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="text-right">
              <div className="mb-1 flex items-center justify-end gap-1">
                <Lock className="h-3 w-3 text-emerald-600" />
                <p className="text-xs font-medium text-gray-700 sm:text-sm">
                  {t(
                    pluginConfig.content.checkout.navigation.secureCheckoutLabel
                  )}
                </p>
              </div>
              <p className="text-xs text-gray-600 sm:text-sm">
                {t(pluginConfig.content.checkout.navigation.supportLabel)}{" "}
                {pluginConfig.branding.supportEmail}
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
              <GlobeIcon />
              {t(pluginConfig.content.checkout.notices.freeShipping)}
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4 text-center text-sm font-medium text-orange-800 sm:p-4 sm:text-base">
              <TruckIcon />
              {t(pluginConfig.content.checkout.notices.cartTimer, "", {
                time: formatCartTimer(cartTimer),
              })}
            </div>

            {/* Step 1 */}
            <div
              className={`space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-opacity duration-300 sm:space-y-6 sm:p-6 ${
                isLoading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      1
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      {t(pluginConfig.content.checkout.packages.title)}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 sm:text-base">
                    {t(pluginConfig.content.checkout.packages.subtitle)}
                  </p>
                </div>
              </div>

              {/* Subscribe & Save toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 sm:px-4">
                <div className="flex items-center gap-3">
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
                      className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700"
                    >
                      <span className="text-emerald-600">💰</span>
                      {t(
                        pluginConfig.content.checkout.packages
                          .subscriptionToggleLabel
                      )}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between px-2 text-xs font-medium text-gray-600 sm:px-4 sm:text-sm">
                <span>
                  {t(
                    pluginConfig.content.checkout.packages.packageDetailsLabel
                  )}
                </span>
                <span>
                  {t(pluginConfig.content.checkout.packages.pricePerUnitLabel)}
                </span>
              </div>

              {/* Show loading state while selectedBundle is null */}
              {selectedBundle === null ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="ml-2 text-gray-600">
                    {t(pluginConfig.content.checkout.packages.loadingMessage)}
                  </p>
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
                      className={`relative flex cursor-pointer touch-manipulation items-center gap-2 rounded-lg border-2 p-2 transition-all duration-200 sm:gap-3 sm:p-3 ${
                        selectedBundle === bundle.id
                          ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
                      }`}
                    >
                      {bundle.bestValue && (
                        <div className="absolute -right-3 -top-3 z-10">
                          <span className="rounded-full border border-emerald-500 bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                            {t(
                              pluginConfig.content.checkout.packages
                                .bestValueBadge
                            )}
                          </span>
                        </div>
                      )}
                      <RadioGroupItem
                        value={bundle.id}
                        id={bundle.id}
                        className="h-5 w-5 border-2"
                      />
                      <div className="flex items-center gap-1 sm:gap-2">
                        {bundle.images.map((src: string, index: number) => (
                          <Fragment key={`${bundle.id}-image-${index}-${src}`}>
                            {src ? (
                              <img
                                src={src}
                                alt={bundle.name}
                                width={80}
                                height={80}
                                className="size-[80px] shrink-0 rounded-md border border-gray-100 sm:size-[100px]"
                              />
                            ) : (
                              <div className="size-[80px] shrink-0 rounded-md border border-gray-100 sm:size-[100px] bg-gray-400 animate-pulse" />
                            )}
                          </Fragment>
                        ))}
                      </div>
                      <div className="flex-grow">
                        <p
                          className="text-base font-semibold text-gray-900 sm:text-lg"
                          dangerouslySetInnerHTML={{ __html: bundle.name }}
                        />
                        <p className="text-sm text-gray-600 sm:text-base">
                          {bundle.productName}
                        </p>
                        {bundle.variantName && (
                          <p
                            dangerouslySetInnerHTML={{
                              __html: bundle.variantName,
                            }}
                            className="text-xs text-gray-500 sm:text-sm"
                          />
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-emerald-700 sm:text-2xl">
                          {formatMoney(
                            Math.round(
                              (Number(bundle.totalPrice) || 0) / bundle.quantity
                            ),
                            String(
                              bundle.currency || pluginConfig.defaultCurrency
                            )
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t(
                            pluginConfig.content.checkout.packages.perUnitLabel
                          )}
                        </p>
                        <p className="text-sm font-medium text-emerald-600">
                          {t(
                            pluginConfig.content.checkout.packages
                              .freeShippingLabel
                          )}
                        </p>

                        {basePrice !==
                          Number(bundle.totalPrice) / bundle.quantity && (
                          <p className="text-sm font-medium text-gray-600 line-through">
                            {formatMoney(
                              basePrice,
                              String(
                                bundle.currency || pluginConfig.defaultCurrency
                              )
                            )}
                          </p>
                        )}
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </div>

            <p className="rounded-lg border border-orange-200 bg-orange-50 py-3 text-center text-sm font-medium text-orange-700 sm:text-base">
              {t(pluginConfig.content.checkout.notices.limitedStock, "", {
                count: limitedStockCount,
              })}
            </p>

            <div
              className={`relative cursor-pointer touch-manipulation select-none rounded-xl border-2 p-5 shadow-sm transition-all duration-300 sm:p-6 ${
                orderBumpSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-200"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:shadow-sm active:scale-[0.98]"
              }`}
              onClick={() => handleOrderBumpToggle(!orderBumpSelected)}
            >
              <div className="absolute -right-2 -top-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {t(pluginConfig.content.checkout.orderBump.badgeLabel)}
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="flex h-7 w-7 items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    id="order-bump-expedited-shipping"
                    checked={orderBumpSelected}
                    onCheckedChange={(checked) =>
                      handleOrderBumpToggle(!!checked)
                    }
                    className={`h-6 w-6 border-2 transition-all duration-200 ${
                      orderBumpSelected
                        ? "border-emerald-500 bg-emerald-500 data-[state=checked]:bg-emerald-500"
                        : "border-slate-400 hover:border-slate-500 data-[state=checked]:bg-slate-500"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={`rounded-full p-1 ${
                        orderBumpSelected ? "bg-emerald-500" : "bg-slate-500"
                      }`}
                    >
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <span
                      className={`text-base font-semibold tracking-wide ${
                        orderBumpSelected
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      {t(pluginConfig.content.checkout.orderBump.title)}
                    </span>
                    {orderBumpSelected && (
                      <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                        {t(pluginConfig.content.checkout.orderBump.addedBadge)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      {t(pluginConfig.content.checkout.orderBump.headline)}
                    </h4>
                    <p
                      className="text-base leading-relaxed text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: t(
                          pluginConfig.content.checkout.orderBump.description
                        ),
                      }}
                    />
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>
                          {t(
                            pluginConfig.content.checkout.orderBump
                              .priorityProcessing
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>
                          {t(
                            pluginConfig.content.checkout.orderBump
                              .fasterDelivery
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>
                          {t(
                            pluginConfig.content.checkout.orderBump
                              .trackingIncluded
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>
                          {t(
                            pluginConfig.content.checkout.orderBump
                              .dedicatedSupport
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 - Customer Information */}
            <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:space-y-6 sm:p-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  2
                </div>
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {t(pluginConfig.content.checkout.customerInformation.title)}
                </h2>
              </div>
              {/* 🚀 NEW: Using useAddress hook for cleaner form handling */}
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <Input
                    {...form.register("firstName")}
                    placeholder={t(
                      pluginConfig.content.checkout.customerInformation
                        .firstNamePlaceholder
                    )}
                    data-address-field="firstName"
                    className={cn(
                      `h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100`,
                      {
                        "border-red-500 focus:border-red-500 focus:ring-red-100":
                          errors.firstName,
                      }
                    )}
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600">
                      {t(
                        pluginConfig.content.checkout.validation
                          .firstNameRequired
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...form.register("lastName")}
                    placeholder={t(
                      pluginConfig.content.checkout.customerInformation
                        .lastNamePlaceholder
                    )}
                    data-address-field="lastName"
                    className={cn(
                      `h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100`,
                      {
                        "border-red-500 focus:border-red-500 focus:ring-red-100":
                          errors.lastName,
                      }
                    )}
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600">
                      {t(
                        pluginConfig.content.checkout.validation
                          .lastNameRequired
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder={t(
                      pluginConfig.content.checkout.customerInformation
                        .emailPlaceholder
                    )}
                    data-address-field="email"
                    className={cn(
                      `h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100`,
                      {
                        "border-red-500 focus:border-red-500 focus:ring-red-100":
                          errors.email,
                      }
                    )}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {t(
                        pluginConfig.content.checkout.validation.emailRequired
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...form.register("phone")}
                    type="tel"
                    placeholder={t(
                      pluginConfig.content.checkout.customerInformation
                        .phonePlaceholder
                    )}
                    data-address-field="phone"
                    className={cn(
                      `h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100`,
                      {
                        "border-red-500 focus:border-red-500 focus:ring-red-100":
                          errors.phone,
                      }
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">
                      {t(
                        pluginConfig.content.checkout.validation.phoneRequired
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  3
                </div>
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {t(pluginConfig.content.checkout.shippingInformation.title)}
                </h2>
              </div>
              <div className="space-y-4">
                {/* Country Selection - Must be first */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="country" className="mb-1">
                    {t(
                      pluginConfig.content.checkout.shippingInformation
                        .countryLabel
                    )}
                  </Label>
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
                          String(
                            t(
                              pluginConfig.content.checkout.shippingInformation
                                .countryToast,
                              ""
                            )
                          )
                        );
                      }
                    }}
                    placeholder={t(
                      pluginConfig.content.checkout.shippingInformation
                        .countryPlaceholder
                    )}
                    error={!!errors.country}
                    className="h-14"
                    data-address-field="country"
                  />
                  {errors.country && (
                    <p className="mt-2 text-sm text-red-600">
                      {t(
                        pluginConfig.content.checkout.validation.countryRequired
                      )}
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
                          {t(
                            pluginConfig.content.checkout.shippingInformation
                              .helperMessage
                          )}
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
                    <Label htmlFor="address1" className="mb-1">
                      {t(
                        pluginConfig.content.checkout.shippingInformation
                          .streetLabel
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="address1"
                        value={addressInput}
                        onChange={handleAddressInputChange}
                        disabled={!isCountrySelected}
                        placeholder={
                          isCountrySelected
                            ? t(
                                pluginConfig.content.checkout
                                  .shippingInformation.streetPlaceholder
                              )
                            : t(
                                pluginConfig.content.checkout
                                  .shippingInformation.streetLockedPlaceholder
                              )
                        }
                        data-address-field="address1"
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
                                  {prediction.structured_formatting?.main_text}
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
                        {t(
                          pluginConfig.content.checkout.validation
                            .addressRequired
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="address2" className="mb-1">
                      {t(
                        pluginConfig.content.checkout.shippingInformation
                          .address2Label
                      )}
                    </Label>
                    <Input
                      id="address2"
                      value={watch("address2")}
                      onChange={(e) => setValue("address2", e.target.value)}
                      disabled={!isCountrySelected}
                      placeholder={t(
                        pluginConfig.content.checkout.shippingInformation
                          .address2Placeholder
                      )}
                      data-address-field="address2"
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
                      <Label htmlFor="city" className="mb-1">
                        {t(
                          pluginConfig.content.checkout.shippingInformation
                            .cityLabel
                        )}
                      </Label>
                      <Input
                        id="city"
                        value={watch("city")}
                        onChange={(e) => setValue("city", e.target.value)}
                        disabled={!isCountrySelected}
                        placeholder={t(
                          pluginConfig.content.checkout.shippingInformation
                            .cityPlaceholder
                        )}
                        data-address-field="city"
                        className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                          errors.city
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-2 text-sm text-red-600">
                          {t(
                            pluginConfig.content.checkout.validation
                              .cityRequired
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <Label htmlFor="state" className="mb-1">
                        {t(
                          pluginConfig.content.checkout.shippingInformation
                            .stateLabel
                        )}
                        <span className="ml-2 text-xs text-gray-500">
                          (
                          {availableStates.length > 0
                            ? t(
                                pluginConfig.content.checkout
                                  .shippingInformation.stateOptionsSuffix,
                                "",
                                { count: availableStates.length }
                              )
                            : t(
                                pluginConfig.content.checkout
                                  .shippingInformation.stateManualSuffix
                              )}
                          )
                        </span>
                      </Label>
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
                          placeholder={t(
                            pluginConfig.content.checkout.shippingInformation
                              .stateSelectPlaceholder
                          )}
                          error={!!errors.state}
                          className="h-14"
                        />
                      ) : (
                        <Input
                          value={watch("state")}
                          onChange={(e) => setValue("state", e.target.value)}
                          disabled={!isCountrySelected}
                          placeholder={
                            isCountrySelected
                              ? t(
                                  pluginConfig.content.checkout
                                    .shippingInformation.stateInputPlaceholder
                                )
                              : t(
                                  pluginConfig.content.checkout
                                    .shippingInformation.stateLockedPlaceholder
                                )
                          }
                          data-address-field="state"
                          className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                            errors.state
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : ""
                          }`}
                        />
                      )}
                      {errors.state && (
                        <p className="mt-2 text-sm text-red-600">
                          {t(
                            pluginConfig.content.checkout.validation
                              .stateRequired
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex w-full flex-col gap-2">
                      <Label htmlFor="postal" className="mb-1">
                        {t(
                          pluginConfig.content.checkout.shippingInformation
                            .postalLabel
                        )}
                      </Label>
                      <Input
                        value={watch("postal")}
                        onChange={(e) => setValue("postal", e.target.value)}
                        disabled={!isCountrySelected}
                        placeholder={t(
                          pluginConfig.content.checkout.shippingInformation
                            .postalPlaceholder
                        )}
                        data-address-field="postal"
                        className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                          errors.postal
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                      />
                      {errors.postal && (
                        <p className="mt-2 text-sm text-red-600">
                          {t(
                            pluginConfig.content.checkout.validation
                              .postalRequired
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {t(
                    pluginConfig.content.checkout.shippingInformation
                      .requiredFieldsNote
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-2">
            <div
              ref={paymentSectionRef}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t(pluginConfig.content.checkout.payment.title)}
                </h3>
              </div>
              <p className="mb-5 flex items-center gap-2 text-sm text-gray-600">
                <Lock className="h-4 w-4 text-emerald-600" />
                {t(pluginConfig.content.checkout.payment.securityMessage)}
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
                    {t(pluginConfig.content.checkout.payment.cardMethodLabel)}
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
                    placeholder={t(
                      pluginConfig.content.checkout.payment
                        .cardNumberPlaceholder
                    )}
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
                      {t(
                        pluginConfig.content.checkout.validation
                          .cardNumberRequired
                      )}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={watch("expiryDate")}
                      placeholder={t(
                        pluginConfig.content.checkout.payment.expiryPlaceholder
                      )}
                      className={`h-14 rounded-lg border-gray-300 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
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
                        {t(
                          pluginConfig.content.checkout.validation
                            .expiryRequired
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      value={watch("cvc")}
                      placeholder={t(
                        pluginConfig.content.checkout.payment.cvcPlaceholder
                      )}
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
                        {t(
                          pluginConfig.content.checkout.validation.cvcRequired
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                className={`mt-5 w-full touch-manipulation bg-gradient-to-r from-blue-600 to-blue-700 py-7 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-md sm:mt-6 sm:py-8 sm:text-xl ${
                  isPaymentLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={handlePayment}
                disabled={isPaymentLoading}
                style={{ minHeight: "72px" }}
              >
                {isPaymentLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white sm:h-6 sm:w-6"></div>
                    {t(
                      pluginConfig.content.checkout.payment
                        .buttonProcessingLabel
                    )}
                  </div>
                ) : (
                  t(pluginConfig.content.checkout.payment.buttonLabel)
                )}
              </Button>
              <div className="mt-4 space-y-3 text-center">
                <p className="text-sm font-medium text-gray-600">
                  {t(pluginConfig.content.checkout.payment.guaranteeBadgeTitle)}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  <span>
                    {t(pluginConfig.content.checkout.payment.sslBadge)}
                  </span>
                  <span>•</span>
                  <span>
                    {t(pluginConfig.content.checkout.payment.encryptionBadge)}
                  </span>
                  <span>•</span>
                  <span>
                    {t(pluginConfig.content.checkout.payment.nortonBadge)}
                  </span>
                </div>
              </div>
              <p className="my-4 text-center text-xs text-gray-500">
                {t(pluginConfig.content.checkout.payment.agreementText)}
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
                {t(pluginConfig.content.checkout.payment.secureFooter)}
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <img
                src="https://img.funnelish.com/9938/69802/1678959839-op.webp"
                alt={t(pluginConfig.content.checkout.payment.guaranteeTitle)}
                width={80}
                height={80}
                className="sm:h-[100px] sm:w-[100px]"
              />
              <div>
                <h4 className="text-base font-semibold text-emerald-800 sm:text-lg">
                  {t(pluginConfig.content.checkout.payment.guaranteeTitle)}
                </h4>
                <p className="text-sm leading-relaxed text-emerald-700">
                  {t(
                    pluginConfig.content.checkout.payment
                      .guaranteeBadgeDescription
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold text-gray-900 sm:text-lg">
                {t(pluginConfig.content.checkout.reviews.topSectionTitle)}
              </h4>
              {pluginConfig.testimonials
                .slice(0, 3)
                .map((testimonial, index) => (
                  <div
                    key={`testimonial-${testimonial.name}-${index}`}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <Avatar>
                      <AvatarImage
                        src={testimonial.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="bg-gray-300">
                        {t(testimonial.name).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="mb-2 rounded-lg border border-gray-100 bg-white p-3">
                        <p className="mb-1 text-sm font-semibold text-gray-900">
                          {t(testimonial.name)}
                        </p>
                        <p className="text-sm leading-relaxed text-gray-700">
                          {t(testimonial.text)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="cursor-pointer font-medium hover:text-blue-600">
                          {t(pluginConfig.content.checkout.reviews.likeAction)}
                        </span>
                        <span className="cursor-pointer font-medium hover:text-blue-600">
                          {t(pluginConfig.content.checkout.reviews.replyAction)}
                        </span>
                        <span>{t(testimonial.time)}</span>
                        <div className="ml-auto flex items-center gap-1 rounded-full border border-gray-100 bg-white px-2 py-1 shadow-sm">
                          <span className="text-xs font-medium">
                            {testimonial.likes}
                          </span>
                          <ThumbsUp className="h-3 w-3 text-blue-500" />
                          <Heart className="h-3 w-3 text-red-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>

      {/* 📱 Mobile Sticky Payment Button */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg lg:hidden">
          <div className="p-4">
            <div className="mb-3 flex items-center justify-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-emerald-600">
                {t(pluginConfig.content.checkout.stickyBar.freeShipping)}
              </span>
              <span>•</span>
              <span>
                {t(pluginConfig.content.checkout.stickyBar.guarantee)}
              </span>
              <span>•</span>
              <span>{t(pluginConfig.content.checkout.stickyBar.ssl)}</span>
            </div>
            <Button
              className={`w-full touch-manipulation bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-md ${
                isPaymentLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={handlePayment}
              disabled={isPaymentLoading}
              style={{ minHeight: "56px" }}
            >
              {isPaymentLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  {t(
                    pluginConfig.content.checkout.stickyBar
                      .buttonProcessingLabel
                  )}
                </div>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {t(pluginConfig.content.checkout.stickyBar.buttonLabel)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <section className="bg-white py-12">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="mb-8 text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
            {t(pluginConfig.content.checkout.reviews.gridSectionTitle)}
          </h2>
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-4">
            {pluginConfig.reviews.slice(0, 8).map((review, index) => {
              // Create varying heights for Pinterest-style layout
              const heights = [
                "h-64",
                "h-72",
                "h-80",
                "h-[350px]",
                "h-68",
                "h-76",
              ];
              const randomHeight = heights[index % heights.length];

              return (
                <Card
                  key={`review-${review.name}-${index}`}
                  className="mb-6 break-inside-avoid overflow-hidden border border-gray-100 bg-white shadow-sm"
                >
                  <div className="relative">
                    <img
                      src={review.image}
                      alt={t(review.name, "name")}
                      width={275}
                      height={200}
                      className={`w-full rounded-t-lg object-cover ${randomHeight}`}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {t(review.name)}
                      </h3>
                      {review.verified && (
                        <img
                          src="//img.funnelish.com/78897/762729/1742988496-checked.png"
                          alt={t(
                            pluginConfig.content.checkout.reviews.verifiedAlt
                          )}
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                      )}
                    </div>
                    <div className="mb-2 flex">
                      <img
                        src="//img.funnelish.com/3947/36340/1662480996-amazon-5-stars-png-1-.png"
                        alt={t(pluginConfig.content.checkout.reviews.starsAlt)}
                        width={90}
                        height={18}
                        className="h-4"
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {t(review.text)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="mt-8 bg-gray-100 py-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-12 xl:px-24">
          <div className="text-center">
            <div className="mb-6">
              <img
                src={pluginConfig.branding.logoUrl}
                alt={storeName}
                className="mx-auto h-10 sm:h-12"
                style={{ maxWidth: "240px" }}
              />
            </div>
            <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600 sm:gap-6">
              <a
                href="#terms"
                className="transition-colors hover:text-blue-600"
              >
                {t(pluginConfig.content.checkout.footer.termsLabel)}
              </a>
              <a
                href="#privacy"
                className="transition-colors hover:text-blue-600"
              >
                {t(pluginConfig.content.checkout.footer.privacyLabel)}
              </a>
              <a
                href="#wireless"
                className="transition-colors hover:text-blue-600"
              >
                {t(pluginConfig.content.checkout.footer.wirelessLabel)}
              </a>
            </div>
            <div className="text-center text-sm leading-relaxed text-gray-600">
              <p className="mb-2">
                {t(pluginConfig.content.checkout.footer.rightsReserved, "", {
                  year: currentYear,
                  company: companyName,
                })}
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
