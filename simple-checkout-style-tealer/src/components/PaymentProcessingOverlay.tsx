import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';

interface PaymentProcessingOverlayProps {
  visible: boolean;
  isNavigating?: boolean;
  isThreedsActive?: boolean;
}

export default function PaymentProcessingOverlay({
  visible,
  isNavigating,
  isThreedsActive,
}: PaymentProcessingOverlayProps) {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  if (!visible) return null;

  const messageEditorId = isNavigating
    ? 'config.checkout.orderCompletion.navigatingText'
    : isThreedsActive
      ? 'config.checkout.orderCompletion.verifyingIdentityText'
      : 'config.checkout.orderCompletion.processingText';

  const message = isNavigating
    ? t(config?.checkout?.orderCompletion?.navigatingText, 'Redirecting...')
    : isThreedsActive
      ? t(config?.checkout?.orderCompletion?.verifyingIdentityText, 'Verifying your identity...')
      : t(config?.checkout?.orderCompletion?.processingText, 'Processing your payment...');

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[9997] flex items-center justify-center duration-200"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="mx-4 flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-2xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-color,#e5e7eb)] border-t-[var(--primary-color,#3b82f6)]" />
        <p className="text-center text-sm font-medium text-gray-700" editor-id={messageEditorId}>
          {message}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
          <span editor-id="config.checkout.orderCompletion.securePaymentText">
            {t(config?.checkout?.orderCompletion?.securePaymentText, 'Secure payment')}
          </span>
        </div>
      </div>
    </div>
  );
}
