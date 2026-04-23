import { cn } from '@/lib/utils';
import * as React from 'react';

function Input({ className, type, style, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full rounded-[4px] border border-[var(--line-strong,#d4d4d8)] bg-[var(--surface,white)] px-3 py-2',
        'text-[15px] text-[var(--text-color)]',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-[var(--ink-400)]',
        'focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-[border-color,box-shadow] duration-100',
        className,
      )}
      style={{ fontFamily: 'var(--font-body)', ...style }}
      {...props}
    />
  );
}

export { Input };
