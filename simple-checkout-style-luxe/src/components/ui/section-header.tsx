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
  /** Optional step number rendered as a small-caps eyebrow (01, 02, 03). */
  step?: number;
  /** Optional eyebrow label override. */
  eyebrowLabel?: string;
}

/**
 * LUXE STYLE SectionHeader — boutique editorial header.
 * The step marker is a gold mono number preceded by a long dash.
 * The title is a display serif in forest-green with tight tracking.
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
    normal: 'mb-6',
    relaxed: 'mb-8',
  };

  const descriptionSpacingClasses = {
    compact: 'mt-1.5',
    normal: 'mt-2.5',
    relaxed: 'mt-3.5',
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {(step || eyebrowLabel) && (
        <div className="eyebrow mb-3.5">
          {step !== undefined && (
            <span className="eyebrow-step">{String(step).padStart(2, '0')}</span>
          )}
          {eyebrowLabel && <span>{eyebrowLabel}</span>}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <h2
          className={cn(
            'text-[var(--text-color)]',
            'text-[24px] sm:text-[28px] font-normal tracking-[-0.02em] leading-[1.12]',
            titleClassName,
          )}
          style={{ fontFamily: 'var(--font-display)' }}
          editor-id={titleEditorId}
        >
          {title}
        </h2>
        {action && (
          <div
            className="shrink-0 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary-color)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {action}
          </div>
        )}
      </div>
      {description && (
        <p
          className={cn(
            'max-w-[60ch] text-[var(--text-secondary-color)] text-[14px] leading-[1.6]',
            descriptionSpacingClasses[spacing],
            descriptionClassName,
          )}
          style={{ fontFamily: 'var(--font-body)' }}
          editor-id={descriptionEditorId}
        >
          {description}
        </p>
      )}
      {/* Hairline rule under the header — the single ornament. */}
      <div
        aria-hidden
        className="mt-4 h-px w-12"
        style={{ backgroundColor: 'var(--gold-500, #C7A15C)' }}
      />
    </div>
  );
}
