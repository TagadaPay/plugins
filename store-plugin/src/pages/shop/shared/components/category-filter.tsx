import { cn } from '@/lib/utils';
import { useCategoryFilterCount } from '../hooks/use-filter-count';
import { Link, useParams } from 'react-router';
import type { Product } from '@/storage/cart/types';

interface CategoryFilterProps {
  products: Array<Product>
  className?: string;
}

export function CategoryFilter({ products, className }: CategoryFilterProps) {
  const { productId } = useParams<{ productId: string }>();

  const categoryCount = useCategoryFilterCount();

  return (
    <div className={cn('px-3 py-4 rounded-lg bg-muted', className)}>
      <h3 className="mb-4 font-semibold">
        Categories {categoryCount > 0 && <span className="text-foreground/50">({categoryCount})</span>}
      </h3>
      <ul className="flex flex-col gap-1">
        {products.map((p) => {
          const isSelected = p.id === productId;

          return (
            <li key={p.id}>
              <Link
                className={cn(
                  'flex w-full text-left transition-all transform cursor-pointer font-sm md:hover:translate-x-1 md:hover:opacity-80',
                  isSelected ? 'font-medium translate-x-1' : productId ? 'opacity-50' : ''
                )}
                to={`/shop/${p.id}`}
                aria-pressed={isSelected}
                aria-label={`Filter by category: ${p.name}`}
                prefetch="viewport"
              >
                {p.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
