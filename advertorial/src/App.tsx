import { Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { AdvertorialPage } from "./components/AdvertorialPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { Providers } from "./components/Providers";
import { ThankYouPage } from "./components/ThankYouPage";

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-news-red"></div>
        <p className="mt-2 text-gray-600">Loading article...</p>
      </div>
    </div>
  );
}

function AdvertorialRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdvertorialPage />
    </Suspense>
  );
}

function CheckoutRoute() {
  const location = useLocation();

  // Extract checkout token from URL parameters (like JointBoost)
  const searchParams = new URLSearchParams(location.search);
  const checkoutToken = searchParams.get("checkoutToken") || undefined;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutPage checkoutToken={checkoutToken} />
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
    <Suspense fallback={<LoadingSpinner />}>
      <ThankYouContent />
    </Suspense>
  );
}

function App() {
  return (
    <Providers>
      <Routes>
        {/* Main advertorial route */}
        <Route path="/" element={<AdvertorialRoute />} />

        {/* Checkout page */}
        <Route path="/checkout" element={<CheckoutRoute />} />

        {/* Thank you page after successful purchase */}
        <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Providers>
  );
}

export default App;
