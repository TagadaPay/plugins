import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * ARCADE STYLE buttons — Y2K jelly pills.
 *
 * Primary CTA is a fully-pilled peach pill with a subtle holo
 * gradient rim (the one sparkle moment), deep-plum label, and a
 * glossy inner highlight. Motion uses a 140ms overshoot cubic-
 * bezier to give a soft "jelly press" feel. Never use shadow-lg;
 * it's all about the inner highlight + outer soft glow.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-full text-[14px] font-semibold tracking-[-0.005em]',
    'transition-[transform,box-shadow,background-color] duration-[140ms]',
    '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--blue-500,#3A5BFF)] focus-visible:ring-offset-[var(--surface)]',
    'disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          [
            'text-[var(--brand-ink,#2A1F4D)]',
            'bg-[var(--primary-color,var(--peach-500))]',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_4px_16px_rgba(255,155,143,0.28)]',
            'hover:-translate-y-[2px] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_8px_22px_rgba(255,155,143,0.38)]',
            'active:translate-y-[0.5px] active:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_2px_8px_rgba(255,155,143,0.25)]',
          ].join(' '),
        destructive:
          [
            'text-white',
            'bg-[#E43B6B]',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_4px_14px_rgba(228,59,107,0.3)]',
            'hover:-translate-y-[2px] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_8px_22px_rgba(228,59,107,0.4)]',
            'active:translate-y-[0.5px]',
          ].join(' '),
        outline:
          [
            'text-[var(--plum-900)]',
            'bg-[var(--lav-200)] border border-[var(--lav-400)]',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]',
            'hover:-translate-y-[1px] hover:bg-[var(--lav-100)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_4px_12px_rgba(42,31,77,0.08)]',
            'active:translate-y-[0.5px]',
          ].join(' '),
        secondary:
          [
            'text-white',
            'bg-[var(--blue-500,#3A5BFF)]',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_4px_16px_rgba(58,91,255,0.32)]',
            'hover:-translate-y-[2px] hover:bg-[var(--blue-600,#2F4BE0)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_8px_22px_rgba(58,91,255,0.42)]',
            'active:translate-y-[0.5px]',
          ].join(' '),
        ghost:
          [
            'text-[var(--plum-700)]',
            'hover:bg-[var(--lav-200)] hover:text-[var(--plum-900)]',
          ].join(' '),
        link:
          [
            'text-[var(--blue-500)] underline underline-offset-4 decoration-[var(--blue-500)]',
            'hover:text-[var(--blue-600)] hover:decoration-[var(--peach-500)]',
          ].join(' '),
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-[13px]',
        lg: 'h-14 px-8 text-[15px] font-semibold',
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
