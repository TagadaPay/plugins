import { cn } from '@/lib/utils';
import { ShopBreadcrumb } from './shop-breadcrumb';
import { ResultsCount } from './results-count';
import { SortDropdown } from './sort-dropdown';
import type { ProductVariant } from '@/storage/cart/types';

export default function ResultsControls({
  products,
  className,
}: {
  products: Array<ProductVariant>;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-3 items-center mb-1 w-full pr-sides', className)}>
      {/* Breadcrumb */}
      <ShopBreadcrumb className="ml-1" />

      {/* Results count */}
      <ResultsCount count={products.length} />

      {/* Sort dropdown */}
      <SortDropdown />
    </div>
  );
}
