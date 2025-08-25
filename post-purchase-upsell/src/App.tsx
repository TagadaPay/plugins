import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { TagadaProvider } from '@tagadapay/plugin-sdk/react'
import PostPurchaseOffer from './components/PostPurchaseOffer.tsx'
import ThankYou from './components/ThankYou.tsx'
import { Toaster } from 'react-hot-toast'

function PostPurchaseRoute() {
  const location = useLocation();
  
  // Extract order ID from URL path
  const pathParts = location.pathname.split('/');
  const orderId = pathParts[pathParts.length - 1];

  if (!orderId) {
    return <div>Order ID not found</div>;
  }

  return <PostPurchaseOffer orderId={orderId} />;
}

function ThankYouRoute() {
  const location = useLocation();
  
  // Extract order ID from URL path
  const pathParts = location.pathname.split('/');
  const orderId = pathParts[pathParts.length - 1];

  return <ThankYou orderId={orderId} />;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/post/:orderId" element={<PostPurchaseRoute />} />
        <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
        <Route path="/" element={<div className="flex items-center justify-center min-h-screen text-lg">Post-Purchase Upsell Plugin</div>} />
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
    <TagadaProvider localConfig="purple" environment="production">
      <Router>
        <AppContent />
      </Router>
    </TagadaProvider>
  )
}

export default App
