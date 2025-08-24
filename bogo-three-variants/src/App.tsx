import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from 'react-router-dom'
import { TagadaProvider } from '@tagadapay/plugin-sdk/react'
import CheckoutPageSimple from './CheckoutPageSimple';
import './globals.css';
import ThankYouPage from './thankyou/ThankYouPage';
import { Toaster } from 'react-hot-toast'

function CheckoutRoute() {
  const location = useLocation();

  // Extract checkout token from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const checkoutToken = searchParams.get("checkoutToken") || undefined;

  return <CheckoutPageSimple checkoutToken={checkoutToken} />;
}

function ThankYouRoute() {
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

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<CheckoutRoute />} />
        <Route path="/checkout" element={<CheckoutRoute />} />
        <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <TagadaProvider localConfig="default" environment="production">
      <Router>
        <AppContent />
      </Router>
    </TagadaProvider>
  )
}

export default App
