import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import { Providers } from './components/Providers';
import { Step1 } from './components/Step1';
import { Step2 } from './components/Step2';
import { Step3 } from './components/Step3';
import { ThankYouPage } from './components/ThankYouPage';
import { pluginConfig } from './data/config';

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

function RedirectToStep1() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Preserve query parameters during redirect
    const queryString = location.search;
    const redirectUrl = queryString ? `/step1${queryString}` : '/step1';

    console.log('Redirecting from / to:', redirectUrl);
    navigate(redirectUrl, { replace: true });
  }, [navigate, location.search]);

  return <LoadingSpinner />;
}

function Step1Route() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step1 />
    </Suspense>
  );
}

function Step2Route() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step2 />
    </Suspense>
  );
}

function Step3Route() {
  const location = useLocation();
  
  // Extract checkout token from URL parameters (like JointBoost)
  const searchParams = new URLSearchParams(location.search);
  const checkoutToken = searchParams.get('checkoutToken') ?? undefined;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step3 checkoutToken={checkoutToken} />
    </Suspense>
  );
}

function ThankYouContent() {
  const { orderId } = useParams<{ orderId: string }>();

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">Order ID Required</h1>
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
  // Use the store ID from configuration
  const storeId = pluginConfig.storeId;
  const accountId = 'acc_4872ce81eca2'; // Matches the store configuration

  return (
    <Providers storeId={storeId} accountId={accountId}>
      <Routes>
        {/* Default route redirects to step1 */}
        <Route path="/" element={<RedirectToStep1 />} />
        
        {/* Three-step funnel routes */}
        <Route path="/step1" element={<Step1Route />} />
        <Route path="/step2" element={<Step2Route />} />
        <Route path="/step3" element={<Step3Route />} />
        
        {/* Thank you page after successful purchase */}
        <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
        
        {/* Catch all route - redirect to step1 */}
        <Route path="*" element={<Navigate to="/step1" replace />} />
      </Routes>
    </Providers>
  );
}

export default App; 