import CardInput from '@/components/CardInput';
import { CreditCardTypesBadges } from '@/components/CreditCardTypesBadges';
import { DynamicIcon } from '@/components/DynamicIcon';
import ExpiryInput from '@/components/ExpiryInput';
import SecurityCodeInput from '@/components/SecurityCodeInput';
import { cn, getColorOpacityFromCSSVar } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import type { PaymentMethodName } from '@tagadapay/plugin-sdk/v2';
import { useApiQuery, usePluginConfig, useSetPaymentMethod as useSetPaymentMethodApi, useStepConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { CreditCard, Info, Shield } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useSetPaymentMethod } from '../contexts/PaymentMethods';
import { AirwallexPaymentMethodDetail } from './AirwallexPaymentMethods';
import { StripePaymentMethodDetail } from './StripePaymentMethods';
import { PAYMENT_TYPES, PaymentMethod, isAirwallexApmType, isStripeApmType } from './payment-types';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { SectionHeader } from './ui/section-header';

/**
 * Radio form value for a payment method.
 * Custom payment rows share the same `type`, so we encode the integration id
 * to make each row uniquely selectable: "custom_payment:<integrationId>".
 */
function paymentMethodFormValue(method: PaymentMethod): string {
  if (method.type === PAYMENT_TYPES.CUSTOM_PAYMENT) return `${PAYMENT_TYPES.CUSTOM_PAYMENT}:${method.id}`;
  return method.type;
}

function findPaymentMethodByFormValue(list: PaymentMethod[], value: string): PaymentMethod | undefined {
  if (value.startsWith(`${PAYMENT_TYPES.CUSTOM_PAYMENT}:`)) {
    const integrationId = value.slice(PAYMENT_TYPES.CUSTOM_PAYMENT.length + 1);
    return list.find((m) => m.type === PAYMENT_TYPES.CUSTOM_PAYMENT && m.id === integrationId);
  }
  return list.find((m) => m.type === value);
}
// Payment method skeleton
const PaymentMethodSkeleton = memo(() => {
  return (
    <div className="space-y-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] p-4"
          role="status"
          aria-label="payment-method-skeleton"
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-[var(--background-color-hover)]" />
            <div className="h-7 w-[50px] rounded bg-[var(--background-color-hover)]" />
            <div className="h-4 flex-1 rounded bg-[var(--background-color-hover)]" />
          </div>
        </div>
      ))}
    </div>
  );
});

PaymentMethodSkeleton.displayName = 'PaymentMethodSkeleton';

// Credit Card Types Component

// Payment method form components
const PaypalForm = memo(() => {
  const setPaymentMethod = useSetPaymentMethod();

  useEffect(() => {
    setPaymentMethod({
      isValid: true,
      type: PAYMENT_TYPES.PAYPAL,
      informations: null,
    });
  }, [setPaymentMethod]);

  return null;
});

PaypalForm.displayName = 'PaypalForm';

const ApplePayForm = memo(() => {
  const setPaymentMethod = useSetPaymentMethod();

  useEffect(() => {
    setPaymentMethod({
      isValid: true,
      type: PAYMENT_TYPES.APPLE_PAY,
      informations: null,
    });
  }, [setPaymentMethod]);

  return null;
});

ApplePayForm.displayName = 'ApplePayForm';

// Sets the payment method context when HiPay is selected so the submit handler
// can read selectedPaymentMethod.type === 'hipay'. isValid starts false and is
// updated to true by HiPayCheckout once the hosted fields are filled.
const HiPayContextSetter = memo(() => {
  const setPaymentMethod = useSetPaymentMethod();

  useEffect(() => {
    setPaymentMethod({
      isValid: false,
      type: PAYMENT_TYPES.HIPAY,
      informations: null,
    });
  }, [setPaymentMethod]);

  return null;
});

HiPayContextSetter.displayName = 'HiPayContextSetter';

const toApiPaymentMethodName = (type: string): PaymentMethodName | null => {
  if (type === PAYMENT_TYPES.CREDIT_CARD) return 'card';
  if (type === PAYMENT_TYPES.ZELLE) return 'zelle';
  if (
    type === PAYMENT_TYPES.PAYPAL ||
    type === PAYMENT_TYPES.AIRWALLEX_PAYPAL
  ) return 'paypal';
  if (
    type === PAYMENT_TYPES.AIRWALLEX_KLARNA ||
    type === PAYMENT_TYPES.STRIPE_KLARNA
  ) return 'klarna';
  return null;
};

interface PaymentSectionProps {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  checkoutSessionId: string;
  disabled?: boolean;
  /** Presentment currency for the checkout session; used to filter Stripe APMs by supported currency */
  presentmentCurrency?: string;
  /** When true, APMs that don't support recurring/subscriptions are filtered out */
  hasRecurringItem?: boolean;
  /** Order total in cents — used to filter crypto providers by minimum amount */
  orderAmountCents?: number;
}

