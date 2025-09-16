

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sortOptions } from '@/lib/shopify/constants';
import { useSearchParams } from 'react-router';
import { useTagataConfig } from '@/hooks/use-tagata-config';

interface SortDropdownProps {
  className?: string;
}

export function SortDropdown({ className }: SortDropdownProps) {
  const [params, setParams] = useSearchParams();
  const { content } = useTagataConfig();
  
  const sortByText = content.getText('sortBy');

  return (
    <Select value={params.get('sort') ?? undefined} onValueChange={(value) => setParams({ sort: value })}>
      <SelectTrigger
        size="sm"
        className={cn(
          'justify-self-end -mr-3 font-medium bg-transparent border-none shadow-none md:w-32 hover:bg-muted/50',
          className
        )}
      >
        <SelectValue placeholder={sortByText} />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          <div className="flex justify-between items-center pr-1">
            <SelectLabel className="text-xs">Sort</SelectLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-1 h-5 text-xs text-muted-foreground"
              onClick={() => setParams({ sort: "" })}
            >
              Clear
            </Button>
          </div>
          <SelectSeparator />
          {sortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
