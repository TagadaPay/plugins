"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useBrandingColors } from "@/lib/branding";
import { cn } from "@/lib/utils";
import { ExpressCheckoutConfig, OrderItemConfig } from "@/types/plugin-config";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatMoney,
  useCheckout,
  useGoogleAutocomplete,
  useISOData,
  usePayment,
  usePluginConfig,
  useShippingRates,
  type GooglePrediction,
} from "@tagadapay/plugin-sdk/v2";
import { ArrowRight, CreditCard, Lock, Package, Truck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

// Card formatting utilities
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(" ");
  } else {
    return v;
  }
};

const formatExpiryDate = (value: string) => {
  const v = value.replace(/\D/g, "");
  if (v.length >= 2) {
    return v.substring(0, 2) + "/" + v.substring(2, 4);
  }
  return v;
};

// Form validation schema
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

interface ExpressCheckout01Props {
  checkoutToken?: string;
  orderItems?: OrderItemConfig[];
  subtotal?: number;
  discount?: {
    code: string;
    amount: number;
  };
  currency?: string;
  className?: string;
}

const getText = (value: string | undefined, fallback: string) =>
  value ?? fallback;

export default function ExpressCheckout({
  checkoutToken,
  subtotal,
  discount,
  currency = "USD",
  className,
}: ExpressCheckout01Props) {
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  // Plugin configuration
  const { config } = usePluginConfig<ExpressCheckoutConfig>();
  const brandingColors = useBrandingColors();

  const checkoutTexts = config?.texts?.checkout;
  const placeholderProductImage =
    config?.images?.placeholderProduct ?? "/placeholder.svg";

  const headerTitle = getText(
    checkoutTexts?.header?.title,
    "Complete your order"
  );
  const headerSubtitle = getText(
    checkoutTexts?.header?.subtitle,
    "Secure checkout powered by industry-leading encryption"
  );
  const contactTitleText = getText(
    checkoutTexts?.contact?.title,
    "Contact Information"
  );
  const contactEmailLabel = getText(
    checkoutTexts?.contact?.emailLabel,
    "Email address"
  );
  const contactEmailPlaceholder = getText(
    checkoutTexts?.contact?.emailPlaceholder,
    "john@example.com"
  );
  const contactPhoneLabel = getText(
    checkoutTexts?.contact?.phoneLabel,
    "Phone number"
  );
  const contactPhonePlaceholder = getText(
    checkoutTexts?.contact?.phonePlaceholder,
    "+1 (555) 123-4567"
  );
  const shippingTitleText = getText(
    checkoutTexts?.shipping?.title,
    "Shipping Address"
  );
  const countryLabel = getText(
    checkoutTexts?.shipping?.countryLabel,
    "Country"
  );
  const countryHint = checkoutTexts?.shipping?.countryHint;
  const countryPlaceholder = getText(
    checkoutTexts?.shipping?.countryPlaceholder,
    "Select Country"
  );
  const countryHelperText = checkoutTexts?.shipping?.countryHelper;
  const countrySelectedToast = checkoutTexts?.shipping?.countrySelectedToast;
  const addressLabel = getText(
    checkoutTexts?.shipping?.addressLabel,
    "Street Address"
  );
  const addressPlaceholder = getText(
    checkoutTexts?.shipping?.addressPlaceholder,
    "Start typing your address..."
  );
  const addressPlaceholderNoCountry = getText(
    checkoutTexts?.shipping?.addressPlaceholderNoCountry,
    "Please select country first"
  );
  const address2Label = getText(
    checkoutTexts?.shipping?.address2Label,
    "Apartment, suite, etc. (optional)"
  );
  const address2Placeholder = getText(
    checkoutTexts?.shipping?.address2Placeholder,
    "Apt 4B"
  );
  const cityLabel = getText(checkoutTexts?.shipping?.cityLabel, "City");
  const cityPlaceholder = getText(
    checkoutTexts?.shipping?.cityPlaceholder,
    "New York"
  );
  const postalLabel = getText(checkoutTexts?.shipping?.postalLabel, "ZIP Code");
  const postalPlaceholder = getText(
    checkoutTexts?.shipping?.postalPlaceholder,
    "10001"
  );
  const stateLabel = getText(
    checkoutTexts?.shipping?.stateLabel,
    "State/Province"
  );
  const statePlaceholder = getText(
    checkoutTexts?.shipping?.statePlaceholder,
    "Enter state/province"
  );
  const stateSelectPlaceholder = getText(
    checkoutTexts?.shipping?.stateSelectPlaceholder,
    "Select State/Province"
  );
  const stateInputLabel = getText(
    checkoutTexts?.shipping?.stateInputLabel,
    "text input"
  );
  const shippingMethodTitle = getText(
    checkoutTexts?.shippingMethod?.title,
    "Shipping Method"
  );
  const shippingMethodBadge = getText(checkoutTexts?.shippingMethod?.badge, "");
  const shippingMethodNoteTitle = getText(
    checkoutTexts?.shippingMethod?.noteTitle,
    "Note"
  );
  const shippingMethodNote = getText(
    checkoutTexts?.shippingMethod?.note,
    "Shipping method selection is for display purposes only. Actual shipping costs and methods will be calculated during payment processing."
  );
  const shippingMethodFreeLabel = getText(
    checkoutTexts?.shippingMethod?.freeLabel,
    "Free"
  );
  const paymentTitleText = getText(
    checkoutTexts?.payment?.title,
    "Payment Information"
  );
  const cardNumberLabel = getText(
    checkoutTexts?.payment?.cardNumberLabel,
    "Card number"
  );
  const cardNumberPlaceholder = getText(
    checkoutTexts?.payment?.cardNumberPlaceholder,
    "4242 4242 4242 4242"
  );
  const expiryLabel = getText(
    checkoutTexts?.payment?.expiryLabel,
    "Expiry date"
  );
  const expiryPlaceholder = getText(
    checkoutTexts?.payment?.expiryPlaceholder,
    "12/28"
  );
  const cvcLabel = getText(checkoutTexts?.payment?.cvcLabel, "CVV");
  const cvcPlaceholder = getText(checkoutTexts?.payment?.cvcPlaceholder, "123");
  const orderSummaryTitle = getText(
    checkoutTexts?.orderSummary?.title,
    "Order Summary"
  );
  const subtotalLabelText = getText(
    checkoutTexts?.orderSummary?.subtotalLabel,
    "Subtotal"
  );
  const shippingLabelText = getText(
    checkoutTexts?.orderSummary?.shippingLabel,
    "Shipping"
  );
  const shippingCalculatedText = getText(
    checkoutTexts?.orderSummary?.shippingCalculatedText,
    "Calculated at checkout"
  );
  const taxLabelText = getText(checkoutTexts?.orderSummary?.taxLabel, "Tax");
  const discountLabelText = getText(
    checkoutTexts?.orderSummary?.discountLabel,
    "Discount"
  );
  const totalLabelText = getText(
    checkoutTexts?.orderSummary?.totalLabel,
    "Total"
  );
  const quantityLabelText = getText(
    checkoutTexts?.orderSummary?.quantityLabel,
    "Qty"
  );
  const completeOrderLabel = getText(
    checkoutTexts?.buttons?.completeOrderLabel,
    "Complete Order"
  );
  const processingLabel = getText(
    checkoutTexts?.buttons?.processingLabel,
    "Processing..."
  );
  const initializingMessage = getText(
    checkoutTexts?.messages?.initializing,
    "Initializing checkout..."
  );
  const securityTitle = getText(
    checkoutTexts?.messages?.securityTitle,
    "Secured by 256-bit SSL encryption"
  );
  const securitySubtitle = getText(
    checkoutTexts?.messages?.securitySubtitle,
    "Your payment information is safe and secure"
  );
  const validationErrorText = getText(
    checkoutTexts?.errors?.validation,
    "Please fix the errors above before continuing."
  );
  const stateRequiredText = getText(
    checkoutTexts?.errors?.stateRequired,
    "Please enter a state/province for the selected country."
  );
  const paymentSuccessText = getText(
    checkoutTexts?.notifications?.paymentSuccess,
    "Payment successful! 🎉"
  );
  const paymentFailedText = getText(
    checkoutTexts?.notifications?.paymentFailed,
    "Payment processing failed. Please try again."
  );
  const paymentFailedWithReasonText = getText(
    checkoutTexts?.notifications?.paymentFailedWithReason,
    "Payment failed: {error}"
  );
  const paymentVerificationText = getText(
    checkoutTexts?.notifications?.paymentVerification,
    "Please complete the additional security verification..."
  );
  const formatPaymentFailureMessage = (errorMsg?: string) => {
    if (paymentFailedWithReasonText.includes("{error}")) {
      return paymentFailedWithReasonText.replace("{error}", errorMsg ?? "");
    }
    return paymentFailedWithReasonText;
  };
  // Static plugin config (for demo purposes)
  // Initialize checkout session
  const { checkout, updateCustomerAndSessionInfo } = useCheckout({
    checkoutToken,
  });

  // Payment processing
  const { processCardPayment, isLoading: isPaymentLoading } = usePayment();

  // Google Autocomplete for address
  const googleMapsApiKey =
    config?.googleApiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    console.warn(
      "⚠️ Google Maps API key not found. Please create a .env.local file with VITE_GOOGLE_MAPS_API_KEY"
    );
  }

  const googleAutocomplete = useGoogleAutocomplete({
    apiKey: googleMapsApiKey || "",
    language: "en",
  });

  // ISO data for countries and states
  const { countries, getRegions, mapGoogleToISO } = useISOData();

  // Shipping rates from SDK
  const shippingRatesResult = useShippingRates({
    checkout,
  });
  const {
    shippingRates,
    selectedRate,
    selectRate,
    isLoading: isShippingRatesLoading,
    error: shippingRatesError,
    refetch: refreshShippingRates,
  } = shippingRatesResult;

  const [localSelectedShippingRateId, setLocalSelectedShippingRateId] =
    useState<string | null>(selectedRate?.id ?? null);
  const shippingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    if (selectedRate?.id) {
      setLocalSelectedShippingRateId(selectedRate.id);
    }
  }, [selectedRate?.id]);

  useEffect(() => {
    return () => {
      if (shippingDebounceRef.current) {
        clearTimeout(shippingDebounceRef.current);
      }
      if (addressDebounceRef.current) {
        clearTimeout(addressDebounceRef.current);
      }
    };
  }, []);

  // State for address autocomplete
  const [addressInput, setAddressInput] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableStates, setAvailableStates] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form setup with validation
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
      country: "US",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
    },
  });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

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

  // Debounced address search
  const debouncedAddressSearch = useCallback(
    (query: string, country: string) => {
      if (addressDebounceRef.current) {
        clearTimeout(addressDebounceRef.current);
      }

      addressDebounceRef.current = setTimeout(() => {
        if (!query || !country) {
          googleAutocomplete.clearPredictions();
          setShowPredictions(false);
          setIsSearching(false);
          return;
        }

        if (query.length < 3) {
          googleAutocomplete.clearPredictions();
          setShowPredictions(false);
          setIsSearching(false);
          return;
        }

        setIsSearching(true);
        try {
          googleAutocomplete.searchPlaces(query, country);
          setShowPredictions(true);
        } catch (err) {
          console.error("Error searching places:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [googleAutocomplete]
  );

  // Address autocomplete handlers
  const handleAddressInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isCountrySelected) {
        return; // Don't allow address input without country selection
      }

      const value = e.target.value;
      setAddressInput(value);
      setValue("address1", value);
      debouncedAddressSearch(value, selectedCountry);
    },
    [isCountrySelected, selectedCountry, debouncedAddressSearch, setValue]
  );

  const handlePredictionSelect = useCallback(
    async (prediction: GooglePrediction) => {
      setAddressInput(prediction.description);
      setShowPredictions(false);

      // Get detailed place information
      const placeDetails = await googleAutocomplete.getPlaceDetails(
        prediction.place_id
      );

      if (placeDetails) {
        const extracted =
          googleAutocomplete.extractAddressComponents(placeDetails);

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
    [googleAutocomplete, setValue, selectedCountry, mapGoogleToISO]
  );

  // Handle country selection change with user feedback
  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const countryCode = e.target.value;
      setValue("country", countryCode);

      if (countryCode && !isCountrySelected && countrySelectedToast) {
        toast.success(countrySelectedToast);
      }
    },
    [setValue, isCountrySelected, countrySelectedToast]
  );

  // Card formatting handlers
  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCardNumber(e.target.value);
      setValue("cardNumber", formatted);

      // Auto-focus to expiry when card number is complete (16 digits)
      const digitsOnly = formatted.replace(/\s/g, "");
      if (digitsOnly.length === 16) {
        expiryRef.current?.focus();
      }
    },
    [setValue]
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatExpiryDate(e.target.value);
      setValue("expiryDate", formatted);

      // Auto-focus to CVC when expiry is complete (MM/YY format)
      if (formatted.length === 5) {
        cvcRef.current?.focus();
      }
    },
    [setValue]
  );

  const handleCvcChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "").substring(0, 4); // Max 4 digits for Amex
      setValue("cvc", value);
    },
    [setValue]
  );

  // Auto-save customer and session info using form data
  const saveCheckoutInfo = useCallback(async () => {
    if (!checkout?.checkoutSession?.id) return;

    const formData = form.getValues();

    try {
      await updateCustomerAndSessionInfo({
        customerData: {
          email: formData.email,
          acceptsMarketing: false,
        },
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address1,
          address2: formData.address2 || "",
          city: formData.city,
          state: formData.state,
          postal: formData.postal,
          country: formData.country,
          phone: formData.phone,
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address1,
          address2: formData.address2 || "",
          city: formData.city,
          state: formData.state,
          postal: formData.postal,
          country: formData.country,
          phone: formData.phone,
        },
      });
    } catch (error) {
      console.error("Failed to save checkout info:", error);
    }
  }, [checkout?.checkoutSession?.id, updateCustomerAndSessionInfo, form]);

  // Payment Handler with unified form validation
  const handlePayment = async () => {
    // Validate all form fields
    const isValid = await form.trigger();

    if (!isValid) {
      // Find first error field and focus it
      const fieldPriority = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "address1",
        "country",
        "city",
        "state",
        "postal",
        "cardNumber",
        "expiryDate",
        "cvc",
      ];

      for (const fieldName of fieldPriority) {
        if ((errors as any)[fieldName]) {
          const fieldElement = document.querySelector(
            `[name="${fieldName}"]`
          ) as HTMLElement;
          if (fieldElement) {
            fieldElement.focus();
            fieldElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
          break;
        }
      }

      toast.error(validationErrorText);
      return;
    }

    // Save checkout info before processing payment
    await saveCheckoutInfo();

    try {
      const formData = form.getValues();

      // Enhanced validation for state field
      const isStateRequired =
        availableStates.length > 0 ||
        ["US", "CA", "GB"].includes(formData.country);
      if (isStateRequired && !formData.state?.trim()) {
        toast.error(stateRequiredText);
        return;
      }

      await processCardPayment(
        checkout?.checkoutSession?.id!,
        {
          cardNumber: formData.cardNumber.replace(/\s+/g, ""),
          expiryDate: formData.expiryDate,
          cvc: formData.cvc,
        },
        {
          enableThreeds: true,
          initiatedBy: "customer",
          source: "checkout",
          onSuccess: () => {
            toast.success(paymentSuccessText);
          },
          onFailure: (errorMsg) => {
            toast.error(formatPaymentFailureMessage(errorMsg));
          },
          onRequireAction: () => {
            toast.loading(paymentVerificationText);
          },
        }
      );
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error(paymentFailedText);
    }
  };

  // Get actual checkout data from SDK
  const checkoutSummary = checkout?.summary; // Use any to access runtime properties
  const checkoutItems = checkoutSummary?.items || [];
  const actualCurrency = checkoutSummary?.currency || currency;

  // Use SDK data if available, otherwise fall back to props or defaults
  // Don't divide by 100 here since formatMoney handles the conversion
  const actualSubtotal =
    checkoutSummary?.subtotalAmount ?? (subtotal ? subtotal * 100 : 0);
  const actualTax = checkoutSummary?.totalTaxAmount ?? 0;
  const actualShippingCost = checkoutSummary?.shippingCost ?? 0;
  const actualPromotionAmount = checkoutSummary?.totalPromotionAmount ?? 0;

  // Convert SDK items to our format - use the correct property structure
  const displayItems =
    checkoutItems.length > 0
      ? checkoutItems.map((item) => ({
          id: item.id,
          name:
            item.orderLineItemVariant?.name ||
            item.orderLineItemProduct?.name ||
            item.variant?.name ||
            item.product?.name,
          quantity: item.quantity,
          unitPrice: item.unitAmount, // Don't divide by 100, formatMoney will handle it
          imageUrl:
            item.orderLineItemVariant?.imageUrl || item.variant?.imageUrl,
        }))
      : [];
  const formatPrice = (amount: number) => {
    return formatMoney(amount, actualCurrency);
  };

  // Shipping method is display-only, not connected to payment calculations
  // Use only SDK shipping cost, no mock shipping calculations
  const displayShippingCost = actualShippingCost;

  // Calculate final total using only SDK data, no mock shipping
  const finalTotal = checkoutSummary?.totalAmount
    ? checkoutSummary.totalAmount
    : actualSubtotal +
      actualTax +
      displayShippingCost -
      (discount?.amount ? discount.amount * 100 : 0);

  // Show loading state while checkout is initializing

  console.log("checkout", checkout, checkoutToken);
  if (!checkout?.checkoutSession && !checkoutToken) {
    return (
      <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{initializingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Checkout Form */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {headerTitle}
            </h1>
            <p className="text-muted-foreground">{headerSubtitle}</p>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: brandingColors.primary,
                    color: "white",
                  }}
                >
                  1
                </div>
                {contactTitleText}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">{contactEmailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={contactEmailPlaceholder}
                  {...register("email")}
                  className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">{contactPhoneLabel}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={contactPhonePlaceholder}
                  {...register("phone")}
                  className={`mt-1 ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: brandingColors.primary,
                    color: "white",
                  }}
                >
                  2
                </div>
                {shippingTitleText}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register("firstName")}
                    className={`mt-1 ${
                      errors.firstName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register("lastName")}
                    className={`mt-1 ${
                      errors.lastName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Country Selection - Must be first */}
              <div>
                <Label htmlFor="country">
                  {countryLabel}{" "}
                  {countryHint && (
                    <span className="text-sm text-muted-foreground">
                      {countryHint}
                    </span>
                  )}
                </Label>
                <select
                  {...register("country")}
                  onChange={handleCountryChange}
                  className={`mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.country ? "border-red-500" : "border-input"
                  }`}
                >
                  <option value="">{countryPlaceholder}</option>
                  {Object.values(countries).map((country: any) => (
                    <option key={country.iso} value={country.iso}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Helpful message when no country is selected */}
              {!isCountrySelected && countryHelperText && (
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: brandingColors.primary50,
                    borderColor: brandingColors.primary200,
                  }}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: brandingColors.primary400 }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p
                        className="text-sm"
                        style={{ color: brandingColors.primary800 }}
                      >
                        {countryHelperText}
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
                <div className="relative">
                  <Label htmlFor="address1">
                    {addressLabel}
                    {!isCountrySelected && countryHint && (
                      <span className="text-sm text-muted-foreground ml-2">
                        {countryHint}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="address1"
                    value={addressInput}
                    onChange={handleAddressInputChange}
                    disabled={!isCountrySelected}
                    placeholder={
                      isCountrySelected
                        ? addressPlaceholder
                        : addressPlaceholderNoCountry
                    }
                    className={`mt-1 disabled:bg-muted disabled:cursor-not-allowed ${
                      errors.address1 ? "border-red-500" : ""
                    }`}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    </div>
                  )}
                  {errors.address1 && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address1.message}
                    </p>
                  )}

                  {/* Google Autocomplete Predictions */}
                  {showPredictions &&
                    googleAutocomplete.predictions.length > 0 &&
                    isCountrySelected && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {googleAutocomplete.predictions.map((prediction) => (
                          <button
                            key={prediction.place_id}
                            type="button"
                            onClick={() => handlePredictionSelect(prediction)}
                            className="w-full px-3 py-2 text-left hover:bg-accent border-b border-border last:border-b-0"
                          >
                            <div className="font-medium text-sm">
                              {prediction.structured_formatting?.main_text}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {prediction.structured_formatting?.secondary_text}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <div>
                  <Label htmlFor="address2">{address2Label}</Label>
                  <Input
                    id="address2"
                    {...register("address2")}
                    disabled={!isCountrySelected}
                    placeholder={address2Placeholder}
                    className="mt-1 disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{cityLabel}</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      disabled={!isCountrySelected}
                      placeholder={cityPlaceholder}
                      className={`mt-1 disabled:bg-muted disabled:cursor-not-allowed ${
                        errors.city ? "border-red-500" : ""
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postal">{postalLabel}</Label>
                    <Input
                      id="postal"
                      {...register("postal")}
                      disabled={!isCountrySelected}
                      placeholder={postalPlaceholder}
                      className={`mt-1 disabled:bg-muted disabled:cursor-not-allowed ${
                        errors.postal ? "border-red-500" : ""
                      }`}
                    />
                    {errors.postal && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.postal.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="state">
                    {stateLabel}
                    <span className="text-xs text-muted-foreground ml-2">
                      (
                      {availableStates.length > 0
                        ? `${availableStates.length} options`
                        : stateInputLabel}
                      )
                    </span>
                  </Label>
                  {availableStates.length > 0 ? (
                    <select
                      {...register("state")}
                      disabled={!isCountrySelected}
                      className={`mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed ${
                        errors.state ? "border-red-500" : "border-input"
                      }`}
                    >
                      <option value="">{stateSelectPlaceholder}</option>
                      {availableStates.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="state"
                      {...register("state")}
                      disabled={!isCountrySelected}
                      placeholder={
                        isCountrySelected
                          ? statePlaceholder
                          : addressPlaceholderNoCountry
                      }
                      className={`mt-1 disabled:bg-muted disabled:cursor-not-allowed ${
                        errors.state ? "border-red-500" : ""
                      }`}
                    />
                  )}
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method - from checkout session shipping rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: brandingColors.primary,
                    color: "white",
                  }}
                >
                  3
                </div>
                {shippingMethodTitle}
                {shippingMethodBadge && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full ml-auto">
                    {shippingMethodBadge}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="mb-3 rounded-lg border p-3"
                style={{
                  backgroundColor: brandingColors.primary50,
                  borderColor: brandingColors.primary200,
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: brandingColors.primary700 }}
                >
                  <span className="font-medium">
                    {shippingMethodNoteTitle}:
                  </span>{" "}
                  {shippingMethodNote}
                </p>
              </div>

              {shippingRatesError && (
                <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {shippingRatesError.message ||
                    "Failed to load shipping methods. Please try again after updating your address."}
                </div>
              )}

              {!shippingRates?.length && !isShippingRatesLoading ? (
                <div className="text-sm text-muted-foreground">
                  Enter your shipping address to view available shipping
                  methods.
                </div>
              ) : (
                <RadioGroup
                  value={localSelectedShippingRateId ?? ""}
                  onValueChange={(rateId) => {
                    setLocalSelectedShippingRateId(rateId);
                    if (shippingDebounceRef.current) {
                      clearTimeout(shippingDebounceRef.current);
                    }
                    shippingDebounceRef.current = setTimeout(() => {
                      selectRate?.(rateId)?.then(() => {
                        refreshShippingRates?.();
                      });
                    }, 800);
                  }}
                >
                  <div className="space-y-3">
                    {isShippingRatesLoading && !shippingRates?.length && (
                      <div className="space-y-2">
                        <div className="flex animate-pulse items-center justify-between rounded-lg border border-border p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-muted" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 rounded bg-muted" />
                              <div className="h-3 w-24 rounded bg-muted" />
                            </div>
                          </div>
                          <div className="h-4 w-16 rounded bg-muted" />
                        </div>
                      </div>
                    )}
                    {shippingRates?.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="flex flex-1 items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <Label
                                htmlFor={method.id}
                                className="cursor-pointer font-medium"
                              >
                                {method.shippingRateName}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {method.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-muted-foreground">
                              {method.isFree
                                ? shippingMethodFreeLabel
                                : formatMoney(method.amount, method.currency)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: brandingColors.primary,
                    color: "white",
                  }}
                >
                  4
                </div>
                {paymentTitleText}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">{cardNumberLabel}</Label>
                <div className="relative mt-1">
                  <Input
                    id="cardNumber"
                    ref={cardNumberRef}
                    value={watch("cardNumber") || ""}
                    onChange={handleCardNumberChange}
                    placeholder={cardNumberPlaceholder}
                    maxLength={19} // 16 digits + 3 spaces
                    className={`pl-10 ${
                      errors.cardNumber ? "border-red-500" : ""
                    }`}
                  />
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.cardNumber.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">{expiryLabel}</Label>
                  <Input
                    id="expiryDate"
                    ref={expiryRef}
                    value={watch("expiryDate") || ""}
                    onChange={handleExpiryChange}
                    placeholder={expiryPlaceholder}
                    maxLength={5} // MM/YY format
                    className={`mt-1 ${
                      errors.expiryDate ? "border-red-500" : ""
                    }`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.expiryDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cvc">{cvcLabel}</Label>
                  <Input
                    id="cvc"
                    ref={cvcRef}
                    value={watch("cvc") || ""}
                    onChange={handleCvcChange}
                    placeholder={cvcPlaceholder}
                    maxLength={4} // Max 4 digits for Amex
                    className={`mt-1 ${errors.cvc ? "border-red-500" : ""}`}
                  />
                  {errors.cvc && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cvc.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {orderSummaryTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Items */}
              <div className="space-y-4">
                {displayItems.map((item: any) => {
                  const displayImageUrl =
                    item.imageUrl ?? placeholderProductImage;
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {displayImageUrl ? (
                          <img
                            src={displayImageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              e.currentTarget.style.display = "none";
                              const fallbackDiv = e.currentTarget
                                .nextElementSibling as HTMLElement;
                              if (fallbackDiv) {
                                fallbackDiv.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center text-lg"
                          style={{ display: displayImageUrl ? "none" : "flex" }}
                        >
                          {item.image || "📦"}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {quantityLabelText}: {item.quantity} ×{" "}
                          {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {subtotalLabelText}
                  </span>
                  <span>{formatPrice(actualSubtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {shippingLabelText}
                  </span>
                  <span>
                    {displayShippingCost === 0 ? (
                      <span className="text-muted-foreground">
                        {shippingCalculatedText}
                      </span>
                    ) : (
                      formatPrice(displayShippingCost)
                    )}
                  </span>
                </div>

                {actualTax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {taxLabelText}
                    </span>
                    <span>{formatPrice(actualTax)}</span>
                  </div>
                )}

                {actualPromotionAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{discountLabelText}</span>
                    <span>-{formatPrice(actualPromotionAmount)}</span>
                  </div>
                )}

                {discount &&
                  discount.amount > 0 &&
                  actualPromotionAmount === 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        {discountLabelText}
                        {discount.code ? ` (${discount.code})` : ""}
                      </span>
                      <span>-{formatPrice(discount.amount * 100)}</span>
                    </div>
                  )}

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>{totalLabelText}</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handlePayment}
                disabled={isPaymentLoading || !checkout?.checkoutSession?.id}
                className="w-full h-12 text-base font-semibold"
                size="lg"
                style={{
                  backgroundColor: brandingColors.primary,
                  borderColor: brandingColors.primary,
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  if (!isPaymentLoading) {
                    e.currentTarget.style.backgroundColor =
                      brandingColors.primary700;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPaymentLoading) {
                    e.currentTarget.style.backgroundColor =
                      brandingColors.primary;
                  }
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isPaymentLoading
                  ? processingLabel
                  : `${completeOrderLabel} ${formatPrice(finalTotal)}`}
                {!isPaymentLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              {/* Security Notice */}
              <div className="text-center text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Lock className="w-3 h-3" />
                  <span>{securityTitle}</span>
                </div>
                <p>{securitySubtitle}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
