"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBrandingColors } from "@/lib/branding";
import { cn } from "@/lib/utils";
import { ExpressCheckoutConfig } from "@/types/plugin-config";
import {
  formatMoney,
  useCurrency,
  useOrder,
  usePluginConfig,
} from "@tagadapay/plugin-sdk/v2";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  Mail,
  Package,
  Truck,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";

interface ThankYouProps {
  className?: string;
}

const getText = (value: string | undefined, fallback: string) =>
  value ?? fallback;

export default function ThankYou({ className }: ThankYouProps) {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading, error } = useOrder({
    orderId: orderId || "",
    enabled: Boolean(orderId),
  });

  const currentCurrency = useCurrency();
  const brandingColors = useBrandingColors();
  const { config } = usePluginConfig<ExpressCheckoutConfig>();
  const thankYouTexts = config?.texts?.thankYou;
  const placeholderProductImage =
    config?.images?.placeholderProduct || "/placeholder.svg";
  const links = config?.links ?? {};
  const loadingText = getText(
    thankYouTexts?.loadingText,
    "Loading order details..."
  );
  const errorTitle = getText(thankYouTexts?.errorTitle, "Order Not Found");
  const errorMessage = getText(
    thankYouTexts?.errorMessage,
    "We could not find the order you are looking for."
  );
  const returnToCheckoutText = getText(
    thankYouTexts?.returnToCheckout,
    "Return to Checkout"
  );
  const successTitle = getText(
    thankYouTexts?.successTitle,
    "Thank you for your order!"
  );
  const successSubtitle = getText(
    thankYouTexts?.successSubtitle,
    "Your payment has been successfully processed."
  );
  const orderDetailsTitle = getText(
    thankYouTexts?.orderDetailsTitle,
    "Order Details"
  );
  const orderNumberLabel = getText(
    thankYouTexts?.orderNumberLabel,
    "Order Number:"
  );
  const orderDateLabel = getText(thankYouTexts?.orderDateLabel, "Order Date:");
  const itemsTitle = getText(thankYouTexts?.itemsTitle, "Items Ordered");
  const noItemsText = getText(thankYouTexts?.noItemsText, "No items found for");
  const itemsQuantityLabel = getText(
    thankYouTexts?.itemsQuantityLabel,
    "Quantity"
  );
  const shippingInfoTitle = getText(
    thankYouTexts?.shippingInfoTitle,
    "Shipping Information"
  );
  const deliveryAddressTitle = getText(
    thankYouTexts?.deliveryAddressTitle,
    "Delivery Address"
  );
  const estimatedDeliveryTitle = getText(
    thankYouTexts?.estimatedDeliveryTitle,
    "Estimated Delivery"
  );
  const estimatedDeliveryWindow = getText(
    thankYouTexts?.estimatedDeliveryWindow,
    "3-5 business days"
  );
  const phoneLabel = getText(thankYouTexts?.phoneLabel, "Phone:");
  const nextStepsTitle = getText(thankYouTexts?.nextStepsTitle, "What's Next?");
  const orderSummaryTitle = getText(
    thankYouTexts?.orderSummaryTitle,
    "Order Summary"
  );
  const subtotalLabel = getText(thankYouTexts?.subtotalLabel, "Subtotal");
  const discountLabel = getText(thankYouTexts?.discountLabel, "Discount");
  const shippingLabel = getText(thankYouTexts?.shippingLabel, "Shipping");
  const taxLabel = getText(thankYouTexts?.taxLabel, "Tax");
  const totalPaidLabel = getText(thankYouTexts?.totalPaidLabel, "Total Paid");
  const freeLabel = getText(thankYouTexts?.freeLabel, "FREE");
  const paymentConfirmedTitle = getText(
    thankYouTexts?.paymentConfirmedTitle,
    "Payment Confirmed"
  );
  const paymentConfirmedText = getText(
    thankYouTexts?.paymentConfirmedText,
    "Your payment has been successfully processed."
  );
  const trackOrderText = getText(
    thankYouTexts?.actions?.trackOrder,
    "Track Your Order"
  );
  const contactSupportText = getText(
    thankYouTexts?.actions?.contactSupport,
    "Contact Support"
  );
  const continueShoppingText = getText(
    thankYouTexts?.actions?.continueShopping,
    "Continue Shopping"
  );
  const helpTitle = getText(thankYouTexts?.actions?.helpTitle, "Need Help?");
  const helpText = getText(
    thankYouTexts?.actions?.helpText,
    "If you have any questions about your order, our support team is here to help."
  );
  const helpLinkText = getText(
    thankYouTexts?.actions?.helpLink,
    "Contact Support →"
  );
  const defaultNextSteps = [
    {
      title: "Order Confirmation",
      description:
        "You'll receive an email confirmation with your order details shortly.",
    },
    {
      title: "Processing",
      description:
        "We'll prepare your order for shipment within 1-2 business days.",
    },
    {
      title: "Shipping Updates",
      description: "You'll receive tracking information once your order ships.",
    },
  ];
  const nextSteps = thankYouTexts?.nextSteps?.length
    ? thankYouTexts.nextSteps
    : defaultNextSteps;
  const handleNavigate = (url?: string) => {
    if (url) {
      window.location.href = url;
    }
  };

  useEffect(() => {
    if (error) {
      console.error("Failed to load order:", error);
      toast.error(errorMessage);
    }
  }, [error, errorMessage]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {errorTitle}
          </h1>
          <p className="text-muted-foreground">
            {error?.message || errorMessage}
          </p>
          <Button
            className="mt-4"
            onClick={() => handleNavigate(links.checkoutUrl ?? "/")}
          >
            {returnToCheckoutText}
          </Button>
        </div>
      </div>
    );
  }

  // Get the current summary using useCurrency hook as priority, then fallback to selectedPresentmentCurrency
  const selectedCurrency =
    currentCurrency?.code ||
    order.checkoutSession?.selectedPresentmentCurrency ||
    order.currency ||
    "USD";
  const currentSummary = order.summaries?.find(
    (summary) => summary.currency === selectedCurrency
  );

  // Use currency from current summary or fallback
  const currency = currentSummary?.currency || selectedCurrency;

  // Get items for the current currency only (filters out duplicate currency items)
  const currentCurrencyItems = order.items.filter(
    (item) => item.currency === currency
  );

  // Calculate totals
  const subtotal =
    currentSummary?.subtotalAdjustedAmount ||
    currentCurrencyItems.reduce((sum, item) => sum + item.adjustedAmount, 0);
  const shippingCost = currentSummary?.shippingCost || 0;
  const shippingIsFree = currentSummary?.shippingCostIsFree ?? true;
  const totalAmount = currentSummary?.totalAdjustedAmount || order.paidAmount;

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Success Header */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: brandingColors.primary100 }}
                >
                  <CheckCircle
                    className="w-6 h-6"
                    style={{ color: brandingColors.primary }}
                  />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: brandingColors.primary800 }}
                  >
                    {successTitle}
                  </h1>
                  <p
                    className="text-base"
                    style={{ color: brandingColors.primary700 }}
                  >
                    {successSubtitle}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {orderDetailsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {orderNumberLabel}
                  </span>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {orderDateLabel}
                  </span>
                  <p className="font-medium">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">
                  {itemsTitle} ({currency})
                </h4>
                {currentCurrencyItems.length > 0 ? (
                  currentCurrencyItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.orderLineItemVariant?.imageUrl ||
                            placeholderProductImage
                          }
                          alt={item.orderLineItemProduct?.name || "Product"}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.orderLineItemProduct?.name}
                        </p>
                        {item.orderLineItemVariant?.name && (
                          <p className="text-sm text-muted-foreground">
                            {item.orderLineItemVariant.name}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {itemsQuantityLabel}: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatMoney(item.adjustedAmount, currency)}
                        </p>
                        {item.amount !== item.adjustedAmount && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatMoney(item.amount, currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>
                      {noItemsText} {currency}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {shippingInfoTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{deliveryAddressTitle}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && (
                      <p>{order.shippingAddress.address2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postal}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p>
                        {phoneLabel} {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">{estimatedDeliveryTitle}</h4>
                  <p className="text-sm text-muted-foreground">
                    {estimatedDeliveryWindow}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {nextStepsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {nextSteps.map((step, index) => (
                  <div
                    className="flex items-start gap-3"
                    key={`${step.title}-${index}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {orderSummaryTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentCurrencyItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.orderLineItemProduct?.name} × {item.quantity}
                    </span>
                    <span>{formatMoney(item.adjustedAmount, currency)}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{subtotalLabel}</span>
                  <span>{formatMoney(subtotal, currency)}</span>
                </div>

                {currentSummary?.totalPromotionAmount ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {discountLabel}
                    </span>
                    <span className="text-green-600">
                      -
                      {formatMoney(
                        currentSummary.totalPromotionAmount,
                        currency
                      )}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{shippingLabel}</span>
                  <span>
                    {shippingIsFree ? (
                      <span className="font-semibold text-green-600">
                        {freeLabel}
                      </span>
                    ) : (
                      formatMoney(shippingCost, currency)
                    )}
                  </span>
                </div>

                {currentSummary?.totalTaxAmount ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{taxLabel}</span>
                    <span>
                      {formatMoney(currentSummary.totalTaxAmount, currency)}
                    </span>
                  </div>
                ) : null}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>{totalPaidLabel}</span>
                  <span>{formatMoney(totalAmount, currency)}</span>
                </div>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-sm font-medium text-green-800 mb-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {paymentConfirmedTitle}
                </div>
                <p className="text-xs text-green-700">{paymentConfirmedText}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleNavigate(links.trackOrderUrl)}
              >
                <Package className="w-4 h-4 mr-2" />
                {trackOrderText}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleNavigate(links.supportUrl)}
              >
                <Mail className="w-4 h-4 mr-2" />
                {contactSupportText}
              </Button>

              <Button
                className="w-full"
                style={{
                  backgroundColor: brandingColors.primary,
                  borderColor: brandingColors.primary,
                  color: "white",
                }}
                onClick={() => handleNavigate(links.continueShoppingUrl)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    brandingColors.primary700;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    brandingColors.primary;
                }}
              >
                {continueShoppingText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">{helpTitle}</h4>
              <p className="text-sm text-muted-foreground mb-3">{helpText}</p>
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => handleNavigate(links.supportUrl)}
              >
                {helpLinkText}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
