import PayOrderButtonPaymentMethod from '@/components/PayOrderButtonPaymentMethod';
import { Button } from '@/components/ui/button';
import { usePaymentMethod } from '@/contexts/PaymentMethods';
import { useVipOffersContext } from '@/contexts/VipOffersContext';
import { cn } from '@/lib/utils';
import { PAYMENT_TYPES } from '@/components/payment-types';
import { PaymentType } from '@/types/payment-type';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';

function VipBadge() {
  return <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium">VIP</span>;
}

function ShieldCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      data-slot="icon"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

interface PayButtons {
  disabled: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  formId?: string;
  isNavigating?: boolean;
}

function PayButtons({ disabled, isLoading, isSubmitting, formId, isNavigating = false }: PayButtons) {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();
  const buttonBaseClass = 'h-12 w-full gap-2 text-lg font-semibold text-[var(--text-color-on-primary)]';
  const paymentMethod = usePaymentMethod();
  const isCreditCard = paymentMethod?.type === PaymentType.CREDIT_CARD;
  const isCrypto = paymentMethod?.type === PAYMENT_TYPES.CRYPTO;
  const { hasVipOffers, isAnyVipOfferSelected, selectVipOffers, cancelVipOffers, isLoadingVipPreview } =
    useVipOffersContext();

  const areLoading = isLoading || isLoadingVipPreview || isNavigating;
  const navigatingText = t(config?.checkout?.orderCompletion?.navigatingText, 'Redirecting...');
  const loadingText = isNavigating
    ? navigatingText
    : t(config?.checkout?.orderCompletion?.loadingText, 'Loading...');
  const processingText = isNavigating
    ? navigatingText
    : t(config?.checkout?.orderCompletion?.processingText, 'Processing...');

  const paymentButton = (
    <PayOrderButtonPaymentMethod
      size="lg"
      baseClassName={buttonBaseClass}
      paymentMethod={paymentMethod.type}
      loadingText={loadingText}
      disabled={disabled || isNavigating}
      loading={areLoading}
      isSubmitting={isSubmitting || isNavigating}
      formId={formId}
      processingText={processingText}
    />
  );

  return hasVipOffers ? (
    <div className="flex flex-col gap-2">
      <Button
        type={isAnyVipOfferSelected ? 'submit' : 'button'}
        form={isAnyVipOfferSelected ? formId : undefined}
        onClick={isAnyVipOfferSelected ? undefined : selectVipOffers}
        disabled={disabled || areLoading || isSubmitting || isNavigating}
        className={cn(
          buttonBaseClass,
          'border-[var(--primary-color)] bg-[var(--primary-color)] hover:bg-[var(--primary-color)]',
        )}
      >
        {isAnyVipOfferSelected ? (
          <>
            <ShieldCheckIcon />
            <span editor-id="config.checkout.orderCompletion.payWithVipText">
              {isSubmitting || isNavigating
                ? processingText
                : t(config?.checkout?.orderCompletion?.payWithVipText)}
            </span>
            <VipBadge />
          </>
        ) : isLoadingVipPreview || isNavigating ? (
          loadingText
        ) : (
          <>
            <VipBadge />
            <span editor-id="config.checkout.orderCompletion.selectVipOffer">
              {t(config?.checkout?.orderCompletion?.selectVipOffer)}
            </span>
          </>
        )}
      </Button>
      {isAnyVipOfferSelected ? (
        <Button
          type={'button'}
          variant={'ghost'}
          onClick={cancelVipOffers}
          disabled={disabled || areLoading || isSubmitting || isNavigating}
          className={'h-5 bg-transparent text-[#6b7280] hover:bg-transparent hover:text-[#374151]'}
        >
          <span editor-id="config.checkout.orderCompletion.cancelVipOffer">
            {isLoadingVipPreview || isNavigating
              ? loadingText
              : t(config?.checkout?.orderCompletion?.cancelVipOffer)}
          </span>
        </Button>
      ) : isCreditCard || isCrypto ? (
        <Button
          type="submit"
          form={formId}
          variant="secondary"
          disabled={disabled || areLoading || isSubmitting || isNavigating}
          className={cn(
            buttonBaseClass,
            'border border-[#e5e7eb] bg-[#f9fafb] text-[#374151] opacity-75 hover:bg-[#f9fafb] hover:opacity-100',
          )}
        >
          <ShieldCheckIcon />
          <span editor-id="config.checkout.orderCompletion.payWithoutVipText">
            {isSubmitting || isNavigating
              ? processingText
              : t(config?.checkout?.orderCompletion?.payWithoutVipText)}
          </span>
        </Button>
      ) : (
        paymentButton
      )}
    </div>
  ) : (
    paymentButton
  );
}

export default PayButtons;
