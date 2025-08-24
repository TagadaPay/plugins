import { usePluginConfig, useOrder, formatMoney } from '@tagadapay/plugin-sdk/react';
import { CheckCircle, Package, Truck, Mail, Phone, Star, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ThankYouPageProps {
  orderId: string;
}

// Type definitions for order data
interface OrderVariantWithDescription {
  name?: string;
  imageUrl?: string;
  description?: string;
}

interface OrderProductWithDescription {
  name?: string;
  description?: string;
}

interface OrderWithPaidAt {
  id?: string;
  status?: string;
  paidAmount?: number;
  currency?: string;
  paidAt?: string;
}

export function ThankYouPage({ orderId }: ThankYouPageProps) {
  // Plugin configuration
  const { config } = usePluginConfig();
  
  // Use the useOrder hook with the orderId
  const { order, isLoading, error } = useOrder({
    orderId: orderId || undefined,
    autoFetch: true,
    enabled: Boolean(orderId),
  });

  // Get configuration from default.tgd.json
  const branding = config?.branding || {};
  const products = config?.products || {};

  // Extract real product data from order
  const orderItem = order?.items?.[0];
  const orderProduct = orderItem?.orderLineItemProduct;
  const orderVariant = orderItem?.orderLineItemVariant;
  const orderSummary = order?.summaries?.[0];
  
  // Use real order data with config fallbacks
  const productName = orderProduct?.name || orderVariant?.name || products.name || "NutraVital Pro";
  const productImage = orderVariant?.imageUrl || products.imageUrl;
  const productDescription = (orderVariant as OrderVariantWithDescription)?.description || (orderProduct as OrderProductWithDescription)?.description || products.description;
  const quantity = orderItem?.quantity || 1;
  const unitAmount = orderItem?.unitAmount || 0;
  const totalAmount = order?.paidAmount || orderSummary?.totalAdjustedAmount || 0;
  const currency = order?.currency || orderSummary?.currency || 'USD';
  const subtotalAmount = orderSummary?.subtotalAmount || totalAmount;
  const discountAmount = orderSummary?.totalPromotionAmount || 0;
  const shippingCost = orderSummary?.shippingCost || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error?.message || "We could not find the order you are looking for."}
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Return to Checkout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-4 sm:py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-md lg:max-w-lg">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 text-sm px-4 py-2">
            Order #{order?.id || orderId}
          </Badge>
        </div>

        {/* Order Details */}
        <Card className="shadow-2xl border-0 mb-6 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Package className="w-5 h-5 mr-2" />
              Order Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Product Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 bg-green-50 rounded-xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="text-2xl sm:text-3xl">💊</div>
                )}
                {/* Fallback emoji (hidden by default, shown on image error) */}
                <div className="hidden text-2xl sm:text-3xl">💊</div>
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                  {productName}
                </h3>
                {productDescription && (
                  <p className="text-sm text-gray-600 mb-1">{productDescription}</p>
                )}
                <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                <div className="flex items-center justify-center sm:justify-start mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600 ml-1">4.9 (2,847 reviews)</span>
                </div>
              </div>
              <div className="text-center sm:text-right flex-shrink-0">
                <p className="font-bold text-lg sm:text-xl text-green-600">
                  {formatMoney(unitAmount, currency)}
                </p>
                {discountAmount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                    Discount Applied
                  </Badge>
                )}
              </div>
            </div>

            {/* Order Summary */}
            {order && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatMoney(subtotalAmount, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatMoney(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-green-600">
                  <span>Shipping:</span>
                  <span>{shippingCost > 0 ? formatMoney(shippingCost, currency) : 'FREE'}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total Paid:</span>
                  <span>{formatMoney(totalAmount, currency)}</span>
                </div>
              </div>
            )}

            {/* Order Status */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Truck className="w-4 h-4 mr-1" />
                Order Status
              </h4>
              <div className="text-sm text-gray-600">
                <p>✅ Payment confirmed ({order?.status === 'paid' ? 'Paid' : 'Processing'})</p>
                <p>📦 Processing your order</p>
                <p>🚚 Will ship within 1-2 business days</p>
                {(order as OrderWithPaidAt)?.paidAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Payment processed: {new Date((order as OrderWithPaidAt).paidAt!).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="shadow-2xl border-0 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              What's Next?
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Order Confirmation</h4>
                <p className="text-sm text-gray-600">
                  You'll receive an email confirmation within the next few minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Processing & Shipping</h4>
                <p className="text-sm text-gray-600">
                  Your order will be processed within 1-2 business days and shipped via expedited shipping.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Delivery</h4>
                <p className="text-sm text-gray-600">
                  Expect delivery within 3-5 business days. You'll receive tracking information via email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Offer */}
        <Card className="shadow-2xl border-0 mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="text-center">
              <Gift className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Exclusive Customer Bonus!
              </h3>
              <p className="text-gray-600 mb-4">
                As a thank you, we're including our "Joint Health Guide" PDF (valued at $29) absolutely FREE with your order.
              </p>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                FREE $29 Value
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="shadow-2xl border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{branding.supportEmail || "support@nutravital.com"}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">1-800-NUTRA-PRO</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Our customer support team is available Monday-Friday, 9AM-6PM EST
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Thank you for choosing {branding.companyName || "NutraVital Pro"}!
          </p>
          <p className="text-xs text-gray-400 mt-2">
            This is your receipt. Please keep it for your records.
          </p>
        </div>
      </div>
    </div>
  );
}