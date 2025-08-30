import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatMoney,
  OrderItem,
  useCurrency,
  useISOData,
  useOrder,
} from "@tagadapay/plugin-sdk/react";
import { useNavigate } from "react-router-dom";

type CheckoutSuccessPageProps = {
  orderId: string;
};

export default function CheckoutSuccessPage({
  orderId,
}: CheckoutSuccessPageProps) {
  const { order, isLoading, error } = useOrder({
    orderId,
    autoFetch: true,
    enabled: Boolean(orderId),
  });
  const { countries } = useISOData();
  const navigate = useNavigate();
  const currentCurrency = useCurrency();

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
            <a href="/checkout">
              <Button className="w-full">Return to Checkout</Button>
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
    (item: OrderItem) => item.currency === currency
  );

  console.log(countries);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">SkinCare</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <svg
                className="w-12 h-12 text-primary animate-check-mark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Order Confirmed!
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for your purchase. Your personalized skincare routine is
              on its way!
            </p>
            <p className="text-sm text-muted-foreground">
              Order #{order.id} • Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Order Summary and Shipping Information - Vertical Layout */}
          <div className="space-y-6 mb-6">
            {/* Order Summary Card */}
            <Card className="p-6 text-left">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                Order Summary ({currency})
              </h3>

              <div className="space-y-4">
                {/* Order Items */}
                {currentCurrencyItems.length > 0 ? (
                  <div className="space-y-3">
                    {currentCurrencyItems.map((item: OrderItem) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={
                              item.orderLineItemVariant?.imageUrl ||
                              "/placeholder.svg"
                            }
                            alt={
                              item.orderLineItemProduct?.name ||
                              item.orderLineItemVariant?.name ||
                              "Product"
                            }
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {item.orderLineItemProduct?.name ||
                              item.orderLineItemVariant?.name ||
                              "Product"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatMoney(
                              item.adjustedAmount || item.amount,
                              currency
                            )}
                          </p>
                          {item.amount !== item.adjustedAmount && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatMoney(item.amount, currency)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No items found
                  </p>
                )}

                {/* Order Totals */}
                {currentSummary && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">
                        {formatMoney(
                          currentSummary.subtotalAdjustedAmount ||
                            currentCurrencyItems.reduce(
                              (sum: number, item: OrderItem) =>
                                sum + item.adjustedAmount,
                              0
                            ),
                          currency
                        )}
                      </span>
                    </div>
                    {currentSummary.totalPromotionAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-green-600">
                          -
                          {formatMoney(
                            currentSummary.totalPromotionAmount,
                            currency
                          )}
                        </span>
                      </div>
                    )}
                    {currentSummary.shippingCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-foreground">
                          {currentSummary.shippingCostIsFree
                            ? "FREE"
                            : formatMoney(
                                currentSummary.shippingCost,
                                currency
                              )}
                        </span>
                      </div>
                    )}
                    {currentSummary.totalTaxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="text-foreground">
                          {formatMoney(currentSummary.totalTaxAmount, currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">
                        {formatMoney(
                          currentSummary.totalAdjustedAmount ||
                            order.paidAmount,
                          currency
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Shipping Information Card */}
            {order.shippingAddress && (
              <Card className="p-6 text-left">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Shipping Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-foreground">
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Name:
                    </span>
                    <p className="text-foreground">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                  </div>

                  {order.shippingAddress.phone && (
                    <div>
                      <span className="font-semibold text-muted-foreground">
                        Phone:
                      </span>
                      <p className="text-foreground">
                        {order.shippingAddress.phone}
                      </p>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <span className="font-semibold text-muted-foreground">
                      Address:
                    </span>
                    <p className="text-foreground">
                      {order.shippingAddress.address1}
                    </p>
                    {order.shippingAddress.address2 && (
                      <p className="text-foreground">
                        {order.shippingAddress.address2}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="font-semibold text-muted-foreground">
                      City:
                    </span>
                    <p className="text-foreground">
                      {order.shippingAddress.city}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-muted-foreground">
                      State/Province:
                    </span>
                    <p className="text-foreground">
                      {order.shippingAddress.state}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Postal Code:
                    </span>
                    <p className="text-foreground">
                      {order.shippingAddress.postal}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Country:
                    </span>
                    <p className="text-foreground">
                      {countries?.[order.shippingAddress.country]?.name ||
                        order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Order Details Card */}
          <Card className="p-8 mb-8 text-left">
            <h3 className="text-xl font-bold text-foreground mb-4">
              What's Next?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Order Processing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We'll prepare your personalized skincare products within 1-2
                    business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Your order will be shipped within 3-5 business days with
                    tracking information.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Start Your Routine
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Follow the included guide to get the best results from your
                    personalized products.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Support Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                Order Confirmation
              </h4>
              <p className="text-sm text-muted-foreground">
                Check your email for order details and tracking information.
              </p>
            </Card>
            <Card className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75 9.75 9.75 0 019.75-9.75z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground">
                Contact our skincare experts for personalized advice and
                support.
              </p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="px-6"
            >
              Take Another Quiz
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              Continue Shopping
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Questions about your order? Contact us at support@skincare.com
          </p>
        </div>
      </main>
    </div>
  );
}
