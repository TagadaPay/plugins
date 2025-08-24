"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, CreditCard, Lock, Package, Truck } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { z } from "zod"
import {
  formatMoney,
  useCheckout,
  usePayment,
  usePluginConfig,
  useGoogleAutocomplete,
  useISOData,
  type GooglePrediction,
} from "@tagadapay/plugin-sdk/react"
import { cn } from "@/lib/utils"
import { useBrandingColors } from "@/lib/branding"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

// Card formatting utilities
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

const formatExpiryDate = (value: string) => {
  const v = value.replace(/\D/g, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
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
  cardNumber: z.string().min(15, "Valid card number is required").transform(val => val.replace(/\s/g, '')),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Valid expiry date (MM/YY) is required"),
  cvc: z.string().min(3, "Valid CVC is required"),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  image?: string
  imageUrl?: string
}

interface ShippingOption {
  id: string
  label: string
  description: string
  price: number
  estimatedDays: string
}

interface ExpressCheckout01Props {
  checkoutToken?: string
  orderItems?: OrderItem[]
  subtotal?: number
  discount?: {
    code: string
    amount: number
  }
  currency?: string
  className?: string
}

const defaultOrderItems: OrderItem[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    quantity: 1,
    unitPrice: 199.99,
    image: "🎧"
  },
  {
    id: "2", 
    name: "USB-C Cable (2m)",
    quantity: 2,
    unitPrice: 24.99,
    image: "🔌"
  }
]

const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    label: "Standard Shipping",
    description: "5-7 business days",
    price: 0,
    estimatedDays: "5-7 days"
  },
  {
    id: "express",
    label: "Express Shipping", 
    description: "2-3 business days",
    price: 15.99,
    estimatedDays: "2-3 days"
  },
  {
    id: "overnight",
    label: "Overnight Shipping",
    description: "Next business day",
    price: 29.99,
    estimatedDays: "1 day"
  }
]

