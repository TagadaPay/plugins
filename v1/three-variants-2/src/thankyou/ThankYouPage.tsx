import { Badge } from "@/components/ui/badge";
import { Button as LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pluginConfig } from "@/data/config";
import Logo from "@/src/Logo";
import {
  formatMoney,
  OrderItem,
  useCurrency,
  useOrder,
} from "@tagadapay/plugin-sdk";
import { Check, Package, Shield } from "lucide-react";

type ThankYouPageProps = {
  orderId: string | null;
};

export default function ThankYouPage({ orderId }: ThankYouPageProps) {
  const { order, isLoading, error, fetchOrder } = useOrder({
    orderId: orderId || undefined,
    autoFetch: true,
    enabled: Boolean(orderId),
  });

  const currentCurrency = useCurrency();

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <svg
          className="mb-2 h-8 w-8 animate-spin text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span className="text-sm text-gray-500">Loading summary...</span>
      </div>
    );
  }

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
            <LinkButton
              className="w-full"
              onClick={() => (window.location.href = "/")}
            >
              Return to Checkout
            </LinkButton>
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

  // Get items from related orders for the current currency
  const relatedOrderItems =
    order.relatedOrders?.flatMap((relatedOrder) =>
      relatedOrder.items.filter((item: OrderItem) => item.currency === currency)
    ) || [];

  const allItems = [...currentCurrencyItems, ...relatedOrderItems];

  const primaryColor = "rgb(11, 34, 125)";

  console.log(allItems);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo />

              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <Shield className="mr-1 h-3 w-3" />
                SSL SECURE
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Contact Us:</p>
              <p className="font-semibold text-slate-900">
                {pluginConfig.branding.supportEmail}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Thank You Header */}
        <div className="mb-12 text-center">
          <div className="mb-6">
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="text-xl text-slate-600">
              Your Tagada plugin-sdk order has been confirmed
            </p>
          </div>

          <div className="inline-block rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-800">Order #{order.id}</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items Ordered */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Items Ordered</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {allItems.map((item, index) => (
                <div key={index} className="flex space-x-4">
                  <img
                    src={
                      item.orderLineItemVariant?.imageUrl || "/placeholder.svg"
                    }
                    alt={item.orderLineItemProduct?.name}
                    className="h-20 w-20 rounded-lg bg-slate-50 object-contain"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {item.quantity}x {item.orderLineItemVariant?.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className="text-lg font-bold"
                        style={{ color: primaryColor }}
                      >
                        {formatMoney(item.unitAmount)} each
                      </span>
                      {/* <span className="text-sm text-slate-500 line-through">${item.originalPrice}</span> */}
                      {item.amount - item.adjustedAmount > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <>
                            Save{" "}
                            {formatMoney(item.amount - item.adjustedAmount)}
                          </>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* {orderData.addOns.map((addon, index) => (
                  <div key={index} className="flex space-x-4 border-t pt-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200">
                      <Shield className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {addon.quantity}x {addon.name}
                      </h3>
                      <p className="mb-2 text-sm text-slate-600">{addon.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold" style={{ color: primaryColor }}>
                          ${addon.price}
                        </span>
                        <span className="text-sm text-slate-500 line-through">${addon.originalPrice}</span>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          50% OFF
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))} */}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 space-y-4 text-center text-sm text-slate-600">
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-slate-900">
              Terms & Conditions
            </a>
            <span>|</span>
            <a href="#" className="hover:text-slate-900">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-slate-900">
              Returns
            </a>
          </div>
          <p>© 2024 {pluginConfig.branding.storeName}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
