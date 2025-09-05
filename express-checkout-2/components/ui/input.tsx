import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'ring-offset-background file:text-foreground flex h-10 w-full rounded-md border border-[rgb(222,222,222)] bg-white px-3 py-2 text-base transition-all duration-200 ease-in-out file:bg-transparent file:text-sm file:font-medium placeholder:text-[rgb(156,163,175)] focus:ring-2 focus:ring-black focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