export default function ExpressCheckout01({
  checkoutToken,
  orderItems = defaultOrderItems,
  subtotal,
  discount,
  currency = "USD",
  className
}: ExpressCheckout01Props) {
  const hasInitializedRef = useRef(false);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  // Plugin configuration
  const { storeId: configStoreId, config } = usePluginConfig();
  const brandingColors = useBrandingColors();

  // Static plugin config (for demo purposes)
  const pluginConfig = {
    storeId: configStoreId,
    product: {
      variantId: config?.products?.variantId || "demo-variant-id",
      quantity: 1,
    },
    defaultCurrency: currency,
  };

  // Initialize checkout session
  const { checkout, init, updateCustomerAndSessionInfo } = useCheckout({
    checkoutToken,
  });

  // Payment processing
  const { processCardPayment, isLoading: isPaymentLoading } = usePayment();

  // Google Autocomplete for address
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!googleMapsApiKey) {
    console.warn("⚠️ Google Maps API key not found. Please create a .env.local file with VITE_GOOGLE_MAPS_API_KEY");
  }
  
  const googleAutocomplete = useGoogleAutocomplete({
    apiKey: googleMapsApiKey || "",
    language: "en",
  });
  
  // ISO data for countries and states
  const { countries, getRegions, mapGoogleToISO } = useISOData();

  // Shipping state
  const [selectedShipping, setSelectedShipping] = useState("standard")

  // State for address autocomplete
  const [addressInput, setAddressInput] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableStates, setAvailableStates] = useState<Array<{code: string, name: string}>>([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);

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

  const { register, formState: { errors }, setValue, watch } = form;

  // Watch country changes to update available states
  const watchedCountry = watch("country");
  
  useEffect(() => {
    if (watchedCountry) {
      setSelectedCountry(watchedCountry);
      setIsCountrySelected(true);
      
      const states = getRegions(watchedCountry);
      const mappedStates = states.map((state: any) => ({ code: state.iso, name: state.name }));
      setAvailableStates(mappedStates || []);
      
      // Clear dependent fields when country changes
      const currentState = watch("state");
      if (currentState && !mappedStates?.find((s: any) => s.code === currentState)) {
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
  const handleAddressInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isCountrySelected) {
      return; // Don't allow address input without country selection
    }
    
    const value = e.target.value;
    setAddressInput(value);
    setValue("address1", value);
    
    if (value.length >= 3 && selectedCountry) {
      googleAutocomplete.searchPlaces(value, selectedCountry);
      setShowPredictions(true);
    } else {
      setShowPredictions(false);
      googleAutocomplete.clearPredictions();
    }
  }, [googleAutocomplete, setValue, selectedCountry, isCountrySelected]);

  const handlePredictionSelect = useCallback(async (prediction: GooglePrediction) => {
    setAddressInput(prediction.description);
    setShowPredictions(false);
    
    // Get detailed place information
    const placeDetails = await googleAutocomplete.getPlaceDetails(prediction.place_id);
    
    if (placeDetails) {
      const extracted = googleAutocomplete.extractAddressComponents(placeDetails);
      
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
  }, [googleAutocomplete, setValue, selectedCountry, mapGoogleToISO]);

  // Handle country selection change with user feedback
  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setValue("country", countryCode);
    
    if (countryCode && !isCountrySelected) {
      // Show a helpful message when country is first selected
      toast.success("Great! Now you can enter your address details below.");
    }
  }, [setValue, isCountrySelected]);

  // Card formatting handlers
  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setValue("cardNumber", formatted);
    
    // Auto-focus to expiry when card number is complete (16 digits)
    const digitsOnly = formatted.replace(/\s/g, '');
    if (digitsOnly.length === 16) {
      expiryRef.current?.focus();
    }
  }, [setValue]);

  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setValue("expiryDate", formatted);
    
    // Auto-focus to CVC when expiry is complete (MM/YY format)
    if (formatted.length === 5) {
      cvcRef.current?.focus();
    }
  }, [setValue]);

  const handleCvcChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4); // Max 4 digits for Amex
    setValue("cvc", value);
  }, [setValue]);

  // Initialize checkout programmatically when no token is provided
  useEffect(() => {
    if (!checkoutToken && !checkout?.checkoutSession && init && !hasInitializedRef.current && pluginConfig.storeId) {
      hasInitializedRef.current = true;
      console.log("🚀 Initializing checkout session...");
      
      init({
        storeId: pluginConfig.storeId,
        lineItems: [
          {
            variantId: pluginConfig.product.variantId,
            quantity: pluginConfig.product.quantity,
          },
        ],
      }).then(() => {
        console.log("✅ Checkout session initialized");
      }).catch((error) => {
        console.error("❌ Failed to initialize checkout:", error);
        toast.error("Failed to initialize checkout. Please try again.");
      });
    }
  }, [checkoutToken, checkout?.checkoutSession, init, pluginConfig]);

  // Auto-save customer and session info using form data
  const saveCheckoutInfo = useCallback(
    async () => {
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
    },
    [checkout?.checkoutSession?.id, updateCustomerAndSessionInfo, form]
  );

  // Payment Handler with unified form validation
  const handlePayment = async () => {
    // Validate all form fields
    const isValid = await form.trigger();
    
    if (!isValid) {
      // Find first error field and focus it
      const fieldPriority = [
        "firstName", "lastName", "email", "phone", 
        "address1", "country", "city", "state", "postal",
        "cardNumber", "expiryDate", "cvc"
      ];
      
      for (const fieldName of fieldPriority) {
        if ((errors as any)[fieldName]) {
          const fieldElement = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
          if (fieldElement) {
            fieldElement.focus();
            fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          break;
        }
      }
      
      toast.error("Please fix the errors above before continuing.");
      return;
    }

    // Save checkout info before processing payment
    await saveCheckoutInfo();

    try {
      const formData = form.getValues();
      
      // Enhanced validation for state field
      const isStateRequired = availableStates.length > 0 || ["US", "CA", "GB"].includes(formData.country);
      if (isStateRequired && !formData.state?.trim()) {
        toast.error("Please enter a state/province for the selected country.");
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
      console.error("Payment processing error:", error);
      toast.error("Payment processing failed. Please try again.");
    }
  };

  // Get actual checkout data from SDK
  const checkoutSummary = checkout?.summary as any; // Use any to access runtime properties
  const checkoutItems = checkoutSummary?.items || [];
  const actualCurrency = checkoutSummary?.currency || currency;
  
  // Use SDK data if available, otherwise fall back to props or defaults
  // Don't divide by 100 here since formatMoney handles the conversion
  const actualSubtotal = checkoutSummary?.subtotalAmount ?? (subtotal ? subtotal * 100 : 0);
  const actualTax = checkoutSummary?.totalTaxAmount ?? 0;
  const actualShippingCost = checkoutSummary?.shippingCost ?? 0;
  const actualPromotionAmount = checkoutSummary?.totalPromotionAmount ?? 0;
  
  // Convert SDK items to our format - use the correct property structure
  const displayItems = checkoutItems.length > 0 ? checkoutItems.map((item: any) => ({
    id: item.id,
    name: item.orderLineItemVariant?.name || item.orderLineItemProduct?.name || item.variant?.name || item.product?.name || item.name || 'Product',
    quantity: item.quantity,
    unitPrice: item.unitAmount, // Don't divide by 100, formatMoney will handle it
    imageUrl: item.orderLineItemVariant?.imageUrl || item.variant?.imageUrl || item.imageUrl || null,
    image: '🎧' // Keep emoji as fallback for now
  })) : orderItems;

  const formatPrice = (amount: number) => {
    return formatMoney(amount, actualCurrency);
  }

  // Shipping method is display-only, not connected to payment calculations
  // Use only SDK shipping cost, no mock shipping calculations
  const displayShippingCost = actualShippingCost
  
  // Calculate final total using only SDK data, no mock shipping
  const finalTotal = checkoutSummary?.totalAmount 
    ? checkoutSummary.totalAmount
    : actualSubtotal + actualTax + displayShippingCost - (discount?.amount ? discount.amount * 100 : 0)

  // Show loading state while checkout is initializing
  if (!checkout?.checkoutSession && !checkoutToken) {
    return (
      <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing checkout...</p>
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
              Complete your order
            </h1>
            <p className="text-muted-foreground">
              Secure checkout powered by industry-leading encryption
            </p>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: brandingColors.primary,
                    color: 'white'
                  }}
                >
                  1
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register("phone")}
                  className={`mt-1 ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
                    color: 'white'
                  }}
                >
                  2
                </div>
                Shipping Address
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
                    className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register("lastName")}
                    className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Country Selection - Must be first */}
              <div>
                <Label htmlFor="country">
                  Country <span className="text-sm text-muted-foreground">(Select country first)</span>
                </Label>
                <select
                  {...register("country")}
                  onChange={handleCountryChange}
                  className={`mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.country ? "border-red-500" : "border-input"
                  }`}
                >
                  <option value="">Select Country</option>
                  {Object.values(countries).map((country: any) => (
                    <option key={country.iso} value={country.iso}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>

              {/* Helpful message when no country is selected */}
              {!isCountrySelected && (
                <div 
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: brandingColors.primary50,
                    borderColor: brandingColors.primary200
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
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p 
                        className="text-sm"
                        style={{ color: brandingColors.primary800 }}
                      >
                        Please select your country first. This will enable address autocomplete and ensure accurate shipping options.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address fields - Disabled until country is selected */}
              <div className={`space-y-4 ${!isCountrySelected ? 'opacity-50' : ''}`}>
                <div className="relative">
                  <Label htmlFor="address1">
                    Street Address
                    {!isCountrySelected && <span className="text-sm text-muted-foreground ml-2">(Select country first)</span>}
                  </Label>
                  <Input
                    id="address1"
                    value={addressInput}
                    onChange={handleAddressInputChange}
                    disabled={!isCountrySelected}
                    placeholder={isCountrySelected ? "Start typing your address..." : "Please select country first"}
                    className={`mt-1 disabled:bg-muted disabled:cursor-not-allowed ${
                      errors.address1 ? "border-red-500" : ""
                    }`}
                  />
                  {errors.address1 && (
                    <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
                  )}

                  {/* Google Autocomplete Predictions */}
                  {showPredictions && googleAutocomplete.predictions.length > 0 && isCountrySelected && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {googleAutocomplete.predictions.map((prediction) => (
                        <button
                          key={prediction.place_id}
                          type="button"
                          onClick={() => handlePredictionSelect(prediction)}
                          className="w-full px-3 py-2 text-left hover:bg-accent border-b border-border last:border-b-0"
                        >
                          <div className="font-medium text-sm">{prediction.structured_formatting?.main_text}</div>
                          <div className="text-xs text-muted-foreground">{prediction.structured_formatting?.secondary_text}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                  <Input
                    id="address2"
                    {...register("address2")}
                    disabled={!isCountrySelected}
                    placeholder="Apt 4B"
                    className="mt-1 disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      disabled={!isCountrySelected}
                      placeholder="New York"
                      className={`mt-1 disabled:bg-muted disabled:cursor-not-allowed ${
                        errors.city ? "border-red-500" : ""
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postal">ZIP Code</Label>
                    <Input
                      id="postal"
                      {...register("postal")}
                      disabled={!isCountrySelected}
                      placeholder="10001"
                      className={`mt-1 disabled:bg-muted disabled:cursor-not-allowed ${
                        errors.postal ? "border-red-500" : ""
                      }`}
                    />
                    {errors.postal && (
                      <p className="mt-1 text-sm text-red-600">{errors.postal.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="state">
                    State/Province 
                    <span className="text-xs text-muted-foreground ml-2">
                      ({availableStates.length > 0 ? `${availableStates.length} options` : 'text input'})
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
                      <option value="">Select State/Province</option>
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
                      placeholder={isCountrySelected ? "Enter state/province" : "Select country first"}
                      className={`mt-1 disabled:bg-muted disabled:cursor-not-allowed ${
                        errors.state ? "border-red-500" : ""
                      }`}
                    />
                  )}
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method - Display Only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: brandingColors.primary,
                    color: 'white'
                  }}
                >
                  3
                </div>
                Shipping Method
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full ml-auto">
                  Display Only
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="mb-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: brandingColors.primary50,
                  borderColor: brandingColors.primary200
                }}
              >
                <p 
                  className="text-sm"
                  style={{ color: brandingColors.primary700 }}
                >
                  <span className="font-medium">Note:</span> Shipping method selection is for display purposes only. 
                  Actual shipping costs and methods will be calculated during payment processing.
                </p>
              </div>
              <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors opacity-75">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor={option.id} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-muted-foreground">
                            {option.price === 0 ? "Free" : formatPrice(option.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
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
                    color: 'white'
                  }}
                >
                  4
                </div>
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card number</Label>
                <div className="relative mt-1">
                  <Input
                    id="cardNumber"
                    ref={cardNumberRef}
                    value={watch("cardNumber") || ""}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19} // 16 digits + 3 spaces
                    className={`pl-10 ${errors.cardNumber ? "border-red-500" : ""}`}
                  />
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry date</Label>
                  <Input
                    id="expiryDate"
                    ref={expiryRef}
                    value={watch("expiryDate") || ""}
                    onChange={handleExpiryChange}
                    placeholder="12/28"
                    maxLength={5} // MM/YY format
                    className={`mt-1 ${errors.expiryDate ? "border-red-500" : ""}`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cvc">CVV</Label>
                  <Input
                    id="cvc"
                    ref={cvcRef}
                    value={watch("cvc") || ""}
                    onChange={handleCvcChange}
                    placeholder="123"
                    maxLength={4} // Max 4 digits for Amex
                    className={`mt-1 ${errors.cvc ? "border-red-500" : ""}`}
                  />
                  {errors.cvc && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
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
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Items */}
              <div className="space-y-4">
                {displayItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.currentTarget.style.display = 'none';
                            const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallbackDiv) {
                              fallbackDiv.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center text-lg"
                        style={{ display: item.imageUrl ? 'none' : 'flex' }}
                      >
                        {item.image || "📦"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(actualSubtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {displayShippingCost === 0 ? (
                      <span className="text-muted-foreground">Calculated at checkout</span>
                    ) : (
                      formatPrice(displayShippingCost)
                    )}
                  </span>
                </div>

                {actualTax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(actualTax)}</span>
                  </div>
                )}

                {actualPromotionAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(actualPromotionAmount)}</span>
                  </div>
                )}

                {discount && discount.amount > 0 && actualPromotionAmount === 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discount.code})</span>
                    <span>-{formatPrice(discount.amount * 100)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
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
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!isPaymentLoading) {
                    e.currentTarget.style.backgroundColor = brandingColors.primary700;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPaymentLoading) {
                    e.currentTarget.style.backgroundColor = brandingColors.primary;
                  }
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isPaymentLoading ? "Processing..." : `Complete Order ${formatPrice(finalTotal)}`}
                {!isPaymentLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              {/* Security Notice */}
              <div className="text-center text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Lock className="w-3 h-3" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
                <p>Your payment information is safe and secure</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
