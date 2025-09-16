import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { AddToCart, AddToCartButton } from '../cart/add-to-cart';
import { Suspense } from 'react';
import { Link } from 'react-router';
import type { ProductVariant } from '@/storage/cart/types';
import { useCurrency } from '@tagadapay/plugin-sdk/react';

export function FeaturedProductLabel({
  product,
  principal = false,
  className,
}: {
  product: ProductVariant;
  principal?: boolean;
  className?: string;
}) {
  const { format, code } = useCurrency();
  
  if (principal) {
    return (
      <div
        className={cn(
          'flex flex-col grid-cols-2 gap-y-3 p-4 w-full bg-white md:w-fit md:rounded-md md:grid',
          className
        )}
      >
        <div className="col-span-2">
          <Badge className="font-black capitalize rounded-full">Best Seller</Badge>
        </div>
        <Link to={`/product/${product.id}`} className="col-span-1 self-start text-2xl font-semibold">
          {product.name}
        </Link>
        <div className="col-span-1 mb-10">
          {/* {product.tags.length > 0 ? (
            <p className="mb-3 text-sm italic font-medium">{product.tags.join('. ')}</p>
          ) : null} */}
          <p className="text-sm font-medium line-clamp-3">{product.description}</p>
        </div>
        <div className="flex col-span-1 gap-3 items-center text-2xl font-semibold md:self-end">
          {format(product.prices[0]?.currencyOptions[code]?.amount / 100)}
          {/* {product.prices[0]?.currencyOptions["USD"]?.amount && (
            <span className="line-through opacity-30">${Number(product.prices[0]?.currencyOptions["USD"]?.amount) / 100}</span>
          )} */}
        </div>
        <Suspense
          fallback={<AddToCartButton className="flex gap-20 justify-between pr-2" size="lg" product={product} />}
        >
          <AddToCart className="flex gap-20 justify-between pr-2" size="lg" product={product} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2 items-center p-2 pl-8 bg-white rounded-md max-w-full', className)}>
      <div className="pr-6 leading-4 overflow-hidden">
        <Link
          to={`/product/${product.id}`}
          className="inline-block w-full truncate text-base font-semibold opacity-80 mb-1.5"
        >
          {product.name}
        </Link>
        <div className="flex gap-2 items-center text-base font-semibold">
          {format(product.prices[0]?.currencyOptions[code]?.amount / 100)}
          {/* {product.prices[0]?.currencyOptions["USD"]?.amount && (
            <span className="line-through opacity-30">${Number(product.prices[0]?.currencyOptions["USD"]?.amount) / 100}</span>
          )} */}
        </div>
      </div>
      <Suspense fallback={<AddToCartButton product={product} iconOnly variant="default" size="icon-lg" />}>
        <AddToCart product={product} iconOnly variant="default" size="icon-lg" />
      </Suspense>
    </div>
  );
}
