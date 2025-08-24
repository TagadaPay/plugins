import { pluginConfig } from "@/data/config";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatMoney,
  useAddress,
  useCheckout,
  usePayment,
  type AddressData,
} from "@tagadapay/plugin-sdk";
import { ChevronLeft, CreditCard, Lock } from "lucide-react";
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

interface Step3Props {
  checkoutToken?: string;
}

export function Step3({ checkoutToken }: Step3Props) {
  const navigate = useNavigate();
  const hasInitializedRef = useRef(false);

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

  console.log(checkout?.checkoutSession);

  // Auto-fill address form from checkout session when it loads
  useEffect(() => {
    if (checkout?.checkoutSession && !hasInitializedRef.current) {
      const session = checkout.checkoutSession;
      const customer = session.customer;
      const shipping = session.shippingAddress;

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

      hasInitializedRef.current = true;
    }
  }, [checkout?.checkoutSession, addressForm]);

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
    setFocus,
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

    if (!checkoutToken && !checkout && init && !hasInitializedRef.current) {
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
  }, [checkoutToken, checkout, init]);

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

  // Handle form submission and payment
  const handlePayment = async () => {
    console.log("💳 Payment button clicked - starting validation...");

    // Step 1: Validate address form first (using useAddress hook)
    const addressValid = addressForm.validateAll();
    console.log("📍 Address validation result:", addressValid);
    console.log(
      "📍 Address errors:",
      Object.fromEntries(
        Object.entries(addressForm.fields)
          .map(([key, field]) => [key, field.error])
          .filter(([, error]) => error)
      )
    );

    // Step 2: Validate ONLY card form fields (not address fields)
    const cardValid = await form.trigger(["cardNumber", "expiryDate", "cvc"]);
    console.log("💳 Card validation result:", cardValid);

    const cardErrors = {
      cardNumber: errors.cardNumber,
      expiryDate: errors.expiryDate,
      cvc: errors.cvc,
    };

    console.log("💳 Card errors only:", cardErrors);

    // Step 3: Focus on first error field if validation fails
    if (!addressValid || !cardValid) {
      console.log("❌ Validation failed, focusing first error...");

      // Enhanced error focusing logic
      // Priority order: firstName, lastName, email, phone, address1, country, city, state, postal, cardNumber, expiryDate, cvc
      const addressFieldPriority: (keyof typeof addressForm.fields)[] = [
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

      const cardFieldPriority: (keyof CardFormData)[] = [
        "cardNumber",
        "expiryDate",
        "cvc",
      ];

      let firstErrorField: string | null = null;

      // Check address form errors first (higher priority)
      for (const fieldName of addressFieldPriority) {
        if (addressForm.fields[fieldName]?.error) {
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
        console.log(`🎯 Focusing first error field: ${firstErrorField}`);

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

    console.log("✅ All validation passed, proceeding with payment...");

    // Make sure checkout session is ready
    if (!checkout?.checkoutSession?.id || !updateCustomerAndSessionInfo) {
      toast.error("Checkout session not ready. Please try again.");
      return;
    }

    // Get validated data from both forms
    const addressData = addressForm.getAddressObject();

    // 🐛 DEBUG: Check actual field values vs getAddressObject in payment handler
    console.log("🔍 DEBUG PAYMENT: Field values:", {
      country: addressForm.fields.country.value,
      state: addressForm.fields.state.value,
      stateIsEmpty: !addressForm.fields.state.value,
      stateLength: addressForm.fields.state.value?.length,
      availableStates: addressForm.states?.length || 0,
      countryName: addressForm.countries.find(
        (c) => c.code === addressForm.fields.country.value
      )?.name,
      stateName: addressForm.states.find(
        (s) => s.code === addressForm.fields.state.value
      )?.name,
      getAddressObjectCountry: addressData.country,
      getAddressObjectState: addressData.state,
      fullAddressData: addressData,
    });

    // ✅ Use getAddressObject() - now fixed and working correctly
    const paymentAddressData = addressForm.getAddressObject();

    // Enhanced validation for state field
    const enhancedPaymentData = {
      ...paymentAddressData,
      state:
        paymentAddressData.state && paymentAddressData.state.trim()
          ? paymentAddressData.state.trim()
          : "N/A",
    };

    console.log("✅ PAYMENT Using getAddressObject() - FIXED:", {
      originalState: paymentAddressData.state,
      enhancedState: enhancedPaymentData.state,
      country: enhancedPaymentData.country,
      countryName: addressForm.countries.find(
        (c) => c.code === enhancedPaymentData.country
      )?.name,
    });

    // Handle state requirement validation for specific countries
    const isStateRequired =
      addressForm.states.length > 0 ||
      ["US", "CA", "GB"].includes(enhancedPaymentData.country);
    if (isStateRequired && !enhancedPaymentData.state?.trim()) {
      toast.error("Please enter a state/province for the selected country.");
      // Focus state field
      const stateField = document.querySelector(
        `[data-address-field="state"]`
      ) as HTMLElement;
      if (stateField) {
        const yOffset = window.innerWidth < 768 ? -120 : -80;
        const y =
          stateField.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        setTimeout(() => stateField.focus(), 300);
      }
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

  const handleBack = () => {
    navigate("/step2");
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
  const firstItem = checkout?.summary.items[0];
  const totalAmount = checkout?.summary?.totalAmount;
  const currency = firstItem?.currency || pluginConfig.defaultCurrency;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="mx-auto max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-semibold">
            ✓
          </div>
          <div className="h-1 w-12 bg-green-600"></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-semibold">
            ✓
          </div>
          <div className="h-1 w-12 bg-green-600"></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
            3
          </div>
        </div>

        {/* Main content */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {pluginConfig.funnel.step3.title}
            </h1>
            <p className="text-lg text-gray-600">
              {pluginConfig.funnel.step3.subtitle}
            </p>
          </div>

          {/* Order Summary */}
          {totalAmount && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              {/* Product Display */}
              {firstItem && (
                <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-lg border">
                  <div className="flex-shrink-0">
                    <img
                      src={
                        (firstItem as any)?.variant?.imageUrl ||
                        "/placeholder-product.svg"
                      }
                      alt={firstItem.name || pluginConfig.branding.productName}
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
                      {firstItem.name || pluginConfig.branding.productName}
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
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {firstItem?.name || pluginConfig.branding.productName}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(totalAmount, currency)}
                  </span>
                </div>
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
                        addressForm.fields.firstName.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {addressForm.fields.firstName.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {addressForm.fields.firstName.error}
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
                        addressForm.fields.lastName.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {addressForm.fields.lastName.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {addressForm.fields.lastName.error}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={addressForm.fields.email.value}
                    onChange={(e) =>
                      addressForm.setValue("email", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      addressForm.fields.email.error
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {addressForm.fields.email.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressForm.fields.email.error}
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
                      addressForm.fields.phone.error
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {addressForm.fields.phone.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressForm.fields.phone.error}
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
                      addressForm.fields.address1.error
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {addressForm.fields.address1.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressForm.fields.address1.error}
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
                        addressForm.fields.country.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Country</option>
                      {addressForm.countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {addressForm.fields.country.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {addressForm.fields.country.error}
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
                        addressForm.fields.city.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {addressForm.fields.city.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {addressForm.fields.city.error}
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
                          addressForm.fields.state.error
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
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
                          addressForm.fields.state.error
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    )}
                    {addressForm.fields.state.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {addressForm.fields.state.error}
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
                        addressForm.fields.postal.error
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {addressForm.fields.postal.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {addressForm.fields.postal.error}
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

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isPaymentLoading || !checkout?.checkoutSession?.id}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
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

              <button
                type="button"
                onClick={handleBack}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Previous Step</span>
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Step 3 of 3 - Secure checkout powered by Tagadapay
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