/** Default icons for payment methods built from step config */
const CONFIG_METHOD_DEFAULTS: Record<string, { title: string; iconUrl: string }> = {
  'credit-card': { title: 'Credit or debit Card', iconUrl: 'https://cdn-icons-png.flaticon.com/512/6963/6963703.png' },
  crypto: { title: 'Pay with Card', iconUrl: '/integrations/tagadapay-logo.png' },
  paypal: { title: 'PayPal', iconUrl: '/integrations/paypal.svg' },
  apple_pay: { title: 'Apple Pay', iconUrl: '/integrations/apple-pay.svg' },
  google_pay: { title: 'Google Pay', iconUrl: '/integrations/google-pay.svg' },
  whop: { title: 'Whop', iconUrl: '/integrations/whop.svg' },
  hipay: { title: 'HiPay', iconUrl: '/integrations/hipay.svg' },
  zelle: { title: 'Zelle', iconUrl: '/integrations/zelle.svg' },
  custom_payment: { title: 'Custom Payment', iconUrl: '' },
};

/**
 * Build payment methods directly from paymentSetupConfig (injected via __TGD_STEP_CONFIG__).
 * This eliminates the API call and the skeleton flash — the list is available synchronously.
 */
function buildPaymentMethodsFromConfig(
  config: Record<string, any>,
  presentmentCurrency?: string,
  hasRecurringItem?: boolean,
): PaymentMethod[] {
  const currencyUpper = presentmentCurrency?.toUpperCase();
  const methods: PaymentMethod[] = [];

  for (const [key, cfg] of Object.entries(config)) {
    if (!cfg.enabled) continue;

    // Skip express checkout entries — handled by ExpressCheckoutButtons
    if (key.startsWith('express_checkout:')) continue;

    // APMs with processorId (e.g. "twint:processor_xxx", "klarna:processor_xxx")
    const baseName = key.split(':')[0];
    if (cfg.processorId && baseName !== 'card') {

      // Skip if currency doesn't match
      if (currencyUpper && cfg.presentmentCurrencies?.length && !cfg.presentmentCurrencies.includes(currencyUpper)) continue;
      // Skip if recurring is required but APM doesn't support it
      if (hasRecurringItem && cfg.recurring === false) continue;

      const apmType = `apm_stripe_${baseName}`;
      methods.push({
        id: `config_${key}`,
        type: apmType,
        title: (cfg.metadata?.label as string) || (cfg.label as string) || baseName,
        iconUrl: (cfg.metadata?.logoUrl as string) || (cfg.logoUrl as string) || '',
        default: false,
        description: (cfg.metadata?.description as string) || (cfg.description as string) || undefined,
        metadata: {
          processorId: cfg.processorId,
          provider: 'stripe_apm',
          apmType: baseName,
          settings: { [baseName]: { ...cfg, enabled: true } },
        },
        order: typeof cfg.order === 'number' ? cfg.order : undefined,
      });
      continue;
    }

    // Standard payment methods (card, crypto, paypal, etc.)
    const methodType = key === 'card' ? 'credit-card' : key.split(':')[0];
    const defaults = CONFIG_METHOD_DEFAULTS[methodType];

    const method: PaymentMethod = {
      id: cfg.integrationId || `config_${key}`,
      type: methodType,
      title: (cfg.metadata?.label as string) || (cfg.label as string) || defaults?.title || methodType,
      iconUrl: (cfg.metadata?.logoUrl as string) || (cfg.logoUrl as string) || defaults?.iconUrl || '',
      default: methodType === 'credit-card',
      description: (cfg.metadata?.description as string) || (cfg.description as string) || undefined,
      metadata: cfg.metadata || {},
      settings: cfg.settings || undefined,
      order: typeof cfg.order === 'number' ? cfg.order : undefined,
    };

    // Enrich crypto with enabled providers from step config
    if (methodType === 'crypto' && cfg.providers) {
      const enabledProviders: Record<string, any> = {};
      for (const [id, prov] of Object.entries(cfg.providers as Record<string, any>)) {
        if (prov.enabled) {
          enabledProviders[id] = prov;
        }
      }
      method.settings = { ...method.settings, providers: enabledProviders } as any;
      if (cfg.provider) {
        (method.settings as any).provider = cfg.provider;
        (method.settings as any).label = cfg.metadata?.label || cfg.label || defaults?.title || 'Pay with Card';
      }
    }

    methods.push(method);
  }

  return methods;
}

