import { SectionHeader, SectionHeaderProps } from '@/components/ui/section-header';
import { PluginConfigData } from '@/types/plugin-config';
import {
  ApplePayButton,
  StripeExpressButton,
  CheckoutData,
  FunnelActionType,
  GooglePayButton,
  useExpressPaymentMethods,
  useFunnel,
  usePluginConfig,
  useTranslation,
} from '@tagadapay/plugin-sdk/v2';
import { toast } from 'react-hot-toast';

type ExpressCheckoutButtonProps = {
  checkout: CheckoutData;
};

function ExpressCheckoutButtons({ checkout }: ExpressCheckoutButtonProps) {
  const { t } = useTranslation();
  const { applePayPaymentMethod, googlePayPaymentMethod, stripeExpressPaymentMethod, loading, error } = useExpressPaymentMethods();
  const { config } = usePluginConfig<PluginConfigData>();
  const { next } = useFunnel();
  const sectionHeaderProps: SectionHeaderProps = {
    eyebrowLabel: 'Express',
    title: t(config?.checkout?.expressCheckout?.title, 'One-tap checkout'),
    description: t(
      config?.checkout?.expressCheckout?.description,
      'Skip the form and check out faster with a saved wallet.',
    ),
    descriptionEditorId: 'config.checkout.expressCheckout.description',
    titleEditorId: 'config.checkout.expressCheckout.title',
    spacing: 'compact',
  };

  // Show initial loading state only if we haven't loaded payment methods yet
  // Once loaded, keep buttons visible even during refetches
  const showInitialLoading = loading && !applePayPaymentMethod && !googlePayPaymentMethod && !stripeExpressPaymentMethod;

  if (showInitialLoading) {
    return (
      <div className="space-y-4">
        <SectionHeader {...sectionHeaderProps} />
        <div className="flex h-12 items-center justify-center rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface-alt)]">
          <div className="h-4 w-4 animate-spin rounded-full border border-[var(--line)] border-t-[var(--ink-700)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Express payment methods error:', error);
    return null;
  }

  const hasAnyMethod = applePayPaymentMethod || googlePayPaymentMethod || stripeExpressPaymentMethod;

  if (!hasAnyMethod) {
    return null;
  }

  // Shared success/error/cancel handlers — used by all express payment buttons
  const handleSuccess = async (result: {
    payment: { id: string; status: string };
    order: { id: string; amount: number; currency: string };
  }) => {
    await next({
      type: FunnelActionType.PAYMENT_SUCCESS,
      data: {
        paymentId: result?.payment?.id,
        payment: {
          id: result?.payment?.id,
          status: result?.payment?.status,
        },
        order: result?.order
          ? {
            id: result.order.id,
            amount: result.order.amount,
            currency: result.order.currency,
          }
          : undefined,
        resources: {
          order: result?.order
            ? {
              id: result.order.id,
              amount: result.order.amount,
              currency: result.order.currency,
            }
            : undefined,
          mainOrder: result?.order
            ? {
              id: result.order.id,
              amount: result.order.amount,
              currency: result.order.currency,
            }
            : undefined,
          payment: {
            id: result?.payment?.id,
            status: result?.payment?.status,
          },
          checkout: {
            id: checkout.checkoutSession.id,
            token: checkout.checkoutSession.checkoutToken,
            selectedPresentmentCurrency: checkout.checkoutSession.selectedPresentmentCurrency,
          },
        },
      },
    });
  };

  const handleError = async (error: string) => {
    toast.error(t(config?.checkout?.errors?.paymentFailed, error || 'Payment failed'));
    await next({
      type: FunnelActionType.PAYMENT_FAILED,
      data: { error: { message: error } },
    });
  };

  const handleCancel = () => {
    console.log('Express payment cancelled by user');
  };

  return (
    <div className="space-y-4" editor-id="config.checkoutSettings.showExpressCheckout">
      <SectionHeader {...sectionHeaderProps} />
      <div className="space-y-3">
        {/* Apple Pay (Basis Theory / native ApplePaySession) */}
        {applePayPaymentMethod && (
          <ApplePayButton
            checkout={checkout}
            onSuccess={async (result) => {
              console.log('Apple Pay payment successful:', result);
              await handleSuccess(result as any);
            }}
            onError={async (error) => {
              console.error('Apple Pay payment failed:', error);
              await handleError(error);
            }}
            onCancel={handleCancel}
          />
        )}

        {/* Apple Pay + Google Pay via Stripe Express Checkout Element */}
        <StripeExpressButton
          checkout={checkout}
          onSuccess={async (result) => {
            console.log('Stripe Express Checkout payment successful:', result);
            await handleSuccess(result as any);
          }}
          onError={async (error) => {
            console.error('Stripe Express Checkout payment failed:', error);
            await handleError(error);
          }}
          onCancel={handleCancel}
        />

        {/* Google Pay (Basis Theory / native) */}
        {googlePayPaymentMethod && (
          <GooglePayButton
            checkout={checkout}
            onSuccess={async (result) => {
              console.log('Google Pay payment successful:', result);
              await handleSuccess(result as any);
            }}
            onError={async (error) => {
              console.error('Google Pay payment failed:', error);
              await handleError(error);
            }}
            onCancel={handleCancel}
          />
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--border-color)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span
            className="text-[var(--text-secondary-color)] bg-[var(--background-color)] px-2"
            editor-id="config.checkout.expressCheckout.dividerText"
          >
            {t(config?.checkout?.expressCheckout?.dividerText, 'Or')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ExpressCheckoutButtons;

