import { ArrowLeft, CheckCircle2, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PluginConfig } from "@/types/plugin-config";
import {
  useCurrency,
  useOrder,
  usePluginConfig,
  useTranslation,
} from "@tagadapay/plugin-sdk/v2";

interface ThankYouPageProps {
  orderId: string;
}

export function ThankYouPage({ orderId }: ThankYouPageProps) {
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { order, isLoading, error } = useOrder({
    orderId,
    enabled: Boolean(orderId),
  });
  const { t, locale } = useTranslation();
  const thankYouContent = pluginConfig.content.thankYou;
  const companyName = t(pluginConfig.branding.companyName);
  const currentYear = new Date().getFullYear().toString();

  const currentCurrency = useCurrency();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="ml-2 text-gray-600">
                {t(thankYouContent.errors.loadingMessage)}
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
      <div className="min-h-screen bg-[#f5f3f0] py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="mb-4 text-xl font-semibold text-red-600">
              {t(thankYouContent.errors.errorTitle)}
            </h1>
            <p className="mb-4 text-gray-600">
              {error?.message || t(thankYouContent.errors.errorMessage)}
            </p>
            <Link to="/checkout">
              <Button className="w-full">
                {t(thankYouContent.errors.errorButton)}
              </Button>
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
    (item) => item.currency === currency
  );

  console.log(
    `[ThankYouPage] Currency sources - useCurrency: ${currentCurrency?.code}, selectedPresentmentCurrency: ${order.checkoutSession?.selectedPresentmentCurrency}, order.currency: ${order.currency}`
  );
  console.log(
    `[ThankYouPage] Final selected currency: ${selectedCurrency}, Display currency: ${currency}`
  );
  console.log(
    `[ThankYouPage] Total items: ${order.items.length}, Current currency items: ${currentCurrencyItems.length}`
  );
  console.log(
    `[ThankYouPage] Available summaries:`,
    order.summaries?.map((s) => s.currency)
  );

  // Calculate totals

  const formatOrderDate = (dateString: string) => {
    const resolvedLocale = locale || "en-US";
    return new Date(dateString).toLocaleDateString(resolvedLocale, {
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
          <p className="font-bold">{t(thankYouContent.header.badge)}</p>
        </div>
        <p className="text-sm">{t(thankYouContent.header.description)}</p>
      </header>

      {/* Navigation */}
      <div className="bg-white py-4">
        <div className="container mx-auto flex items-center justify-between px-2 sm:px-4">
          <img
            src={pluginConfig.branding.logoUrl}
            alt={t(pluginConfig.branding.storeName)}
            className="h-12 sm:h-16"
            style={{ maxWidth: "250px" }}
          />
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="text-right">
              <div className="mb-1 flex items-center justify-end gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <p className="text-xs font-medium text-gray-700 sm:text-sm">
                  {t(thankYouContent.header.navConfirmation)}
                </p>
              </div>
              <p className="text-xs text-gray-600 sm:text-sm">
                {t(thankYouContent.header.navSupportLabel)}{" "}
                {pluginConfig.branding.supportEmail}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-2 py-4 sm:px-4 md:px-8 lg:px-12 xl:px-24">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Left Column - Order Details */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-3">
            {/* Success Message */}
            <div className="flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-100 p-3 text-center text-sm font-semibold text-green-700 sm:p-4 sm:text-base">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              {t(thankYouContent.order.successAlert)}
            </div>

            {/* Order Information */}
            <div className="space-y-3 rounded-lg border border-gray-300 bg-white p-3 sm:space-y-4 sm:p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">
                    {t(thankYouContent.order.title)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t(thankYouContent.order.orderNumberPrefix)}
                    {order.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t(thankYouContent.order.placedOnPrefix)}{" "}
                    {formatOrderDate(order.createdAt)}
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
                  {t(thankYouContent.order.itemsTitle, "", { currency })}
                </h3>
                {currentCurrencyItems.length > 0 ? (
                  currentCurrencyItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-gray-100 pb-3"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.orderLineItemVariant?.imageUrl ||
                            "/placeholder.svg"
                          }
                          alt={
                            item.orderLineItemProduct?.name ||
                            t(thankYouContent.order.productFallbackAlt)
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
                          {t(thankYouContent.order.quantityLabel, "", {
                            count: item.quantity,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    <p>
                      {t(thankYouContent.order.noItemsMessage, "", {
                        currency,
                      })}
                    </p>
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
                    {t(thankYouContent.shipping.title)}
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
                    <p>
                      {t(thankYouContent.shipping.phoneLabel)}{" "}
                      {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={thankYouContent.guarantee.imageUrl}
                alt={t(thankYouContent.guarantee.imageAlt)}
                width={80}
                height={80}
                className="sm:h-[100px] sm:w-[100px]"
              />
              <div>
                <h4 className="text-base font-bold sm:text-lg">
                  {t(thankYouContent.guarantee.title)}
                </h4>
                <p className="text-pretty text-xs text-gray-600 sm:text-sm">
                  {t(thankYouContent.guarantee.description)}
                </p>
              </div>
            </div>
            {/* Continue Shopping */}
            <div className="text-center">
              {order.checkoutSession?.returnUrl ? (
                <a
                  href={order.checkoutSession.returnUrl}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t(thankYouContent.actions.continueShopping)}
                </a>
              ) : (
                <Link
                  to="/checkout"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t(thankYouContent.actions.returnToCheckout)}
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6 bg-[#eae4da] py-6 sm:mt-8 sm:py-8">
        <div className="container mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-24">
          <div className="text-center">
            <div className="mb-4 sm:mb-6">
              <img
                src={pluginConfig.branding.logoUrl}
                alt={t(pluginConfig.branding.storeName)}
                className="mx-auto h-10 sm:h-12"
                style={{ maxWidth: "240px" }}
              />
            </div>
            <div className="mb-4 flex flex-wrap justify-center gap-4 text-xs sm:mb-6 sm:gap-6 sm:text-sm">
              <a href="#terms" className="text-[#23527c] hover:underline">
                {t(thankYouContent.footer.termsLabel)}
              </a>
              <a href="#privacy" className="text-[#23527c] hover:underline">
                {t(thankYouContent.footer.privacyLabel)}
              </a>
              <a href="#wireless" className="text-[#23527c] hover:underline">
                {t(thankYouContent.footer.wirelessLabel)}
              </a>
            </div>
            <div className="text-center text-xs leading-relaxed text-gray-700 sm:text-sm">
              <p className="mb-2">
                {t(thankYouContent.footer.rightsReserved, "", {
                  year: currentYear,
                  company: companyName,
                })}
              </p>
              <p className="text-sm font-semibold sm:text-base">
                {pluginConfig.branding.supportEmail}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