/** Known crypto on-ramp provider metadata for label fallback */
const CRYPTO_PROVIDER_META: Record<string, { label: string; min: number; logoUrl: string; note?: string }> = {
  moonpay: { label: 'MoonPay', min: 20, logoUrl: '/integrations/crypto/moonpay.png' },
  stripe: { label: 'Stripe', min: 2, logoUrl: '/integrations/crypto/stripe.png', note: 'USD/USA only' },
  rampnetwork: { label: 'Ramp Network', min: 4, logoUrl: '/integrations/crypto/rampnetwork.png', note: 'USD only' },
  robinhood: { label: 'Robinhood', min: 5, logoUrl: '/integrations/crypto/robinhood.png', note: 'USD only' },
  topper: { label: 'Topper', min: 10, logoUrl: '/integrations/crypto/topper.png' },
  unlimit: { label: 'Unlimit', min: 10, logoUrl: '/integrations/crypto/unlimit.png' },
  bitnovo: { label: 'Bitnovo', min: 10, logoUrl: '/integrations/crypto/bitnovo.png' },
  simpleswap: { label: 'SimpleSwap', min: 10, logoUrl: '/integrations/crypto/simpleswap.png' },
  mercuryo: { label: 'Mercuryo', min: 15, logoUrl: '/integrations/crypto/mercuryo.png' },
  revolut: { label: 'Revolut', min: 15, logoUrl: '/integrations/crypto/revolut.png' },
  transak: { label: 'Transak', min: 15, logoUrl: '/integrations/crypto/transak.png' },
  cryptix: { label: 'Cryptix', min: 15, logoUrl: '/integrations/crypto/cryptix.png' },
  guardarian: { label: 'Guardarian', min: 20, logoUrl: '/integrations/crypto/guardarian.png', note: 'EU-regulated' },
  banxa: { label: 'Banxa', min: 20, logoUrl: '/integrations/crypto/banxa.png' },
  alchemypay: { label: 'Alchemy Pay', min: 20, logoUrl: '/integrations/crypto/alchemypay.png' },
  sardine: { label: 'Sardine', min: 30, logoUrl: '/integrations/crypto/sardine.png' },
  particle: { label: 'Particle', min: 30, logoUrl: '/integrations/crypto/particle.png' },
  wert: { label: 'Wert', min: 30, logoUrl: '/integrations/crypto/wert.png' },
  simplex: { label: 'Simplex', min: 50, logoUrl: '/integrations/crypto/simplex.svg' },
  utorg: { label: 'Utorg', min: 50, logoUrl: '/integrations/crypto/utorg.png' },
  transfi: { label: 'TransFi', min: 70, logoUrl: '/integrations/crypto/transfi.png', note: 'USD only' },
  interac: { label: 'Interac', min: 100, logoUrl: '/integrations/crypto/interac.png', note: 'CAD only' },
  upi: { label: 'UPI', min: 100, logoUrl: '/integrations/crypto/upi.png', note: 'INR only' },
};

/** Normalize providers from either Record or Array format into a consistent list */
function normalizeCryptoProviders(
  providers: Record<string, { enabled?: boolean; label?: string; min?: number; note?: string }> | Array<{ id: string; enabled: boolean }>,
): { id: string; label: string; logoUrl?: string; min?: number; note?: string }[] {
  if (Array.isArray(providers)) {
    return providers
      .filter((p) => p.enabled)
      .map((p) => {
        const meta = CRYPTO_PROVIDER_META[p.id];
        return { id: p.id, label: meta?.label || p.id, logoUrl: meta?.logoUrl, min: meta?.min, note: meta?.note };
      });
  }
  return Object.entries(providers)
    .filter(([, v]) => v.enabled)
    .map(([id, v]) => {
      const meta = CRYPTO_PROVIDER_META[id];
      return { id, label: v.label || meta?.label || id, logoUrl: meta?.logoUrl, min: v.min ?? meta?.min, note: v.note ?? meta?.note };
    });
}

const CRYPTO_PROVIDER_COOKIE = 'tagada_crypto_provider';

function getCryptoProviderCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CRYPTO_PROVIDER_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCryptoProviderCookie(providerId: string) {
  document.cookie = `${CRYPTO_PROVIDER_COOKIE}=${encodeURIComponent(providerId)};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

/** Searchable select dropdown for crypto on-ramp provider selection */
function CryptoProviderSelector({
  providers,
  onSelect,
  orderAmountCents,
}: {
  providers: Record<string, { enabled?: boolean; label?: string; min?: number; note?: string }> | Array<{ id: string; enabled: boolean }>;
  onSelect: (providerId: string) => void;
  orderAmountCents?: number;
}) {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();
  const orderAmountDollars = orderAmountCents ? orderAmountCents / 100 : undefined;
  const enabledProviders = normalizeCryptoProviders(providers).filter(
    (p) => !p.min || !orderAmountDollars || orderAmountDollars >= p.min,
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-select: prefer cookie, then first provider
  useEffect(() => {
    if (!selected && enabledProviders.length > 0) {
      const cookieProvider = getCryptoProviderCookie();
      const fromCookie = cookieProvider && enabledProviders.find((p) => p.id === cookieProvider);
      const firstId = fromCookie ? fromCookie.id : enabledProviders[0].id;
      setSelected(firstId);
      onSelect(firstId);
    }
  }, [enabledProviders.length]);

  // Single provider or none — auto-select silently, don't render UI
  if (enabledProviders.length <= 1) {
    return null;
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filtered = search
    ? enabledProviders.filter((p) => p.label.toLowerCase().includes(search.toLowerCase()))
    : enabledProviders;

  const selectedProvider = enabledProviders.find((p) => p.id === selected);

  return (
    <div className="border-t border-[var(--border-color)] bg-[var(--background-color)] p-4">
      {/* Preload provider logos so they're cached when dropdown opens */}
      <div className="hidden">
        {enabledProviders.map((p) => p.logoUrl && <img key={p.id} src={p.logoUrl} alt="" />)}
      </div>
      <p className="mb-2 text-xs font-medium text-[var(--text-secondary-color)]" editor-id="config.checkout.payment.cryptoProviderLabel">
        {t(config?.checkout?.payment?.cryptoProviderLabel, 'Choose your payment provider')}
      </p>
      <div ref={dropdownRef} className="relative">
        {/* Trigger */}
        <div
          className="flex cursor-pointer items-center justify-between rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-[13px] transition-colors hover:border-[var(--ink-500)]"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={cn('flex items-center gap-2', selectedProvider ? 'font-medium' : 'text-[var(--text-secondary-color)]')}>
            {selectedProvider?.logoUrl && (
              <img src={selectedProvider.logoUrl} alt="" className="h-5 w-5 rounded object-contain" />
            )}
            {selectedProvider?.label || t(config?.checkout?.payment?.cryptoSelectProvider, 'Select a provider')}
          </span>
          <svg className={cn('h-4 w-4 text-[var(--text-secondary-color)] transition-transform', isOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)]">
            {enabledProviders.length > 4 && (
              <div className="border-b border-[var(--border-color)] p-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full rounded border border-[var(--border-color)] bg-[var(--background-color)] px-2 py-1.5 text-sm outline-none focus:border-[var(--primary-color)]"
                  placeholder={t(config?.checkout?.payment?.cryptoSearchProvider, 'Search provider...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            <div className="max-h-48 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[var(--text-secondary-color)]">{t(config?.checkout?.payment?.cryptoNoProvider, 'No provider found')}</p>
              ) : (
                filtered.map((provider) => {
                  const isActive = selected === provider.id;
                  return (
                    <div
                      key={provider.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'font-medium'
                          : 'text-[var(--text-secondary-color)]',
                      )}
                      style={{
                        backgroundColor: isActive ? getColorOpacityFromCSSVar('primary-color', 8) : undefined,
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--background-color-hover, rgba(0,0,0,0.04))'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = ''; }}
                      onClick={() => {
                        setSelected(provider.id);
                        onSelect(provider.id);
                        setCryptoProviderCookie(provider.id);
                        setIsOpen(false);
                        setSearch('');
                      }}
                    >
                      {isActive ? (
                        <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--primary-color)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}
                      {provider.logoUrl && (
                        <img src={provider.logoUrl} alt="" className="h-5 w-5 shrink-0 rounded object-contain" />
                      )}
                      <span className="flex-1">{provider.label}</span>
                      {provider.min != null && (
                        <span className="text-[10px] text-[var(--text-secondary-color)]">min ${provider.min}</span>
                      )}
                      {provider.note && (
                        <span className="rounded border border-[var(--border-color)] px-1 py-0.5 text-[10px] text-[var(--text-secondary-color)]">
                          {provider.note}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentSection({ watch, setValue, errors, checkoutSessionId, control, disabled = false, presentmentCurrency, hasRecurringItem, orderAmountCents }: PaymentSectionProps) {
  const { config } = usePluginConfig<PluginConfigData>();
  const { t } = useTranslation();
  const [paymentList, setPaymentList] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { paymentSetupConfig } = useStepConfig();

  // Only trust the config when it actually carries at least one enabled method.
  // Absent, empty `{}`, or all-disabled configs should fall through to the API fetch.
  const hasConfigMethods = !!paymentSetupConfig
    && Object.values(paymentSetupConfig).some((v: any) => v?.enabled === true);

  // Fallback: when step config doesn't carry any payment methods, fetch the
  // canonical list from the backend. Cache key matches ExpressPaymentMethodsProvider
  // so both consumers share the same request when both are active.
  const { data: apiPaymentMethods } = useApiQuery<Array<{
    id: string;
    type: string;
    title: string;
    iconUrl: string;
    default: boolean;
    settings?: unknown;
    metadata?: unknown;
  }>>(
    ['payment-methods', checkoutSessionId],
    !hasConfigMethods && checkoutSessionId
      ? `/api/v1/payment-methods?checkoutSessionId=${encodeURIComponent(checkoutSessionId)}`
      : null,
    { staleTime: 60_000, refetchOnWindowFocus: false },
  );

  const selectedPaymentMethod = watch('paymentMethod');
  const setPaymentMethod = useSetPaymentMethod();
  const { setPaymentMethod: setPaymentMethodApi } = useSetPaymentMethodApi({ sessionId: checkoutSessionId });

  const setSelectedPaymentMethod = async (paymentMethodTypeOrMethod: string | PaymentMethod) => {
    const method =
      typeof paymentMethodTypeOrMethod === 'string'
        ? findPaymentMethodByFormValue(paymentList, paymentMethodTypeOrMethod)
        : paymentMethodTypeOrMethod;
    if (!method) {
      setValue('paymentMethod', typeof paymentMethodTypeOrMethod === 'string' ? paymentMethodTypeOrMethod : '');
      setPaymentMethod((prev) => ({ ...prev, type: typeof paymentMethodTypeOrMethod === 'string' ? paymentMethodTypeOrMethod : null, informations: null }));
      return;
    }
    const formValue = paymentMethodFormValue(method);
    setValue('paymentMethod', formValue);
    const isZelle = method.type === PAYMENT_TYPES.ZELLE;
    const isCustomPayment = method.type === PAYMENT_TYPES.CUSTOM_PAYMENT;
    const instructionsMessage = (method.settings as { instructionsMessage?: string } | undefined)?.instructionsMessage;
    const checkoutInstructions = (method.settings as { checkoutInstructions?: string } | undefined)?.checkoutInstructions;
    setPaymentMethod((prev) => ({
      ...prev,
      type: formValue,
      isValid: (isZelle || isCustomPayment) ? true : prev.isValid,
      informations: isZelle && instructionsMessage != null
        ? { instructionsMessage }
        : isCustomPayment
          ? { integrationId: method.id, checkoutInstructions: checkoutInstructions ?? null }
          : null,
    }));

    const apiMethodName = toApiPaymentMethodName(method.type);
    if (apiMethodName) {
      await setPaymentMethodApi(apiMethodName);
    }
  };

  // Resolution rules (see README → "Payment Method Resolution"):
  //   • config has >=1 enabled method → build list from config, no network.
  //   • otherwise → use the backend `/api/v1/payment-methods` response
  //     (shared react-query cache with ExpressPaymentMethodsProvider).
  //   • express_checkout:* entries are always stripped from the radio group
  //     — they render via the express buttons block instead.
  useEffect(() => {
    if (hasConfigMethods) {
      const methods = buildPaymentMethodsFromConfig(paymentSetupConfig!, presentmentCurrency, hasRecurringItem);
      // Sort by configured order; unordered methods go last preserving original position
      const hasAnyOrder = methods.some((m) => m.order !== undefined);
      if (hasAnyOrder) {
        methods.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
      }
      setPaymentList(methods);
      setIsLoading(false);
      return;
    }

    if (apiPaymentMethods) {
      // API returns shape compatible with the native PaymentMethod type; strip any
      // express-only entries so the radio group only shows inline methods.
      const methods: PaymentMethod[] = apiPaymentMethods
        .filter((m) => !String(m.type).startsWith('express_checkout'))
        .map((m) => ({
          id: m.id,
          type: m.type,
          title: m.title,
          iconUrl: m.iconUrl,
          default: m.default,
          settings: (m.settings as Record<string, Record<string, unknown>> | undefined) ?? undefined,
          metadata: (m.metadata as Record<string, unknown> | undefined) ?? undefined,
        }));
      setPaymentList(methods);
      setIsLoading(false);
    }
  }, [presentmentCurrency, hasRecurringItem, paymentSetupConfig, hasConfigMethods, apiPaymentMethods]);

  const hasWhop = paymentList?.some((method: PaymentMethod) => method.type === PAYMENT_TYPES.WHOP);
  const hasHiPay = paymentList?.some((method: PaymentMethod) => method.type === PAYMENT_TYPES.HIPAY);

  // When Whop is available, set the payment method context so WhopCheckout can render
  useEffect(() => {
    if (hasWhop) {
      setPaymentMethod({
        isValid: true,
        type: 'whop',
        informations: null,
      });
    }
  }, [hasWhop, setPaymentMethod]);

  // When HiPay is available, set the payment method context so HiPayCheckout can render (only HiPay, no card/others)
  useEffect(() => {
    if (hasHiPay) {
      setPaymentMethod({
        isValid: false,
        type: PAYMENT_TYPES.HIPAY,
        informations: null,
      });
    }
  }, [hasHiPay, setPaymentMethod]);


  // Set default payment method
  const handleSetDefaultPaymentMethod = useCallback(() => {
    if (!paymentList || paymentList.length === 0) return;

    // If methods have configured order, first method in list wins (already sorted)
    const hasConfiguredOrder = paymentList.some((m) => m.order !== undefined);
    if (hasConfiguredOrder) {
      setSelectedPaymentMethod(paymentList[0].type);
      return;
    }

    // Legacy fallback: Whop → HiPay → credit card → default → first
    const whopMethod = paymentList.find((method: PaymentMethod) => method.type === PAYMENT_TYPES.WHOP);
    const hipayMethod = paymentList.find((method: PaymentMethod) => method.type === PAYMENT_TYPES.HIPAY);
    const creditCardMethod = paymentList.find(
      (method: PaymentMethod) => method.type === PAYMENT_TYPES.CREDIT_CARD,
    );
    const defaultMethod = paymentList.find((method) => method.default);
    const methodToSelect = whopMethod || hipayMethod || creditCardMethod || defaultMethod || paymentList[0];

    if (methodToSelect) {
      setSelectedPaymentMethod(methodToSelect.type);
    }
  }, [paymentList]);

  useEffect(() => {
    handleSetDefaultPaymentMethod();
  }, [handleSetDefaultPaymentMethod]);

  // Show loading skeleton
  if (isLoading || !paymentList) {
    return (
      <div className="space-y-4">
        <SectionHeader
          step={3}
          eyebrowLabel="Payment"
          title={t(config?.checkout?.payment?.title, 'How would you like to pay?')}
          description={t(
            config?.checkout?.payment?.description,
            'All transactions are secure and encrypted. Your payment information is protected.',
          )}
          titleEditorId="config.checkout.payment.title"
          descriptionEditorId="config.checkout.payment.description"
        />
        <PaymentMethodSkeleton />
      </div>
    );
  }
  // Hide payment section if Whop or HiPay is available (show only that method)
  if (hasWhop || hasHiPay) {
    return null;
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        step={3}
        eyebrowLabel="Payment"
        title={t(config?.checkout?.payment?.title, 'How would you like to pay?')}
        description={t(
          config?.checkout?.payment?.description,
          'All transactions are secure and encrypted. Your payment information is protected.',
        )}
        titleEditorId="config.checkout.payment.title"
        descriptionEditorId="config.checkout.payment.description"
      />

      <div id="payment-form" className={`space-y-3 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
        <RadioGroup
          value={selectedPaymentMethod}
          onValueChange={setSelectedPaymentMethod}
          className="space-y-3"
          disabled={disabled}
        >
          {paymentList.map((method) => {
            // Filter out parent APM types (they've been expanded into individual methods)
            if (method.type === PAYMENT_TYPES.AIRWALLEX_APM || method.type === PAYMENT_TYPES.STRIPE_APM || method.type === PAYMENT_TYPES.TAGADAPAY_APM) {
              return null;
            }
            // Filter out payment methods based on metadata
            if (method.type === PAYMENT_TYPES.APPLE_PAY && !method?.metadata?.enablePaymentFormCheckout) {
              return null;
            }
            // Temp disable google pay for now
            if (method.type === PAYMENT_TYPES.GOOGLE_PAY) {
              return null;
            }
            if (method.type === PAYMENT_TYPES.WHOP) {
              return null;
            }
            if (method.type === PAYMENT_TYPES.HIPAY) {
              return null;
            }

            const formValue = paymentMethodFormValue(method);
            const isCreditCard = method.type === PAYMENT_TYPES.CREDIT_CARD;
            const isCrypto = method.type === PAYMENT_TYPES.CRYPTO;
            const isSelected = selectedPaymentMethod === formValue;
            const methodTitle = isCreditCard
              ? t(config?.checkout?.payment?.creditCard, 'Credit Card')
              : method.title;
            const methodTitleEditorId = isCreditCard ? 'config.checkout.payment.creditCard' : undefined;

            return (
              <div key={formValue} className="group">
                <div
                  className={cn(
                    'overflow-hidden rounded-[4px] border transition-colors duration-100 ease-out',
                    isSelected ? '' : 'hover:border-[var(--ink-500)]',
                  )}
                  style={{
                    borderColor: isSelected ? 'var(--primary-color)' : 'var(--line-strong)',
                    backgroundColor: isSelected ? 'var(--brand-tint)' : 'var(--surface)',
                    boxShadow: isSelected ? '0 0 0 1px var(--primary-color) inset' : 'none',
                  }}
                >
                  <Label
                    htmlFor={formValue}
                    className={cn(
                      'flex cursor-pointer items-center justify-between p-4',
                      isSelected && isCreditCard && 'border-b',
                    )}
                  >
                    <div className="flex shrink-0 items-center space-x-3">
                      <RadioGroupItem value={formValue} id={formValue} disabled={disabled} />
                      <div className="flex items-center space-x-2">
                        {isCreditCard ? (
                          <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded-[3px] bg-[var(--primary-color)]">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                        ) : isCrypto ? (
                          <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded-[3px] border border-[var(--line-strong)] bg-[var(--surface-alt)]">
                            <Shield className="h-4 w-4 text-[var(--ink-700)]" />
                          </div>
                        ) : method.iconUrl ? (
                          <div className="flex h-8 w-10 items-center justify-center rounded-[3px] border border-[var(--line-strong)] bg-[var(--surface)] p-1">
                            <img
                              src={method.iconUrl}
                              alt={methodTitle}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : null}
                        <div className="shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-[var(--ink-900)]" editor-id={methodTitleEditorId}>
                              {methodTitle}
                            </span>
                          </div>
                          <p
                            className="text-[12px] text-[var(--text-secondary-color)]"
                            editor-id={
                              isCreditCard
                                ? 'config.checkout.payment.creditCardSecureText'
                                : 'config.checkout.payment.completePaymentText'
                            }
                          >
                            {isCreditCard
                              ? t(
                                config?.checkout?.payment?.creditCardSecureText,
                                'Pay securely with your credit card',
                              )
                              : method.description ||
                              t(config?.checkout?.payment?.completePaymentText, 'Complete your payment')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isCreditCard && <CreditCardTypesBadges />}
                  </Label>

                  {/* Expanded Credit Card Form */}
                  {isSelected && isCreditCard && (
                    <div className="space-y-3 bg-[var(--background-color)] p-4">
                      <div>
                        <Controller
                          control={control}
                          name="cardNumber"
                          render={({ field }) => (
                            <CardInput
                              name={field.name}
                              ref={field.ref}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t(config?.checkout?.payment?.cardNumberPlaceholder, 'Card number')}
                              editor-id="config.checkout.payment.cardNumberPlaceholder"
                              error={!!errors.cardNumber}
                              disabled={disabled}
                            />
                          )}
                        />
                        {errors.cardNumber && (
                          <p className="text-[12px] font-medium text-[var(--danger)]">{errors.cardNumber.message as string}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Controller
                            control={control}
                            name="expirationDate"
                            render={({ field }) => (
                              <ExpiryInput
                                name={field.name}
                                ref={field.ref}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={t(config?.checkout?.payment?.expiryPlaceholder, 'MM/YY')}
                                editor-id="config.checkout.payment.expiryPlaceholder"
                                error={!!errors.expirationDate}
                                disabled={disabled}
                              />
                            )}
                          />
                          {errors.expirationDate && (
                            <p className="text-[12px] font-medium text-[var(--danger)]">{errors.expirationDate.message as string}</p>
                          )}
                        </div>
                        <div>
                          <Controller
                            control={control}
                            name="securityCode"
                            render={({ field }) => (
                              <SecurityCodeInput
                                name={field.name}
                                ref={field.ref}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={t(
                                  config?.checkout?.payment?.securityCodePlaceholder,
                                  'Security code',
                                )}
                                editor-id="config.checkout.payment.securityCodePlaceholder"
                                error={!!errors.securityCode}
                                disabled={disabled}
                              />
                            )}
                          />
                          {errors.securityCode && (
                            <p className="text-[12px] font-medium text-[var(--danger)]">{errors.securityCode.message as string}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal Message */}
                  {isSelected && method.type === PAYMENT_TYPES.PAYPAL && (
                    <div className="border-t border-[var(--border-color)] bg-[var(--background-color)] p-6">
                      <div className="py-4 text-center">
                        <p className="text-[12px] text-[var(--text-secondary-color)]" editor-id="config.checkout.payment.paypalRedirectText">
                          {t(config?.checkout?.payment?.paypalRedirectText, 'You will be redirected to PayPal to complete your payment.')}
                        </p>
                      </div>
                      <PaypalForm />
                    </div>
                  )}

                  {/* Apple Pay Message */}
                  {isSelected && method.type === PAYMENT_TYPES.APPLE_PAY && (
                    <div className="border-t border-[var(--border-color)] bg-[var(--background-color)] p-6">
                      <div className="py-4 text-center">
                        <p className="text-[12px] text-[var(--text-secondary-color)]" editor-id="config.checkout.payment.applePayRedirectText">
                          {t(config?.checkout?.payment?.applePayRedirectText, 'Apple Pay will be prompted on your device to complete your payment.')}
                        </p>
                      </div>
                      <ApplePayForm />
                    </div>
                  )}

                  {/* Crypto provider selector — shown when multiple on-ramp providers are available */}
                  {isSelected && isCrypto && (method.settings as any)?.providers && (
                    <CryptoProviderSelector
                      providers={(method.settings as any).providers}
                      orderAmountCents={orderAmountCents}
                      onSelect={(providerId) => {
                        setPaymentMethod((prev) => ({
                          ...prev,
                          type: 'crypto',
                          isValid: true,
                          informations: { provider: providerId },
                        }));
                      }}
                    />
                  )}

                  {/* Crypto info section */}
                  {isSelected && isCrypto && (config?.checkout?.payment?.cryptoSteps?.length || config?.checkout?.payment?.cryptoBadges?.length) && (
                    <div className="border-t border-[var(--border-color)] bg-[var(--background-color)] p-6">
                      {/* Info title + Steps */}
                      {config?.checkout?.payment?.cryptoSteps && config.checkout.payment.cryptoSteps.length > 0 && (
                        <>
                          <div className="mb-3 flex items-center gap-2">
                            <Info className="text-primary h-4 w-4" />
                            <span className="text-sm font-semibold text-primary" editor-id="config.checkout.payment.cryptoInfoTitle">
                              {t(config?.checkout?.payment?.cryptoInfoTitle, 'How your payment works')}
                            </span>
                          </div>
                          <div className="mb-4 space-y-2">
                            {config.checkout.payment.cryptoSteps.map((step, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div
                                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                  style={{ backgroundColor: 'var(--primary-color)' }}
                                >
                                  {index + 1}
                                </div>
                                <p
                                  className="text-primary text-xs leading-relaxed [&_strong]:font-semibold"
                                  editor-id={`config.checkout.payment.cryptoSteps[${index}].text`}
                                  dangerouslySetInnerHTML={{ __html: t(step.text, '') }}
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Badges */}
                      {config?.checkout?.payment?.cryptoBadges && config.checkout.payment.cryptoBadges.length > 0 && (
                        <div
                          className="rounded-lg px-3 py-2 text-center"
                          style={{ backgroundColor: getColorOpacityFromCSSVar('primary-color', 8) }}
                        >
                          <span className="text-primary flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
                            {config.checkout.payment.cryptoBadges.map((badge, index) => {
                              return (
                                <span key={index} className="inline-flex items-center gap-1">
                                  {index > 0 && <span className="mr-1">&bull;</span>}
                                  <DynamicIcon name={badge.icon || 'Check'} className="text-primary h-3.5 w-3.5" strokeWidth={2.5} />
                                  <span editor-id={`config.checkout.payment.cryptoBadges[${index}].text`}>
                                    {t(badge.text, '')}
                                  </span>
                                </span>
                              );
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* HiPay — sets context so the submit handler and HiPayCheckout are triggered */}
                  {isSelected && method.type === PAYMENT_TYPES.HIPAY && (
                    <HiPayContextSetter />
                  )}

                  {/* Custom payment — inline instructions shown directly below the selected row */}
                  {isSelected && method.type === PAYMENT_TYPES.CUSTOM_PAYMENT && (() => {
                    const instructions = (method.settings as { checkoutInstructions?: string } | undefined)?.checkoutInstructions;
                    if (!instructions?.trim()) return null;
                    return (
                      <div className="border-t border-[var(--border-color)] bg-[var(--background-color-hover)] p-4">
                        <p className="whitespace-pre-wrap text-sm text-[var(--text-color)]">
                          {instructions.replace(/\{orderNumber\}/g, 'your order number')}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Zelle — inline instructions shown directly below the selected row */}
                  {isSelected && method.type === PAYMENT_TYPES.ZELLE && (() => {
                    const instructions = (method.settings as { instructionsMessage?: string } | undefined)?.instructionsMessage;
                    if (!instructions?.trim()) return null;
                    return (
                      <div className="border-t border-[var(--border-color)] bg-[var(--background-color-hover)] p-4">
                        <p className="whitespace-pre-wrap text-sm text-[var(--text-color)]">
                          {instructions.replace(/\{orderNumber\}/g, 'your order number')}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Airwallex APM expanded detail (Klarna, Afterpay, PayPal, etc.) */}
                  {isAirwallexApmType(method.type) && (
                    <AirwallexPaymentMethodDetail method={method} isSelected={isSelected} />
                  )}

                  {/* Stripe APM expanded detail (Klarna, Afterpay, iDEAL, etc.) */}
                  {isStripeApmType(method.type) && (
                    <StripePaymentMethodDetail method={method} isSelected={isSelected} />
                  )}
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
}
