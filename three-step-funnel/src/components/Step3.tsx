import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  useCheckout,
  usePayment,
  usePluginConfig,
  useProducts,
  useGoogleAutocomplete,
  useISOData,
  formatMoney,
  type GooglePrediction,
} from '@tagadapay/plugin-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, Star, CreditCard, Truck } from 'lucide-react';

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

// Complete checkout form schema
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

// Type definitions for better type safety
interface CountryData {
  iso: string;
  name: string;
}

interface StateData {
  iso: string;
  name: string;
}

interface Step3Props {
  checkoutToken?: string;
}

export function Step3({ checkoutToken }: Step3Props) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasInitializedRef = useRef(false);

  // Plugin configuration
  const { config } = usePluginConfig();
  
  // Get product info from config
  const products = config?.products || {};
  const funnel = config?.funnel?.step3 || {};

  // SDK hooks
  const { getVariant } = useProducts({
    enabled: true,
    includeVariants: true,
    includePrices: true,
  });

  // Get variant data from API using the configured variant ID (no hardcoded fallback)
  const variantData = getVariant(products.variantId);
  const product = variantData?.product;
  const variant = variantData?.variant;
  
  const { checkout, init, updateCustomerAndSessionInfo } = useCheckout({
    checkoutToken,
  });
  
  const { processCardPayment } = usePayment();
  const { countries, getRegions, mapGoogleToISO } = useISOData();

  // Google Autocomplete for address
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!googleMapsApiKey) {
    console.warn("⚠️ Google Maps API key not found. Please create a .env.local file with VITE_GOOGLE_MAPS_API_KEY");
  }
  
  const googleAutocomplete = useGoogleAutocomplete({
    apiKey: googleMapsApiKey || "",
    language: "en",
  });

  // State for address autocomplete and country management
  const [addressInput, setAddressInput] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableStates, setAvailableStates] = useState<Array<{code: string, name: string}>>([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);

  // Refs for card input fields
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      country: 'US',
    },
  });

  const watchedCountry = watch("country");

  // Watch country changes to update available states
  useEffect(() => {
    if (watchedCountry) {
      setSelectedCountry(watchedCountry);
      setIsCountrySelected(true);
      
      const states = getRegions(watchedCountry);
      const mappedStates = states.map((state) => ({ 
        code: (state as StateData).iso, 
        name: (state as StateData).name 
      }));
      setAvailableStates(mappedStates || []);
      
      // Clear dependent fields when country changes
      const currentState = watch("state");
      if (currentState && !mappedStates?.find((s) => s.code === currentState)) {
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
    if (!checkoutToken && !checkout?.checkoutSession && init && !hasInitializedRef.current && products.variantId && variant) {
      hasInitializedRef.current = true;
      console.log("🚀 Initializing checkout session...");
      
      // Get the price ID from variant data
      const price = variant?.prices?.[0];
      const priceId = price?.id;
      
      if (!priceId) {
        console.error('Price ID not found for variant:', products.variantId);
        toast.error("Product pricing not available. Please try again.");
        hasInitializedRef.current = false;
        return;
      }
      
      const lineItems = [{
        variantId: products.variantId,
        priceId: priceId,
        quantity: 1,
      }];
      
      console.log("🚀 Initializing with line items:", lineItems);
      
      init({
        lineItems,
      }).then(() => {
        console.log("✅ Checkout session initialized");
      }).catch((error) => {
        console.error("❌ Failed to initialize checkout:", error);
        toast.error("Failed to initialize checkout. Please try again.");
        hasInitializedRef.current = false; // Reset on error to allow retry
      });
    }
  }, [checkoutToken, checkout?.checkoutSession, init, products.variantId, variant]);

  // Handle form submission
  const onSubmit = async (data: CheckoutFormData) => {
    if (!variant) {
      toast.error('Product variant not found');
      return;
    }

    setIsProcessing(true);

    try {
      // Enhanced validation for state field
      const isStateRequired = availableStates.length > 0 || ["US", "CA", "GB"].includes(data.country);
      if (isStateRequired && !data.state?.trim()) {
        toast.error("Please enter a state/province for the selected country.");
        return;
      }

      // Update customer and session info
      await updateCustomerAndSessionInfo({
        customerData: {
          email: data.email,
          acceptsMarketing: false,
        },
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          postal: data.postal,
          country: data.country,
          phone: data.phone,
        },
        billingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          postal: data.postal,
          country: data.country,
          phone: data.phone,
        },
      });

      // Process payment
      if (!checkout?.checkoutSession?.id) {
        throw new Error('Checkout session not found');
      }
      
      const paymentResult = await processCardPayment(
        checkout.checkoutSession.id,
        {
          cardNumber: data.cardNumber.replace(/\s+/g, ""),
          expiryDate: data.expiryDate,
          cvc: data.cvc,
        },
        {
          enableThreeds: true,
          initiatedBy: "customer",
          source: "checkout",
          onSuccess: () => {
            toast.success("Payment successful! 🎉");
          },
        }
      );

      if (paymentResult?.order?.id) {
        toast.success('Order placed successfully!');
        navigate(`/thankyou/${paymentResult.order.id}`);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-4 sm:py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-md lg:max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-6 sm:mb-8 flex items-center justify-center space-x-2 sm:space-x-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-600 text-white text-sm sm:text-base font-semibold shadow-lg">
            ✓
          </div>
          <div className="h-1 w-8 sm:w-12 bg-green-300 rounded-full"></div>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-600 text-white text-sm sm:text-base font-semibold shadow-lg">
            ✓
          </div>
          <div className="h-1 w-8 sm:w-12 bg-green-300 rounded-full"></div>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-600 text-white text-sm sm:text-base font-semibold shadow-lg">
            3
          </div>
        </div>

        {/* Main content */}
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6 pt-6 sm:pt-8">
            <Badge variant="secondary" className="mb-2 sm:mb-4 bg-green-100 text-green-800 hover:bg-green-100 mx-auto w-fit text-xs sm:text-sm px-3 py-1">
              <Lock className="w-3 h-3 mr-1" />
              Secure Checkout
            </Badge>
            
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {funnel.title || "Secure Your Order"}
            </CardTitle>
            
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              {funnel.subtitle || "Join thousands who've transformed their joint health"}
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Product summary */}
            {!checkout?.checkoutSession && !checkoutToken ? (
              <Card className="mb-6 bg-blue-50 border-blue-200 rounded-xl">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="ml-2 text-gray-600 text-sm sm:text-base">Initializing checkout...</p>
                  </div>
                </CardContent>
              </Card>
            ) : variantData ? (
              <Card className="mb-6 bg-green-50 border-green-200 rounded-xl">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      {(() => {
                        // Get product image with priority: variant data > config > placeholder
                        const productImage = variant?.imageUrl || 
                                           products.imageUrl || 
                                           '/placeholder.svg';
                        
                        if (productImage && productImage !== '/placeholder.svg') {
                          return (
                            <img
                              src={productImage}
                              alt={variant?.name || product?.name || "Product"}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          );
                        } else {
                          return <div className="text-2xl sm:text-3xl">💊</div>;
                        }
                      })()}
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                        {variant?.name || product?.name || products.name || "NutraVital Pro"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {product?.name && variant?.name !== product.name ? product.name : products.description || "Advanced Joint Support Formula"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Quantity: 1</p>
                      <div className="flex items-center justify-center sm:justify-start mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">4.9 (2,847 reviews)</span>
                      </div>
                    </div>
                    <div className="text-center sm:text-right flex-shrink-0">
                      <p className="font-bold text-lg sm:text-xl text-green-600">
                        {(() => {
                          // Get price from variant data using the same pattern as CheckoutPageSimple
                          const price = variant?.prices?.[0];
                          const priceAmount = price?.currencyOptions?.USD?.amount || 3999;
                          const currency = price?.currencyOptions ? Object.keys(price.currencyOptions)[0] : 'USD';
                          return formatMoney(priceAmount, currency);
                        })()}
                      </p>
                      <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                        20% OFF
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Checkout form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center text-base sm:text-lg">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <Label htmlFor="firstName" className="text-sm sm:text-base font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      className={`mt-1 h-12 sm:h-10 text-base sm:text-sm ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName" className="text-sm sm:text-base font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      className={`mt-1 h-12 sm:h-10 text-base sm:text-sm ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                                <div className="mb-4 sm:mb-6">
                  <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`mt-1 h-12 sm:h-10 text-base sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="mb-4 sm:mb-6">
                  <Label htmlFor="phone" className="text-sm sm:text-base font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className={`mt-1 h-12 sm:h-10 text-base sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
            </div>

              {/* Shipping Address */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center text-base sm:text-lg">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping Address
              </h3>

                {/* Country Selection - Must be first */}
                <div className="mb-4 sm:mb-6">
                  <Label htmlFor="country" className="text-sm sm:text-base font-medium">
                    Country <span className="text-xs text-gray-500">(Select country first)</span>
                  </Label>
                  <select
                    {...register("country")}
                    onChange={handleCountryChange}
                    className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.country ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Country</option>
                    {Object.values(countries).map((country) => {
                      const countryData = country as CountryData;
                      return (
                        <option key={countryData.iso} value={countryData.iso}>
                          {countryData.name}
                        </option>
                      );
                    })}
                  </select>
                  {errors.country && (
                    <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
                  )}
                </div>

                {/* Helpful message when no country is selected */}
                {!isCountrySelected && (
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg mb-4 sm:mb-6">
                    <div className="flex items-start sm:items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
                          Please select your country first. This will enable address autocomplete and ensure accurate shipping options.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address fields - Disabled until country is selected */}
                <div className={`space-y-4 sm:space-y-6 ${!isCountrySelected ? 'opacity-50' : ''}`}>
                  <div className="relative">
                    <Label htmlFor="address1" className="text-sm sm:text-base font-medium">
                      Street Address
                      {!isCountrySelected && <span className="text-xs text-gray-500 ml-2">(Select country first)</span>}
                    </Label>
                    <Input
                      id="address1"
                      value={addressInput}
                      onChange={handleAddressInputChange}
                      disabled={!isCountrySelected}
                      placeholder={isCountrySelected ? "Start typing your address..." : "Please select country first"}
                      className={`mt-1 h-12 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.address1 ? "border-red-500" : ""
                      }`}
                    />
                    {errors.address1 && (
                      <p className="text-sm text-red-500 mt-1">{errors.address1.message}</p>
                    )}

                    {/* Google Autocomplete Predictions */}
                    {showPredictions && googleAutocomplete.predictions.length > 0 && isCountrySelected && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {googleAutocomplete.predictions.map((prediction) => (
                          <button
                            key={prediction.place_id}
                            type="button"
                            onClick={() => handlePredictionSelect(prediction)}
                            className="w-full px-3 sm:px-4 py-3 sm:py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 touch-manipulation"
                          >
                            <div className="font-medium text-sm sm:text-base">{prediction.structured_formatting?.main_text}</div>
                            <div className="text-xs sm:text-sm text-gray-600">{prediction.structured_formatting?.secondary_text}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="city" className="text-sm sm:text-base font-medium">City</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        disabled={!isCountrySelected}
                        placeholder="New York"
                        className={`mt-1 h-12 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.city ? "border-red-500" : ""
                        }`}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="postal" className="text-sm sm:text-base font-medium">Zip/Postal Code</Label>
                      <Input
                        id="postal"
                        {...register("postal")}
                        disabled={!isCountrySelected}
                        placeholder="10001"
                        className={`mt-1 h-12 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.postal ? "border-red-500" : ""
                        }`}
                      />
                      {errors.postal && (
                        <p className="text-sm text-red-500 mt-1">{errors.postal.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm sm:text-base font-medium">
                      State/Province 
                      <span className="text-xs text-gray-500 ml-2">
                        ({availableStates.length > 0 ? `${availableStates.length} options` : 'text input'})
                      </span>
                    </Label>
                    {availableStates.length > 0 ? (
                      <select
                        {...register("state")}
                        disabled={!isCountrySelected}
                        className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                      <Input
                        id="state"
                        {...register("state")}
                        disabled={!isCountrySelected}
                        placeholder={isCountrySelected ? "Enter state/province" : "Select country first"}
                        className={`mt-1 h-12 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.state ? "border-red-500" : ""
                        }`}
                      />
                    )}
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </div>

            {/* Payment Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center text-base sm:text-lg">
                  <Lock className="w-5 h-5 mr-2" />
                Payment Information
              </h3>

                <div className="mb-4 sm:mb-6">
                  <Label htmlFor="cardNumber" className="text-sm sm:text-base font-medium">Card Number</Label>
                  <Input
                    id="cardNumber"
                    ref={cardNumberRef}
                    value={watch("cardNumber") || ""}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19} // 16 digits + 3 spaces
                    className={`mt-1 h-12 sm:h-10 text-base sm:text-sm ${errors.cardNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <Label htmlFor="expiryDate" className="text-sm sm:text-base font-medium">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      ref={expiryDateRef}
                      value={watch("expiryDate") || ""}
                      onChange={handleExpiryDateChange}
                      placeholder="12/28"
                      maxLength={5} // MM/YY format
                      className={`mt-1 h-12 sm:h-10 text-base sm:text-sm ${errors.expiryDate ? 'border-red-500' : ''}`}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.expiryDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="cvc" className="text-sm sm:text-base font-medium">CVC</Label>
                    <Input
                      id="cvc"
                      ref={cvcRef}
                      value={watch("cvc") || ""}
                      onChange={handleCvcChange}
                      placeholder="123"
                      maxLength={4} // Max 4 digits for Amex
                      className={`mt-1 h-12 sm:h-10 text-base sm:text-sm ${errors.cvc ? 'border-red-500' : ''}`}
                    />
                    {errors.cvc && (
                      <p className="text-sm text-red-500 mt-1">{errors.cvc.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span>256-bit Encryption</span>
                </div>
              </div>

              {/* Order summary */}
              {variant && (
                <Card className="bg-gray-50 border-gray-200 mb-6">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {(() => {
                        const price = variant?.prices?.[0];
                        const priceAmount = price?.currencyOptions?.USD?.amount || 3999;
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>{formatMoney(priceAmount, 'USD')}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Discount (20%):</span>
                              <span>-{formatMoney(priceAmount * 0.2, 'USD')}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Free Shipping:</span>
                              <span>$0.00</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                              <span>Total:</span>
                              <span>{formatMoney(priceAmount * 0.8, 'USD')}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

                            {/* Submit button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-4 sm:py-5 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    Complete Order - $39.99
                  </>
                )}
              </Button>

              {/* Guarantee */}
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
                ✅ {funnel.guarantee || "60-Day Money-Back Guarantee"}
              </p>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}