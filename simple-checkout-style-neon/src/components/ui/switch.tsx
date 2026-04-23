'use client';

import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-[var(--line-strong)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary-color,var(--brand))] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--primary-color,var(--brand))]',
      className,
    )}
    {...props}
    ref={ref}
    data-slot="switch"
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-white ring-0 transition-transform data-[state=checked]:translate-x-[17px] data-[state=unchecked]:translate-x-[2px]',
      )}
      data-slot="switch-thumb"
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
