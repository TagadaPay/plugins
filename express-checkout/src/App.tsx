import { Toaster } from "react-hot-toast";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import ExpressCheckout from "./components/ExpressCheckout";
import PostPurchase from "./components/PostPurchase";
import { Providers } from "./components/Providers";
import ThankYou from "./components/ThankYou";

function CheckoutRoute() {
  const location = useLocation();

  // Extract checkout token from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const checkoutToken = searchParams.get("checkoutToken") || undefined;

  console.log("checkoutToken", checkoutToken);

  return <ExpressCheckout checkoutToken={checkoutToken} />;
}

function PostPurchaseRoute() {
  return <PostPurchase />;
}

function AppContent() {
  console.log("AppContent");
  return (
    <div className="min-h-screen bg-background">
      <Router>
        <Routes>
          <Route path="/" element={<CheckoutRoute />} />
          <Route path="/checkout" element={<CheckoutRoute />} />
          <Route path="/thankyou/:orderId" element={<ThankYou />} />
          <Route path="/post/:orderId" element={<PostPurchaseRoute />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </Router>
    </div>
  );
}

function App() {
  console.log("App");
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}

export default App;
