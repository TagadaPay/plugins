

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { CategoryFilter } from './category-filter';
import { useFilterCount } from '../hooks/use-filter-count';
import { ResultsCount } from './results-count';
import { SortDropdown } from './sort-dropdown';
import { Link } from 'react-router';
import type { Product } from '@/storage/cart/types';
// import { ColorFilter } from './color-filter';

interface MobileFiltersProps {
  products: Array<Product>;
  className?: string;
}

export function MobileFilters({ products, className }: MobileFiltersProps) {
  const filterCount = useFilterCount();

  return (
    <div className="pt-top-spacing bg-background md:hidden overflow-x-clip">
      <Drawer>
        {/* 3 main items: Filters, Results count, Sort by */}
        <div className="grid grid-cols-3 items-center px-4 py-3">
          {/* Filters */}
          <DrawerTrigger asChild>
            <Button variant="ghost" size="sm" className="justify-self-start text-sm font-semibold text-foreground">
              Filters {filterCount > 0 && <span className="text-foreground/50">({filterCount})</span>}
            </Button>
          </DrawerTrigger>

          {/* Results count */}
          <ResultsCount count={products.length} />

          {/* Sort by */}
          <SortDropdown className="justify-self-end" />
        </div>

        {/* Drawer content */}
        <DrawerContent className={cn('h-[80vh]', className)}>
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>
              Filters {filterCount > 0 && <span className="text-muted-foreground">({filterCount})</span>}
            </DrawerTitle>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                'font-medium text-foreground/50 hover:text-foreground/60 transition-opacity',
                filterCount === 0 && 'opacity-0 pointer-events-none'
              )}
              disabled={filterCount === 0}
              asChild={filterCount > 0}
            >
              <Link to="/shop" prefetch="viewport">
                Clear
              </Link>
            </Button>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-6">
            <CategoryFilter products={products} />
            {/* <ColorFilter products={originalProducts} /> */}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
