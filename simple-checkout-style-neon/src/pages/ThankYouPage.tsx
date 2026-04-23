import ThankYou from '@/components/ThankYouPage';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { isDraftMode } from '@tagadapay/plugin-sdk/v2';

/**
 * Thank-you route wrapper.
 * - Validates the orderId from the URL.
 * - In draft mode (or when navigating to /thankyou/preview locally),
 *   passes "preview" to render the mock order tree.
 */
interface ThankYouPageProps {
  orderId: string;
}

export function ThankYouPage({ orderId }: ThankYouPageProps) {
  usePageMetadata('thankyou');

  const isLocalDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV === true;

  if (!orderId) {
    if (isDraftMode() || isLocalDev) {
      return <ThankYou orderId="preview" />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Order ID Required</h1>
          <p className="text-[var(--text-secondary-color)]">
            No order ID provided in the URL.
          </p>
        </div>
      </div>
    );
  }

  return <ThankYou orderId={orderId} />;
}
