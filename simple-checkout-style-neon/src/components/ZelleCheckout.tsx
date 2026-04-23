import { forwardRef, memo, useCallback, useImperativeHandle, useRef } from 'react';
import { useTagadaContext, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { toast } from 'react-hot-toast';

export interface ZelleCheckoutHandle {
  submit: () => Promise<void>;
}

export interface ZellePaymentResult {
  orderId: string;
  paymentId: string;
  orderNumber: string;
}

interface ZelleCheckoutProps {
  checkoutSessionId: string;
  instructionsMessage?: string | null;
  setLoading: (loading: boolean) => void;
  onPaymentCompleted?: (result: ZellePaymentResult) => void | Promise<void>;
  onPaymentFailed?: (errorMessage: string) => void;
  getCheckoutErrorMessage: () => string;
}

export const ZelleCheckout = memo(
  forwardRef<ZelleCheckoutHandle, ZelleCheckoutProps>(
    (
      {
        checkoutSessionId,
        instructionsMessage,
        setLoading,
        onPaymentCompleted,
        onPaymentFailed,
        getCheckoutErrorMessage,
      },
      ref,
    ) => {
      const { apiService } = useTagadaContext();
      const { t } = useTranslation();
      const isSubmittingRef = useRef(false);

      const submit = useCallback(async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setLoading(true);
        try {
          const orderResult = await apiService.fetch<{ orderId: string }>(
            `/api/v1/checkout-sessions/${checkoutSessionId}/create-order`,
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ checkoutSessionId }),
            },
          );
          if (!orderResult?.orderId) {
            throw new Error('Failed to create order');
          }
          const createRes = await apiService.fetch<{
            orderId: string;
            paymentId: string;
            orderNumber: string;
          }>(`/api/v1/checkout-sessions/${checkoutSessionId}/zelle-order-payment`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ checkoutSessionId, orderId: orderResult.orderId }),
          });
          toast.success('Payment successful!');
          await onPaymentCompleted?.({
            orderId: createRes.orderId,
            paymentId: createRes.paymentId,
            orderNumber: createRes.orderNumber,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to place Zelle order';
          console.error('Zelle order error:', err);
          toast.error(t(getCheckoutErrorMessage(), 'Failed to place Zelle order'));
          onPaymentFailed?.(message);
        } finally {
          isSubmittingRef.current = false;
          setLoading(false);
        }
      }, [
        checkoutSessionId,
        setLoading,
        getCheckoutErrorMessage,
        onPaymentCompleted,
        onPaymentFailed,
        apiService,
        t,
      ]);

      useImperativeHandle(ref, () => ({ submit }), [submit]);

      if (!instructionsMessage) return null;

      return (
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--background-color-hover)] p-4">
          <p className="whitespace-pre-wrap text-sm text-[var(--text-color)]">
            {instructionsMessage.replace(/\{orderNumber\}/g, 'your order number')}
          </p>
        </div>
      );
    },
  ),
);

ZelleCheckout.displayName = 'ZelleCheckout';
