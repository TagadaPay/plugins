'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  'data-address-field'?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  error = false,
  disabled = false,
  className,
  ...props
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          'w-full justify-between',
          error && 'border-red-500 focus:ring-red-500',
          !value && 'text-muted-foreground',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        onClick={() => !disabled && setOpen(!open)}
        {...props}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border shadow-md">
          <div className="p-2">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground px-3 py-2 text-sm">No option found.</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'hover:bg-accent hover:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none',
                    value === option.value && 'bg-accent text-accent-foreground',
                  )}
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                    setSearchValue('');
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')}
                  />
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
