import { Suspense } from 'react';
import { DesktopFilters } from '@/pages/shop/shared/components/shop-filters';
import { PageLayout } from '@/components/layout/page-layout';
import { MobileFilters } from '@/pages/shop/shared/components/mobile-filters';
import { ProductsProvider } from '@/pages/shop/shared/providers/products-provider';
import { Outlet } from 'react-router';
import { useCart } from '@/hooks/use-cart';

export default function ShopLayout() {
  const { products } = useCart();

  return (
    <PageLayout>
      <ProductsProvider>
        <div className="flex flex-col md:grid grid-cols-12 md:gap-sides">
          <Suspense fallback={<div className="col-span-3 max-md:hidden h-64 bg-muted rounded-md animate-pulse" />}>
            <DesktopFilters products={products} className="col-span-3 max-md:hidden" />
          </Suspense>
          <Suspense fallback={null}>
            <MobileFilters products={products} />
          </Suspense>
          <div className="col-span-9 flex flex-col h-full md:pt-top-spacing">
            <Outlet />
          </div>
        </div>
      </ProductsProvider>
    </PageLayout>
  );
}
