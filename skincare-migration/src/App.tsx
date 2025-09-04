import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "./contexts/ConfigProvider";
import { CartProvider } from "./contexts/CartProvider";
import { Navigation } from "./components/Layout/Navigation";
import { Footer } from "./components/Layout/Footer";
import { CartDrawer } from "./components/Cart/CartDrawer";
import { DevConfigSwitcher } from "./components/DevConfigSwitcher";
// import { CheckoutTest } from "./components/CheckoutTest"; // Dev tool only
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";

function App() {
  return (
    <ConfigProvider defaultConfig="default">
      <Router>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route
                  path="/products/:productId"
                  element={<ProductDetail />}
                />
              </Routes>
            </main>

            <Footer />
            <CartDrawer />
            {import.meta.env.DEV && <DevConfigSwitcher />}
          </div>
        </CartProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
