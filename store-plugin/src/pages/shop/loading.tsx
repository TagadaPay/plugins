import { Suspense } from 'react';

import ResultsControls from '@/pages/shop/shared/components/results-controls';
import { ProductGrid } from '@/pages/shop/shared/components/product-grid';
import { ProductCardSkeleton } from '@/pages/shop/shared/components/product-card-skeleton';

export default function ShopLoading() {
  return (
    <div>
      <Suspense>
        <ResultsControls products={[]} />
      </Suspense>
      <ProductGrid>
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </ProductGrid>
    </div>
  );
}
