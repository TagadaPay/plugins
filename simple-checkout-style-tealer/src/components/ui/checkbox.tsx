import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer h-[15px] w-[15px] shrink-0 rounded-[3px] border border-[var(--line-strong)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary-color,var(--brand))] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--primary-color,var(--brand))] data-[state=checked]:bg-[var(--primary-color,var(--brand))] data-[state=checked]:text-white',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        <CheckIcon className="h-3 w-3 text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
