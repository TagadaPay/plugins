import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, Phone, Truck, CreditCard } from 'lucide-react';
import { useOrder, useCurrency, formatMoney, type OrderItem } from '@tagadapay/plugin-sdk';
import toast from 'react-hot-toast';
import { pluginConfig } from '@/data/config';

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
        console.error('Failed to fetch order:', err);
        toast.error('Failed to load order details');
      });
    }
  }, [orderId, order, isLoading, error, fetchOrder]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8 px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error?.message || 'We could not find the order you are looking for.'}
            </p>
            <Link
              to="/step1"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Checkout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get the current summary using useCurrency hook as priority, then fallback to selectedPresentmentCurrency
  const selectedCurrency = currentCurrency?.code || order.checkoutSession?.selectedPresentmentCurrency || order.currency || 'USD';
  const currentSummary = order.summaries?.find((summary) => summary.currency === selectedCurrency);

  // Use currency from current summary or fallback
  const currency = currentSummary?.currency || selectedCurrency;

  // Get items for the current currency only (filters out duplicate currency items)
  const currentCurrencyItems = order.items.filter((item: OrderItem) => item.currency === currency);

  // Calculate totals
  const subtotal =
    currentSummary?.subtotalAdjustedAmount ||
    currentCurrencyItems.reduce((sum: number, item: OrderItem) => sum + item.adjustedAmount, 0);
  const shippingCost = currentSummary?.shippingCost || 0;
  const shippingIsFree = currentSummary?.shippingCostIsFree ?? true;
  const totalAmount = currentSummary?.totalAdjustedAmount || order.paidAmount;

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Your order has been successfully processed and confirmed.
          </p>
          <p className="text-sm text-gray-500">
            Order #{order.id} • Placed on {formatOrderDate(order.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Items Ordered ({currency})
              </h2>
              
              {currentCurrencyItems.length > 0 ? (
                <div className="space-y-4">
                  {currentCurrencyItems.map((item: OrderItem) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <img
                          src={item.orderLineItemVariant?.imageUrl || '/placeholder.svg'}
                          alt={item.orderLineItemProduct?.name || 'Product'}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{item.orderLineItemProduct?.name}</h3>
                        {item.orderLineItemVariant?.name && (
                          <p className="text-sm text-gray-600">{item.orderLineItemVariant.name}</p>
                        )}
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatMoney(item.adjustedAmount, currency)}</p>
                        {item.amount !== item.adjustedAmount && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatMoney(item.amount, currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No items found for {currency}</p>
                </div>
              )}
            </div>

            {/* Shipping Information */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Information
                </h2>
                <div className="text-gray-700">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Order Confirmation</h3>
                    <p className="text-sm text-gray-600">
                      You'll receive an email confirmation shortly with your order details and tracking information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Package className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Processing & Shipping</h3>
                    <p className="text-sm text-gray-600">
                      Your order will be processed within 1-2 business days and shipped via our fast delivery service.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Delivery</h3>
                    <p className="text-sm text-gray-600">
                      Most orders arrive within 3-5 business days. You'll receive tracking information to monitor your shipment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Order Summary ({currency})
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatMoney(subtotal, currency)}</span>
                </div>

                {currentSummary?.totalPromotionAmount ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">
                      -{formatMoney(currentSummary.totalPromotionAmount, currency)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shippingIsFree ? (
                      <span className="font-semibold text-green-600">FREE</span>
                    ) : (
                      formatMoney(shippingCost, currency)
                    )}
                  </span>
                </div>

                {currentSummary?.totalTaxAmount ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatMoney(currentSummary.totalTaxAmount, currency)}</span>
                  </div>
                ) : null}

                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900">Total Paid</span>
                    <span className="text-green-600">{formatMoney(totalAmount, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-green-50 rounded-lg p-4">
                <div className="flex items-center text-sm font-medium text-green-800 mb-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Payment Confirmed
                </div>
                <p className="text-xs text-green-700">Your payment has been successfully processed.</p>
              </div>
            </div>

            {/* Support Information */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">{pluginConfig.branding.supportEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Customer Care</p>
                    <p className="text-sm text-gray-600">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-green-900 mb-2">
                30-Day Money Back Guarantee
              </h4>
              <p className="text-sm text-green-800">
                Not satisfied? Get a full refund within 30 days.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          {order.checkoutSession?.returnUrl ? (
            <a
              href={order.checkoutSession.returnUrl}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </a>
          ) : (
            <Link
              to="/step1"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Funnel
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center">
          <p className="text-gray-600 mb-2">
            Thank you for choosing {pluginConfig.branding.storeName}!
          </p>
          <p className="text-xs text-gray-500">
            Order powered by Tagadapay - Secure, Fast, Reliable
          </p>
        </div>
      </div>
    </div>
  );
} 