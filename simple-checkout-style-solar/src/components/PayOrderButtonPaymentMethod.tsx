import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { Lock } from 'lucide-react';

type PayOrderButtonPaymentMethodProps = {
  paymentMethod: string | null;
  loadingText: string;
  disabled: boolean;
  loading: boolean;
  isSubmitting: boolean;
  baseClassName?: string;
  size?: 'lg' | 'sm' | 'icon' | 'default' | null | undefined;
  formId?: string;
  processingText?: string;
};

const PayOrderButtonPaypal = ({ disabled, baseClassName, formId }: PayOrderButtonPaymentMethodProps) => (
  <Button
    type="submit"
    form={formId}
    className={cn(baseClassName, 'bg-[#ffc439] hover:bg-[#ffc439]/80')}
    disabled={disabled}
  >
    <img src="/integrations/paypal.svg" alt="pay with paypal" width={100} height={28} />
  </Button>
);

const PayOrderButtonApplePay = ({ disabled, baseClassName, formId }: PayOrderButtonPaymentMethodProps) => {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  return (
    <Button
      type="submit"
      form={formId}
      className={cn(baseClassName, 'bg-black text-base text-white hover:bg-black/90')}
      disabled={disabled}
      editor-id="config.checkout.orderCompletion.applePayText"
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      {t(config?.checkout?.orderCompletion?.applePayText, 'Pay with Apple Pay')}
    </Button>
  );
};

const PayOrderButtonBase = ({
  loading,
  loadingText,
  isSubmitting,
  baseClassName,
  paymentMethod: _,
  processingText,
  ...props
}: PayOrderButtonPaymentMethodProps) => {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  const displayProcessingText =
    processingText || t(config?.checkout?.orderCompletion?.processingText, 'Processing...');

  return (
    <Button
      size={props.size}
      form={props.formId}
      className={cn(baseClassName)}
      {...props}
    >
      <Lock className="mr-2 h-5 w-5" />
      {isSubmitting
        ? displayProcessingText
        : loading
          ? loadingText
          : t(config?.checkout?.orderCompletion?.completeOrderText, 'Complete order')}
    </Button>
  );
};

const PayOrderButtonWhop = ({
  loading,
  loadingText,
  isSubmitting,
  disabled,
  baseClassName,
  processingText,
  ...props
}: PayOrderButtonPaymentMethodProps) => {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  const displayProcessingText =
    processingText || t(config?.checkout?.orderCompletion?.processingText, 'Processing...');

  return (
    <Button
      type="submit"
      form={props.formId}
      size={props.size}
      className={cn(baseClassName, 'bg-purple-600 text-white hover:bg-purple-700')}
      disabled={disabled}
    >
      <div className="flex flex-row items-center">
        <img src="/integrations/whop.svg" alt="Whop logo" width={31} height={31} />
        <span className="ml-2">
          {isSubmitting
            ? displayProcessingText
            : loading
              ? loadingText
              : t(config?.checkout?.orderCompletion?.whopPayText, 'Pay with Whop')}
        </span>
      </div>
    </Button>
  );
};

function PayOrderButtonKlarna({ disabled, baseClassName, formId }: PayOrderButtonPaymentMethodProps) {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  return (
    <Button
      type="submit"
      form={formId}
      className={cn(baseClassName, 'bg-black text-white hover:bg-black/80')}
      disabled={disabled}
      editor-id="config.checkout.orderCompletion.klarnaText"
    >
      {t(config?.checkout?.orderCompletion?.klarnaText, 'Pay with')}
      <img src="/integrations/klarna.svg" alt="pay with klarna" width={58} height={25.13} />
    </Button>
  );
}

const PayOrderButtonBridge = ({ disabled, baseClassName, formId }: PayOrderButtonPaymentMethodProps) => (
  <Button
    type="submit"
    form={formId}
    className={cn(baseClassName, 'bg-black text-white hover:bg-black/80')}
    disabled={disabled}
  >
    <div className="flex flex-row items-center">
      <img src="/integrations/bridge-white.svg" alt="Bridge logo" width={31} height={31} />
      <span className="ml-2">Pay with Bridge</span>
    </div>
  </Button>
);

function PayOrderButtonPaymentMethod(props: PayOrderButtonPaymentMethodProps) {
  switch (props.paymentMethod) {
    case 'paypal':
      return <PayOrderButtonPaypal {...props} />;
    case 'klarna':
      return <PayOrderButtonKlarna {...props} />;
    case 'bridge':
      return <PayOrderButtonBridge {...props} />;
    case 'apple_pay':
      return <PayOrderButtonApplePay {...props} />;
    case 'whop':
      return <PayOrderButtonWhop {...props} />;
    default:
      return <PayOrderButtonBase {...props} />;
  }
}

export default PayOrderButtonPaymentMethod;
