
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link, useParams } from 'react-router';
import { useCart } from '@/hooks/use-cart';

interface ShopBreadcrumbProps {
  className?: string;
}

export function ShopBreadcrumb({ className }: ShopBreadcrumbProps) {
  const params = useParams<{ productId: string }>();
  const { products } = useCart();
  const targetProduct = products.find(p => p.id === params.productId);  

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem className="cursor-pointer text-foreground/50 hover:text-foreground/70">
          <Link to="/shop" className="font-semibold">
            Shop
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbPage className="font-semibold">{targetProduct?.name || 'All'}</BreadcrumbPage>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
