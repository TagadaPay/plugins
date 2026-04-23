import { useEffect, useRef } from 'react';

import PayButtons from '@/components/PayButtons';
import { cn } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { LockIcon } from 'lucide-react';

interface PaymentButtonsSectionProps {
  isSubmitting: boolean;
  isPaymentLoading: boolean;
  className?: string;
  isSticky?: boolean;
  formId?: string;
  isNavigating?: boolean;
  disabled?: boolean;
}

function PaymentButtonsSection({
  isSubmitting,
  isPaymentLoading,
  className,
  isSticky = false,
  formId,
  isNavigating = false,
  disabled = false,
}: PaymentButtonsSectionProps) {
  const { config } = usePluginConfig<PluginConfigData>();
  const { t } = useTranslation();
  const hasStickyPaymentButtons = config?.layout?.stickyPaymentButtons ?? false;
  const stickyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (!isSticky) {
      document.documentElement.style.removeProperty('--sticky-payment-footer-height');
      return;
    }

    const updateHeight = () => {
      if (!stickyRef.current) {
        return;
      }
      const height = stickyRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--sticky-payment-footer-height', `${Math.ceil(height)}px`);
    };

    const element = stickyRef.current;
    if (!element) {
      return;
    }

    updateHeight();

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(element);
    }

    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      resizeObserver?.disconnect();
      document.documentElement.style.removeProperty('--sticky-payment-footer-height');
    };
  }, [isSticky]);

  return (
    <div
      editor-id="config.layout.stickyPaymentButtons"
      ref={stickyRef}
      className={cn(
        'space-y-4',
        {
          'fixed inset-x-0 bottom-0 z-50 shrink-0 border-t border-[var(--line-strong)] bg-[var(--surface)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:hidden':
            isSticky,
          'max-lg:hidden': hasStickyPaymentButtons && !isSticky,
        },
        className,
      )}
    >
      <PayButtons
        disabled={disabled || isSubmitting || isPaymentLoading || isNavigating}
        isLoading={isPaymentLoading || isNavigating}
        isSubmitting={isSubmitting || isNavigating}
        formId={formId}
        isNavigating={isNavigating}
      />
      {config?.checkoutSettings?.displaySecureCheckoutText && (
        <div
          editor-id="config.checkout.orderCompletion.secureCheckoutText config.checkoutSettings.displaySecureCheckoutText"
          className="flex items-center justify-center gap-1.5 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary-color)]"
        >
          <LockIcon className="h-3 w-3" />
          <span editor-id="config.checkout.orderCompletion.secureCheckoutText">
            {t(config?.checkout?.orderCompletion?.secureCheckoutText, 'Secure checkout powered by TagadaPay')}
          </span>
        </div>
      )}
    </div>
  );
}

export default PaymentButtonsSection;
