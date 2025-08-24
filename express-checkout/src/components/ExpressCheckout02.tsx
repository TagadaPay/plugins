"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, Lock, CreditCard, Mail, User } from "lucide-react"
import {
  useCheckout,
  usePayment,
  usePluginConfig,
  useGoogleAutocomplete,
  type GooglePrediction,
} from "@tagadapay/plugin-sdk/react"
import { cn } from "@/lib/utils"
import { useBrandingColors } from "@/lib/branding"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"

interface ExpressCheckout02Props {
  checkoutToken?: string
  className?: string
}

export default function ExpressCheckout02({ checkoutToken, className }: ExpressCheckout02Props) {
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
  };

  // Checkout hook
  const {
    checkout,
    init,
    isLoading: isCheckoutLoading,
  } = useCheckout({
    checkoutToken,
  });

  // Payment hook
  const {
    processCardPayment,
    isLoading: isPaymentLoading,
  } = usePayment();

  // Google Autocomplete
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const googleAutocomplete = useGoogleAutocomplete({
    apiKey: googleMapsApiKey || "",
    language: "en",
  });

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
  });

  // Address autocomplete state
  const [addressQuery, setAddressQuery] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);

  // Refs for card inputs
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  // Initialize checkout on mount
  useEffect(() => {
    if (!checkout && pluginConfig.storeId && !checkoutToken) {
      init({
        storeId: pluginConfig.storeId,
        lineItems: [
          {
            variantId: pluginConfig.product.variantId,
            quantity: pluginConfig.product.quantity,
          },
        ],
        returnUrl: `${window.location.origin}/thankyou`,
      });
    }
  }, [checkout, init, pluginConfig.storeId, checkoutToken]);

  // Handle address search
  const handleAddressSearch = (query: string) => {
    setAddressQuery(query);
    if (query.length > 2) {
      googleAutocomplete.searchPlaces(query, formData.country);
      setShowPredictions(true);
    } else {
      setShowPredictions(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = async (prediction: GooglePrediction) => {
    // For now, just use the description as the address
    setFormData(prev => ({
      ...prev,
      address1: prediction.description,
    }));
    setAddressQuery(prediction.description);
    setShowPredictions(false);
  };

  // Format card number
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

  // Format expiry
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Handle card input
  const handleCardInput = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length === 16) {
        expiryRef.current?.focus();
      }
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
      const [month, year] = formattedValue.split('/');
      setFormData(prev => ({
        ...prev,
        expiryMonth: month || "",
        expiryYear: year || "",
      }));
      if (formattedValue.length === 5) {
        cvcRef.current?.focus();
      }
      return;
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  // Handle payment
  const handlePayment = async () => {
    if (!checkout?.checkoutSession?.id) {
      toast.error("Checkout session not ready");
      return;
    }

    try {
      await processCardPayment(
        checkout.checkoutSession.id,
        {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryDate: `${formData.expiryMonth}/${formData.expiryYear}`,
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
            toast.loading("Please complete the additional security verification...");
          },
        }
      );
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  // Calculate totals
  const checkoutSummary = checkout?.summary;
  const total = checkoutSummary?.totalAmount || 2999;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  if (isCheckoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Express Checkout
          </h1>
          <p className="text-muted-foreground text-sm">
            Quick and secure payment
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">
              Complete Your Order
            </CardTitle>
            <div className="text-center">
              <span className="text-2xl font-bold" style={{ color: brandingColors.primary }}>
                {formatPrice(total)}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4" style={{ color: brandingColors.primary }} />
                Contact
              </div>
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-11"
              />
            </div>

            {/* Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" style={{ color: brandingColors.primary }} />
                Name
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="h-11"
                />
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Address</div>
              <div className="relative">
                <Input
                  placeholder="Start typing your address..."
                  value={addressQuery}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  className="h-11"
                />
                {showPredictions && googleAutocomplete.predictions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {googleAutocomplete.predictions.map((prediction, index) => (
                      <button
                        key={index}
                        className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                        onClick={() => handleAddressSelect(prediction)}
                      >
                        {prediction.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="h-11"
                />
                <Input
                  placeholder="ZIP code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="w-4 h-4" style={{ color: brandingColors.primary }} />
                Payment
              </div>
              
              <Input
                ref={cardNumberRef}
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => handleCardInput('cardNumber', e.target.value)}
                maxLength={19}
                className="h-11"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <Input
                  ref={expiryRef}
                  placeholder="MM/YY"
                  value={`${formData.expiryMonth}${formData.expiryYear ? '/' + formData.expiryYear : ''}`}
                  onChange={(e) => handleCardInput('expiry', e.target.value)}
                  maxLength={5}
                  className="h-11"
                />
                <Input
                  ref={cvcRef}
                  placeholder="CVC"
                  value={formData.cvc}
                  onChange={(e) => handleCardInput('cvc', e.target.value)}
                  maxLength={4}
                  className="h-11"
                />
              </div>
            </div>

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={isPaymentLoading || !checkout?.checkoutSession?.id}
              className="w-full h-12 text-base font-semibold mt-6"
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
              {isPaymentLoading ? "Processing..." : `Pay ${formatPrice(total)}`}
              {!isPaymentLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>

            {/* Security note */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              🔒 Your payment information is encrypted and secure
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
