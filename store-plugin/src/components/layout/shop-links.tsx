import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { useTagataConfig } from '@/hooks/use-tagata-config';
import type { Product } from '@/storage/cart/types';

interface ShopLinksProps {
  products: Array<Product>;
  align?: 'left' | 'right';
  label?: string;
  className?: string;
}

export function ShopLinks({ products, label, align = 'left', className }: ShopLinksProps) {
  const { content } = useTagataConfig();
  const defaultLabel = content.getText('shop');
  const displayLabel = label || defaultLabel;
  return (
    <div className={cn(align === 'right' ? 'text-right' : 'text-left', className)}>
      <h4 className="text-lg font-extrabold md:text-xl">{displayLabel}</h4>

      <ul className="flex flex-col gap-1.5 leading-5 mt-5">
        {products.map((item, index) => (
          <li key={`${item.name}-${index}`}>
            <Link to={`/shop/${item.id}`} prefetch="viewport">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
