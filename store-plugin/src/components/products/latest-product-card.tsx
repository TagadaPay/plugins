import { cn } from '@/lib/utils';
import { FeaturedProductLabel } from './featured-product-label';
import { Link } from 'react-router';
import type { ProductVariant } from '@/storage/cart/types';

interface LatestProductCardProps {
  product: ProductVariant;
  principal?: boolean;
  className?: string;
  labelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function LatestProductCard({
  product,
  principal = false,
  className,
  labelPosition = 'bottom-right',
}: LatestProductCardProps) {

  if (principal) {
    return (
      <div className={cn('min-h-fold flex flex-col relative', className)}>
        <Link to={`/product/${product.id}`} className="size-full flex-1 flex flex-col" prefetch="viewport">
          <img
            src={product.imageUrl}
            alt={product.name}
            width={1000}
            height={100}
            className="object-cover size-full flex-1"
          />
        </Link>
        <div className="absolute bottom-0 left-0 grid w-full grid-cols-4 gap-6 pointer-events-none max-md:contents p-sides">
          <FeaturedProductLabel
            className="col-span-3 col-start-2 pointer-events-auto 2xl:col-start-3 2xl:col-span-2 shrink-0"
            product={product}
            principal
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Link to={`/product/${product.id}`} className="block w-full aspect-square" prefetch="viewport">
        <img
          src={product.imageUrl}
          alt={product.name}
          width={1000}
          height={100}
          className="object-cover size-full"
        />
      </Link>

      <div
        className={cn(
          'absolute flex p-sides inset-0 items-end justify-end',
          labelPosition === 'top-left' && 'md:justify-start md:items-start',
          labelPosition === 'top-right' && 'md:justify-end md:items-start',
          labelPosition === 'bottom-left' && 'md:justify-start md:items-end',
          labelPosition === 'bottom-right' && 'md:justify-end md:items-end'
        )}
      >
        <FeaturedProductLabel product={product} />
      </div>
    </div>
  );
}
