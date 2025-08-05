import {
  formatMoney,
  useCurrency,
  useOrder,
  type OrderItem,
} from "@tagadapay/plugin-sdk";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Package,
  Truck,
} from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { pluginConfig } from "@/data/config";

interface ThankYouPageProps {
  orderId: string;
}

export function ThankYouPage({ orderId }: ThankYouPageProps) {
  const { order, isLoading, error, fetchOrder } = useOrder({
    orderId,
    autoFetch: true,
    enabled: Boolean(orderId),
  });

  const currentCurrency = useCurrency();

  useEffect(() => {
    if (orderId && !order && !isLoading && !error) {
      fetchOrder(orderId).catch((err: unknown) => {
        console.error("Failed to fetch order:", err);
        toast.error("Failed to load order details");
      });
    }
  }, [orderId, order, isLoading, error, fetchOrder]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="ml-2 text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="mb-4 text-xl font-semibold text-red-600">
              Order Not Found
            </h1>
            <p className="mb-4 text-gray-600">
              {error?.message ||
                "We could not find the order you are looking for."}
            </p>
            <Link to="/checkout">
              <Button className="w-full">Return to Checkout</Button>
            </Link>
          </div>
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
    (item: OrderItem) => item.currency === currency
  );

  // Get items from related orders for the current currency
  const relatedOrderItems =
    order.relatedOrders?.flatMap((relatedOrder) =>
      relatedOrder.items.filter((item: OrderItem) => item.currency === currency)
    ) || [];

  // Combine main order items and related order items
  const allItems = [...currentCurrencyItems, ...relatedOrderItems];

  console.log(
    `[ThankYouPage] Currency sources - useCurrency: ${currentCurrency?.code}, selectedPresentmentCurrency: ${order.checkoutSession?.selectedPresentmentCurrency}, order.currency: ${order.currency}`
  );
  console.log(
    `[ThankYouPage] Final selected currency: ${selectedCurrency}, Display currency: ${currency}`
  );
  console.log(
    `[ThankYouPage] Total items: ${order.items.length}, Current currency items: ${currentCurrencyItems.length}, Related order items: ${relatedOrderItems.length}, All items: ${allItems.length}`
  );
  console.log(
    `[ThankYouPage] Available summaries:`,
    order.summaries?.map((s) => s.currency)
  );

  // Calculate totals including related orders
  const mainOrderSubtotal =
    currentSummary?.subtotalAdjustedAmount ||
    currentCurrencyItems.reduce(
      (sum: number, item: OrderItem) => sum + item.adjustedAmount,
      0
    );

  // Calculate related orders subtotal and discounts
  const relatedOrdersSubtotal = relatedOrderItems.reduce(
    (sum: number, item: OrderItem) => sum + item.adjustedAmount,
    0
  );

  // Get related orders summaries for the current currency
  const relatedOrdersSummaries =
    order.relatedOrders
      ?.map((relatedOrder) =>
        relatedOrder.summaries?.find((summary) => summary.currency === currency)
      )
      .filter(Boolean) || [];

  // Calculate total promotion amount from related orders
  const relatedOrdersPromotionAmount = relatedOrdersSummaries.reduce(
    (sum, summary) => sum + (summary?.totalPromotionAmount || 0),
    0
  );

  // Total subtotal including related orders
  const subtotal = mainOrderSubtotal + relatedOrdersSubtotal;

  // Total promotion amount (main order + related orders)
  const totalPromotionAmount =
    (currentSummary?.totalPromotionAmount || 0) + relatedOrdersPromotionAmount;

  console.log(
    `[ThankYouPage] Summary calculations - Main order subtotal: ${mainOrderSubtotal}, Related orders subtotal: ${relatedOrdersSubtotal}, Total subtotal: ${subtotal}`
  );
  console.log(
    `[ThankYouPage] Promotion amounts - Main order: ${
      currentSummary?.totalPromotionAmount || 0
    }, Related orders: ${relatedOrdersPromotionAmount}, Total: ${totalPromotionAmount}`
  );

  const shippingCost = currentSummary?.shippingCost || 0;
  const shippingIsFree = currentSummary?.shippingCostIsFree ?? true;

  // Calculate total amount including related orders
  const mainOrderTotal =
    currentSummary?.totalAdjustedAmount || order.paidAmount;
  const relatedOrdersTotal = relatedOrdersSummaries.reduce(
    (sum, summary) => sum + (summary?.totalAdjustedAmount || 0),
    0
  );
  const totalAmount = mainOrderTotal + relatedOrdersTotal;

  console.log(
    `[ThankYouPage] Total amounts - Main order: ${mainOrderTotal}, Related orders: ${relatedOrdersTotal}, Total paid: ${totalAmount}`
  );

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[#f5f3f0] font-sans">
      {/* Header */}
      <header className="bg-brand-green-dark p-2 text-center text-white">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-400" />
          <p className="font-bold">ORDER CONFIRMED</p>
        </div>
        <p className="text-sm">
          Thank you for your purchase! Your order has been successfully
          processed.
        </p>
      </header>

      {/* Navigation */}
      <div className="bg-white py-4">
        <div className="container mx-auto flex items-center justify-between px-2 sm:px-4">
          <h1 className="text-2xl font-bold">
            {pluginConfig.branding.storeName}
          </h1>
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-700 sm:text-sm">
                ORDER CONFIRMED
              </p>
              {/* <p className="text-xs font-bold text-gray-700 sm:text-sm">
                NEED HELP?
              </p>
              <p className="text-xs text-gray-500">
                {pluginConfig.branding.supportEmail}
              </p> */}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-2 py-4 sm:px-4 md:px-8 lg:px-12 xl:px-24">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
          {/* Left Column - Order Details */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-3">
            {/* Success Message */}
            <div className="flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-100 p-3 text-center text-sm font-semibold text-green-700 sm:p-4 sm:text-base">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Your order has been confirmed and will be processed shortly!
            </div>

            {/* Order Information */}
            <div className="space-y-3 rounded-lg border border-gray-300 bg-white p-3 sm:space-y-4 sm:p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">
                    ORDER DETAILS
                  </h2>
                  <p className="text-sm text-gray-600">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">
                    Placed on {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold">
                  Items Ordered ({currency})
                </h3>
                {allItems.length > 0 ? (
                  <>
                    {/* Main Order Items */}
                    {currentCurrencyItems.length > 0 && (
                      <>
                        {currentCurrencyItems.map(
                          (item: OrderItem, index: number) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-b-0"
                            >
                              <div className="flex-shrink-0">
                                <img
                                  src={
                                    item.orderLineItemVariant?.imageUrl ||
                                    "/placeholder.svg"
                                  }
                                  alt={
                                    item.orderLineItemProduct?.name || "Product"
                                  }
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium">
                                  {item.orderLineItemProduct?.name}
                                </h4>
                                {item.orderLineItemVariant?.name && (
                                  <p className="text-sm text-gray-600">
                                    {item.orderLineItemVariant.name}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {formatMoney(item.adjustedAmount, currency)}
                                </p>
                                {item.amount !== item.adjustedAmount && (
                                  <p className="text-sm text-gray-500 line-through">
                                    {formatMoney(item.amount, currency)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </>
                    )}

                    {/* Related Order Items */}
                    {relatedOrderItems.length > 0 && (
                      <>
                        {relatedOrderItems.map(
                          (item: OrderItem, index: number) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-b-0"
                            >
                              <div className="flex-shrink-0">
                                <img
                                  src={
                                    item.orderLineItemVariant?.imageUrl ||
                                    "/placeholder.svg"
                                  }
                                  alt={
                                    item.orderLineItemProduct?.name || "Product"
                                  }
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium">
                                  {item.orderLineItemProduct?.name}
                                </h4>
                                {item.orderLineItemVariant?.name && (
                                  <p className="text-sm text-gray-600">
                                    {item.orderLineItemVariant.name}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {formatMoney(item.adjustedAmount, currency)}
                                </p>
                                {item.amount !== item.adjustedAmount && (
                                  <p className="text-sm text-gray-500 line-through">
                                    {formatMoney(item.amount, currency)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    <p>No items found for {currency}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Information */}
            {order.shippingAddress && (
              <div className="space-y-3 rounded-lg border border-gray-300 bg-white p-3 sm:space-y-4 sm:p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-bold sm:text-xl">
                    SHIPPING INFORMATION
                  </h2>
                </div>
                <div className="text-sm">
                  <p className="font-medium">
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postal}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p>Phone: {order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Post-Purchase Upsell */}

            {/* Continue Shopping */}
            <div className="text-center">
              {order.checkoutSession?.returnUrl ? (
                <a
                  href={order.checkoutSession.returnUrl}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </a>
              ) : (
                <Link
                  to="/checkout"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Checkout
                </Link>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            <div className="rounded-lg border border-gray-300 bg-white p-3 shadow-md sm:p-4">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Package className="h-5 w-5" />
                ORDER SUMMARY ({currency})
              </h3>

              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatMoney(subtotal, currency)}</span>
                  </div>

                  {totalPromotionAmount > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">
                        -{formatMoney(totalPromotionAmount, currency)}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {shippingIsFree ? (
                        <span className="font-semibold text-green-600">
                          FREE
                        </span>
                      ) : (
                        formatMoney(shippingCost, currency)
                      )}
                    </span>
                  </div>

                  {currentSummary?.totalTaxAmount ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span>
                        {formatMoney(currentSummary.totalTaxAmount, currency)}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-base font-medium">
                    <span>Total Paid</span>
                    <span>{formatMoney(totalAmount, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-green-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <CreditCard className="h-4 w-4" />
                  Payment Confirmed
                </div>
                <p className="mt-1 text-xs text-green-700">
                  Your payment has been successfully processed.
                </p>
              </div>
            </div>

            {/* Guarantee Badge */}
            {/* <div className="flex items-center gap-3 sm:gap-4">
              <img
                src="https://img.funnelish.com/9938/69802/1678959839-op.webp"
                alt="90 Day Guarantee"
                width={80}
                height={80}
                className="sm:h-[100px] sm:w-[100px]"
              />
              <div>
                <h4 className="text-base font-bold sm:text-lg">
                  90 DAYS GUARANTEE
                </h4>
                <p className="text-xs text-gray-600 sm:text-sm">
                  If you are not completely thrilled with your purchase - we are
                  offering you a 90 day guarantee on all purchases. Simply
                  contact our customer support for a full refund or replacement.
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
