// Payment method types
export type PaymentMethod = {
  id: string;
  type: string;
  title: string;
  iconUrl: string;
  default: boolean;
  description?: string;
  settings?: Record<string, Record<string, unknown>>;
  metadata?: Record<string, unknown>;
  /** Display order from step config (lower = first). Undefined = unordered. */
  order?: number;
};

export const PAYMENT_TYPES = {
  CREDIT_CARD: 'credit-card',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  WHOP: 'whop',
  // Airwallex APMs
  AIRWALLEX_KLARNA: 'apm_airwallex_klarna',
  AIRWALLEX_AFTERPAY: 'apm_airwallex_afterpay',
  AIRWALLEX_PAYPAL: 'apm_airwallex_paypal',
  AIRWALLEX_SKRILL: 'apm_airwallex_skrill',
  AIRWALLEX_BANCONTACT: 'apm_airwallex_bancontact',
  AIRWALLEX_IDEAL: 'apm_airwallex_ideal',
  AIRWALLEX_TWINT: 'apm_airwallex_twint',
  AIRWALLEX_APM: 'airwallex_apm',
  // Stripe APMs
  STRIPE_KLARNA: 'apm_stripe_klarna',
  STRIPE_AFTERPAY: 'apm_stripe_afterpay',
  STRIPE_IDEAL: 'apm_stripe_ideal',
  STRIPE_BANCONTACT: 'apm_stripe_bancontact',
  STRIPE_TWINT: 'apm_stripe_twint',
  STRIPE_BLIK: 'apm_stripe_blik',
  STRIPE_AFFIRM: 'apm_stripe_affirm',
  STRIPE_APM: 'stripe_apm',
  // TagadaPay APMs (reuses Stripe APM types since TagadaPay extends Stripe)
  TAGADAPAY_APM: 'tagadapay_apm',
  HIPAY: 'hipay',
  ZELLE: 'zelle',
  CRYPTO: 'crypto',
  CUSTOM_PAYMENT: 'custom_payment',
} as const;

/** All Airwallex APM payment type values */
const AIRWALLEX_APM_TYPES: ReadonlySet<string> = new Set([
  PAYMENT_TYPES.AIRWALLEX_KLARNA,
  PAYMENT_TYPES.AIRWALLEX_AFTERPAY,
  PAYMENT_TYPES.AIRWALLEX_PAYPAL,
  PAYMENT_TYPES.AIRWALLEX_SKRILL,
  PAYMENT_TYPES.AIRWALLEX_BANCONTACT,
  PAYMENT_TYPES.AIRWALLEX_IDEAL,
  PAYMENT_TYPES.AIRWALLEX_TWINT,
]);

/** All Stripe APM payment type values */
const STRIPE_APM_TYPES: ReadonlySet<string> = new Set([
  PAYMENT_TYPES.STRIPE_KLARNA,
  PAYMENT_TYPES.STRIPE_AFTERPAY,
  PAYMENT_TYPES.STRIPE_IDEAL,
  PAYMENT_TYPES.STRIPE_BANCONTACT,
  PAYMENT_TYPES.STRIPE_TWINT,
  PAYMENT_TYPES.STRIPE_BLIK,
  PAYMENT_TYPES.STRIPE_AFFIRM,
]);

/** Returns true if the given payment method type is an Airwallex APM. */
export function isAirwallexApmType(type: string): boolean {
  return AIRWALLEX_APM_TYPES.has(type);
}

/** Returns true if the given payment method type is a Stripe APM. */
export function isStripeApmType(type: string): boolean {
  return STRIPE_APM_TYPES.has(type);
}
