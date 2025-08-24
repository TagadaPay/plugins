import { pluginConfig } from "@/data/config";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatMoney,
  useAddress,
  useCheckout,
  usePayment,
  type AddressData,
} from "@tagadapay/plugin-sdk";
import { CreditCard, Lock } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Schema for card fields only - address handled by useAddress hook
const cardFormSchema = z.object({
  cardNumber: z.string().min(15, "Valid card number is required"),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Valid expiry date (MM/YY) is required"),
  cvc: z.string().min(3, "Valid CVC is required"),
});

type CardFormData = z.infer<typeof cardFormSchema>;

interface CheckoutPageProps {
  checkoutToken?: string;
}

export function CheckoutPage({ checkoutToken }: CheckoutPageProps) {
  const navigate = useNavigate();
  const hasInitializedRef = useRef(false);
  const hasInitializedForm = useRef(false);

  // Initialize checkout session with the configured product
  const { checkout, init, updateCustomerAndSessionInfo } = useCheckout({
    checkoutToken, // Use the explicit token passed as prop if available
    autoRefresh: false,
  });

  // Payment processing
  const { processCardPayment, isLoading: isPaymentLoading } = usePayment();

  // Address form using useAddress hook
  const addressForm = useAddress({
    autoValidate: true,
    enableGooglePlaces: true,
    googlePlacesApiKey: "AIzaSyC4uCRdDH_9A7iUmkQg4_0AGXFnK2bErQA",
    countryRestrictions: [], // Allow all countries
    onFieldsChange: (addressData) => saveCheckoutInfo(addressData),
    debounceConfig: {
      manualInputDelay: 1200,
      googlePlacesDelay: 200,
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

  // Card form setup
  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvc: "",
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Initialize checkout programmatically when no token is provided (like JointBoost)
  useEffect(() => {
    console.log("🔄 Checkout initialization check:", {
      hasCheckoutToken: !!checkoutToken,
      hasCheckoutData: !!checkout,
      hasInitFunction: !!init,
      hasInitialized: hasInitializedRef.current,
      checkoutTokenPreview: checkoutToken
        ? `${checkoutToken.substring(0, 8)}...`
        : "none",
    });

    // Only initialize if NO token is provided AND we haven't initialized yet
    if (!checkoutToken && init && !hasInitializedRef.current) {
      console.log(
        "🚀 Initializing new checkout session (no token provided)..."
      );
      hasInitializedRef.current = true;

      init({
        storeId: pluginConfig.storeId,
        lineItems: [
          {
            variantId: pluginConfig.product.variantId,
            quantity: pluginConfig.product.quantity,
          },
        ],
      }).catch((error) => {
        console.error("❌ Failed to initialize checkout:", error);
        hasInitializedRef.current = false; // Reset on error to allow retry
        toast.error("Failed to initialize checkout. Please try again.");
      });
    } else if (checkoutToken) {
      console.log(
        "✅ CheckoutToken provided - skipping init(), auto-load should handle it"
      );
    }
  }, [checkoutToken, init]); // Removed checkout from dependencies to prevent loops

  // Initialize form fields with checkout session data (like JointBoost)
  useEffect(() => {
    if (checkout?.checkoutSession && !hasInitializedForm.current) {
      const session = checkout.checkoutSession;
      const customer = session.customer;
      const shipping = session.shippingAddress;

      console.log("🔄 Initializing form fields with checkout data:", {
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

      // Update address form values (this won't trigger auto-save per field)
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

      // Update card form email field if available

      // Mark as initialized to prevent overwriting user input
      hasInitializedForm.current = true;
      console.log("✅ Form fields initialized with checkout data");
    }
  }, [checkout?.checkoutSession, addressForm, form]);

  // Auto-save customer and session info using useAddress hook data
  const saveCheckoutInfo = useCallback(
    async (addressData?: AddressData) => {
      if (!checkout?.checkoutSession?.id || !addressData) return;

      const formData = form.getValues();

      try {
        await updateCustomerAndSessionInfo({
          customerData: {
            email: addressData.email,
            acceptsMarketing: false,
          },
          shippingAddress: {
            firstName: addressData.firstName,
            lastName: addressData.lastName,
            address1: addressData.address1,
            address2: addressData.address2 || "",
            city: addressData.city,
            state: addressData.state,
            postal: addressData.postal,
            country: addressData.country,
            phone: addressData.phone,
          },
          billingAddress: {
            firstName: addressData.firstName,
            lastName: addressData.lastName,
            address1: addressData.address1,
            address2: addressData.address2 || "",
            city: addressData.city,
            state: addressData.state,
            postal: addressData.postal,
            country: addressData.country,
            phone: addressData.phone,
          },
          differentBillingAddress: false,
        });
      } catch (error) {
        console.error("Failed to save checkout info:", error);
      }
    },
    [checkout?.checkoutSession?.id, updateCustomerAndSessionInfo, form]
  );

  // --- New Payment Handler with robust validation and focus/scroll logic ---
  const handlePayment = async () => {
    // Step 1: Validate address form first (using useAddress hook)
    const addressValid = addressForm.validateAll();
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
      // Priority order: firstName, lastName, email, phone, address1, country, city, state, postal, cardNumber, expiryDate, cvc
      const addressFieldPriority = [
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
      const cardFieldPriority = ["cardNumber", "expiryDate", "cvc"];
      let firstErrorField = null;
      // Check address form errors first (higher priority)
      for (const fieldName of addressFieldPriority) {
        if ((addressForm.fields as Record<string, any>)[fieldName]?.error) {
          firstErrorField = fieldName;
          break;
        }
      }
      // If no address errors, check card form errors
      if (!firstErrorField) {
        for (const fieldName of cardFieldPriority) {
          if ((cardErrors as Record<string, any>)[fieldName]) {
            firstErrorField = fieldName;
            break;
          }
        }
      }
      // Focus the first error field
      if (firstErrorField) {
        // Try data attribute selector first (for address fields)
        let fieldElement = document.querySelector(
          `[data-address-field="${firstErrorField}"]`
        );
        // If not found, try card field selector
        if (!fieldElement) {
          fieldElement = document.querySelector(
            `[data-card-field="${firstErrorField}"]`
          );
        }
        if (fieldElement) {
          // Scroll to the field with offset for mobile
          const yOffset = window.innerWidth < 768 ? -120 : -80;
          const y =
            (fieldElement as HTMLElement).getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
          // Focus the field after scroll
          setTimeout(() => {
            (fieldElement as HTMLElement).focus();
            // Additional blur/focus cycle for better mobile keyboard activation
            if (window.innerWidth < 768) {
              setTimeout(() => {
                (fieldElement as HTMLElement).blur();
                setTimeout(() => (fieldElement as HTMLElement).focus(), 50);
              }, 100);
            }
          }, 300);
        }
        // Show error toast with field name
        const fieldDisplayNames = {
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
          (fieldDisplayNames as Record<string, string>)[firstErrorField] ||
          firstErrorField;
        toast.error(`Please check the ${displayName} field`);
      } else {
        toast.error("Please check all required fields");
      }
      return;
    }
    // --- All validation passed, proceed with payment ---
    if (!checkout?.checkoutSession?.id || !updateCustomerAndSessionInfo) {
      toast.error("Checkout session not ready. Please try again.");
      return;
    }
    // Get validated data from both forms
    const addressData = addressForm.getAddressObject();
    // Enhanced validation for state field
    const enhancedPaymentData = {
      ...addressData,
      state:
        addressData.state && addressData.state.trim()
          ? addressData.state.trim()
          : "N/A",
    };
    // Handle state requirement validation for specific countries
    const isStateRequired =
      addressForm.states.length > 0 ||
      ["US", "CA", "GB"].includes(enhancedPaymentData.country);
    if (isStateRequired && !enhancedPaymentData.state?.trim()) {
      toast.error("Please enter a state/province for the selected country.");
      // Focus state field
      const stateField = document.querySelector(`[data-address-field="state"]`);
      if (stateField) {
        const yOffset = window.innerWidth < 768 ? -120 : -80;
        const y =
          (stateField as HTMLElement).getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        setTimeout(() => (stateField as HTMLElement).focus(), 300);
      }
      return;
    }
    try {
      // Data is already saved via saveCheckoutInfo (triggered by useAddress hook)
      const cardData = form.getValues();
      await processCardPayment(
        checkout.checkoutSession.id,
        {
          cardNumber: cardData.cardNumber.replace(/\s+/g, ""),
          expiryDate: cardData.expiryDate,
          cvc: cardData.cvc,
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
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  // Format card number as user types
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

  // Get the total amount from checkout session
  const firstItem = checkout?.summary?.items?.[0];
  const totalAmount = checkout?.summary?.totalAmount;
  const currency = firstItem?.currency || pluginConfig.defaultCurrency;
  console.log("first item variant name", (firstItem as any)?.variant?.name);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Order
          </h1>
          <p className="text-lg text-gray-600">
            Secure checkout powered by Tagadapay
          </p>
        </div>

        {/* Order Summary */}
        {totalAmount && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

            {/* Product Display */}
            {firstItem && (
              <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <img
                    src={
                      (firstItem as any).variant.imageUrl ||
                      "/placeholder-product.svg"
                    }
                    alt={
                      (firstItem as any)?.variant?.name ||
                      pluginConfig.branding.productName
                    }
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTI4IDI4TDM2IDM2TDI4IDI4WiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K";
                    }}
                    loading="lazy"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-900">
                    {(firstItem as any)?.variant?.name ||
                      pluginConfig.branding.productName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Quantity:{" "}
                    {firstItem.quantity || pluginConfig.product.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatMoney(
                      firstItem.adjustedAmount || firstItem.amount,
                      currency
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <hr className="my-4" />
              <div className="flex justify-between items-center font-semibold">
                <span>Total</span>
                <span className="text-xl text-blue-600">
                  {formatMoney(totalAmount, currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit(handlePayment)} className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Customer Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={addressForm.fields.firstName.value}
                      onChange={(e) =>
                        addressForm.setValue("firstName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        (addressForm.fields as Record<string, any>)["firstName"]
                          ?.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      data-address-field="firstName"
                    />
                    {(addressForm.fields as Record<string, any>)["firstName"]
                      ?.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {
                          (addressForm.fields as Record<string, any>)[
                            "firstName"
                          ]?.error
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={addressForm.fields.lastName.value}
                      onChange={(e) =>
                        addressForm.setValue("lastName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        (addressForm.fields as Record<string, any>)["lastName"]
                          ?.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      data-address-field="lastName"
                    />
                    {(addressForm.fields as Record<string, any>)["lastName"]
                      ?.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {
                          (addressForm.fields as Record<string, any>)[
                            "lastName"
                          ]?.error
                        }
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={addressForm.fields.phone.value}
                    onChange={(e) =>
                      addressForm.setValue("email", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      (addressForm.fields as Record<string, any>)["email"]
                        ?.error
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    data-card-field="email"
                  />
                  {(addressForm.fields as Record<string, any>)["email"]
                    ?.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {
                        (addressForm.fields as Record<string, any>)["email"]
                          ?.error
                      }
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={addressForm.fields.phone.value}
                    onChange={(e) =>
                      addressForm.setValue("phone", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      (addressForm.fields as Record<string, any>)["phone"]
                        ?.error
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    data-address-field="phone"
                  />
                  {(addressForm.fields as Record<string, any>)["phone"]
                    ?.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {
                        (addressForm.fields as Record<string, any>)["phone"]
                          ?.error
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Shipping Information
              </h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    ref={addressForm.addressRef}
                    value={addressForm.addressInputValue}
                    onChange={(e) => {
                      if (addressForm.handleAddressChange) {
                        addressForm.handleAddressChange(e);
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      (addressForm.fields as Record<string, any>)["address1"]
                        ?.error
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    data-address-field="address1"
                  />
                  {(addressForm.fields as Record<string, any>)["address1"]
                    ?.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {
                        (addressForm.fields as Record<string, any>)["address1"]
                          ?.error
                      }
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={addressForm.fields.country.value}
                      onChange={(e) =>
                        addressForm.setValue("country", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        (addressForm.fields as Record<string, any>)["country"]
                          ?.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      data-address-field="country"
                    >
                      <option value="">Select Country</option>
                      {addressForm.countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {(addressForm.fields as Record<string, any>)["country"]
                      ?.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {
                          (addressForm.fields as Record<string, any>)["country"]
                            ?.error
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={addressForm.fields.city.value}
                      onChange={(e) =>
                        addressForm.setValue("city", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        (addressForm.fields as Record<string, any>)["city"]
                          ?.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      data-address-field="city"
                    />
                    {(addressForm.fields as Record<string, any>)["city"]
                      ?.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {
                          (addressForm.fields as Record<string, any>)["city"]
                            ?.error
                        }
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {addressForm.states.length > 0 ? (
                      <select
                        value={addressForm.fields.state.value}
                        onChange={(e) =>
                          addressForm.setValue("state", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          (addressForm.fields as Record<string, any>)["state"]
                            ?.error
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        data-address-field="state"
                      >
                        <option value="">Select State/Province</option>
                        {addressForm.states.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="State/Province"
                        value={addressForm.fields.state.value}
                        onChange={(e) =>
                          addressForm.setValue("state", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          (addressForm.fields as Record<string, any>)["state"]
                            ?.error
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        data-address-field="state"
                      />
                    )}
                    {(addressForm.fields as Record<string, any>)["state"]
                      ?.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {
                          (addressForm.fields as Record<string, any>)["state"]
                            ?.error
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Zip/Postal Code"
                      value={addressForm.fields.postal.value}
                      onChange={(e) =>
                        addressForm.setValue("postal", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        (addressForm.fields as Record<string, any>)["postal"]
                          ?.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      data-address-field="postal"
                    />
                    {(addressForm.fields as Record<string, any>)["postal"]
                      ?.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {
                          (addressForm.fields as Record<string, any>)["postal"]
                            ?.error
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    {...form.register("cardNumber")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setValue("cardNumber", formatted);
                    }}
                    data-card-field="cardNumber"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cardNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      {...form.register("expiryDate")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                      maxLength={5}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length >= 2) {
                          value =
                            value.substring(0, 2) + "/" + value.substring(2, 4);
                        }
                        setValue("expiryDate", value);
                      }}
                      data-card-field="expiryDate"
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.expiryDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC
                    </label>
                    <input
                      {...form.register("cvc")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                      maxLength={4}
                      data-card-field="cvc"
                    />
                    {errors.cvc && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cvc.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="button"
                onClick={handlePayment}
                disabled={isPaymentLoading || !checkout?.checkoutSession?.id}
                className="w-full bg-news-red hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Lock className="h-5 w-5" />
                <span>
                  {isPaymentLoading
                    ? "Processing..."
                    : `Complete Order ${
                        totalAmount
                          ? `- ${formatMoney(totalAmount, currency)}`
                          : ""
                      }`}
                </span>
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Secure checkout powered by Tagadapay
            </p>
          </form>

          {/* Security badges */}
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center space-x-4 text-gray-500">
              <div className="flex items-center space-x-1">
                <Lock className="h-4 w-4" />
                <span className="text-xs">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">Safe Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
