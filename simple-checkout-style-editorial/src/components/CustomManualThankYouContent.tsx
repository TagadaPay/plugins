import { memo } from 'react';

export type ManualPaymentSnapshot = {
  displayName?: string;
  logoUrl?: string;
  thankYouTitle?: string;
  thankYouSubtitle?: string;
  thankYouBody?: string;
  thankYouBadgeLabel?: string;
};

interface CustomManualThankYouContentProps {
  snapshot: ManualPaymentSnapshot;
  orderNumber: string;
  customerEmail?: string | null;
}

/** Thank-you body for custom_payment integrations (copy from payment metadata snapshot). */
export const CustomManualThankYouContent = memo(
  ({ snapshot, orderNumber, customerEmail }: CustomManualThankYouContentProps) => {
    const body = (snapshot.thankYouBody ?? '')
      .replace(/\{orderNumber\}/g, orderNumber)
      .replace(/\{email\}/g, customerEmail ?? '');

    return (
      <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/80 p-6">
        {snapshot.logoUrl ? (
          <div className="flex justify-center">
            <img src={snapshot.logoUrl} alt="" className="h-12 max-w-[200px] object-contain" />
          </div>
        ) : null}
        {snapshot.displayName ? (
          <h3 className="text-center text-lg font-semibold text-[var(--text-color)]">{snapshot.displayName}</h3>
        ) : null}
        {body ? (
          <p className="whitespace-pre-wrap text-sm text-[var(--text-color)]">{body}</p>
        ) : null}
      </div>
    );
  },
);

CustomManualThankYouContent.displayName = 'CustomManualThankYouContent';
