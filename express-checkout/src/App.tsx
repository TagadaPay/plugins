import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { TagadaProvider } from '@tagadapay/plugin-sdk/react'
import ExpressCheckout01 from './components/ExpressCheckout01'
import ThankYou from './components/ThankYou'
import { Toaster } from 'react-hot-toast'

function CheckoutRoute() {
  const location = useLocation();

  // Extract checkout token from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const checkoutToken = searchParams.get("checkoutToken") || undefined;

  return <ExpressCheckout01 checkoutToken={checkoutToken} />;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<CheckoutRoute />} />
        <Route path="/checkout" element={<CheckoutRoute />} />
        <Route path="/thankyou/:orderId" element={<ThankYou />} />
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
    <TagadaProvider environment="production" localConfig="default" debugMode={true}>
      <Router>
        <AppContent />
      </Router>
    </TagadaProvider>
  )
}

export default App
