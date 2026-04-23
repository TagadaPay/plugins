import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { AlertTriangle, Mail, ShieldCheck } from 'lucide-react';
import { memo } from 'react';

interface ZellePaymentInstructionsProps {
  orderNumber: string;
  customerEmail?: string;
}

/** Left-column Zelle instruction cards (memo warning, steps, security note, email notice). */
export const ZellePaymentInstructions = memo(({ orderNumber, customerEmail }: ZellePaymentInstructionsProps) => {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  const defaultSteps = [
    { title: 'Open your Zelle app or banking app', description: "Log in to your bank's mobile app or the Zelle app." },
    { title: 'Send payment', description: 'Send the exact amount shown in your order summary to the Zelle account provided in your confirmation email.' },
    { title: 'Use your Order Number as memo', description: 'Enter <b>#{orderNumber}</b> as the memo or reference for your payment.' },
    { title: 'Wait for confirmation', description: 'Once your payment is verified, you will receive a confirmation email and your order will be processed.' },
  ];

  const configSteps = config?.zelleThankYou?.steps;
  const steps = (configSteps?.length ? configSteps : defaultSteps).map((step, i) => ({
    title: t(step.title, defaultSteps[i]?.title ?? ''),
    description: t(
      step.description,
      defaultSteps[i]?.description ?? '',
      { orderNumber, b: (chunks) => <strong>{String(chunks).replace('{orderNumber}', orderNumber)}</strong> },
    ),
  }));

  return (
    <>
      {/* Important memo notice */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-800" editor-id="config.zelleThankYou.importantTitle">
              {t(config?.zelleThankYou?.importantTitle, 'Important')}
            </h3>
            <p className="mt-1 text-sm text-amber-700" editor-id="config.zelleThankYou.importantMessage">
              {t(
                config?.zelleThankYou?.importantMessage,
                'Please use only your Order Number <b>#{orderNumber}</b> as the payment memo/reference when sending your Zelle payment. This ensures your payment is matched to your order quickly.',
                {
                  orderNumber,
                  b: (chunks) => <strong>{String(chunks).replace('{orderNumber}', orderNumber)}</strong>
                },
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[var(--text-color)]" editor-id="config.zelleThankYou.howToPayTitle">
          {t(config?.zelleThankYou?.howToPayTitle, 'How to Complete Your Payment')}
        </h3>
        <div className="space-y-5">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)] text-sm font-bold text-[var(--text-color-on-primary)]">
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-color)]">{step.title}</h4>
                <p className="mt-0.5 text-sm text-[var(--text-secondary-color)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security note */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary-color)]" />
          <div>
            <h4 className="font-medium text-[var(--text-color)]" editor-id="config.zelleThankYou.securityNoteTitle">
              {t(config?.zelleThankYou?.securityNoteTitle, 'Security Note')}
            </h4>
            <p className="mt-1 text-sm text-[var(--text-secondary-color)]" editor-id="config.zelleThankYou.securityNoteDescription">
              {t(
                config?.zelleThankYou?.securityNoteDescription,
                'Your bank may ask security questions when sending to a new business account. This is a standard security measure to protect you from fraud. Please answer the verification questions and proceed with the payment.',
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation email notice */}
      {customerEmail && (
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary-color)]" />
            <div>
              <h4 className="font-medium text-[var(--text-color)]" editor-id="config.zelleThankYou.emailSentTitle">
                {t(config?.zelleThankYou?.emailSentTitle, 'Confirmation Email Sent')}
              </h4>
              <p className="mt-1 text-sm text-[var(--text-secondary-color)]" editor-id="config.zelleThankYou.emailSentDescription">
                {t(
                  config?.zelleThankYou?.emailSentDescription,
                  'A confirmation email with your order details and Zelle payment instructions has been sent to <b>{email}</b>.',
                  {
                    email: customerEmail,
                    b: (chunks) => <strong>{String(chunks).replace('{email}', customerEmail || '')}</strong>,
                  },
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
ZellePaymentInstructions.displayName = 'ZellePaymentInstructions';

/** Amber badge shown at the bottom of the order summary sidebar. */
export const ZellePaymentStatusBadge = memo(() => {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  return (
    <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-center">
      <span className="text-sm font-medium text-amber-700" editor-id="config.zelleThankYou.awaitingPayment">
        {t(config?.zelleThankYou?.awaitingPayment, 'Awaiting Zelle Payment')}
      </span>
    </div>
  );
});
ZellePaymentStatusBadge.displayName = 'ZellePaymentStatusBadge';
