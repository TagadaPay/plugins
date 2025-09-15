import type React from "react";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PluginConfig } from "@/types/plugin-config";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckoutLineItem,
  formatMoney,
  useCheckout,
  useGoogleAutocomplete,
  useISOData,
  usePayment,
  usePluginConfig,
  type GooglePrediction,
} from "@tagadapay/plugin-sdk/react";
import { CreditCard, LockIcon, Mail, MapPin, Phone, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s/g, "").replace(/\D/g, "");
  return v.replace(/(\d{4})(?=\d)/g, "$1 ");
};

export const formatExpiryDate = (value: string): string => {
  const v = value.replace(/\D/g, "");
  if (v.length >= 2) {
    return v.substring(0, 2) + "/" + v.substring(2, 4);
  }
  return v;
};

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

type CardFormData = z.infer<typeof cardFormSchema>;

type CheckoutPageProps = {
  checkoutToken: string;
};

export default function CheckoutPage({ checkoutToken }: CheckoutPageProps) {
  const isLineItemsInitialized = useRef(false);
  const [isInitFailed, setIsInitFailed] = useState(false);
  const {
    processCardPayment,
    isLoading: isPaymentLoading,
    error: paymentError,
    clearError: clearPaymentError,
  } = usePayment();
  const {
    checkout,
    init,
    updateLineItems,
    isLoading,
    isInitialized,
    error,
    updateCustomerAndSessionInfo,
  } = useCheckout({
    checkoutToken, // Use the explicit token passed as prop
  });
  const { storeId, config } = usePluginConfig<PluginConfig>();

  const hasInitializedRef = useRef(false);

  const initialLineItems: CheckoutLineItem[] = [
    ...config.variants.map((variant) => ({
      variantId: variant,
      quantity: 1,
    })),
  ];

  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [lineItems, setLineItems] = useState<CheckoutLineItem[]>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Google Places and ISO data hooks
  const {
    predictions,
    searchPlaces,
    getPlaceDetails,
    extractAddressComponents,
    clearPredictions,
  } = useGoogleAutocomplete({
    apiKey: config.googleApiKey || "",
    language: "en",
  });

  const { countries, getRegions, mapGoogleToISO } = useISOData();

  // State for address autocomplete
  const [addressInput, setAddressInput] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableStates, setAvailableStates] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);

  useEffect(() => {
    if (isInitialized && checkout && !isLineItemsInitialized.current) {
      setLineItems(
        checkout.summary.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }))
      );
      isLineItemsInitialized.current = true;
    }
  }, [isInitFailed, checkout]);

  // Debounced effect to call updateLineItems when lineItems changes
  useEffect(() => {
    if (lineItems && isInitialized) {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout to call updateLineItems after 2 seconds
      debounceTimeoutRef.current = setTimeout(() => {
        updateLineItems(lineItems);
      }, 2000);
    }

    // Cleanup timeout on unmount or when lineItems changes
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [lineItems, isInitialized, updateLineItems]);

  useEffect(() => {
    if (
      !checkoutToken &&
      !checkout &&
      init &&
      !hasInitializedRef.current &&
      isInitFailed === false
    ) {
      hasInitializedRef.current = true;

      init({
        storeId,
        lineItems: initialLineItems,
      }).catch(() => {
        setIsInitFailed(true);
      });
    }
  }, [checkoutToken, checkout, init]);

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

  useEffect(() => {
    if (isLoading === false) {
      setIsSummaryLoading(false);
    }
  }, [isLoading]);

  const updateQuantity = (variantId: string, newQuantity: number) => {
    if (!checkout) return;
    setIsSummaryLoading(true);
    setLineItems(
      lineItems?.map((item) =>
        item.variantId === variantId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

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

  const handlePayment = async () => {
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

    // Get validated data from the form
    const formData = form.getValues();

    // Enhanced validation for state field
    const enhancedPaymentData = {
      ...formData,
      state:
        formData.state && formData.state.trim() ? formData.state.trim() : "N/A",
    };

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

  if (!isInitialized) {
    return <Loader />;
  }

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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header
        className="border-border border-b backdrop-blur-sm"
        style={{ backgroundColor: `${config.primaryColor}10` }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1
              className="text-2xl font-bold"
              style={{ color: config.primaryColor }}
            >
              {config.title}
            </h1>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <LockIcon
                className="size-4"
                style={{ color: config.primaryColor }}
              />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-foreground mb-8 text-3xl font-bold">
            Complete Your Order
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Order Summary */}
            <div className="lg:order-2">
              <Card className="sticky top-4 p-6">
                <h3 className="text-foreground mb-6 text-xl font-bold">
                  Order Summary
                </h3>

                <div className="mb-6 space-y-4">
                  {checkout?.summary.items.map((item) => {
                    const lineItem = lineItems?.find(
                      (lineItem) => lineItem.variantId === item.variantId
                    );
                    const quantity = lineItem?.quantity || item.quantity;
                    return (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.variant.imageUrl || "/placeholder.svg"}
                          alt={item.variant.name}
                          className="bg-muted h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-foreground text-sm font-semibold">
                            {item.variant.name}
                          </h4>
                          <p className="text-muted-foreground mb-2 text-xs">
                            {item.variant.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={quantity <= 1}
                                onClick={() =>
                                  item.quantity >= 1 &&
                                  updateQuantity(item.variantId, quantity - 1)
                                }
                                className="h-8 w-8 p-0"
                              >
                                -
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.variantId, quantity + 1)
                                }
                                className="h-8 w-8 p-0"
                              >
                                +
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-foreground font-semibold">
                                {formatMoney(item.adjustedAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                <div className="relative">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">
                        {formatMoney(checkout?.summary.totalAmount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground text-green-600 font-semibold">
                        Free
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span style={{ color: config.primaryColor }}>
                        {formatMoney(
                          checkout?.summary.totalAdjustedAmount || 0
                        )}
                      </span>
                    </div>
                  </div>
                  {isSummaryLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                      <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300"
                        style={{ borderTopColor: config.primaryColor }}
                      ></div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Checkout Form */}
            <div className="lg:order-1">
              <form
                onSubmit={form.handleSubmit(handlePayment)}
                className="space-y-6"
              >
                {/* Contact Information */}
                <Card className="p-6">
                  <h3 className="text-foreground mb-4 text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          {...form.register("email")}
                          placeholder="your@email.com"
                          className={`pl-10 ${
                            errors.email
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          {...form.register("firstName")}
                          placeholder="John"
                          className={
                            errors.firstName
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }
                          required
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          {...form.register("lastName")}
                          placeholder="Doe"
                          className={
                            errors.lastName
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }
                          required
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...form.register("phone")}
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className={`pl-10 ${
                            errors.phone
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                          required
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Shipping Information */}
                <Card className="p-6">
                  <h3 className="text-foreground mb-4 text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h3>

                  {/* Country Selection - Must be first */}
                  <div>
                    <Label htmlFor="country" className="mb-2 block">
                      Country *
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
                            "Great! Now you can enter your address details below."
                          );
                        }
                      }}
                      placeholder="Select Country"
                      className={
                        errors.country
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  {/* Helpful message when no country is selected */}
                  {!isCountrySelected && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
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
                            Please select your country first. This will enable
                            address autocomplete and ensure accurate shipping
                            options.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`space-y-4 ${
                      !isCountrySelected ? "opacity-50" : ""
                    }`}
                  >
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <div className="relative">
                        <Input
                          id="address"
                          value={addressInput}
                          onChange={handleAddressInputChange}
                          disabled={!isCountrySelected}
                          placeholder={
                            isCountrySelected
                              ? "Start typing your address..."
                              : "Please select country first"
                          }
                          className={
                            errors.address1
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }
                          required
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
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address1.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address2">Apartment, Suite, etc.</Label>
                      <Input
                        id="address2"
                        value={watch("address2")}
                        onChange={(e) => setValue("address2", e.target.value)}
                        disabled={!isCountrySelected}
                        placeholder="Apartment, suite, etc."
                        className={
                          errors.address2
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }
                      />
                      {errors.address2 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address2.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={watch("city")}
                          onChange={(e) => setValue("city", e.target.value)}
                          disabled={!isCountrySelected}
                          placeholder="Enter city"
                          className={
                            errors.city
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }
                          required
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">State / Province *</Label>
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
                            placeholder="Select State/Province"
                            className={
                              errors.state
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : ""
                            }
                          />
                        ) : (
                          <Input
                            id="state"
                            value={watch("state")}
                            onChange={(e) => setValue("state", e.target.value)}
                            placeholder={
                              isCountrySelected
                                ? "Enter state/province"
                                : "Select country first"
                            }
                            disabled={!isCountrySelected}
                            className={
                              errors.state
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : ""
                            }
                            required
                          />
                        )}
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP / Postal Code *</Label>
                      <Input
                        id="zipCode"
                        value={watch("postal")}
                        onChange={(e) => setValue("postal", e.target.value)}
                        disabled={!isCountrySelected}
                        placeholder="12345"
                        className={
                          errors.postal
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }
                        required
                      />
                      {errors.postal && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.postal.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    * Required fields
                  </p>
                </Card>

                {/* Payment Information */}
                <Card className="p-6">
                  <h3 className="text-foreground mb-4 text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        id="cardNumber"
                        value={watch("cardNumber")}
                        maxLength={19}
                        onChange={(e) =>
                          setValue(
                            "cardNumber",
                            formatCardNumber(e.target.value)
                          )
                        }
                        data-card-field="cardNumber"
                        className={
                          errors.cardNumber
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.cardNumber.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          value={watch("expiryDate")}
                          onChange={(e) =>
                            setValue(
                              "expiryDate",
                              formatExpiryDate(e.target.value)
                            )
                          }
                          data-card-field="expiryDate"
                          placeholder="MM/YY"
                          maxLength={5}
                          className={
                            errors.expiryDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }
                          required
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.expiryDate.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          value={watch("cvc")}
                          placeholder="CVC*"
                          maxLength={4}
                          onChange={(e) =>
                            setValue("cvc", e.target.value.replace(/\D/g, ""))
                          }
                          data-card-field="cvc"
                          className={
                            errors.cvc
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }
                        />
                        {errors.cvc && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.cvc.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPaymentLoading}
                  className="w-full py-3 text-lg"
                >
                  {isPaymentLoading ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 animate-spin rounded-full border-2"
                        style={{
                          borderColor: `${config.primaryColor}30`,
                          borderTopColor: config.primaryColor,
                        }}
                      />
                      Processing...
                    </div>
                  ) : (
                    `Complete Order - ${formatMoney(
                      checkout?.summary.totalAdjustedAmount || 0
                    )}`
                  )}
                </Button>

                <div className="text-muted-foreground text-center text-sm">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Your payment information is secure and encrypted
                  </div>
                  <p>30-day money-back guarantee • Free returns</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
