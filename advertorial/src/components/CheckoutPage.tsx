import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatMoney,
  useCheckout,
  usePayment,
  usePluginConfig,
  useGoogleAutocomplete,
  useISOData,
  type GooglePrediction,
} from "@tagadapay/plugin-sdk/react";
import { pluginConfig as staticConfig } from "@/data/config";
import { CreditCard, Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Card formatting utilities
const formatCardNumber = (value: string) => {
  // Remove all non-digits
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  // Add spaces every 4 digits
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
  // Remove all non-digits
  const v = value.replace(/\D/g, '');
  // Add slash after 2 digits
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

// Complete checkout form schema including address and card fields
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

interface CheckoutPageProps {
  checkoutToken?: string;
}

export function CheckoutPage({ checkoutToken }: CheckoutPageProps) {
  const navigate = useNavigate();
  const hasInitializedRef = useRef(false);
  const { storeId: configStoreId, accountId: configAccountId, config, loading: configLoading } = usePluginConfig();

  // Use injected config - storeId from .local.json, variantId from .tgd.json
  const pluginConfig = {
    storeId: configStoreId, // From .local.json via usePluginConfig
    product: {
      variantId: config?.products?.variantId, // From .tgd.json via usePluginConfig
      quantity: staticConfig.product.quantity,
    },
    defaultCurrency: staticConfig.defaultCurrency,
    branding: {
      productName: config?.branding?.companyName || staticConfig.branding.productName,
    },
  };



  // Initialize checkout session with the configured product
  const { checkout, init, updateCustomerAndSessionInfo } = useCheckout({
    checkoutToken,
  });

  // Payment processing
  const { processCardPayment, isLoading: isPaymentLoading } = usePayment();

  // Google Autocomplete for address
  // Note: Create a .env.local file with VITE_GOOGLE_MAPS_API_KEY=your_api_key
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

  // Complete form setup with all fields
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
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // State for address autocomplete
  const [addressInput, setAddressInput] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableStates, setAvailableStates] = useState<Array<{code: string, name: string}>>([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);

  // Refs for card input fields
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

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

  // Card input handlers
  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setValue("cardNumber", formatted);
    
    // Auto-focus to expiry when card number is complete (16 digits)
    const digitsOnly = formatted.replace(/\s/g, '');
    if (digitsOnly.length === 16) {
      expiryDateRef.current?.focus();
    }
  }, [setValue]);

  const handleExpiryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!checkoutToken && !checkout?.checkoutSession && init && !hasInitializedRef.current) {
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
          differentBillingAddress: false,
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
      toast.error("Payment failed. Please try again.");
    }
  };

  // Loading state
  if (configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const firstItem = checkout?.checkoutSession?.sessionLineItems?.[0];
  const currency = firstItem?.price?.currency || pluginConfig.defaultCurrency;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {firstItem && (
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {firstItem.price?.variant?.product?.name || pluginConfig.branding.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {firstItem.quantity || pluginConfig.product.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatMoney(firstItem.price?.amount || 0, currency)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatMoney(checkout?.summary?.totalAmount || 0, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Promotions:</span>
                <span>-{formatMoney(checkout?.summary?.totalPromotionAmount || 0, currency)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatMoney(checkout?.summary?.totalAdjustedAmount || 0, currency)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Checkout Information</h2>
            
            <form onSubmit={handleSubmit(handlePayment)} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...form.register("firstName")}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    {...form.register("lastName")}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...form.register("email")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...form.register("phone")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Address Information - Country First */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                
                {/* Country Selection - Must be first */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country * <span className="text-sm text-gray-500">(Select country first)</span>
                  </label>
                  <select
                    {...form.register("country")}
                    onChange={handleCountryChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.country ? "border-red-500" : "border-gray-300"
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
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-800">
                          Please select your country first. This will enable address autocomplete and ensure accurate shipping options.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address fields - Disabled until country is selected */}
                <div className={`space-y-4 ${!isCountrySelected ? 'opacity-50' : ''}`}>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                      {!isCountrySelected && <span className="text-sm text-gray-500 ml-2">(Select country first)</span>}
                    </label>
                    <input
                      type="text"
                      value={addressInput}
                      onChange={handleAddressInputChange}
                      disabled={!isCountrySelected}
                      placeholder={isCountrySelected ? "Start typing your address..." : "Please select country first"}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.address1 ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.address1 && (
                      <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
                    )}

                    {/* Google Autocomplete Predictions */}
                    {showPredictions && googleAutocomplete.predictions.length > 0 && isCountrySelected && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {googleAutocomplete.predictions.map((prediction) => (
                          <button
                            key={prediction.place_id}
                            type="button"
                            onClick={() => handlePredictionSelect(prediction)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{prediction.structured_formatting?.main_text}</div>
                            <div className="text-sm text-gray-600">{prediction.structured_formatting?.secondary_text}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      {...form.register("address2")}
                      disabled={!isCountrySelected}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        {...form.register("city")}
                        disabled={!isCountrySelected}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip/Postal Code *
                      </label>
                      <input
                        type="text"
                        {...form.register("postal")}
                        disabled={!isCountrySelected}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.postal ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.postal && (
                        <p className="mt-1 text-sm text-red-600">{errors.postal.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province * 
                      <span className="text-xs text-gray-500 ml-2">
                        ({availableStates.length > 0 ? `${availableStates.length} options` : 'text input'})
                      </span>
                    </label>
                    {availableStates.length > 0 ? (
                      <select
                        {...form.register("state")}
                        disabled={!isCountrySelected}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.state ? "border-red-500" : "border-gray-300"
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
                      <input
                        type="text"
                        {...form.register("state")}
                        disabled={!isCountrySelected}
                        placeholder={isCountrySelected ? "Enter state/province" : "Select country first"}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.state ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    )}
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    ref={cardNumberRef}
                    value={watch("cardNumber") || ""}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19} // 16 digits + 3 spaces
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cardNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      ref={expiryDateRef}
                      value={watch("expiryDate") || ""}
                      onChange={handleExpiryDateChange}
                      placeholder="12/28"
                      maxLength={5} // MM/YY format
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.expiryDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC *
                    </label>
                    <input
                      type="text"
                      ref={cvcRef}
                      value={watch("cvc") || ""}
                      onChange={handleCvcChange}
                      placeholder="123"
                      maxLength={4} // Max 4 digits for Amex
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cvc ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.cvc && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPaymentLoading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
              >
                {isPaymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Complete Order - {formatMoney(checkout?.summary?.totalAdjustedAmount || 0, currency)}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}