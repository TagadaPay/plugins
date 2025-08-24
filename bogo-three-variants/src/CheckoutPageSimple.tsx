import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import {
  useCheckout,
  usePayment,
  usePluginConfig,
  useProducts,
  useGoogleAutocomplete,
  useISOData,
  formatMoney,
  type GooglePrediction,
} from '@tagadapay/plugin-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Lock, Star } from 'lucide-react'

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
  checkoutToken?: string
}

// Bundle configurations will be generated from config

export default function CheckoutPageSimple({ checkoutToken }: CheckoutPageProps) {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null) // Start with null, will be set from checkout data
  const [isProcessing, setIsProcessing] = useState(false)
  const hasInitializedRef = useRef(false)

  // Plugin configuration - data comes from default.tgd.json via SDK
  const { config } = usePluginConfig()
  
  // Get variant configurations from SDK config (default.tgd.json)
  const variants = config?.products?.variants || {}

  // Generate bundles from SDK config (default.tgd.json)
  const bundles = [
    {
      id: 'bogo',
      name: variants.bogo?.name || 'Buy 1 Get 1 Free',
      quantity: variants.bogo?.quantity || 2,
      variantId: variants.bogo?.variantId,
      dealType: 'bogo',
      bestValue: false,
      bestSelling: true,
    },
    {
      id: 'buy2get1',
      name: variants.buy2get1?.name || 'Buy 2 Get 1',
      quantity: variants.buy2get1?.quantity || 3,
      variantId: variants.buy2get1?.variantId,
      dealType: 'buy2get1',
      bestValue: false,
      bestSelling: false,
    },
    {
      id: 'buy3get2',
      name: variants.buy3get2?.name || 'Buy 3 Get 2',
      quantity: variants.buy3get2?.quantity || 5,
      variantId: variants.buy3get2?.variantId,
      dealType: 'buy3get2',
      bestValue: true,
      bestSelling: false,
    },
  ].filter(bundle => bundle.variantId) // Only include bundles with valid variant IDs

  // SDK hooks
  const { checkout, init, updateCustomerAndSessionInfo, updateLineItems } = useCheckout({
    checkoutToken,
  })

  const { processCardPayment, isLoading: isPaymentLoading } = usePayment()
  const { countries, getRegions, mapGoogleToISO } = useISOData()
  
  // Fetch products data - SDK handles all complexity internally!
  const { error: productsError, getVariant } = useProducts({
    enabled: true,
    includeVariants: true,
    includePrices: true,
  })
  
  // Google Autocomplete for address
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!googleMapsApiKey) {
    console.warn("⚠️ Google Maps API key not found. Please create a .env.local file with VITE_GOOGLE_MAPS_API_KEY");
  }
  
  const googleAutocomplete = useGoogleAutocomplete({
    apiKey: googleMapsApiKey || "",
    language: "en",
  })

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
    if (!checkoutToken && !checkout?.checkoutSession && init && !hasInitializedRef.current && bundles.length > 0) {
      hasInitializedRef.current = true;
      console.log("🚀 Initializing checkout session...");
      
      // Use the selected bundle or fallback to buy3get2
      const bundleToInit = selectedBundle || 'buy3get2';
      const selectedBundleData = bundles.find(b => b.id === bundleToInit);
      
      if (selectedBundleData) {
        // Get the price ID from config
        const variantConfig = Object.values(config?.products?.variants || {}).find((v: any) => v.variantId === selectedBundleData.variantId) as any;
        const priceId = variantConfig?.priceId;
        
        const lineItems = [{
          variantId: selectedBundleData.variantId,
          priceId: priceId,
          quantity: 1, // Always 1 since the deal is in the variant price
        }];
        
        console.log("🚀 Initializing with line items:", lineItems);
        
        init({
          lineItems,
        }).then(() => {
          console.log("✅ Checkout session initialized");
          // Set the selected bundle after successful initialization
          if (!selectedBundle) {
            setSelectedBundle(bundleToInit);
          }
        }).catch((error) => {
          console.error("❌ Failed to initialize checkout:", error);
          toast.error("Failed to initialize checkout. Please try again.");
          hasInitializedRef.current = false; // Reset on error to allow retry
        });
      }
    }
  }, [checkoutToken, checkout?.checkoutSession, init, selectedBundle, bundles, config]);

  // Sync selected bundle with checkout session line items (only on initial load, not during user interactions)
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  useEffect(() => {
    // Only sync from checkout data if user is not actively interacting
    if (!isUserInteracting && checkout?.checkoutSession?.sessionLineItems && checkout.checkoutSession.sessionLineItems.length > 0 && bundles.length > 0) {
      const currentVariantId = checkout.checkoutSession.sessionLineItems.find(
        (item: any) => !item.isOrderBump
      )?.variantId;
      
      if (currentVariantId) {
        const matchingBundle = bundles.find(bundle => bundle.variantId === currentVariantId);
        
        if (matchingBundle && matchingBundle.id !== selectedBundle) {
          console.log(`🔄 Syncing selected bundle to match checkout session: ${matchingBundle.id}`);
          setSelectedBundle(matchingBundle.id);
        }
      }
    } else if (selectedBundle === null && bundles.length > 0) {
      // Fallback to default selection if no checkout data yet
      console.log("🔄 Setting default bundle selection: buy3get2");
      setSelectedBundle('buy3get2');
    }
  }, [checkout?.checkoutSession?.sessionLineItems, bundles, selectedBundle, isUserInteracting]);

  // Handle bundle selection change with optimistic UI updates
  const handleBundleChange = async (bundleId: string) => {
    const selectedBundleData = bundles.find(bundle => bundle.id === bundleId);
    
    if (!selectedBundleData) return;

    // Store the previous selection for potential rollback
    const previousSelection = selectedBundle;

    // 🚀 INSTANT UI UPDATE - Update immediately for zero-flicker experience
    setSelectedBundle(bundleId);
    setIsUserInteracting(true); // Prevent sync conflicts during user interaction
    console.log(`⚡ Instant UI update to: ${bundleId}`);

    // 🔄 BACKGROUND PROCESSING - Update backend without blocking UI
    // Run this in the background after UI update
    setTimeout(async () => {
      try {
        // Check if checkout session is available
        if (!checkout?.checkoutSession?.id || !updateLineItems) {
          console.warn('Checkout session not ready, skipping background update');
          setIsUserInteracting(false);
          return;
        }

        // Get the appropriate price ID from config
        const variantId = selectedBundleData.variantId;
        const variantConfig = Object.values(config?.products?.variants || {}).find((v: any) => v.variantId === variantId) as any;
        const priceId = variantConfig?.priceId;

        if (!priceId) {
          console.error('Price ID not found for variant:', variantId);
          // Don't revert UI for missing price - might be a config issue
          setIsUserInteracting(false);
          return;
        }

        const lineItems = [
          {
            variantId: selectedBundleData.variantId,
            priceId,
            quantity: 1,
          },
        ];

        console.log('🔄 Background sync started for:', bundleId, lineItems);

        // Perform the background update
        await updateLineItems(lineItems);

        console.log('✅ Background sync completed for:', bundleId);
        
        // Clear interaction flag after successful update
        setIsUserInteracting(false);

      } catch (error) {
        console.error('❌ Background sync failed for:', bundleId, error);

        // Only revert UI if it's a critical error and user hasn't made another selection
        if (selectedBundle === bundleId) {
          console.log('🔄 Reverting UI due to background sync failure');
          setSelectedBundle(previousSelection);
          toast.error('Failed to update selection. Please try again.');
        }
        
        setIsUserInteracting(false);
      }
    }, 0); // Run immediately but asynchronously
  };

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





  // Show error state for products
  if (productsError) {
    console.warn("Products loading error:", productsError);
    // Continue with fallback data instead of blocking
  }

  const selectedBundleData = selectedBundle ? bundles.find(b => b.id === selectedBundle) : null
  const summary = checkout?.summary
  const total = summary?.totalAmount || 0
  const currency = summary?.currency || 'USD'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-4xl lg:max-w-6xl xl:max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-base">S</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 text-sm sm:text-lg">Secure Checkout</h1>
                </div>
              </div>
            </div>
            
            {/* Security Badge */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="hidden sm:inline">SSL Secured</span>
              <span className="sm:hidden">Secure</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="py-4 sm:py-8">
        <div className="mx-auto max-w-4xl lg:max-w-6xl xl:max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Mobile-first: Stack vertically, then side-by-side on larger screens */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 xl:gap-12 lg:grid-cols-2">
          {/* Left Column - Product Selection */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-1">
            <Card className="shadow-sm border-0 sm:border sm:shadow-md">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Choose Your Bundle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {selectedBundle === null ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="ml-2 text-gray-600 text-sm sm:text-base">Loading bundles...</p>
                  </div>
                ) : (
                  bundles.map((bundle) => {
                  // Get variant data from useProducts hook
                  const variantData = getVariant(bundle.variantId);
                  const summaryItem = checkout?.summary?.items?.[0] as any;
                  
                  // Get product image with priority: variant data > summary data > placeholder
                  const productImage = variantData?.variant?.imageUrl || 
                                     summaryItem?.variant?.imageUrl || 
                                     summaryItem?.orderLineItemVariant?.imageUrl ||
                                     '/placeholder.svg';
                  
                  // Get product info from variant data
                  const productName = variantData?.product?.name || bundle.name;
                  const variantName = variantData?.variant?.name || bundle.name;
                  const variantDescription = (variantData?.variant as any)?.description;
                  
                  // Get price from variant data
                  const price = variantData?.variant?.prices?.[0];
                  const priceAmount = price?.currencyOptions?.USD?.amount || 0;
                  const currency = price?.currencyOptions ? Object.keys(price.currencyOptions)[0] : 'USD';
                  
                  return (
                    <div
                      key={bundle.id}
                      className={`relative cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all touch-manipulation ${
                        selectedBundle === bundle.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleBundleChange(bundle.id)}
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        {/* Product Image - Responsive sizing */}
                        <div className="flex-shrink-0">
                          <img
                            src={productImage}
                            alt={variantName}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-md border border-gray-200 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        
                        {/* Bundle Info - Better mobile layout */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base leading-tight truncate">{variantName}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{productName}</p>
                              {variantDescription && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden sm:block">{variantDescription}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Qty: {bundle.quantity}
                                </p>
                                {priceAmount > 0 && (
                                  <p className="text-sm sm:text-lg font-semibold text-emerald-600">
                                    {formatMoney(priceAmount, currency)}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Selection indicator - Always visible on mobile */}
                            <div className="flex-shrink-0">
                              {selectedBundle === bundle.id && (
                                <Check className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                          </div>
                          
                          {/* Badges - Mobile optimized */}
                          <div className="flex items-center gap-1 sm:gap-2 mt-2">
                            {bundle.bestValue && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                                Best Value
                              </Badge>
                            )}
                            {bundle.bestSelling && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-2">
            {/* Contact Information */}
            <Card className="shadow-sm border-0 sm:border sm:shadow-md">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    className={`h-11 sm:h-10 text-base sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register('phone')}
                    className={`h-11 sm:h-10 text-base sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      className={`h-11 sm:h-10 text-base sm:text-sm ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      className={`h-11 sm:h-10 text-base sm:text-sm ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="shadow-sm border-0 sm:border sm:shadow-md">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Country Selection - Must be first */}
                <div>
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country <span className="text-xs text-gray-500">(Select country first)</span>
                  </Label>
                  <select
                    {...form.register("country")}
                    onChange={handleCountryChange}
                    className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
                  )}
                </div>

                {/* Helpful message when no country is selected */}
                {!isCountrySelected && (
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start sm:items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                          Please select your country first. This will enable address autocomplete and ensure accurate shipping options.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address fields - Disabled until country is selected */}
                <div className={`space-y-3 sm:space-y-4 ${!isCountrySelected ? 'opacity-50' : ''}`}>
                  <div className="relative">
                    <Label htmlFor="address1" className="text-sm font-medium">
                      Street Address
                      {!isCountrySelected && <span className="text-xs text-gray-500 ml-2">(Select country first)</span>}
                    </Label>
                    <Input
                      id="address1"
                      value={addressInput}
                      onChange={handleAddressInputChange}
                      disabled={!isCountrySelected}
                      placeholder={isCountrySelected ? "Start typing your address..." : "Please select country first"}
                      className={`h-11 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
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

                  <div>
                    <Label htmlFor="address2" className="text-sm font-medium">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="address2"
                      {...form.register("address2")}
                      disabled={!isCountrySelected}
                      placeholder="Apt 4B, Suite 100, etc."
                      className="h-11 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium">City</Label>
                      <Input
                        id="city"
                        {...form.register("city")}
                        disabled={!isCountrySelected}
                        placeholder="New York"
                        className={`h-11 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.city ? "border-red-500" : ""
                        }`}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="postal" className="text-sm font-medium">Zip/Postal Code</Label>
                      <Input
                        id="postal"
                        {...form.register("postal")}
                        disabled={!isCountrySelected}
                        placeholder="10001"
                        className={`h-11 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.postal ? "border-red-500" : ""
                        }`}
                      />
                      {errors.postal && (
                        <p className="text-sm text-red-500 mt-1">{errors.postal.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm font-medium">
                      State/Province 
                      <span className="text-xs text-gray-500 ml-2">
                        ({availableStates.length > 0 ? `${availableStates.length} options` : 'text input'})
                      </span>
                    </Label>
                    {availableStates.length > 0 ? (
                      <select
                        {...form.register("state")}
                        disabled={!isCountrySelected}
                        className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                        {...form.register("state")}
                        disabled={!isCountrySelected}
                        placeholder={isCountrySelected ? "Enter state/province" : "Select country first"}
                        className={`h-11 sm:h-10 text-base sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.state ? "border-red-500" : ""
                        }`}
                      />
                    )}
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="shadow-sm border-0 sm:border sm:shadow-md">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
                  <Input
                    id="cardNumber"
                    ref={cardNumberRef}
                    value={watch("cardNumber") || ""}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19} // 16 digits + 3 spaces
                    className={`h-11 sm:h-10 text-base sm:text-sm ${errors.cardNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      ref={expiryDateRef}
                      value={watch("expiryDate") || ""}
                      onChange={handleExpiryDateChange}
                      placeholder="12/28"
                      maxLength={5} // MM/YY format
                      className={`h-11 sm:h-10 text-base sm:text-sm ${errors.expiryDate ? 'border-red-500' : ''}`}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.expiryDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvc" className="text-sm font-medium">CVC</Label>
                    <Input
                      id="cvc"
                      ref={cvcRef}
                      value={watch("cvc") || ""}
                      onChange={handleCvcChange}
                      placeholder="123"
                      maxLength={4} // Max 4 digits for Amex
                      className={`h-11 sm:h-10 text-base sm:text-sm ${errors.cvc ? 'border-red-500' : ''}`}
                    />
                    {errors.cvc && (
                      <p className="text-sm text-red-500 mt-1">{errors.cvc.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary & Payment Button */}
            <Card className="shadow-sm border-0 sm:border sm:shadow-md">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Selected Bundle Display */}
                {selectedBundleData && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={(() => {
                        const variantData = getVariant(selectedBundleData.variantId);
                        const summaryItem = checkout?.summary?.items?.[0] as any;
                        return variantData?.variant?.imageUrl || 
                               summaryItem?.variant?.imageUrl || 
                               summaryItem?.orderLineItemVariant?.imageUrl ||
                               '/placeholder.svg';
                      })()}
                      alt={selectedBundleData.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-md border border-gray-200 object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const variantData = getVariant(selectedBundleData.variantId);
                        const variantName = variantData?.variant?.name || selectedBundleData.name;
                        const productName = variantData?.product?.name;
                        
                        return (
                          <>
                            <h4 className="font-semibold text-sm sm:text-base leading-tight">{variantName}</h4>
                            {productName && (
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{productName}</p>
                            )}
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Quantity: {selectedBundleData.quantity}
                            </p>
                            {selectedBundleData.dealType !== 'regular' && (
                              <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                                🎉 {selectedBundleData.dealType === 'bogo' ? 'Buy 1 Get 1 Free!' : 
                                    selectedBundleData.dealType === 'buy2get1' ? 'Buy 2 Get 1 Free!' :
                                    'Buy 3 Get 2 Free!'}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatMoney(checkout?.summary?.totalAmount || total, checkout?.summary?.currency || currency)}</span>
                  </div>
                  
                  {checkout?.summary?.totalPromotionAmount && checkout.summary.totalPromotionAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatMoney(checkout.summary.totalPromotionAmount, checkout.summary.currency || currency)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatMoney(checkout?.summary?.totalAdjustedAmount || checkout?.summary?.totalAmount || total, checkout?.summary?.currency || currency)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handlePayment}
                  disabled={isPaymentLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 sm:h-11 text-base sm:text-sm font-medium touch-manipulation"
                  size="lg"
                >
                  {isPaymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Pay {formatMoney(checkout?.summary?.totalAdjustedAmount || checkout?.summary?.totalAmount || total, checkout?.summary?.currency || currency)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
