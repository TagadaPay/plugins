import ProductList from '@/pages/shop/shared/components/product-list';
import { Suspense } from 'react';
import ResultsControls from '@/pages/shop/shared/components/results-controls';
import { ProductGrid } from '@/pages/shop/shared/components/product-grid';
import { ProductCardSkeleton } from '@/pages/shop/shared/components/product-card-skeleton';
import SEO from '@/components/seo';
import { useTagataConfig } from '@/hooks/use-tagata-config';

export default function Shop() {
  const { content } = useTagataConfig();
  
  // Get SEO data from config
  const seoData = content.getSEO('/shop');
  
  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        type="website"
        keywords={seoData.keywords}
      />
      <Suspense
        fallback={
          <>
            <ResultsControls className="max-md:hidden" products={[]} />
            <ProductGrid>
              {Array.from({ length: 12 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </ProductGrid>
          </>
        }
      >
        <ProductList />
      </Suspense>
    </>
  );
}
