import PostPurchasePage from "@/components/PostPurchasePage";
import {
  useCheckout,
  useCheckoutToken,
  useFunnel,
  usePluginConfig,
  useTranslation,
} from "@tagadapay/plugin-sdk/v2";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { CheckoutPage } from "./components/CheckoutPage";
import { Providers } from "./components/Providers";
import { ThankYouPage } from "./components/ThankYouPage";
import { PluginConfig } from "./types/plugin-config";

function RedirectComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();
  const appContent = pluginConfig.content?.app;

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
        <p className="mt-2 text-gray-600">
          {t(appContent?.redirect?.redirectingMessage)}
        </p>
      </div>
    </div>
  );
}

function HomePage() {
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();
  const appContent = pluginConfig.content?.app;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">
              {t(appContent?.suspense?.defaultLoading)}
            </p>
          </div>
        </div>
      }
    >
      <RedirectComponent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { checkoutToken } = useCheckoutToken();
  const [isInitFailed, setIsInitFailed] = useState(false);
  const hasInitializedRef = useRef(false);

  const { checkout, init } = useCheckout({
    checkoutToken: checkoutToken || "",
  });

  const { initializeSession } = useFunnel({
    enabled: true,
  });

  const { config: pluginConfig, storeId } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();

  // Initialize checkout programmatically when no token is provided
  useEffect(() => {
    if (
      !checkoutToken &&
      !checkout &&
      init &&
      !hasInitializedRef.current &&
      isInitFailed === false
    ) {
      hasInitializedRef.current = true;

      // Get the third bundle variant (Best Value) from config
      const specialProduct = pluginConfig.products?.[2];
      const thirdVariantId = specialProduct?.variantID;

      if (thirdVariantId) {
        initializeSession();
        init({
          storeId: storeId,
          lineItems: [
            {
              variantId: thirdVariantId,
              quantity: 1,
            },
          ],
        }).catch(() => {
          setIsInitFailed(true);
        });
      }
    }
  }, [
    checkoutToken,
    checkout,
    init,
    initializeSession,
    pluginConfig.products,
    storeId,
  ]);

  // Show error state if initialization failed
  if (isInitFailed) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="mb-4 text-xl font-semibold text-red-600">
              {t(pluginConfig.content?.checkout?.errors?.genericTitle)}
            </h1>
            <p className="mb-4 text-gray-600">
              {t(
                pluginConfig.content?.checkout?.errors?.genericDescription,
                "",
                {
                  supportEmail: pluginConfig.branding?.supportEmail,
                }
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <CheckoutPage checkoutToken={checkoutToken || ""} />;
}

function CheckoutRoute() {
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();
  const appContent = pluginConfig.content?.app;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="mt-2 text-center text-sm text-gray-600">
                {t(appContent?.suspense?.checkoutLoading)}
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
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();
  const appContent = pluginConfig.content?.app;

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">
            {t(appContent?.errors?.orderIdRequiredTitle)}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(appContent?.errors?.orderIdRequiredDescription)}
          </p>
        </div>
      </div>
    );
  }

  return <ThankYouPage orderId={orderId} />;
}

function ThankYouRoute() {
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();
  const thankYouContent = pluginConfig.content?.thankYou;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="mt-2 text-center text-sm text-gray-600">
                {t(thankYouContent?.errors?.loadingMessage)}
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
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();
  const thankYouContent = pluginConfig.content?.thankYou;

  return (
    <Suspense fallback={t(thankYouContent?.errors?.loadingMessage)}>
      <PostPurchaseContent />
    </Suspense>
  );
}

function PostPurchaseContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();
  const appContent = pluginConfig.content?.app;

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">
            {t(appContent?.errors?.orderIdRequiredTitle)}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(appContent?.errors?.orderIdRequiredDescription)}
          </p>
        </div>
      </div>
    );
  }

  return <PostPurchasePage orderId={orderId} />;
}

function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutRoute />} />
        <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
        <Route path="/post/:orderId" element={<PostPurchaseRoute />} />
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Providers>
  );
}

export default App;
