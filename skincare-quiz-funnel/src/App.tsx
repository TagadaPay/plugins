import Loader from "@/components/Loader";
import QuizResultsPage from "@/pages/QuizResultsPage";
import { Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import Providers from "./components/providers";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";

function QuizResultsContent() {
  return <QuizResultsPage />;
}

function QuizResultsRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <QuizResultsContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const checkoutToken = urlParams.get("checkoutToken");

  return <CheckoutPage checkoutToken={checkoutToken || ""} />;
}

function CheckoutRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <CheckoutContent />
    </Suspense>
  );
}

function ThankYouRouter() {
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

  return (
    <Suspense fallback={<Loader />}>
      <CheckoutSuccessPage orderId={orderId} />
    </Suspense>
  );
}

function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz/results" element={<QuizResultsRouter />} />
        <Route path="/checkout" element={<CheckoutRouter />} />
        <Route path="/thankyou/:orderId" element={<ThankYouRouter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Providers>
  );
}

export default App;
