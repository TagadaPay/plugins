import { useCallback } from 'react';
import { PAYMENT_TYPES, PaymentMethod, isStripeApmType } from '../components/payment-types';

interface ApmMethodSettings {
  enabled?: boolean;
  label?: string;
  description?: string;
  logoUrl?: string;
  presentmentCurrencies?: string[];
  recurring?: boolean;
  [key: string]: unknown;
}

interface ProcessorGroup {
  processorId: string;
  methods: Record<string, ApmMethodSettings>;
}

function expandFromProcessorGroups(
  method: PaymentMethod,
  groups: ProcessorGroup[],
  currencyUpper: string | undefined,
  hasRecurringItem: boolean | undefined,
): PaymentMethod[] {
  const expanded: PaymentMethod[] = [];

  for (const group of groups) {
    if (!group.methods) continue;

    for (const [key, apmSettings] of Object.entries(group.methods)) {
      if (!apmSettings?.enabled) continue;

      const type = `apm_stripe_${key}`;
      if (!isStripeApmType(type)) continue;

      const title = (apmSettings.label as string | undefined) ?? key;
      const iconUrl = (apmSettings.logoUrl as string | undefined) ?? '';
      const presentmentCurrencies = apmSettings.presentmentCurrencies as string[] | undefined;
      if (currencyUpper && presentmentCurrencies?.length && !presentmentCurrencies.includes(currencyUpper)) continue;
      if (hasRecurringItem && !apmSettings.recurring) continue;

      expanded.push({
        id: `${method.id}_${key}`,
        type,
        title,
        iconUrl,
        default: false,
        description: apmSettings.description,
        metadata: {
          ...method.metadata,
          processorId: group.processorId,
          provider: method.type,
          apmType: key,
          settings: { [key]: apmSettings },
        },
      });
    }
  }

  return expanded;
}

/**
 * Hook that provides a function to expand Stripe APM payment methods
 * into individual payment methods (Klarna, Afterpay, iDEAL, etc.).
 *
 * Supports both the new processors-array format and the legacy flat format.
 */
export function useExpandStripeMethods() {
  const expandStripeMethods = useCallback(
    (methods: PaymentMethod[], presentmentCurrency?: string, hasRecurringItem?: boolean): PaymentMethod[] => {
      const expanded: PaymentMethod[] = [];
      const currencyUpper = presentmentCurrency?.toUpperCase();

      for (const method of methods) {
        if (method.type === PAYMENT_TYPES.STRIPE_APM || method.type === PAYMENT_TYPES.TAGADAPAY_APM) {
          const settings = method.settings;
          if (!settings) continue;

          // New format: settings.processors is an array of { processorId, methods }
          if (settings.processors && Array.isArray(settings.processors)) {
            expanded.push(...expandFromProcessorGroups(method, settings.processors, currencyUpper, hasRecurringItem));
            continue;
          }

          // Legacy format: flat settings keyed by APM name, processorId in metadata
          for (const [key, apmSettings] of Object.entries(settings)) {
            if (!apmSettings?.enabled) continue;

            const type = `apm_stripe_${key}`;
            if (!isStripeApmType(type)) continue;

            const title = (apmSettings.label as string | undefined) ?? key;
            const iconUrl = (apmSettings.logoUrl as string | undefined) ?? '';
            const description = typeof apmSettings.description === 'string' ? apmSettings.description : undefined;
            const presentmentCurrencies = apmSettings.presentmentCurrencies as string[] | undefined;
            if (currencyUpper && presentmentCurrencies?.length && !presentmentCurrencies.includes(currencyUpper)) continue;
            if (hasRecurringItem && !apmSettings.recurring) continue;

            expanded.push({
              id: `${method.id}_${key}`,
              type,
              title,
              iconUrl,
              default: false,
              description,
              metadata: {
                ...method.metadata,
                provider: method.type,
                apmType: key,
                settings: { [key]: apmSettings },
              },
            });
          }
        } else {
          expanded.push(method);
        }
      }

      return expanded;
    },
    [],
  );

  return { expandStripeMethods };
}
