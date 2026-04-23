import { Input as AppInput } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ error, className, ...rest }, ref) => {
  return (
    <div>
      <AppInput
        ref={ref}
        {...rest}
        className={cn(
          'h-11 px-3 text-[15px]',
          {
            'border-[var(--danger)] focus-within:border-[var(--danger)] focus:border-[var(--danger)] focus-visible:border-[var(--danger)]':
              error,
          },
          className,
        )}
      />
      {error && (
        <p
          className="mt-1.5 text-[12px] font-medium text-[var(--danger)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
