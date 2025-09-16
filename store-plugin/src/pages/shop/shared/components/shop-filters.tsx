

import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarLinks } from '@/components/layout/sidebar/product-sidebar-links';
import { CategoryFilter } from './category-filter';
import { useFilterCount } from '../hooks/use-filter-count';
import { Link } from 'react-router';
import type { Product } from '@/storage/cart/types';
import { useTagataConfig } from '@/hooks/use-tagata-config';
// import { ColorFilter } from './color-filter';

export function DesktopFilters({ products, className }: { products: Array<Product>; className?: string }) {
  const filterCount = useFilterCount();
  const { content } = useTagataConfig();
  
  const clearText = content.getText('close'); // Using 'close' as it's similar to 'clear'

  return (
    <aside className={cn('grid sticky top-0 grid-cols-3 h-screen pl-sides pt-top-spacing', className)}>
      <div className="flex flex-col col-span-3 xl:col-span-2 gap-4">
        <div className="flex justify-between items-baseline pl-2 -mb-2">
          <h2 className="text-2xl font-semibold">
            Filter {filterCount > 0 && <span className="text-foreground/50">({filterCount})</span>}
          </h2>
          <Button
            size={'sm'}
            variant="ghost"
            aria-label="Clear all filters"
            className="font-medium text-foreground/50 hover:text-foreground/60"
            asChild
          >
            <Link to="/shop" prefetch="viewport">
              {clearText}
            </Link>
          </Button>
        </div>
        <Suspense fallback={null}>
          <CategoryFilter products={products} />
          {/* <ColorFilter products={originalProducts} /> */}
        </Suspense>
      </div>

      <div className="col-span-3 self-end">
        <SidebarLinks className="flex-col-reverse py-sides" size="sm" />
      </div>
    </aside>
  );
}
