

import { Minus, Plus } from 'lucide-react';
import clsx from 'clsx';
import type { ProductVariant } from '@/storage/cart/types';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@tagadapay/plugin-sdk/react';

function SubmitButton({ type }: { type: 'plus' | 'minus' }) {
  return (
    <button
      type="submit"
      aria-label={type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
      className={clsx(
        'ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80',
        {
          'ml-auto': type === 'minus',
        }
      )}
    >
      {type === 'plus' ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
    </button>
  );
}

export function EditItemQuantityButton({ variant, type }: { variant: ProductVariant; type: 'plus' | 'minus' }) {
  const { removeProduct, addProduct } = useCart();
  const { code } = useCurrency();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();

        const priceId = variant.prices.find((p) => p.currencyOptions[code])?.id;

        if (!priceId) return;

        switch (type) {
          case 'plus':
            addProduct(variant.productId, variant.id, priceId, 1);
            break;
          case 'minus':
            removeProduct(variant.productId, variant.id, priceId, 1);
            break;
        }        
      }}
    >
      <SubmitButton type={type} />
    </form>
  );
}
