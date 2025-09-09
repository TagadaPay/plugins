"use client";

import { ApplePayButton } from "@/components/apple-pay-button";
import Header from "@/components/header";
import MainContainer from "@/components/main-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  formatCardNumber,
  formatExpiryDate,
} from "@/lib/utils/card-formatting";
import { PluginConfig } from "@/types/plugin-config";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatMoney,
  useCheckout,
  useDiscounts,
  useGoogleAutocomplete,
  useISOData,
  usePayment,
  usePluginConfig,
  type GooglePrediction,
} from "@tagadapay/plugin-sdk/react";
import {
  CheckCircle,
  ChevronDown,
  CircleQuestionMark,
  Lock,
  Search,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Combobox } from "./ui/combobox";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// Skeleton component for order items
const OrderItemSkeleton = () => (
  <div className="flex gap-4">
    <div className="relative">
      <Skeleton className="h-[62px] w-[62px] rounded-lg bg-gray-400" />
      <Skeleton className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-gray-400" />
    </div>
    <div className="mt-4 flex-1">
      <Skeleton className="mb-2 h-4 w-32 bg-gray-400" />
      <Skeleton className="h-3 w-24 bg-gray-400" />
    </div>
    <Skeleton className="mt-4 h-4 w-16 bg-gray-400" />
  </div>
);

const cardFormSchema = z.object({
  cardNumber: z.string().min(15, "Valid card number is required"),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Valid expiry date (MM/YY) is required"),
  cvc: z.string().min(3, "Valid CVC is required"),
});

const checkoutFormSchema = z
  .object({
    // Personal information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone number is required"),

    // Address information
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal: z.string().min(1, "Postal code is required"),
    country: z.string().min(2, "Country is required"),

    // Billing address information
    useShippingAsBilling: z.boolean().default(true),
    billingFirstName: z.string().optional(),
    billingLastName: z.string().optional(),
    billingAddress1: z.string().optional(),
    billingAddress2: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingPostal: z.string().optional(),
    billingCountry: z.string().optional(),
    billingPhone: z.string().optional(),

    // Card information
    cardNumber: z
      .string()
      .min(15, "Valid card number is required")
      .transform((val) => val.replace(/\s/g, "")),
    expiryDate: z
      .string()
      .regex(/^\d{2}\/\d{2}$/, "Valid expiry date (MM/YY) is required"),
    cvc: z.string().min(3, "Valid CVC is required"),
  })
  .superRefine((data, ctx) => {
    // If not using shipping as billing, require billing address fields
    if (!data.useShippingAsBilling) {
      if (!data.billingFirstName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing first name is required",
          path: ["billingFirstName"],
        });
      }
      if (!data.billingLastName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing last name is required",
          path: ["billingLastName"],
        });
      }
      if (!data.billingAddress1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing address is required",
          path: ["billingAddress1"],
        });
      }
      if (!data.billingCountry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing country is required",
          path: ["billingCountry"],
        });
      }
      if (!data.billingCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing city is required",
          path: ["billingCity"],
        });
      }
      if (!data.billingState) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing state is required",
          path: ["billingState"],
        });
      }
      if (!data.billingPostal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing postal code is required",
          path: ["billingPostal"],
        });
      }
      if (!data.billingPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing phone is required",
          path: ["billingPhone"],
        });
      }
    }
  });

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Type for card form data only
type CardFormData = z.infer<typeof cardFormSchema>;

type CheckoutPageProps = {
  checkoutToken: string;
};

