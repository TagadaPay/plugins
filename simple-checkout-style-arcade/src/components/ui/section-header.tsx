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
  /** Optional step number rendered as a glossy pill above the title. */
  step?: number;
  /** Optional eyebrow label override. */
  eyebrowLabel?: string;
}

/**
 * ARCADE STYLE SectionHeader — Y2K candy masthead.
 * Step marker is a glossy pill with electric-blue mono number.
 * Title is wide display serif in deep plum with a peach-to-blue
 * gradient underline (the one sparkle per section).
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
            'text-[var(--text-color)]',
            'text-[24px] sm:text-[28px] font-medium tracking-[-0.02em] leading-[1.1]',
            titleClassName,
          )}
          style={{ fontFamily: 'var(--font-display)' }}
          editor-id={titleEditorId}
        >
          {title}
        </h2>
        {action && (
          <div
            className="shrink-0 text-[12px] font-semibold text-[var(--blue-500,#3A5BFF)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {action}
          </div>
        )}
      </div>
      {description && (
        <p
          className={cn(
            'max-w-[60ch] text-[var(--text-secondary-color)] text-[14px] leading-[1.58]',
            descriptionSpacingClasses[spacing],
            descriptionClassName,
          )}
          style={{ fontFamily: 'var(--font-body)' }}
          editor-id={descriptionEditorId}
        >
          {description}
        </p>
      )}
      {/* The one sparkle per section: soft holo gradient underline. */}
      <div
        aria-hidden
        className="mt-3 h-[3px] w-16 rounded-full"
        style={{ background: 'var(--holo-gradient)' }}
      />
    </div>
  );
}
