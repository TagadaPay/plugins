import {
  Select as GenericSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

interface Select<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  disabled?: boolean;
  blockChange?: boolean;
  error?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  choices: { value: string; label: string }[];
  'editor-id'?: string;
}

function Select<T extends FieldValues>({
  name,
  control,
  choices,
  disabled,
  blockChange,
  error,
  placeholder,
  searchable,
  searchPlaceholder,
  'editor-id': editorId,
}: Select<T>) {
  const { field } = useController({ name, control });
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredChoices = useMemo(() => {
    if (!searchable || !search) return choices;
    const needle = search.toLowerCase();
    return choices.filter(({ label }) => label.toLowerCase().includes(needle));
  }, [choices, search, searchable]);

  // Reset search when dropdown closes (value changes or unmounts)
  useEffect(() => {
    setSearch('');
  }, [field.value]);

  // Refocus search input after filtering (Radix steals focus when items change)
  useEffect(() => {
    if (search && searchInputRef.current) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [filteredChoices]);

  return (
    <div>
      <GenericSelect
        key={name}
        value={field.value}
        onValueChange={(value) => {
          if (!!!blockChange) {
            field.onChange(value);
          }
          setSearch('');
        }}
        disabled={disabled}
        onOpenChange={(open) => {
          if (!open) setSearch('');
          if (open && searchable) {
            // Skip auto-focus on touch devices — focusing the search input triggers
            // the virtual keyboard which resizes the viewport and causes Radix to
            // immediately close the dropdown.
            const isTouch = window.matchMedia('(pointer: coarse)').matches;
            if (!isTouch) {
              setTimeout(() => searchInputRef.current?.focus(), 0);
            }
          }
        }}
      >
        <SelectTrigger
          id={name}
          ref={field.ref}
          className={cn('h-12 px-4 text-base', { 'border-red-500': error })}
          editor-id={editorId}
        >
          <SelectValue className="placeholder:text-muted-foreground" placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent hideScrollButtons={searchable}>
          {searchable && (
            <div className="sticky top-0 z-10 bg-[var(--background-color)] p-2" onKeyDown={(e) => e.stopPropagation()}>
              <input
                ref={searchInputRef}
                type="text"
                className="w-full rounded-md border border-[var(--border-color)] bg-[var(--background-color)] px-3 py-2 text-sm outline-none focus:border-[var(--primary-color)]"
                placeholder={searchPlaceholder || 'Search...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {filteredChoices.map(({ label, value }) => (
            <SelectItem id={`${name}-${value}`} key={value} value={value}>
              {label}
            </SelectItem>
          ))}
          {searchable && filteredChoices.length === 0 && (
            <div className="px-8 py-4 text-center text-sm text-gray-500">No results found</div>
          )}
        </SelectContent>
      </GenericSelect>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default Select;
