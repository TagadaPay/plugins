import { cn } from '@/lib/utils';
import React from 'react';

export interface SectionHeaderProps {
  title: string;
  titleEditorId?: string;
  description?: string;
  descriptionEditorId?: string;
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
  /** Optional step number to render as an eyebrow above the title (1, 2, 3…). */
  step?: number;
  /** Optional eyebrow label override. Defaults to "STEP {step}". */
  eyebrowLabel?: string;
}

export function SectionHeader({
  title,
  description,
  titleEditorId,
  descriptionEditorId,
  action,
  className,
  titleClassName,
  descriptionClassName,
  spacing = 'normal',
  step,
  eyebrowLabel,
}: SectionHeaderProps) {
  const spacingClasses = {
    compact: 'mb-3',
    normal: 'mb-5',
    relaxed: 'mb-6',
  };

  const descriptionSpacingClasses = {
    compact: 'mt-1',
    normal: 'mt-1.5',
    relaxed: 'mt-2',
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {(step || eyebrowLabel) && (
        <div className="eyebrow mb-3">
          {step !== undefined && (
            <span className="eyebrow-step">{String(step).padStart(2, '0')}</span>
          )}
          {eyebrowLabel && <span>{eyebrowLabel}</span>}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <h2
          className={cn(
            'font-[var(--font-display)] text-[var(--text-color)]',
            'text-[22px] sm:text-[24px] font-medium tracking-[-0.025em] leading-[1.15]',
            titleClassName,
          )}
          style={{ fontFamily: 'var(--font-display)' }}
          editor-id={titleEditorId}
        >
          {title}
        </h2>
        {action && (
          <div
            className="shrink-0 text-[13px] font-medium text-[var(--text-secondary-color)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {action}
          </div>
        )}
      </div>
      {description && (
        <p
          className={cn(
            'max-w-[58ch] text-[var(--text-secondary-color)] text-[13.5px] leading-[1.55]',
            descriptionSpacingClasses[spacing],
            descriptionClassName,
          )}
          style={{ fontFamily: 'var(--font-body)' }}
          editor-id={descriptionEditorId}
        >
          {description}
        </p>
      )}
    </div>
  );
}
