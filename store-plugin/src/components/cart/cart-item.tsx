import { createUrl } from '@/lib/utils';
import { Link } from 'react-router';
import { DeleteItemButton } from './delete-item-button';
import { EditItemQuantityButton } from './edit-item-quantity-button';
import { type CheckoutLineItem, useCurrency } from '@tagadapay/plugin-sdk/react';
import { useCart } from '@/hooks/use-cart';
import type { ProductVariant, Product } from '@/storage/cart/types';

type MerchandiseSearchParams = {
  [key: string]: string;
};

interface CartItemProps {
  item: CheckoutLineItem;
  onCloseCart: () => void;
}

export function CartItemCard({ item, onCloseCart }: CartItemProps) {
  const merchandiseSearchParams = {} as MerchandiseSearchParams;

  const merchandiseUrl = createUrl(
    `/product/${item.variantId}`,
    new URLSearchParams(merchandiseSearchParams)
  );

  const { filterVariants } = useCart();
  const { format, code } = useCurrency();

  const foundResults = filterVariants((v) => v.id === item.variantId) as unknown as Array<{ variant: ProductVariant; product: Product }>;
  const found = foundResults?.[0];
  
  if (!found?.variant) {
    return (
      <div className="bg-popover rounded-lg p-2">
        <div className="flex flex-row gap-6">
          <div className="relative size-[120px] overflow-hidden rounded-sm shrink-0 bg-muted animate-pulse"></div>
          <div className="flex flex-col gap-2 2xl:gap-3 flex-1">
            <div className="flex flex-col justify-center">
              <span className="2xl:text-lg font-semibold text-muted-foreground">Product not available</span>
            </div>
            <p className="2xl:text-lg font-semibold text-muted-foreground">-</p>
            <div className="flex justify-between items-end mt-auto">
              <div className="flex h-8 flex-row items-center rounded-md border border-neutral-200">
                <span className="w-8 text-center text-sm">{item.quantity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const variant = found.variant;
  const price = variant.prices.find((p) => p.currencyOptions[code])?.currencyOptions[code];

  return (
    <div className="bg-popover rounded-lg p-2">
      <div className="flex flex-row gap-6">
        <div className="relative size-[120px] overflow-hidden rounded-sm shrink-0">
          <img
            className="size-full object-cover"
            width={240}
            height={240}
            alt={variant.name || 'Product image'}
            src={variant.imageUrl || '/placeholder.jpg'}
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-2 2xl:gap-3 flex-1">
          <Link to={merchandiseUrl} onClick={onCloseCart} className="z-30 flex flex-col justify-center">
            <span className="2xl:text-lg font-semibold">{variant.name}</span>
          </Link>
          <p className="2xl:text-lg font-semibold">
            {price ? format(price.amount / 100) : 'Price unavailable'}
          </p>
          <div className="flex justify-between items-end mt-auto">
            <div className="flex h-8 flex-row items-center rounded-md border border-neutral-200">
              <EditItemQuantityButton variant={variant} type="minus" />
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <EditItemQuantityButton variant={variant} type="plus" />
            </div>
            <DeleteItemButton variant={variant} />
          </div>
        </div>
      </div>
    </div>
  );
}