export default function CheckoutPage({ checkoutToken }: CheckoutPageProps) {
  // Initialize checkout session with the configured product
  const { checkout, updateCustomerAndSessionInfo, error } = useCheckout({
    checkoutToken,
  });

  const {
    appliedDiscounts,
    isApplying,
    isRemoving,
    error: discountsError,
    applyDiscountCode,
    removeDiscountCode,
  } = useDiscounts({
    checkoutSessionId: checkout?.checkoutSession?.id,
    autoRefresh: true,
  });

  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const texts = pluginConfig?.texts;

  // 🚀 Payment processing using SDK
  const {
    processCardPayment,
    isLoading: isPaymentLoading,
    error: paymentError,
    clearError: clearPaymentError,
  } = usePayment();

  // Track if we've initialized the form to prevent overwriting user input
  const hasInitializedForm = useRef(false);

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

  // Billing address state
  const [billingAddressInput, setBillingAddressInput] = useState("");
  const [showBillingPredictions, setShowBillingPredictions] = useState(false);
  const [selectedBillingCountry, setSelectedBillingCountry] = useState("");
  const [availableBillingStates, setAvailableBillingStates] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [isBillingCountrySelected, setIsBillingCountrySelected] =
    useState(false);

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  const form = useForm<CheckoutFormData>({
    mode: "all",
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
      useShippingAsBilling: true,
      billingFirstName: "",
      billingLastName: "",
      billingAddress1: "",
      billingAddress2: "",
      billingCity: "",
      billingState: "",
      billingPostal: "",
      billingCountry: "",
      billingPhone: "",
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

  // Watch country changes to update available states
  const watchedCountry = watch("country");
  const watchedBillingCountry = watch("billingCountry");
  const useShippingAsBilling = watch("useShippingAsBilling");

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

  // Watch billing country changes to update available billing states
  useEffect(() => {
    if (watchedBillingCountry) {
      setSelectedBillingCountry(watchedBillingCountry);
      setIsBillingCountrySelected(true);

      const states = getRegions(watchedBillingCountry);
      const mappedStates = states.map((state: any) => ({
        code: state.iso,
        name: state.name,
      }));
      setAvailableBillingStates(mappedStates || []);

      // Clear dependent fields when billing country changes
      const currentBillingState = watch("billingState");
      if (
        currentBillingState &&
        !mappedStates?.find((s: any) => s.code === currentBillingState)
      ) {
        setValue("billingState", "");
      }

      // Clear billing address fields when billing country changes
      setValue("billingAddress1", "");
      setValue("billingCity", "");
      setValue("billingPostal", "");
      setBillingAddressInput("");
      setShowBillingPredictions(false);
    } else {
      setIsBillingCountrySelected(false);
      setSelectedBillingCountry("");
      setAvailableBillingStates([]);
    }
  }, [watchedBillingCountry, getRegions, setValue, watch]);

  // Update billing address when useShippingAsBilling changes
  useEffect(() => {
    if (useShippingAsBilling) {
      // Copy shipping address to billing address
      setValue("billingFirstName", watch("firstName"));
      setValue("billingLastName", watch("lastName"));
      setValue("billingAddress1", watch("address1"));
      setValue("billingAddress2", watch("address2"));
      setValue("billingCity", watch("city"));
      setValue("billingState", watch("state"));
      setValue("billingPostal", watch("postal"));
      setValue("billingCountry", watch("country"));
      setValue("billingPhone", watch("phone"));
    }
  }, [useShippingAsBilling, watch, setValue]);

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

  // Billing address autocomplete handlers
  const handleBillingAddressInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isBillingCountrySelected) {
        return; // Don't allow address input without country selection
      }

      const value = e.target.value;
      setBillingAddressInput(value);
      setValue("billingAddress1", value || "");

      if (value.length >= 3 && selectedBillingCountry) {
        searchPlaces(value, selectedBillingCountry);
        setShowBillingPredictions(true);
      } else {
        setShowBillingPredictions(false);
        clearPredictions();
      }
    },
    [
      searchPlaces,
      setValue,
      selectedBillingCountry,
      isBillingCountrySelected,
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

  const handleBillingPredictionSelect = useCallback(
    async (prediction: GooglePrediction) => {
      setBillingAddressInput(prediction.description);
      setShowBillingPredictions(false);

      // Get detailed place information
      const placeDetails = await getPlaceDetails(prediction.place_id);

      if (placeDetails) {
        const extracted = extractAddressComponents(placeDetails);

        // Update form with extracted billing address components
        const billingAddress1 =
          `${extracted.streetNumber} ${extracted.route}`.trim();
        setValue("billingAddress1", billingAddress1);
        setValue("billingCity", extracted.locality);
        setValue("billingPostal", extracted.postalCode);

        // Use mapGoogleToISO to properly convert Google state to ISO format
        const mappedState = mapGoogleToISO(
          extracted.administrativeAreaLevel1,
          extracted.administrativeAreaLevel1Long,
          selectedBillingCountry
        );

        if (mappedState) {
          setValue("billingState", mappedState.iso);
        } else {
          setValue("billingState", extracted.administrativeAreaLevel1);
        }

        // Only update billing country if it matches the selected billing country (for consistency)
        if (extracted.country === selectedBillingCountry) {
          setValue("billingCountry", extracted.country);
        }
      }
    },
    [
      getPlaceDetails,
      extractAddressComponents,
      setValue,
      selectedBillingCountry,
      mapGoogleToISO,
    ]
  );

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
          !enhancedAddressData.country &&
          !enhancedAddressData.billingAddress1 &&
          !enhancedAddressData.billingCountry
        ) {
          return;
        }

        // Prepare billing address data
        const billingAddress = addressData.useShippingAsBilling
          ? {
              firstName: enhancedAddressData.firstName,
              lastName: enhancedAddressData.lastName,
              address1: enhancedAddressData.address1,
              address2: enhancedAddressData.address2 || "",
              city: enhancedAddressData.city,
              country: enhancedAddressData.country,
              state: enhancedAddressData.state,
              postal: enhancedAddressData.postal,
              phone: enhancedAddressData.phone,
            }
          : {
              firstName:
                enhancedAddressData.billingFirstName ||
                enhancedAddressData.firstName,
              lastName:
                enhancedAddressData.billingLastName ||
                enhancedAddressData.lastName,
              address1: enhancedAddressData.billingAddress1 || "",
              address2: enhancedAddressData.billingAddress2 || "",
              city: enhancedAddressData.billingCity || "",
              country:
                enhancedAddressData.billingCountry ||
                enhancedAddressData.country,
              state: enhancedAddressData.billingState || "N/A",
              postal: enhancedAddressData.billingPostal || "",
              phone:
                enhancedAddressData.billingPhone || enhancedAddressData.phone,
            };

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
          billingAddress,
          differentBillingAddress: !addressData.useShippingAsBilling,
        });
      } catch (error) {
        console.error("❌ Failed to auto-save checkout info:", error);
        // Don't show error toast for auto-save failures to avoid annoying the user
      }
    },
    [checkout?.checkoutSession?.id, updateCustomerAndSessionInfo]
  );

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
        value.country ||
        value.billingAddress1 ||
        value.billingCountry
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

  // Clear payment errors when user starts typing in card fields
  useEffect(() => {
    if (
      paymentError &&
      (watch("cardNumber") || watch("expiryDate") || watch("cvc"))
    ) {
      clearPaymentError();
    }
  }, [watch("cardNumber"), watch("expiryDate"), watch("cvc")]);

  // Handle discount code application
  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    try {
      console.log("Applying discount code:", discountCode);
      const result = await applyDiscountCode(discountCode);
      if (result.success) {
        toast.success("Discount code applied successfully!");
        setDiscountCode(""); // Clear the input after successful application
      } else {
        toast.error(result.error || "Invalid discount code. Please try again.");
      }
    } catch (error) {
      toast.error("Invalid discount code. Please try again.");
    }
  };

  // Handle discount code removal
  const handleRemoveDiscountCode = async (discountId: string) => {
    try {
      const result = await removeDiscountCode(discountId);
      console.log("result", result);
      if (result.success) {
        toast.success("Discount code removed");
      } else {
        toast.error(result.error || "Failed to remove discount code");
      }
    } catch (error) {
      toast.error("Failed to remove discount code");
    }
  };

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

    // Step 2: Validate billing address if different from shipping
    let billingValid = true;
    if (!watch("useShippingAsBilling")) {
      billingValid = await form.trigger([
        "billingFirstName",
        "billingLastName",
        "billingAddress1",
        "billingCountry",
        "billingCity",
        "billingState",
        "billingPostal",
      ]);
    }

    // Step 3: Validate ONLY card form fields (not address fields)
    const cardValid = await form.trigger(["cardNumber", "expiryDate", "cvc"]);

    // Extract only card-related errors for focus logic
    const cardErrors = {
      cardNumber: errors.cardNumber,
      expiryDate: errors.expiryDate,
      cvc: errors.cvc,
    };

    // Step 3: Focus on first error field if validation fails
    if (!addressValid || !billingValid || !cardValid) {
      console.log("❌ Validation failed, focusing first error...");

      // Enhanced error focusing logic
      // Priority order: firstName, lastName, email, phone, address1, country, city, state, postal, billing fields, cardNumber, expiryDate, cvc
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
      ];

      const billingFieldPriority: string[] = [
        "billingFirstName",
        "billingLastName",
        "billingAddress1",
        "billingCountry",
        "billingCity",
        "billingState",
        "billingPostal",
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

      // If no address errors and billing is different, check billing form errors
      if (!firstErrorField && !watch("useShippingAsBilling")) {
        for (const fieldName of billingFieldPriority) {
          if (errors[fieldName as keyof typeof errors]) {
            firstErrorField = fieldName;
            break;
          }
        }
      }

      // If no address or billing errors, check card form errors
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
          billingFirstName: "Billing First Name",
          billingLastName: "Billing Last Name",
          billingAddress1: "Billing Street Address",
          billingCountry: "Billing Country",
          billingCity: "Billing City",
          billingState: "Billing State/Province",
          billingPostal: "Billing Zip/Postal Code",
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
      toast.error("Please enter a state/province for the selected country.");
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

  // Show error state for critical checkout errors (not loading state)
  if (error) {
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
          </div>
        </div>
      </div>
    );
  }

  // Show loading indicator for payment processing

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <Header />

      <div>
        <div className="bg-[rgb(237,237,237)] lg:hidden">
          <button
            onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
            className="flex w-full items-center justify-between border-b border-[rgb(222,222,222)] transition-colors hover:bg-[rgb(230,230,230)]"
          >
            <div className="mx-auto flex w-full max-w-[580px] items-center justify-between gap-2 px-[21px] py-[9px]">
              <div className="flex items-center gap-2">
                <h2 className="text-foreground text-lg font-semibold">
                  {texts?.orderSummary?.title || "Order summary"}
                </h2>
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                    isOrderSummaryOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[19px] font-semibold text-gray-900">
                  {formatMoney(
                    (checkout?.summary as any)?.subtotalAdjustedAmount || 0
                  )}
                </span>
              </div>
            </div>
          </button>
          <div
            className={cn(
              "overflow-hidden border-0 border-[rgb(222,222,222)] transition-all duration-500 max-h-0",
              {
                "max-h-[1000px] border-b": isOrderSummaryOpen,
              }
            )}
          >
            <div className="space-y-4 p-[21px] mx-auto max-w-[580px]">
              {!checkout?.summary?.items ? (
                // Show skeleton loaders when not initialized
                <>
                  <OrderItemSkeleton />
                  <OrderItemSkeleton />
                  <OrderItemSkeleton />
                </>
              ) : (
                // Show actual items when initialized
                checkout?.summary.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative">
                      <img
                        src={item.variant.imageUrl}
                        alt="Noir Mini Dress"
                        className="h-[62px] w-[62px] rounded-lg object-cover"
                        style={{
                          imageRendering: "auto",
                          // Use pixel density aware srcset for higher quality on retina screens
                        }}
                        srcSet={
                          item.variant.imageUrl
                            ? `${
                                item.variant.imageUrl
                              } 1x, ${item.variant.imageUrl.replace(
                                /(\.[\w\d_-]+)$/i,
                                "@2x$1"
                              )} 2x`
                            : undefined
                        }
                        loading="lazy"
                        decoding="async"
                        width={62}
                        height={62}
                      />
                      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(102,102,102)] text-xs font-medium text-white">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="mt-4 flex-1">
                      <h3 className="text-sm">{item.product.name}</h3>
                      <p className="text-xs text-gray-600">
                        {item.variant.name}
                      </p>
                    </div>
                    <p className="mt-4 text-sm">
                      {item.adjustedAmount > 0
                        ? formatMoney(item.adjustedAmount)
                        : "Free"}
                    </p>
                  </div>
                ))
              )}

              <div className="flex gap-2">
                <Input
                  placeholder={
                    texts?.orderSummary?.discount?.placeholder ||
                    "Discount code"
                  }
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 bg-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleApplyDiscountCode();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="border-gray-300 bg-gray-300 text-gray-700 hover:bg-gray-400"
                  onClick={handleApplyDiscountCode}
                  disabled={isApplying || !discountCode.trim()}
                >
                  {isApplying
                    ? texts?.orderSummary?.discount?.applying || "Applying..."
                    : texts?.orderSummary?.discount?.apply || "Apply"}
                </Button>
              </div>

              {/* Applied discounts */}
              {appliedDiscounts && appliedDiscounts.length > 0 && (
                <div className="space-y-2">
                  {appliedDiscounts
                    .filter((discount) => discount.promotionCodeId)
                    .map((discount) => (
                      <div
                        key={discount.id}
                        className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-800">
                            {discount.promotion.name}
                            {texts?.orderSummary?.discount
                              ?.appliedLabelSuffix || " - Discount applied"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveDiscountCode(discount.promotionId)
                          }
                          disabled={isRemoving}
                          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {isRemoving
                            ? texts?.orderSummary?.discount?.removing ||
                              "Removing..."
                            : texts?.orderSummary?.discount?.remove || "Remove"}
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Discount error */}
              {discountsError && (
                <div className="rounded border border-red-200 bg-red-50 p-2">
                  <p className="text-sm text-red-600">
                    {discountsError.message}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">
                    {texts?.orderSummary?.subtotal || "Subtotal"}
                  </span>
                  <span className="text-gray-900">
                    {formatMoney(
                      (checkout?.summary as any)?.subtotalAdjustedAmount || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900">
                      {texts?.orderSummary?.shipping || "Shipping"}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {texts?.orderSummary?.shippingFree || "Free"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-3 text-[19px] font-semibold">
                <span className="font-bold text-gray-900">
                  {texts?.orderSummary?.total || "Total"}
                </span>
                <span className="font-bold text-gray-900">
                  {formatMoney(checkout?.summary.totalAdjustedAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <MainContainer
          firstChild={
            <div className="flex h-full flex-col gap-8 lg:max-w-[580px]">
              <ApplePayButton />
              {/* Trending Alert */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">{pluginConfig.alert.title}</p>
                      <p>{pluginConfig.alert.subtitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-semibold">
                    {texts?.contact?.title || "Contact"}
                  </h2>
                </div>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder={texts?.contact?.emailPlaceholder || "Email"}
                  data-address-field="email"
                  className={cn(`h-12 rounded-lg border-gray-300 text-base`, {
                    "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                      errors.email,
                  })}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Delivery */}
              <div className="space-y-4">
                <h2 className="text-foreground text-lg font-semibold">
                  {texts?.delivery?.title || "Delivery"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium">
                      {texts?.delivery?.countryLabel || "Country/Region"}
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
                            texts?.delivery?.addressPlaceholder ||
                              "Start typing your address..."
                          );
                        }
                      }}
                      placeholder={
                        texts?.delivery?.countryLabel || "Select Country"
                      }
                      error={!!errors.country}
                      className="mt-1 h-12"
                      data-address-field="country"
                    />
                    {errors.country && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        {texts?.delivery?.firstNameLabel || "First name"}
                      </Label>
                      <Input
                        {...form.register("firstName")}
                        id="firstName"
                        placeholder={
                          texts?.delivery?.firstNameLabel || "First Name"
                        }
                        data-address-field="firstName"
                        className={cn(
                          `mt-1 h-12 rounded-lg border-gray-300 text-base`,
                          {
                            "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                              errors.firstName,
                          }
                        )}
                      />
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        {texts?.delivery?.lastNameLabel || "Last name"}
                      </Label>
                      <Input
                        {...form.register("lastName")}
                        placeholder={
                          texts?.delivery?.lastNameLabel || "Last Name"
                        }
                        id="lastName"
                        data-address-field="lastName"
                        className={cn(`mt-1 h-12 rounded-lg text-base`, {
                          "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                            errors.lastName,
                        })}
                      />
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address1" className="text-sm font-medium">
                      {texts?.delivery?.addressLabel || "Address"}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        {...form.register("address1")}
                        id="address1"
                        value={addressInput}
                        onChange={handleAddressInputChange}
                        disabled={!isCountrySelected}
                        placeholder={
                          isCountrySelected
                            ? texts?.delivery?.addressPlaceholder ||
                              "Start typing your address..."
                            : texts?.delivery?.addressSelectCountryFirst ||
                              "Please select country first"
                        }
                        data-address-field="address1"
                        className={cn(
                          `h-12 rounded-lg pr-10 text-base disabled:cursor-not-allowed disabled:bg-gray-100`,
                          {
                            "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                              errors.address1,
                          }
                        )}
                      />
                      <Search className="absolute right-3 top-4 h-4 w-4 text-[rgb(112,112,112)]" />

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
                        {errors.address1.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register("address2")}
                      placeholder={
                        texts?.delivery?.address2Placeholder ||
                        "Apartment, suite, etc. (optional)"
                      }
                      data-address-field="address2"
                      className="h-12 rounded-lg text-base"
                    />
                    {errors.address2 && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.address2.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        {...form.register("city")}
                        placeholder={texts?.delivery?.cityPlaceholder || "City"}
                        data-address-field="city"
                        disabled={!isCountrySelected}
                        className={cn(
                          `h-12 rounded-lg text-base disabled:cursor-not-allowed disabled:bg-gray-100`,
                          {
                            "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                              errors.city,
                          }
                        )}
                      />
                      {errors.city && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
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
                            texts?.delivery?.statePlaceholder || "State"
                          }
                          error={!!errors.state}
                          className="h-12"
                          data-address-field="state"
                        />
                      ) : (
                        <Input
                          {...form.register("state")}
                          disabled={!isCountrySelected}
                          placeholder={
                            isCountrySelected
                              ? texts?.delivery?.statePlaceholder ||
                                "Enter state/province"
                              : texts?.delivery?.addressSelectCountryFirst ||
                                "Select country first"
                          }
                          data-address-field="state"
                          className={cn(
                            `h-12 rounded-lg text-base disabled:cursor-not-allowed disabled:bg-gray-100`,
                            {
                              "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                errors.state,
                            }
                          )}
                        />
                      )}
                      {errors.state && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="relative">
                        <Input
                          {...form.register("postal")}
                          placeholder={
                            texts?.delivery?.postalPlaceholder || "ZIP code"
                          }
                          data-address-field="postal"
                          disabled={!isCountrySelected}
                          className={cn(
                            `h-12 rounded-lg text-base disabled:cursor-not-allowed disabled:bg-gray-100`,
                            {
                              "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                errors.postal,
                            }
                          )}
                        />
                      </div>
                      {errors.postal && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.postal.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <Input
                        {...form.register("phone")}
                        placeholder={
                          texts?.delivery?.phonePlaceholder || "Phone"
                        }
                        data-address-field="phone"
                        className={cn(`h-12 rounded-lg text-base`, {
                          "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                            errors.phone,
                        })}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CircleQuestionMark className="absolute right-3 top-4 h-4 w-4 cursor-help text-[rgb(112,112,112)]" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[150px] px-3 py-1.5 text-center text-sm text-white"
                          sideOffset={8}
                        >
                          {texts?.delivery?.phoneTooltip ||
                            "In case we need to contact you about your order"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="space-y-4">
                <h2 className="text-foreground text-lg font-semibold">
                  {texts?.shippingMethod?.title || "Shipping method"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {texts?.shippingMethod?.subtitle ||
                    "Enter your shipping address to view available shipping methods."}
                </p>
              </div>

              {/* Payment */}
              <div className="space-y-4">
                <Card className="border-gray-200 bg-[rgb(237,237,237)]/40">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {texts?.payment?.title || "Credit card"}
                        </span>
                      </div>
                      <div className="flex items-center gap-[5px]">
                        <img
                          src="/payments/visa.svg"
                          alt="Visa"
                          className="h-6 w-[38px]"
                        />
                        <img
                          src="/payments/mastercard.svg"
                          alt="Mastercard"
                          className="h-6 w-[38px]"
                        />
                        <img
                          src="/payments/amex.svg"
                          alt="Apple Pay"
                          className="h-6 w-[38px]"
                        />
                        <img
                          src="/payments/discover.svg"
                          alt="Google Pay"
                          className="h-6 w-[38px]"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="mx-auto flex h-6 w-[38px] items-center justify-center rounded-[3px] border border-gray-200 bg-white text-center text-xs">
                              <span>+4</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="flex max-w-[150px] flex-wrap gap-[5px] px-3 py-1.5 text-center text-sm text-white"
                            sideOffset={8}
                          >
                            <img
                              src="/payments/diners_club.svg"
                              alt="Visa"
                              className="h-6 w-[38px]"
                            />
                            <img
                              src="/payments/elo.svg"
                              alt="Mastercard"
                              className="h-6 w-[38px]"
                            />
                            <img
                              src="/payments/jcb.svg"
                              alt="Apple Pay"
                              className="h-6 w-[38px]"
                            />
                            <img
                              src="/payments/unionpay.svg"
                              alt="Google Pay"
                              className="h-6 w-[38px]"
                            />
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Payment Error Display */}
                    {paymentError && (
                      <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4">
                        <p className="text-sm text-red-600">{paymentError}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          {...form.register("cardNumber")}
                          placeholder={
                            texts?.payment?.cardNumberPlaceholder ||
                            "Card number"
                          }
                          value={watch("cardNumber")}
                          onChange={(e) =>
                            setValue(
                              "cardNumber",
                              formatCardNumber(e.target.value)
                            )
                          }
                          maxLength={19}
                          data-card-field="cardNumber"
                          className={cn(`h-12 border-gray-200 text-base`, {
                            "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                              errors.cardNumber,
                          })}
                        />
                        <Lock className="absolute right-3 top-4 h-4 w-4 text-[rgb(112,112,112)]" />
                      </div>
                      {errors.cardNumber && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.cardNumber.message}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            {...form.register("expiryDate")}
                            placeholder={
                              texts?.payment?.expiryPlaceholder ||
                              "Expiration date (MM / YY)"
                            }
                            value={watch("expiryDate")}
                            onChange={(e) =>
                              setValue(
                                "expiryDate",
                                formatExpiryDate(e.target.value)
                              )
                            }
                            maxLength={5}
                            data-card-field="expiryDate"
                            className={cn(`h-12 border-gray-200 text-base`, {
                              "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                errors.expiryDate,
                            })}
                          />
                          {errors.expiryDate && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors.expiryDate.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <div className="relative">
                            <Input
                              {...form.register("cvc")}
                              placeholder={
                                texts?.payment?.cvcPlaceholder ||
                                "Security code"
                              }
                              value={watch("cvc")}
                              onChange={(e) =>
                                setValue(
                                  "cvc",
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              maxLength={4}
                              data-card-field="cvc"
                              className={cn(
                                `h-12 border-gray-200 pr-10 text-base`,
                                {
                                  "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                    errors.cvc,
                                }
                              )}
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CircleQuestionMark className="absolute right-3 top-4 h-4 w-4 cursor-help text-[rgb(112,112,112)]" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-[200px] px-3 py-1.5 text-center text-sm text-white"
                                sideOffset={8}
                              >
                                {texts?.payment?.cvcTooltip ||
                                  "3-digit security code usually found on the back of your card. American Express cards have a 4-digit code located on the front."}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          {errors.cvc && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors.cvc.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useShippingAsBilling"
                          checked={watch("useShippingAsBilling")}
                          onClick={() =>
                            setValue(
                              "useShippingAsBilling",
                              !watch("useShippingAsBilling")
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-2 focus:ring-black focus:ring-offset-0"
                        />
                        <Label
                          htmlFor="useShippingAsBilling"
                          className="text-sm font-medium"
                        >
                          {texts?.payment?.useShippingAsBilling ||
                            "Use shipping address as billing address"}
                        </Label>
                      </div>
                      {/* Billing Address */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          watch("useShippingAsBilling")
                            ? "max-h-0 opacity-0"
                            : "max-h-[1000px] opacity-100"
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h2 className="text-foreground text-lg font-semibold">
                              {texts?.payment?.billingTitle ||
                                "Billing address"}
                            </h2>
                          </div>

                          {/* Billing Address Form */}
                          <div className="space-y-4">
                            <div>
                              <Label
                                htmlFor="billingCountry"
                                className="text-sm font-medium"
                              >
                                {texts?.payment?.billing?.countryLabel ||
                                  "Country/Region"}
                              </Label>
                              <Combobox
                                options={Object.values(countries).map(
                                  (country: any) => ({
                                    value: country.iso,
                                    label: country.name,
                                  })
                                )}
                                value={watch("billingCountry") || ""}
                                onValueChange={(countryCode: string) => {
                                  setValue("billingCountry", countryCode);
                                  if (
                                    countryCode &&
                                    !isBillingCountrySelected
                                  ) {
                                    toast.success(
                                      texts?.payment?.billing
                                        ?.addressPlaceholder ||
                                        "Start typing your address..."
                                    );
                                  }
                                }}
                                placeholder={
                                  texts?.payment?.billing?.countryLabel ||
                                  "Select Country"
                                }
                                error={!!errors.billingCountry}
                                className="mt-1 h-12"
                                data-address-field="billingCountry"
                              />
                              {errors.billingCountry && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.billingCountry.message}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor="billingFirstName"
                                  className="text-sm font-medium"
                                >
                                  {texts?.payment?.billing?.firstNameLabel ||
                                    "First name"}
                                </Label>
                                <Input
                                  {...form.register("billingFirstName")}
                                  id="billingFirstName"
                                  placeholder={
                                    texts?.payment?.billing?.firstNameLabel ||
                                    "First Name"
                                  }
                                  data-address-field="billingFirstName"
                                  className={cn(
                                    `mt-1 h-12 rounded-lg border-gray-300 text-base`,
                                    {
                                      "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                        errors.billingFirstName,
                                    }
                                  )}
                                />
                                {errors.billingFirstName && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billingFirstName.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <Label
                                  htmlFor="billingLastName"
                                  className="text-sm font-medium"
                                >
                                  {texts?.payment?.billing?.lastNameLabel ||
                                    "Last name"}
                                </Label>
                                <Input
                                  {...form.register("billingLastName")}
                                  placeholder={
                                    texts?.payment?.billing?.lastNameLabel ||
                                    "Last Name"
                                  }
                                  id="billingLastName"
                                  data-address-field="billingLastName"
                                  className={cn(
                                    `mt-1 h-12 rounded-lg text-base`,
                                    {
                                      "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                        errors.billingLastName,
                                    }
                                  )}
                                />
                                {errors.billingLastName && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billingLastName.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label
                                htmlFor="billingAddress1"
                                className="text-sm font-medium"
                              >
                                {texts?.payment?.billing?.addressLabel ||
                                  "Address"}
                              </Label>
                              <div className="relative mt-1">
                                <Input
                                  {...form.register("billingAddress1")}
                                  id="billingAddress1"
                                  value={billingAddressInput}
                                  onChange={handleBillingAddressInputChange}
                                  disabled={!isBillingCountrySelected}
                                  placeholder={
                                    isBillingCountrySelected
                                      ? texts?.payment?.billing
                                          ?.addressPlaceholder ||
                                        "Start typing your address..."
                                      : texts?.payment?.billing
                                          ?.addressSelectCountryFirst ||
                                        "Please select country first"
                                  }
                                  data-address-field="billingAddress1"
                                  className={cn(
                                    `h-12 rounded-lg pr-10 text-base disabled:cursor-not-allowed disabled:bg-gray-100`,
                                    {
                                      "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                        errors.billingAddress1,
                                    }
                                  )}
                                />
                                <Search className="absolute right-3 top-4 h-4 w-4 text-[rgb(112,112,112)]" />

                                {/* Google Autocomplete Predictions for Billing */}
                                {showBillingPredictions &&
                                  predictions.length > 0 &&
                                  isBillingCountrySelected && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                                      {predictions.map((prediction) => (
                                        <button
                                          key={prediction.place_id}
                                          type="button"
                                          onClick={() =>
                                            handleBillingPredictionSelect(
                                              prediction
                                            )
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
                              {errors.billingAddress1 && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.billingAddress1.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Input
                                {...form.register("billingAddress2")}
                                placeholder={
                                  texts?.payment?.billing
                                    ?.address2Placeholder ||
                                  "Apartment, suite, etc. (optional)"
                                }
                                data-address-field="billingAddress2"
                                className="h-12 rounded-lg text-base"
                              />
                              {errors.billingAddress2 && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.billingAddress2.message}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Input
                                  {...form.register("billingCity")}
                                  placeholder={
                                    texts?.payment?.billing?.cityPlaceholder ||
                                    "City"
                                  }
                                  data-address-field="billingCity"
                                  disabled={!isBillingCountrySelected}
                                  className={cn(
                                    `h-12 rounded-lg text-base disabled:cursor-not-allowed disabled:bg-gray-100`,
                                    {
                                      "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                        errors.billingCity,
                                    }
                                  )}
                                />
                                {errors.billingCity && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billingCity.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                {availableBillingStates.length > 0 ? (
                                  <Combobox
                                    options={availableBillingStates.map(
                                      (state) => ({
                                        value: state.code,
                                        label: state.name,
                                      })
                                    )}
                                    value={watch("billingState") || ""}
                                    onValueChange={(stateCode: string) =>
                                      setValue("billingState", stateCode)
                                    }
                                    placeholder={
                                      texts?.payment?.billing
                                        ?.statePlaceholder || "State"
                                    }
                                    error={!!errors.billingState}
                                    className="h-12"
                                    data-address-field="billingState"
                                  />
                                ) : (
                                  <Input
                                    {...form.register("billingState")}
                                    disabled={!isBillingCountrySelected}
                                    placeholder={
                                      isBillingCountrySelected
                                        ? texts?.payment?.billing
                                            ?.statePlaceholder ||
                                          "Enter state/province"
                                        : texts?.payment?.billing
                                            ?.addressSelectCountryFirst ||
                                          "Select country first"
                                    }
                                    data-address-field="billingState"
                                    className={cn(
                                      `h-12 rounded-lg text-base disabled:cursor-not-allowed disabled:bg-gray-100`,
                                      {
                                        "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                          errors.billingState,
                                      }
                                    )}
                                  />
                                )}
                                {errors.billingState && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billingState.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <div className="relative">
                                  <Input
                                    {...form.register("billingPostal")}
                                    placeholder={
                                      texts?.payment?.billing
                                        ?.postalPlaceholder || "ZIP code"
                                    }
                                    data-address-field="billingPostal"
                                    disabled={!isBillingCountrySelected}
                                    className={cn(
                                      `h-12 rounded-lg text-base disabled:cursor-not-allowed disabled:bg-gray-100`,
                                      {
                                        "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                          errors.billingPostal,
                                      }
                                    )}
                                  />
                                </div>
                                {errors.billingPostal && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billingPostal.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="relative">
                                <Input
                                  {...form.register("billingPhone")}
                                  placeholder="Phone"
                                  data-address-field="billingPhone"
                                  className={cn(`h-12 rounded-lg text-base`, {
                                    "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0":
                                      errors.billingPhone,
                                  })}
                                />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <CircleQuestionMark className="absolute right-3 top-4 h-4 w-4 cursor-help text-[rgb(112,112,112)]" />
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-[150px] px-3 py-1.5 text-center text-sm text-white"
                                    sideOffset={8}
                                  >
                                    In case we need to contact you about your
                                    order
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              {errors.billingPhone && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.billingPhone.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address Checkbox */}
              </div>

              {/* Complete Order Button */}
              <Button
                className="h-14 w-full rounded-lg bg-black text-lg font-semibold text-white transition-colors duration-200 hover:bg-gray-800"
                onClick={handlePayment}
                disabled={isPaymentLoading}
              >
                {isPaymentLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Processing Payment...
                  </div>
                ) : (
                  "Complete Order"
                )}
              </Button>

              {/* Footer Links */}
              <div className="mt-auto hidden flex-wrap gap-4 border-t border-gray-200 pt-3.5 text-sm text-gray-600 lg:flex">
                <a
                  href={pluginConfig?.footerLinks?.refundPolicy?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.refundPolicy?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.shipping?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.shipping?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.privacyPolicy?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.privacyPolicy?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.termsOfService?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.termsOfService?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.cancellations?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.cancellations?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.contact?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.contact?.text}
                </a>
              </div>
            </div>
          }
          secondChild={
            <>
              <div className="sm:pr-auto flex flex-col gap-[21px] lg:max-w-[480px]">
                {/* Order Summary */}
                <div className="space-y-4">
                  <h2 className="text-foreground text-lg font-semibold lg:hidden">
                    Order summary
                  </h2>
                  {!checkout?.summary?.items ? (
                    // Show skeleton loaders when not initialized
                    <>
                      <OrderItemSkeleton />
                      <OrderItemSkeleton />
                      <OrderItemSkeleton />
                    </>
                  ) : (
                    checkout?.summary.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative">
                          <img
                            src={item.variant.imageUrl}
                            alt="Noir Mini Dress"
                            className="h-[62px] w-[62px] rounded-lg object-cover"
                            style={{
                              imageRendering: "auto",
                              // Use pixel density aware srcset for higher quality on retina screens
                            }}
                            srcSet={
                              item.variant.imageUrl
                                ? `${
                                    item.variant.imageUrl
                                  } 1x, ${item.variant.imageUrl.replace(
                                    /(\.[\w\d_-]+)$/i,
                                    "@2x$1"
                                  )} 2x`
                                : undefined
                            }
                            loading="lazy"
                            decoding="async"
                            width={62}
                            height={62}
                          />
                          <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(102,102,102)] text-xs font-medium text-white">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="mt-4 flex-1">
                          <h3 className="text-sm">{item.product.name}</h3>
                          <p className="text-xs text-gray-600">
                            {item.variant.name}
                          </p>
                        </div>
                        <p className="mt-4 text-sm">
                          {item.adjustedAmount > 0
                            ? formatMoney(item.adjustedAmount)
                            : "Free"}
                        </p>
                      </div>
                    ))
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1 bg-white"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleApplyDiscountCode();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      className="border-gray-300 bg-gray-300 text-gray-700 hover:bg-gray-400"
                      onClick={handleApplyDiscountCode}
                      disabled={isApplying || !discountCode.trim()}
                    >
                      {isApplying ? "Applying..." : "Apply"}
                    </Button>
                  </div>

                  {/* Applied discounts */}
                  {appliedDiscounts && appliedDiscounts.length > 0 && (
                    <div className="space-y-2">
                      {appliedDiscounts
                        .filter((discount) => discount.promotionCodeId)
                        .map((discount) => (
                          <div
                            key={discount.id}
                            className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-800">
                                {discount.promotion.name} - Discount applied
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveDiscountCode(discount.promotionId)
                              }
                              disabled={isRemoving}
                              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {isRemoving ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Discount error */}
                  {discountsError && (
                    <div className="rounded border border-red-200 bg-red-50 p-2">
                      <p className="text-sm text-red-600">
                        {discountsError.message}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-900">Subtotal</span>
                      <span className="text-gray-900">
                        {formatMoney(
                          (checkout?.summary as any)?.subtotalAdjustedAmount ||
                            0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-900">Shipping</span>
                      </div>
                      <span className="text-gray-500">Free</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 text-[19px] font-semibold">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">
                      {formatMoney(checkout?.summary.totalAdjustedAmount || 0)}
                    </span>
                  </div>
                </div>

                {/* Customer Reviews */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-3.5 rounded-lg border border-[rgb(222,222,222)] p-3.5">
                    {pluginConfig.customerReviews.map((review, index) => (
                      <div
                        key={`review-${review.name}-${index}`}
                        className="flex flex-col gap-[5px]"
                      >
                        <div className="flex items-center gap-2 text-sm font-bold">
                          {review.name}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="79"
                            height="11"
                            viewBox="0 0 79 11"
                            fill="none"
                          >
                            <path
                              d="M7.56989 4.29954C7.77491 4.09451 7.77491 3.7621 7.56989 3.55708C7.36486 3.35205 7.03245 3.35205 6.82743 3.55708L4.74866 5.63585L3.89489 4.78208C3.68986 4.57705 3.35745 4.57705 3.15243 4.78208C2.9474 4.9871 2.9474 5.31951 3.15243 5.52454L4.37743 6.74954C4.58245 6.95456 4.91486 6.95456 5.11989 6.74954L7.56989 4.29954Z"
                              fill="#00A57D"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M10.1737 4.97831C10.1737 7.6845 7.97985 9.87831 5.27366 9.87831C2.56746 9.87831 0.373657 7.6845 0.373657 4.97831C0.373657 2.27211 2.56746 0.0783081 5.27366 0.0783081C7.97985 0.0783081 10.1737 2.27211 10.1737 4.97831ZM9.12366 4.97831C9.12366 7.1046 7.39995 8.82831 5.27366 8.82831C3.14736 8.82831 1.42366 7.1046 1.42366 4.97831C1.42366 2.85201 3.14736 1.12831 5.27366 1.12831C7.39995 1.12831 9.12366 2.85201 9.12366 4.97831Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M15.2082 8.97833L12.6106 1.93243H13.5334L15.6037 7.84064H15.6819L17.7522 1.93243H18.675L16.0774 8.97833H15.2082Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M21.4631 9.07111C19.9592 9.07111 19.051 8.01642 19.051 6.36603V6.36115C19.051 4.73517 19.9787 3.62189 21.4094 3.62189C22.8401 3.62189 23.7092 4.68634 23.7092 6.25861V6.59064H19.9201C19.9445 7.6795 20.5451 8.31427 21.4826 8.31427C22.1955 8.31427 22.635 7.97736 22.7766 7.65997L22.7961 7.61603H23.6457L23.636 7.65509C23.4553 8.36798 22.7033 9.07111 21.4631 9.07111ZM21.4045 4.37872C20.6233 4.37872 20.0276 4.91095 19.9348 5.91193H22.8449C22.757 4.87189 22.1809 4.37872 21.4045 4.37872Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M25.0276 8.97833V3.71466H25.8772V4.49591H25.9553C26.1555 3.94415 26.6487 3.62189 27.3615 3.62189C27.5227 3.62189 27.7033 3.64142 27.7863 3.65607V4.48126C27.6106 4.45197 27.4494 4.43243 27.2639 4.43243C26.4533 4.43243 25.8772 4.94513 25.8772 5.71661V8.97833H25.0276Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M29.2854 2.69904C28.9631 2.69904 28.6994 2.43536 28.6994 2.1131C28.6994 1.79083 28.9631 1.52716 29.2854 1.52716C29.6076 1.52716 29.8713 1.79083 29.8713 2.1131C29.8713 2.43536 29.6076 2.69904 29.2854 2.69904ZM28.8557 8.97833V3.71466H29.7053V8.97833H28.8557Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M31.6584 8.97833V4.41779H30.7844V3.71466H31.6584V3.12872C31.6584 2.07892 32.1858 1.57599 33.1867 1.57599C33.3918 1.57599 33.5774 1.59064 33.7531 1.62482V2.30353C33.6506 2.284 33.509 2.27911 33.3576 2.27911C32.7522 2.27911 32.508 2.57697 32.508 3.15314V3.71466H33.7043V4.41779H32.508V8.97833H31.6584Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M35.3791 2.69904C35.0569 2.69904 34.7932 2.43536 34.7932 2.1131C34.7932 1.79083 35.0569 1.52716 35.3791 1.52716C35.7014 1.52716 35.9651 1.79083 35.9651 2.1131C35.9651 2.43536 35.7014 2.69904 35.3791 2.69904ZM34.9494 8.97833V3.71466H35.799V8.97833H34.9494Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M39.549 9.07111C38.0451 9.07111 37.1369 8.01642 37.1369 6.36603V6.36115C37.1369 4.73517 38.0647 3.62189 39.4953 3.62189C40.926 3.62189 41.7951 4.68634 41.7951 6.25861V6.59064H38.0061C38.0305 7.6795 38.6311 8.31427 39.5686 8.31427C40.2815 8.31427 40.7209 7.97736 40.8625 7.65997L40.882 7.61603H41.7317L41.7219 7.65509C41.5412 8.36798 40.7893 9.07111 39.549 9.07111ZM39.4904 4.37872C38.7092 4.37872 38.1135 4.91095 38.0207 5.91193H40.9309C40.843 4.87189 40.2668 4.37872 39.4904 4.37872Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M45.0569 9.07111C43.7238 9.07111 42.8498 7.992 42.8498 6.35138V6.34161C42.8498 4.69122 43.719 3.62189 45.0569 3.62189C45.7795 3.62189 46.4094 3.98322 46.6975 4.54474H46.7756V1.62482H47.6252V8.97833H46.7756V8.13849H46.6975C46.3752 8.72443 45.7893 9.07111 45.0569 9.07111ZM45.2522 8.31915C46.2092 8.31915 46.7951 7.5672 46.7951 6.35138V6.34161C46.7951 5.12579 46.2092 4.37384 45.2522 4.37384C44.2903 4.37384 43.719 5.11603 43.719 6.34161V6.35138C43.719 7.57697 44.2903 8.31915 45.2522 8.31915Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M52.176 8.97833V1.93243H54.8713C56.1653 1.93243 56.9563 2.61115 56.9563 3.68536V3.69513C56.9563 4.42267 56.4192 5.08673 55.7404 5.2088V5.28693C56.7024 5.409 57.3127 6.06818 57.3127 6.99591V7.00568C57.3127 8.24103 56.424 8.97833 54.925 8.97833H52.176ZM54.6858 2.7088H53.0549V4.96954H54.4612C55.5256 4.96954 56.0676 4.58868 56.0676 3.8465V3.83673C56.0676 3.12384 55.5598 2.7088 54.6858 2.7088ZM54.7102 5.72638H53.0549V8.20197H54.7932C55.8528 8.20197 56.4094 7.77228 56.4094 6.96173V6.95197C56.4094 6.14142 55.8332 5.72638 54.7102 5.72638Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M60.4035 9.07111C59.2072 9.07111 58.592 8.36798 58.592 7.12286V3.71466H59.4416V6.91779C59.4416 7.86505 59.7834 8.31915 60.6233 8.31915C61.551 8.31915 62.0442 7.75275 62.0442 6.8299V3.71466H62.8938V8.97833H62.0442V8.1922H61.966C61.7072 8.75372 61.175 9.07111 60.4035 9.07111Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M64.9299 10.824C64.8176 10.824 64.6711 10.8143 64.5539 10.7947V10.0965C64.6565 10.116 64.7883 10.1209 64.9055 10.1209C65.3889 10.1209 65.6819 9.90118 65.8723 9.29572L65.9699 8.98322L64.0217 3.71466H64.9299L66.3752 8.04572H66.4533L67.8938 3.71466H68.7873L66.7317 9.3006C66.2971 10.4822 65.8625 10.824 64.9299 10.824Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M71.8635 9.07111C70.3596 9.07111 69.4514 8.01642 69.4514 6.36603V6.36115C69.4514 4.73517 70.3791 3.62189 71.8098 3.62189C73.2404 3.62189 74.1096 4.68634 74.1096 6.25861V6.59064H70.3205C70.3449 7.6795 70.9455 8.31427 71.883 8.31427C72.5959 8.31427 73.0354 7.97736 73.177 7.65997L73.1965 7.61603H74.0461L74.0363 7.65509C73.8557 8.36798 73.1037 9.07111 71.8635 9.07111ZM71.8049 4.37872C71.0237 4.37872 70.4279 4.91095 70.3352 5.91193H73.2453C73.1574 4.87189 72.5813 4.37872 71.8049 4.37872Z"
                              fill="#00A57D"
                            />
                            <path
                              d="M75.4279 8.97833V3.71466H76.2776V4.49591H76.3557C76.5559 3.94415 77.049 3.62189 77.7619 3.62189C77.9231 3.62189 78.1037 3.64142 78.1867 3.65607V4.48126C78.011 4.45197 77.8498 4.43243 77.6643 4.43243C76.8537 4.43243 76.2776 4.94513 76.2776 5.71661V8.97833H75.4279Z"
                              fill="#00A57D"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center gap-[5px]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <p className="text-xs leading-[18px]">
                          {review.review}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Collapsible className="rounded-lg border border-gray-200 bg-[hsl(0,0%,83%)]">
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-900 transition-colors duration-200 focus:outline-none">
                    <span>{pluginConfig?.terms?.title}</span>
                    <svg
                      className="h-4 w-4 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 text-sm leading-relaxed text-gray-700">
                    <div className="space-y-3">
                      <p>{pluginConfig?.terms?.paragraphFirst}</p>
                      {pluginConfig?.terms?.bullets && (
                        <ul className="space-y-2 pl-4">
                          {pluginConfig.terms.bullets.map((bullet, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 text-green-600">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p>{pluginConfig?.terms?.paragraphEnd}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <div className="mt-auto flex flex-wrap gap-4 border-t border-gray-200 pt-3.5 text-sm text-gray-600 lg:hidden">
                <a
                  href={pluginConfig?.footerLinks?.refundPolicy?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.refundPolicy?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.shipping?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.shipping?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.privacyPolicy?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.privacyPolicy?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.termsOfService?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.termsOfService?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.cancellations?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.cancellations?.text}
                </a>
                <a
                  href={pluginConfig?.footerLinks?.contact?.href}
                  className="transition-colors hover:text-gray-900"
                >
                  {pluginConfig?.footerLinks?.contact?.text}
                </a>
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
