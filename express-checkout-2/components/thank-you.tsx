"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { PluginConfig } from "@/types/plugin-config";
import {
  formatMoney,
  useCurrency,
  useISOData,
  useOrder,
  usePluginConfig,
  useTranslation,
} from "@tagadapay/plugin-sdk/v2";

interface ThankYouProps {
  orderId: string;
}

export default function ThankYou({ orderId }: ThankYouProps) {
  const { order, isLoading, error } = useOrder({
    orderId,
    enabled: Boolean(orderId),
  });
  const { countries } = useISOData();
  const currentCurrency = useCurrency();
  const { config } = usePluginConfig<PluginConfig>();
  const texts = config?.texts;
  const links = config?.links || {};
  const { t } = useTranslation();
  const orderSummaryTexts = texts?.orderSummary;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--checkout-thankyou-background)] py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="ml-2 text-gray-600">
                {t(texts?.thankYou?.loadingText, "Loading order details...")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--checkout-thankyou-background)] py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="mb-4 text-xl font-semibold text-red-600">
              {t(texts?.thankYou?.errorTitle, "Order Not Found")}
            </h1>
            <p className="mb-4 text-gray-600">
              {error?.message ||
                t(
                  texts?.thankYou?.errorDescription,
                  "We could not find the order you are looking for."
                )}
            </p>
            <a href={links.checkoutUrl ?? "/checkout"}>
              <Button className="w-full">
                {t(texts?.thankYou?.returnToCheckout, "Return to Checkout")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Order Confirmation Header - At the very top */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t(texts?.thankYou?.title, "Order Confirmed!")}
              </h1>
              <p className="text-gray-600">
                {t(
                  texts?.thankYou?.subtitle,
                  `Thank you for your order. We've received your order #${order.id} and will begin processing it shortly.`,
                  {
                    orderId: order.id,
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Order summary
          </h2>
          <div className="space-y-4">
            {currentCurrencyItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative">
                  <img
                    src={item.orderLineItemVariant?.imageUrl || ""}
                    alt="Noir Mini Dress"
                    className="h-[62px] w-[62px] rounded-lg object-cover"
                    style={{
                      imageRendering: "auto",
                      // Use pixel density aware srcset for higher quality on retina screens
                    }}
                    srcSet={
                      item.orderLineItemVariant?.imageUrl
                        ? `${
                            item.orderLineItemVariant.imageUrl
                          } 1x, ${item.orderLineItemVariant.imageUrl.replace(
                            /(\.[\w\d_-]+)$/i,
                            "@2x$1"
                          )} 2x`
                        : undefined
                    }
                    loading="lazy"
                    decoding="async"
                    width={62}
                    height={62}
                  />
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--checkout-badge-bg)] text-xs font-medium text-white">
                    {item.quantity}
                  </div>
                </div>
                <div className="mt-4 flex-1">
                  <h3 className="text-sm">{item.orderLineItemProduct?.name}</h3>
                  <p className="text-xs text-gray-600">
                    {item.orderLineItemVariant?.name}
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  {item.adjustedAmount > 0
                    ? formatMoney(item.adjustedAmount)
                    : "Free"}
                </p>
              </div>
            ))}

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-900">
                    {t(orderSummaryTexts?.shipping, "Shipping")}
                  </span>
                </div>
                <span className="text-gray-500">
                  {t(orderSummaryTexts?.shippingFree, "Free")}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-3 text-[19px] font-semibold">
              <span className="font-bold text-gray-900">
                {t(orderSummaryTexts?.total, "Total")}
              </span>
              <span className="font-bold text-gray-900">
                {formatMoney(order.paidAmount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Thank You Details */}
        <div className="flex h-full flex-col gap-8">
          {/* Order Details Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t(texts?.thankYou?.orderDetails?.title, "Order Details")}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t(
                    texts?.thankYou?.orderDetails?.orderNumber,
                    "Order Number:"
                  )}
                </span>
                <span className="font-medium text-gray-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t(texts?.thankYou?.orderDetails?.orderDate, "Order Date:")}
                </span>
                <span className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t(
                    texts?.thankYou?.orderDetails?.paymentStatus,
                    "Payment Status:"
                  )}
                </span>
                <span className="font-medium text-green-600 capitalize">
                  Paid
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t(
                    texts?.thankYou?.orderDetails?.fulfillmentStatus,
                    "Fulfillment Status:"
                  )}
                </span>
                <span className="font-medium text-blue-600 capitalize">
                  Unfulfilled
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t(texts?.thankYou?.orderDetails?.totalPaid, "Total Paid:")}
                </span>
                <span className="font-bold text-gray-900">
                  {formatMoney(order.paidAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {t(texts?.thankYou?.shipping?.title, "Shipping Information")}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t(texts?.thankYou?.shipping?.shipTo, "Ship to:")}
                  </span>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.address1}
                      {order.shippingAddress.address2 &&
                        `, ${order.shippingAddress.address2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postal}
                    </p>
                    <p className="text-sm text-gray-600">
                      {countries[order.shippingAddress.country]?.name ||
                        order.shippingAddress.country}
                    </p>
                    {order.shippingAddress.phone && (
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Information */}
          {order.billingAddress && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {t(texts?.thankYou?.billing?.title, "Billing Information")}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t(texts?.thankYou?.billing?.billTo, "Bill to:")}
                  </span>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {order.billingAddress.firstName}{" "}
                      {order.billingAddress.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.billingAddress.address1}
                      {order.billingAddress.address2 &&
                        `, ${order.billingAddress.address2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.billingAddress.city}, {order.billingAddress.state}{" "}
                      {order.billingAddress.postal}
                    </p>
                    <p className="text-sm text-gray-600">
                      {countries[order.billingAddress.country]?.name ||
                        order.billingAddress.country}
                    </p>
                    {order.billingAddress.phone && (
                      <p className="text-sm text-gray-600">
                        {order.billingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          {order.checkoutSession?.customer && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {t(texts?.thankYou?.customer?.title, "Customer Information")}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t(texts?.thankYou?.customer?.email, "Email:")}
                  </span>
                  <span className="font-medium text-gray-900">
                    {order.checkoutSession.customer.email}
                  </span>
                </div>
                {order.checkoutSession.customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t(texts?.thankYou?.customer?.phone, "Phone:")}
                    </span>
                    <span className="font-medium text-gray-900">
                      {order.checkoutSession.customer.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-blue-900">
              {t(texts?.thankYou?.nextSteps?.title, "What's Next?")}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    {t(
                      texts?.thankYou?.nextSteps?.step1?.title,
                      "Order Confirmation"
                    )}
                  </p>
                  <p className="text-sm text-blue-700">
                    {t(
                      texts?.thankYou?.nextSteps?.step1?.description,
                      "You'll receive an email confirmation with your order details shortly."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    {t(texts?.thankYou?.nextSteps?.step2?.title, "Processing")}
                  </p>
                  <p className="text-sm text-blue-700">
                    {t(
                      texts?.thankYou?.nextSteps?.step2?.description,
                      "We'll prepare your order for shipment within 1-2 business days."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    {t(texts?.thankYou?.nextSteps?.step3?.title, "Tracking")}
                  </p>
                  <p className="text-sm text-blue-700">
                    {t(
                      texts?.thankYou?.nextSteps?.step3?.description,
                      "You'll receive tracking information once your order ships."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Information */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t(texts?.thankYou?.support?.title, "Need Help?")}
            </h2>
            <p className="mb-4 text-gray-600">
              {t(
                texts?.thankYou?.support?.description,
                "If you have any questions about your order, our customer support team is here to help."
              )}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  window.open(
                    `mailto:${
                      links.supportEmail || "support@example.com"
                    }?subject=Order ${order.id}`
                  )
                }
              >
                {t(texts?.thankYou?.support?.emailButton, "Email Support")}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  window.open(`tel:${links.supportPhone || "+1234567890"}`)
                }
              >
                {t(texts?.thankYou?.support?.phoneButton, "Call Support")}
              </Button>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-auto">
            <Button
              className="w-full"
              onClick={() =>
                (window.location.href = links.continueShoppingUrl || "/")
              }
            >
              {t(texts?.thankYou?.continueShopping, "Continue Shopping")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
