import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * LUXE STYLE buttons — boutique / atelier.
 *
 * The primary CTA is an aged-gold rectangle with forest-green
 * text — almost square (2px radius), thin hairline border,
 * no drop shadow, no gradient. On hover the fill darkens one
 * step; on press the fill darkens further and the label shifts
 * by 0.5px. It should feel like pressing the clasp of a
 * leather-bound portfolio, not a website button.
 *
 * NO pills. NO gradients. NO soft shadows. NO emoji.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-[2px] text-[13.5px] font-medium tracking-[0.04em] uppercase',
    'transition-[background-color,border-color,color,letter-spacing] duration-[160ms] ease-out',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-color,var(--brand))]',
    'focus-visible:ring-offset-[var(--surface)]',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          [
            'bg-[var(--primary-color,var(--brand))] text-[var(--brand-ink,#1F2A22)]',
            'border border-[var(--brand-hover,#B38A44)]',
            'hover:bg-[var(--brand-hover,#B38A44)] hover:tracking-[0.06em]',
            'active:bg-[color-mix(in_oklab,var(--brand-hover,#B38A44)_85%,#1F2A22)]',
          ].join(' '),
        destructive:
          [
            'bg-[var(--danger,#A64336)] text-[#FBF8EF]',
            'border border-[var(--danger,#A64336)]',
            'hover:opacity-95',
          ].join(' '),
        outline:
          [
            'border border-[var(--line-strong,#C9BFA4)] bg-transparent text-[var(--ink-900)]',
            'hover:bg-[var(--surface-alt)] hover:border-[var(--ink-700)]',
          ].join(' '),
        secondary:
          [
            'bg-[var(--surface-alt)] text-[var(--ink-900)]',
            'border border-[var(--line-strong)]',
            'hover:bg-[var(--surface-sunk)]',
          ].join(' '),
        ghost:
          [
            'text-[var(--ink-700)] border border-transparent',
            'hover:bg-[var(--surface-alt)] hover:text-[var(--ink-900)]',
          ].join(' '),
        link:
          [
            'text-[var(--ink-900)] underline underline-offset-[5px] decoration-[var(--bronze-500)] decoration-1',
            'hover:decoration-[var(--gold-500)]',
            'normal-case tracking-normal',
          ].join(' '),
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-[12px]',
        lg: 'h-[54px] px-8 text-[14px] font-semibold',
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
