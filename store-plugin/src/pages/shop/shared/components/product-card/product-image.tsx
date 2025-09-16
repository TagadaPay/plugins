

import type { ProductVariant } from '@/storage/cart/types';

export const ProductImage = ({ product }: { product: ProductVariant }) => {

  return (
    <img
      src={product.imageUrl}
      alt={product.name}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover size-full"
    />
  );
};
