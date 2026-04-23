import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * TEALER STYLE buttons — neobrutalist streetwear.
 *
 * Every button is a fully-pilled chunky chip with a 2px black border and a
 * hard 3×3 black drop-shadow. On hover the button nudges up-left (−1px) to
 * "press" into the shadow; on active it nudges all the way in and the shadow
 * collapses. Primary is acid-lime neon on pure black text — that contrast is
 * the entire brand.
 *
 * NO gradients. NO soft shadows. NO border-radius less than 999px for CTAs.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-full text-[14px] font-semibold tracking-[-0.005em]',
    'transition-[transform,box-shadow,background-color,color] duration-75 ease-linear',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0',
    'select-none',
    'border-2 border-[var(--ink-900,#000)]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          [
            'bg-[var(--primary-color,var(--neon-lime))] text-[var(--ink-900,#000)]',
            'shadow-[3px_3px_0_0_var(--ink-900,#000)]',
            'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--ink-900,#000)]',
            'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--ink-900,#000)]',
          ].join(' '),
        destructive:
          [
            'bg-[var(--hot-pink,#FF2E88)] text-white',
            'shadow-[3px_3px_0_0_var(--ink-900,#000)]',
            'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--ink-900,#000)]',
            'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--ink-900,#000)]',
          ].join(' '),
        outline:
          [
            'bg-white text-[var(--ink-900,#000)]',
            'shadow-[3px_3px_0_0_var(--ink-900,#000)]',
            'hover:bg-[var(--brand-tint,#F5FFCC)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--ink-900,#000)]',
            'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--ink-900,#000)]',
          ].join(' '),
        secondary:
          [
            'bg-[var(--ink-900,#000)] text-white',
            'shadow-[3px_3px_0_0_var(--neon-lime,#C8FF00)]',
            'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--neon-lime,#C8FF00)]',
            'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--neon-lime,#C8FF00)]',
          ].join(' '),
        ghost:
          [
            'border-transparent text-[var(--ink-900)]',
            'shadow-none',
            'hover:bg-[var(--surface-alt)] hover:text-[var(--ink-900)]',
          ].join(' '),
        link:
          [
            'border-transparent text-[var(--ink-900)] underline-offset-4',
            'shadow-none',
            'hover:underline',
          ].join(' '),
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-[13px]',
        lg: 'h-14 px-8 text-[15px] font-bold uppercase tracking-[0.04em]',
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
