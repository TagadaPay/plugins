import { Providers } from "@/components/providers";
import PostPurchasePage from "@/src/PostPurchasePage";
import { PluginConfig } from "@/src/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { Suspense, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import CheckoutPage from "./CheckoutPage";
import "./globals.css";
import ThankYouPage from "./thankyou/ThankYouPage";

function RedirectComponent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Preserve query parameters during redirect
    const queryString = location.search;
    const redirectUrl = queryString ? `/checkout${queryString}` : "/checkout";

    console.log("Redirecting from / to:", redirectUrl);
    navigate(redirectUrl, { replace: true });
  }, [navigate, location.search]);

  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <RedirectComponent />
    </Suspense>
  );
}

function CheckoutContent() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const checkoutToken = urlParams.get("checkoutToken");

  // Pass the checkout token to the component
  // The component will handle initialization via the init() function
  return <CheckoutPage checkoutToken={checkoutToken || ""} />;
}

function CheckoutRoute() {
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

  return <ThankYouPage orderId={orderId} />;
}

function ThankYouRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="mt-2 text-center text-sm text-gray-600">
                Loading order details...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}

function PostPurchaseRoute() {
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

  return <PostPurchasePage orderId={orderId} />;
}

function AppRoutes() {
  const { config } = usePluginConfig<PluginConfig>();

  useEffect(() => {
    if (config?.companyName) {
      document.title = config.companyName;
    }
  }, [config?.companyName]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/checkout" element={<CheckoutRoute />} />
      <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
      <Route path="/post/:orderId" element={<PostPurchaseRoute />} />
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}
