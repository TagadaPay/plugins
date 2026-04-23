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
  /** Optional step number to render as a chunky pill above the title (1, 2, 3…). */
  step?: number;
  /** Optional eyebrow label override. */
  eyebrowLabel?: string;
}

/**
 * NEON STYLE SectionHeader — chunky streetwear masthead.
 * The step marker is a filled black pill with neon-lime number (mono font).
 * The title is all-caps Archivo Black, tight & heavy.
 */
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
    relaxed: 'mb-7',
  };

  const descriptionSpacingClasses = {
    compact: 'mt-1',
    normal: 'mt-2',
    relaxed: 'mt-3',
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
            'text-[var(--text-color)] uppercase',
            'text-[22px] sm:text-[26px] font-normal tracking-[-0.025em] leading-[1.05]',
            titleClassName,
          )}
          style={{ fontFamily: 'var(--font-display)' }}
          editor-id={titleEditorId}
        >
          {title}
        </h2>
        {action && (
          <div
            className="shrink-0 text-[13px] font-semibold text-[var(--ink-900)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {action}
          </div>
        )}
      </div>
      {description && (
        <p
          className={cn(
            'max-w-[58ch] text-[var(--text-secondary-color)] text-[14px] font-medium leading-[1.5]',
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
