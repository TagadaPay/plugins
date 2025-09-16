import type { Product } from '@/storage/cart/types';
import { ShopLinks } from '../shop-links';
import { useTagataConfig } from '@/hooks/use-tagata-config';

interface HomeSidebarProps {
  products: Array<Product>;
}

export function HomeSidebar({ products }: HomeSidebarProps) {
  const { content } = useTagataConfig();
  
  const heroQuote = content.getText('heroQuote');
  const descriptionLines = content.getTextArray('descriptionLines');

  return (
    <aside className="max-md:hidden col-span-4 h-screen sticky top-0 p-sides pt-top-spacing flex flex-col justify-between">
      <div>
        <p className="italic tracking-tighter text-base">{heroQuote}</p>
        <div className="mt-5 text-base leading-tight">
          {descriptionLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
      <ShopLinks products={products} />
    </aside>
  );
}
