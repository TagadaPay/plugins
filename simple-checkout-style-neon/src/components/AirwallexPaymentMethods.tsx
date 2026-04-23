import { memo, useEffect } from 'react';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { useSetPaymentMethod } from '../contexts/PaymentMethods';
import { PAYMENT_TYPES, type PaymentMethod } from './payment-types';
import type { PluginConfigData } from '@/types/plugin-config';

// ─── Airwallex APM configuration ────────────────────────────────────────────
// Maps each APM type to its form metadata and default redirect description.

interface AirwallexApmConfig {
  type: (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES];
  apmType: string;
  settingsKey: string;
  defaultDescription: string;
  defaultRedirectLabel: string;
}

const AIRWALLEX_APM_DETAILS: AirwallexApmConfig[] = [
  {
    type: PAYMENT_TYPES.AIRWALLEX_KLARNA,
    apmType: 'klarna',
    settingsKey: 'klarna',
    defaultDescription: 'Pay in 4 interest-free payments',
    defaultRedirectLabel: 'You will be redirected to Klarna to complete your payment securely.',
  },
  {
    type: PAYMENT_TYPES.AIRWALLEX_AFTERPAY,
    apmType: 'afterpay',
    settingsKey: 'afterpay',
    defaultDescription: 'Buy now, pay later in 4 installments',
    defaultRedirectLabel: 'You will be redirected to Afterpay to complete your payment securely.',
  },
  {
    type: PAYMENT_TYPES.AIRWALLEX_PAYPAL,
    apmType: 'paypal',
    settingsKey: 'paypal',
    defaultDescription: 'Pay securely with PayPal',
    defaultRedirectLabel: 'You will be redirected to PayPal to complete your payment.',
  },
  {
    type: PAYMENT_TYPES.AIRWALLEX_SKRILL,
    apmType: 'skrill',
    settingsKey: 'skrill',
    defaultDescription: 'Pay securely with Skrill',
    defaultRedirectLabel: 'You will be redirected to Skrill to complete your payment.',
  },
  {
    type: PAYMENT_TYPES.AIRWALLEX_BANCONTACT,
    apmType: 'bancontact',
    settingsKey: 'bancontact',
    defaultDescription: 'Pay with your Bancontact card',
    defaultRedirectLabel: 'You will be redirected to Bancontact to complete your payment.',
  },
  {
    type: PAYMENT_TYPES.AIRWALLEX_IDEAL,
    apmType: 'ideal',
    settingsKey: 'ideal',
    defaultDescription: 'Pay with iDEAL bank transfer',
    defaultRedirectLabel: 'You will be redirected to iDEAL to complete your payment.',
  },
  {
    type: PAYMENT_TYPES.AIRWALLEX_TWINT,
    apmType: 'twint',
    settingsKey: 'twint',
    defaultDescription: 'Pay with TWINT mobile payment',
    defaultRedirectLabel: 'You will be redirected to TWINT to complete your payment.',
  },
];

// ─── Generic Airwallex APM Form ─────────────────────────────────────────────
// A single form component that handles all Airwallex APM types.

const AirwallexApmForm = memo(
  ({ apmType, metadata }: { apmType: string; metadata?: Record<string, unknown> }) => {
    const setPaymentMethod = useSetPaymentMethod();
    const config = AIRWALLEX_APM_DETAILS.find((c) => c.apmType === apmType);

    useEffect(() => {
      if (!config) return;
      setPaymentMethod({
        isValid: true,
        type: config.type,
        informations: {
          provider: 'airwallex_apm',
          apmType,
          processorId: metadata?.processorId as string,
        },
      });
    }, [setPaymentMethod, metadata, apmType, config]);

    return null;
  },
);
AirwallexApmForm.displayName = 'AirwallexApmForm';

// ─── Airwallex Payment Method Detail ────────────────────────────────────────
// Renders the expanded content panel for a selected Airwallex APM method.

interface AirwallexPaymentMethodDetailProps {
  method: PaymentMethod;
  isSelected: boolean;
}

export const AirwallexPaymentMethodDetail = memo(
  ({ method, isSelected }: AirwallexPaymentMethodDetailProps) => {
    const apmConfig = AIRWALLEX_APM_DETAILS.find((c) => c.type === method.type);
    const { config } = usePluginConfig<PluginConfigData>();
    const { t } = useTranslation();

    if (!apmConfig || !isSelected) return null;

    const apmTexts = config?.checkout?.payment?.airwallexApm?.[apmConfig.settingsKey];
    const description = t(apmTexts?.description, apmConfig.defaultDescription);
    const redirectLabel = t(apmTexts?.redirectLabel, apmConfig.defaultRedirectLabel);

    return (
      <div className="border-t border-[var(--border-color)] bg-[var(--background-color)] p-6">
        <div className="space-y-3 text-center">
          <p className="text-sm font-medium text-[var(--text-color)]" editor-id={`config.checkout.payment.airwallexApm.${apmConfig.settingsKey}.description`}>{description}</p>
          <p className="text-[12px] text-[var(--text-secondary-color)]" editor-id={`config.checkout.payment.airwallexApm.${apmConfig.settingsKey}.redirectLabel`}>{redirectLabel}</p>
        </div>
        <AirwallexApmForm apmType={apmConfig.apmType} metadata={method.metadata} />
      </div>
    );
  },
);
AirwallexPaymentMethodDetail.displayName = 'AirwallexPaymentMethodDetail';
