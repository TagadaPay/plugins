import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * SOLAR STYLE buttons — risograph / zine.
 *
 * Primary CTA is a tomato-red stamp with cream label, 2px
 * charcoal border, and a 3×3 offset charcoal "stamp" shadow.
 * On hover: the button slides -1px up-left (pressing into the
 * shadow), on active: collapses onto the shadow. Motion is 100ms
 * linear — the same cadence as flipping through a zine.
 *
 * NO gradients, NO soft shadows, NO pills. 2px radius only.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-[2px] text-[13.5px] font-semibold tracking-[0.02em] uppercase',
    'transition-[transform,box-shadow,background-color,color] duration-100 ease-linear',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0',
    'select-none',
    'border-2 border-[var(--char-900,#1A1915)]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          [
            'bg-[var(--primary-color,var(--tomato-500))] text-[var(--brand-ink,#FDF8E7)]',
            'shadow-[3px_3px_0_0_var(--char-900,#1A1915)]',
            'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--char-900,#1A1915)] hover:bg-[var(--tomato-600,#BA3527)]',
            'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--char-900,#1A1915)]',
          ].join(' '),
        destructive:
          [
            'bg-[var(--tomato-600,#BA3527)] text-[var(--cream-800,#FDF8E7)]',
            'shadow-[3px_3px_0_0_var(--char-900,#1A1915)]',
            'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--char-900,#1A1915)]',
            'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--char-900,#1A1915)]',
          ].join(' '),
        outline:
          [
            'bg-[var(--cream-800,#FDF8E7)] text-[var(--ink-900)]',
            'shadow-[3px_3px_0_0_var(--char-900,#1A1915)]',
            'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--char-900,#1A1915)] hover:bg-[var(--cream-700)]',
            'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--char-900,#1A1915)]',
          ].join(' '),
        secondary:
          [
            'bg-[var(--cobalt-500,#2E4BD2)] text-[var(--cream-800,#FDF8E7)]',
            'shadow-[3px_3px_0_0_var(--char-900,#1A1915)]',
            'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--char-900,#1A1915)] hover:bg-[var(--cobalt-700,#1E3BB8)]',
            'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--char-900,#1A1915)]',
          ].join(' '),
        ghost:
          [
            'border-transparent text-[var(--ink-900)]',
            'shadow-none normal-case tracking-normal',
            'hover:bg-[var(--cream-700)]',
          ].join(' '),
        link:
          [
            'border-transparent text-[var(--cobalt-500,#2E4BD2)] underline underline-offset-[5px] decoration-2 decoration-[var(--cobalt-500,#2E4BD2)]',
            'shadow-none normal-case tracking-normal',
            'hover:text-[var(--cobalt-700)] hover:decoration-[var(--tomato-500)]',
          ].join(' '),
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-[12px]',
        lg: 'h-[54px] px-8 text-[15px] font-bold',
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
