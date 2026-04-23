import LoadingSpinner from '@/components/LoadingSpinner';
import { Providers } from '@/components/Providers';
import { CheckoutPage } from '@/pages';
import { matchRoute } from '@tagadapay/plugin-sdk/v2';
import { Suspense } from 'react';
import { Route, Router, Switch } from 'wouter';

/**
 * Minimal thank-you landing
 * SingleStepCheckout.onPaymentCompleted calls funnel `next()` which typically
 * navigates to `/thankyou/:orderId`. We provide a tiny confirmation screen here
 * so this example is self-contained and doesn't require the full ThankYouPage
 * component tree from native-checkout.
 */
function ThankYouPage({ orderId }: { orderId: string }) {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[var(--background-color)] p-6">
      <div className="mx-auto max-w-md rounded-lg border border-[var(--border-color)] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--text-color)]">Thank you!</h1>
        <p className="mt-3 text-sm text-gray-600">
          Your payment was successful. Order reference:
        </p>
        <p className="mt-1 break-all font-mono text-xs text-gray-800">{orderId}</p>
      </div>
    </div>
  );
}

/**
 * Handles dynamic path remapping for /checkout using the SDK's matchRoute.
 * This is what lets merchants remap the checkout to custom URLs.
 */
function RemappedRoutes() {
  const checkoutMatch = matchRoute('/checkout');
  if (checkoutMatch.matched) return <CheckoutPage />;

  const thankyouMatch = matchRoute('/thankyou/:orderId');
  if (thankyouMatch.matched && thankyouMatch.params?.orderId) {
    return <ThankYouPage orderId={thankyouMatch.params.orderId} />;
  }

  return <CheckoutPage />;
}

function App() {
  return (
    <Providers>
      <Router>
        <Switch>
          <Route path="/checkout">
            <Suspense fallback={<LoadingSpinner />}>
              <CheckoutPage />
            </Suspense>
          </Route>

          <Route path="/thankyou/:orderId">
            {(params) => <ThankYouPage orderId={params.orderId ?? ''} />}
          </Route>

          <Route path="*">
            <Suspense fallback={<LoadingSpinner />}>
              <RemappedRoutes />
            </Suspense>
          </Route>
        </Switch>
      </Router>
    </Providers>
  );
}

export default App;
