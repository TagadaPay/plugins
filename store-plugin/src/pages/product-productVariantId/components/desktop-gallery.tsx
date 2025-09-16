import type { ProductVariant } from '@/storage/cart/types';


export const DesktopGallery = ({ product }: { product: ProductVariant }) => {
  return (
    <img
      src={product.imageUrl}
      alt={product.name}
      className="w-full object-cover"
    />
  );
};
