import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { CheckCircle2, Clock } from 'lucide-react';
import { memo } from 'react';
import type { ManualPaymentSnapshot } from './CustomManualThankYouContent';

interface ThankYouHeaderProps {
  /** True for any pending-manual payment (Zelle or custom_payment) */
  isZellePayment: boolean;
  orderNumber: number;
  /** When set (custom_payment), overrides the Zelle thank-you copy with snapshot values */
  customPaymentSnapshot?: ManualPaymentSnapshot;
}

const ThankYouHeader = memo(({ isZellePayment, orderNumber, customPaymentSnapshot }: ThankYouHeaderProps) => {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  const isPending = isZellePayment;
  const title = isPending
    ? customPaymentSnapshot?.thankYouTitle || t(config?.zelleThankYou?.title, 'Thank You for Your Order!')
    : t(config?.thankYou?.title, 'Thank You for Your Order!');
  const subtitle = isPending
    ? customPaymentSnapshot?.thankYouSubtitle || t(config?.zelleThankYou?.subtitle, 'Your order has been received and is awaiting payment.')
    : t(config?.thankYou?.subtitle, 'Your order has been received and is being processed.');
  const badgeLabel = customPaymentSnapshot?.thankYouBadgeLabel || t(config?.zelleThankYou?.pendingPayment, 'Pending Payment');

  return (
    <div className="mb-8 flex flex-col items-center justify-center text-center">
      <div className="bg-[var(--primary-color)]/10 mb-4 rounded-full p-4">
        {isPending ? (
          <Clock className="h-12 w-12 text-amber-500" />
        ) : (
          <CheckCircle2 className="h-12 w-12 text-[var(--primary-color)]" />
        )}
      </div>
      <h1
        className="mb-2 text-2xl font-semibold text-[var(--text-color)]"
        editor-id={isPending ? 'config.zelleThankYou.title' : 'config.thankYou.title'}
      >
        {title}
      </h1>
      <div className="mb-4 flex items-center gap-2">
        <p
          className="text-sm text-[var(--text-secondary-color)]"
          editor-id={isPending ? 'config.zelleThankYou.subtitle' : 'config.thankYou.subtitle'}
        >
          {subtitle}
        </p>
        {isPending ? (
          <div className="inline-flex items-center rounded-full border border-amber-500 px-2.5 py-0.5 text-xs font-medium text-amber-600">
            <Clock size={12} className="mr-1" />
            <span editor-id="config.zelleThankYou.pendingPayment">{badgeLabel}</span>
          </div>
        ) : (
          <div className="border-[var(--primary-color)] inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-[var(--primary-color)]">
            <CheckCircle2 size={12} className="mr-1" />
            <span editor-id="config.thankYou.confirmed">
              {t(config?.thankYou?.confirmed, 'Confirmed')}
            </span>
          </div>
        )}
      </div>
      <div className="rounded-full bg-[var(--background-color-hover)] px-3 py-1">
        <span className="text-sm font-medium text-[var(--text-color)]" editor-id="config.thankYou.orderNumber">
          {t(config?.thankYou?.orderNumber, 'Order')}: #{orderNumber}
        </span>
      </div>
    </div>
  );
});

ThankYouHeader.displayName = 'ThankYouHeader';

export default ThankYouHeader;
