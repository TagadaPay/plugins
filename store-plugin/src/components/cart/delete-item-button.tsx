import { Button } from '../ui/button';
import type { ProductVariant } from '@/storage/cart/types';
import { useCart } from '@/hooks/use-cart';
import { useCurrency } from '@tagadapay/plugin-sdk/react';
import { useTagataConfig } from '@/hooks/use-tagata-config';

export function DeleteItemButton({ variant }: { variant: ProductVariant }) {
  const { updateProductQuantity } = useCart();
  const { code } = useCurrency();
  const { content } = useTagataConfig();
  
  const removeText = content.getText('remove');

  return (
    <form
      className="-mr-1 -mb-1 opacity-70"
      onSubmit={e => {
        e.preventDefault();

        const priceId = variant.prices.find((p) => p.currencyOptions[code])?.id;

        if (!priceId) return;
        updateProductQuantity(variant.productId, variant.id, priceId, 0);
      }}
    >
      <Button type="submit" size="sm" variant="ghost" aria-label="Remove item" className="px-2 text-sm">
        {removeText}
      </Button>
    </form>
  );
}
