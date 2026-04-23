import LoadingSpinner from '@/components/LoadingSpinner';
import { Providers } from '@/components/Providers';
import { CheckoutPage, ThankYouPage } from '@/pages';
import { matchRoute } from '@tagadapay/plugin-sdk/v2';
import { Suspense } from 'react';
import { Route, Router, Switch } from 'wouter';

/**
 * Handles dynamic path remapping for /checkout and /thankyou using the
 * SDK's matchRoute. This is what lets merchants remap the checkout to
 * custom URLs in their plugin config.
 */
function RemappedRoutes() {
  const checkoutMatch = matchRoute('/checkout');
  if (checkoutMatch.matched) return <CheckoutPage />;

  const thankyouMatch = matchRoute('/thankyou/:orderId');
  if (thankyouMatch.matched) {
    return <ThankYouPage orderId={thankyouMatch.params?.orderId ?? ''} />;
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
            {(params) => (
              <Suspense fallback={<LoadingSpinner />}>
                <ThankYouPage orderId={params.orderId ?? ''} />
              </Suspense>
            )}
          </Route>

          {/* Preview route — useful in local dev and draft mode to render the
              mock order tree without needing a real orderId. */}
          <Route path="/thankyou">
            <Suspense fallback={<LoadingSpinner />}>
              <ThankYouPage orderId="preview" />
            </Suspense>
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
