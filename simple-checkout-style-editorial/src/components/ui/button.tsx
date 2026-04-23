import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * Buttons — Swiss/editorial flavor.
 * No gradients, no soft drop shadows. The primary is a solid tinted brand color
 * with a single crisp outline-on-focus. Active state is a subtle depression via
 * opacity only. Avoid rounded pills — 4px radius reinforces the "document" feel.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-[4px] text-[14px] font-semibold tracking-[-0.005em]',
    'transition-[background-color,border-color,color,opacity] duration-100 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--primary-color,var(--brand))]',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary-color,var(--brand))] text-[var(--brand-ink,white)] hover:opacity-95 active:opacity-90',
        destructive:
          'bg-[var(--danger,oklch(54%_0.17_25))] text-white hover:opacity-95 active:opacity-90',
        outline:
          'border border-[var(--line-strong,#d4d4d8)] bg-transparent text-[var(--ink-900)] hover:bg-[var(--surface-alt)] hover:border-[var(--ink-500)]',
        secondary:
          'bg-[var(--surface-sunk)] text-[var(--ink-900)] hover:bg-[var(--line)]',
        ghost:
          'text-[var(--ink-700)] hover:bg-[var(--surface-sunk)] hover:text-[var(--ink-900)]',
        link:
          'text-[var(--ink-900)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3.5 text-[13px]',
        lg: 'h-[52px] px-7 text-[15px] font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={{ fontFamily: 'var(--font-body)' }}
      {...props}
    />
  );
}

export { Button, buttonVariants };
