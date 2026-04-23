import { memo, useEffect } from 'react';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { useSetPaymentMethod } from '../contexts/PaymentMethods';
import { PAYMENT_TYPES, type PaymentMethod } from './payment-types';
import type { PluginConfigData } from '@/types/plugin-config';

// ─── Stripe APM configuration ───────────────────────────────────────────────
// Maps each Stripe APM type to its form metadata and default redirect description.

interface StripeApmConfig {
  type: (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES];
  apmType: string;
  settingsKey: string;
  defaultDescription: string;
  defaultRedirectLabel: string;
}

const STRIPE_APM_DETAILS: StripeApmConfig[] = [
  {
    type: PAYMENT_TYPES.STRIPE_KLARNA,
    apmType: 'klarna',
    settingsKey: 'klarna',
    defaultDescription: 'Pay in 4 interest-free payments',
    defaultRedirectLabel: 'You will be redirected to Klarna to complete your payment securely.',
  },
  {
    type: PAYMENT_TYPES.STRIPE_AFTERPAY,
    apmType: 'afterpay',
    settingsKey: 'afterpay',
    defaultDescription: 'Buy now, pay later in 4 installments',
    defaultRedirectLabel: 'You will be redirected to Afterpay to complete your payment securely.',
  },
  {
    type: PAYMENT_TYPES.STRIPE_IDEAL,
    apmType: 'ideal',
    settingsKey: 'ideal',
    defaultDescription: 'Pay with iDEAL bank transfer',
    defaultRedirectLabel: 'You will be redirected to iDEAL to complete your payment.',
  },
  {
    type: PAYMENT_TYPES.STRIPE_BANCONTACT,
    apmType: 'bancontact',
    settingsKey: 'bancontact',
    defaultDescription: 'Pay with your Bancontact card',
    defaultRedirectLabel: 'You will be redirected to Bancontact to complete your payment.',
  },
  {
    type: PAYMENT_TYPES.STRIPE_TWINT,
    apmType: 'twint',
    settingsKey: 'twint',
    defaultDescription: 'Pay with TWINT mobile payment',
    defaultRedirectLabel: 'You will be redirected to TWINT to complete your payment.',
  },
  {
    type: PAYMENT_TYPES.STRIPE_BLIK,
    apmType: 'blik',
    settingsKey: 'blik',
    defaultDescription: 'Pay with your BLIK code',
    defaultRedirectLabel: 'Enter your BLIK code to complete your payment.',
  },
  {
    type: PAYMENT_TYPES.STRIPE_AFFIRM,
    apmType: 'affirm',
    settingsKey: 'affirm',
    defaultDescription: 'Buy now, pay later with Affirm',
    defaultRedirectLabel: 'You will be redirected to Affirm to complete your payment.',
  },
];

// ─── Generic Stripe APM Form ────────────────────────────────────────────────
// A single form component that handles all Stripe APM types.

const StripeApmForm = memo(
  ({ apmType, metadata }: { apmType: string; metadata?: Record<string, unknown> }) => {
    const setPaymentMethod = useSetPaymentMethod();
    const config = STRIPE_APM_DETAILS.find((c) => c.apmType === apmType);

    useEffect(() => {
      if (!config) return;
      setPaymentMethod({
        isValid: true,
        type: config.type,
        informations: {
          provider: 'stripe_apm',
          apmType,
          processorId: metadata?.processorId as string,
        },
      });
    }, [setPaymentMethod, metadata, apmType, config]);

    return null;
  },
);
StripeApmForm.displayName = 'StripeApmForm';

// ─── Stripe Payment Method Detail ───────────────────────────────────────────
// Renders the expanded content panel for a selected Stripe APM method.

interface StripePaymentMethodDetailProps {
  method: PaymentMethod;
  isSelected: boolean;
}

export const StripePaymentMethodDetail = memo(
  ({ method, isSelected }: StripePaymentMethodDetailProps) => {
    const apmConfig = STRIPE_APM_DETAILS.find((c) => c.type === method.type);
    const { config } = usePluginConfig<PluginConfigData>();
    const { t } = useTranslation();

    if (!apmConfig || !isSelected) return null;

    const apmTexts = config?.checkout?.payment?.stripeApm?.[apmConfig.settingsKey];
    const description = t(apmTexts?.description, apmConfig.defaultDescription);
    const redirectLabel = t(apmTexts?.redirectLabel, apmConfig.defaultRedirectLabel);

    return (
      <div className="border-t border-[var(--border-color)] bg-[var(--background-color)] p-6">
        <div className="space-y-3 text-center">
          <p className="text-sm font-medium text-[var(--text-color)]" editor-id={`config.checkout.payment.stripeApm.${apmConfig.settingsKey}.description`}>{description}</p>
          <p className="text-xs text-gray-600" editor-id={`config.checkout.payment.stripeApm.${apmConfig.settingsKey}.redirectLabel`}>{redirectLabel}</p>
        </div>
        <StripeApmForm apmType={apmConfig.apmType} metadata={method.metadata} />
      </div>
    );
  },
);
StripePaymentMethodDetail.displayName = 'StripePaymentMethodDetail';
