import CheckoutPage from "@/components/checkout-page";
import Providers from "@/components/providers";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";

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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="mt-2 text-center text-sm text-gray-600">
                Loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/checkout" element={<CheckoutRoute />} />
        {/* <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
        <Route path="/post/:orderId" element={<PostPurchaseRoute />} />
        {/* Catch all route - redirect to home */}
      </Routes>
    </Providers>
  );
}

export default App;
