"use client"

import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { CheckCircle, Package, Truck, CreditCard, Mail, ArrowRight } from "lucide-react"
import { useOrder, useCurrency, formatMoney, usePluginConfig, type OrderItem } from "@tagadapay/plugin-sdk/react"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ThankYouProps {
  className?: string
}

export default function ThankYou({ className }: ThankYouProps) {
  const { orderId } = useParams<{ orderId: string }>()
  const { order, isLoading, error, fetchOrder } = useOrder({
    orderId: orderId || "",
    autoFetch: true,
    enabled: Boolean(orderId),
  })
  
  const currentCurrency = useCurrency()
  const { config } = usePluginConfig()

  useEffect(() => {
    if (orderId && !order && !isLoading && !error) {
      fetchOrder(orderId).catch((err: unknown) => {
        console.error('Failed to fetch order:', err)
        toast.error('Failed to load order details')
      })
    }
  }, [orderId, order, isLoading, error, fetchOrder])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-4">Order Not Found</h1>
          <p className="text-muted-foreground">
            {error?.message || 'We could not find the order you are looking for.'}
          </p>
          <Button className="mt-4" onClick={() => window.location.href = '/'}>
            Return to Checkout
          </Button>
        </div>
      </div>
    )
  }

  // Get the current summary using useCurrency hook as priority, then fallback to selectedPresentmentCurrency
  const selectedCurrency = currentCurrency?.code || order.checkoutSession?.selectedPresentmentCurrency || order.currency || 'USD'
  const currentSummary = order.summaries?.find((summary) => summary.currency === selectedCurrency)

  // Use currency from current summary or fallback
  const currency = currentSummary?.currency || selectedCurrency

  // Get items for the current currency only (filters out duplicate currency items)
  const currentCurrencyItems = order.items.filter((item: OrderItem) => item.currency === currency)

  // Calculate totals
  const subtotal = currentSummary?.subtotalAdjustedAmount || 
    currentCurrencyItems.reduce((sum: number, item: OrderItem) => sum + item.adjustedAmount, 0)
  const shippingCost = currentSummary?.shippingCost || 0
  const shippingIsFree = currentSummary?.shippingCostIsFree ?? true
  const totalAmount = currentSummary?.totalAdjustedAmount || order.paidAmount

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto p-4", className)}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Success Header */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800">Thank you for your order!</h1>
                  <p className="text-green-700">Your payment has been successfully processed.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Order Number:</span>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Date:</span>
                  <p className="font-medium">{formatOrderDate(order.createdAt)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Items Ordered ({currency})</h4>
                {currentCurrencyItems.length > 0 ? (
                  currentCurrencyItems.map((item: OrderItem) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
                      <div className="flex-shrink-0">
                        <img
                          src={item.orderLineItemVariant?.imageUrl || '/placeholder.svg'}
                          alt={item.orderLineItemProduct?.name || 'Product'}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.orderLineItemProduct?.name}</p>
                        {item.orderLineItemVariant?.name && (
                          <p className="text-sm text-muted-foreground">{item.orderLineItemVariant.name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatMoney(item.adjustedAmount, currency)}</p>
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
                    <p>No items found for {currency}</p>
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
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
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

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Estimated Delivery</h4>
                  <p className="text-sm text-muted-foreground">3-5 business days</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email confirmation with your order details shortly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-sm text-muted-foreground">
                      We'll prepare your order for shipment within 1-2 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Shipping Updates</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive tracking information once your order ships.
                    </p>
                  </div>
                </div>
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
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentCurrencyItems.map((item: OrderItem) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.orderLineItemProduct?.name} × {item.quantity}
                    </span>
                    <span>{formatMoney(item.adjustedAmount, currency)}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatMoney(subtotal, currency)}</span>
                </div>

                {currentSummary?.totalPromotionAmount ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">
                      -{formatMoney(currentSummary.totalPromotionAmount, currency)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingIsFree ? (
                      <span className="font-semibold text-green-600">FREE</span>
                    ) : (
                      formatMoney(shippingCost, currency)
                    )}
                  </span>
                </div>

                {currentSummary?.totalTaxAmount ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatMoney(currentSummary.totalTaxAmount, currency)}</span>
                  </div>
                ) : null}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total Paid</span>
                  <span>{formatMoney(totalAmount, currency)}</span>
                </div>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-sm font-medium text-green-800 mb-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Payment Confirmed
                </div>
                <p className="text-xs text-green-700">Your payment has been successfully processed.</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button className="w-full" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Track Your Order
              </Button>
              
              <Button className="w-full" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>

              <Button className="w-full">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                If you have any questions about your order, our support team is here to help.
              </p>
              <Button variant="link" className="p-0 h-auto text-sm">
                Contact Support →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
