import CheckoutPage from "@/components/checkout-page";
import PostPurchase from "@/components/post-purchase";
import Providers from "@/components/providers";
import ThankYou from "@/components/thank-you";
import ThemeSetter from "@/components/theme-setter";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig, useTranslation } from "@tagadapay/plugin-sdk/v2";
import { Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

function LoadingSpinner() {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfig>();
  const appTexts = config?.texts?.app;
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">
          {t(appTexts?.loading, "Loading...")}
        </p>
      </div>
    </div>
  );
}

function CheckoutContent() {
  console.log("CheckoutContent");
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfig>();
  const appTexts = config?.texts?.app;
  const searchParams = new URLSearchParams(window.location.search);
  const checkoutToken = searchParams.get("checkoutToken") || undefined;

  // Pass the checkout token to the component
  // The component will handle initialization via the init() function

  if (!checkoutToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">
            {t(appTexts?.checkoutTokenRequiredTitle, "Checkout Token Required")}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(
              appTexts?.checkoutTokenRequiredDescription,
              "No checkout token provided in the URL."
            )}
          </p>
        </div>
      </div>
    );
  }
  return <CheckoutPage checkoutToken={checkoutToken} />;
}

function CheckoutRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfig>();
  const appTexts = config?.texts?.app;
  const { orderId } = useParams<{ orderId: string }>();
  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">
            {t(appTexts?.orderIdRequiredTitle, "Order ID Required")}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(
              appTexts?.orderIdRequiredDescription,
              "No order ID provided in the URL."
            )}
          </p>
        </div>
      </div>
    );
  }
  return <ThankYou orderId={orderId} />;
}

function ThankYouRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ThankYouContent />
    </Suspense>
  );
}

function PostPurchaseContent() {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfig>();
  const appTexts = config?.texts?.app;
  const { orderId } = useParams<{ orderId: string }>();

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">
            {t(appTexts?.orderIdRequiredTitle, "Order ID Required")}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(
              appTexts?.orderIdRequiredDescription,
              "No order ID provided in the URL."
            )}
          </p>
        </div>
      </div>
    );
  }

  return <PostPurchase />;
}

function PostPurchaseRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PostPurchaseContent />
    </Suspense>
  );
}

function AppRoutes() {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfig>();

  // Set page metadata when plugin config is loaded
  useEffect(() => {
    if (config?.metadata) {
      // Set page title
      document.title = t(config.metadata.title, "");

      // Set meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute(
        "content",
        t(config.metadata.description, "")
      );

      // Set meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute(
        "content",
        config.metadata.keywords?.join(", ") || ""
      );
    }
  }, [config, t]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/checkout" replace />} />
      <Route path="/checkout" element={<CheckoutRoute />} />
      <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
      <Route path="/post/:orderId" element={<PostPurchaseRoute />} />
      {/* Catch all route - redirect to home */}
    </Routes>
  );
}

function App() {
  return (
    <Providers>
      <ThemeSetter>
        <AppRoutes />
      </ThemeSetter>
    </Providers>
  );
}

export default App;
