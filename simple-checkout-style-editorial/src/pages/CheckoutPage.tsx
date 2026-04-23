import { SingleStepCheckout } from '@/components/SingleStepCheckout';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { useFunnel } from '@tagadapay/plugin-sdk/v2';
import { useSearch } from 'wouter/use-browser-location';

/**
 * Checkout Page
 * Handles checkout flow with checkout token from:
 * 1. Query parameter (legacy/direct links)
 * 2. Context resources (from previous funnel step)
 */
export function CheckoutPage() {
  usePageMetadata('checkout');
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const { context, stepConfig } = useFunnel();
  console.log('[CheckoutPage] Step config:', stepConfig);
  // Priority 1: Check query parameter (e.g., direct links, external redirects)
  const checkoutTokenFromQuery = searchParams.get('checkoutToken');

  // Priority 2: Check context resources (e.g., from landing page via funnel navigation)
  const checkoutSessionResource = context?.resources?.checkoutSession;
  const checkoutTokenFromContext =
    checkoutSessionResource && !Array.isArray(checkoutSessionResource)
      ? ((checkoutSessionResource as any)?.checkoutToken as string | undefined)
      : undefined;

  // Use query param if available, otherwise use token from context
  const checkoutToken = checkoutTokenFromQuery || checkoutTokenFromContext || undefined;

  console.log('[CheckoutPage] Checkout token sources:', {
    fromQuery: checkoutTokenFromQuery,
    fromContext: checkoutTokenFromContext,
    using: checkoutToken,
  });

  return <SingleStepCheckout checkoutToken={checkoutToken} />;
}
