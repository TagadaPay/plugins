import CheckoutPage from "@/components/checkout-page";
import Providers from "@/components/providers";
import ThankYou from "@/components/thank-you";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { Suspense, useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = new URLSearchParams(window.location.search);
  const checkoutToken = searchParams.get("checkoutToken") || undefined;

  // Pass the checkout token to the component
  // The component will handle initialization via the init() function

  if (!checkoutToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">
            Checkout Token Required
          </h1>
          <p className="mt-2 text-gray-600">
            No checkout token provided in the URL.
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
  const { orderId } = useParams<{ orderId: string }>();
  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">
            Order ID Required
          </h1>
          <p className="mt-2 text-gray-600">No order ID provided in the URL.</p>
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

function AppRoutes() {
  const { config } = usePluginConfig<PluginConfig>();

  // Set page metadata when plugin config is loaded
  useEffect(() => {
    if (config?.metadata) {
      // Set page title
      document.title = config.metadata.title;

      // Set meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", config.metadata.description);

      // Set meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", config.metadata.keywords.join(", "));
    }
  }, [config]);

  return (
    <Routes>
      <Route path="/checkout" element={<CheckoutRoute />} />
      <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
      {/* Catch all route - redirect to home */}
    </Routes>
  );
}

function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}

export default App;
