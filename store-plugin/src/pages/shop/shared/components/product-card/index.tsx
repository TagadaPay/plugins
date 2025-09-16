import { Suspense } from 'react';
import type { ProductVariant } from '@/storage/cart/types';
import { AddToCart, AddToCartButton } from '@/components/cart/add-to-cart';
import { ProductImage } from './product-image';
import { Link } from 'react-router';
import { useCurrency } from '@tagadapay/plugin-sdk/react';

export const ProductCard = ({ product }: { product: ProductVariant }) => {
  const { format, code } = useCurrency();
  const price = (product.prices.find((p) => p.currencyOptions[code])?.currencyOptions[code].amount || 0) / 100;
  return (
    <div className="relative w-full aspect-[3/4] md:aspect-square bg-muted group overflow-hidden">
      <Link
        to={`/product/${product.id}`}
        className="block size-full focus-visible:outline-none"
        aria-label={`View details for ${product.name}, price ${product.prices.find((p) => p.currencyOptions[code])?.currencyOptions[code].amount || 0}`}
        prefetch="viewport"
      >
        <Suspense fallback={null}>
          <ProductImage product={product} />
        </Suspense>
      </Link>

      {/* Interactive Overlay */}
      <div className="absolute inset-0 p-2 w-full pointer-events-none">
        <div className="flex gap-6 justify-between items-baseline px-3 py-1 w-full font-semibold transition-all duration-300 translate-y-0 max-md:hidden group-hover:opacity-0 group-focus-visible:opacity-0 group-hover:-translate-y-full group-focus-visible:-translate-y-full">
          <p className="text-sm uppercase 2xl:text-base text-balance">{product.name}</p>
          <div className="flex gap-2 items-center text-sm uppercase 2xl:text-base">
            {format(price)}
            {/* {product.compareAtPrice && (
              <span className="line-through opacity-30">
                {formatPrice(product.compareAtPrice.amount, product.compareAtPrice.currencyCode)}
              </span>
            )} */}
          </div>
        </div>

        <div className="flex absolute inset-x-3 bottom-3 flex-col gap-8 px-2 py-3 rounded-md transition-all duration-300 pointer-events-none bg-popover md:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 md:translate-y-1/3 group-hover:translate-y-0 group-focus-visible:translate-y-0 group-hover:pointer-events-auto group-focus-visible:pointer-events-auto max-md:pointer-events-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 items-end">
            <p className="text-lg font-semibold text-pretty">{product.name}</p>
            <div className="flex gap-2 items-center place-self-end text-lg font-semibold">
              {format(price)}
              {/* {product.compareAtPrice && (
                <span className="text-base line-through opacity-30">
                  {formatPrice(product.compareAtPrice.amount, product.compareAtPrice.currencyCode)}
                </span>
              )} */}
            </div>
            {/* <Suspense fallback={null}>
              <div className="self-center">
                <VariantSelector product={product} />
              </div>
            </Suspense> */}

            <Suspense fallback={<AddToCartButton className="col-start-2" product={product} size="sm" />}>
              <AddToCart className="col-start-2" size="sm" product={product} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};
