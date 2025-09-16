import { HomeSidebar } from '@/components/layout/sidebar/home-sidebar';
import { PageLayout } from '@/components/layout/page-layout';
import { LatestProductCard } from '@/components/products/latest-product-card';
import { Badge } from '@/components/ui/badge';
import { getLabelPosition } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';
import { useCart } from '@/hooks/use-cart';
import { useTagataConfig } from '@/hooks/use-tagata-config';
import { useTransactionComplete } from '@/hooks/use-transaction-complete';
import { useMemo } from 'react';
import type { ProductVariant } from '@/storage/cart/types';
import SEO from '@/components/seo';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/structured-data';

export default function Home() {
  const { products, isLoading } = useCart();
  const { content } = useTagataConfig();
  
  useTransactionComplete();
  
  // Get SEO data from config
  const seoData = content.getSEO('/');
  
  // Get text content from config
  const noProductsAvailable = content.getText('noProductsAvailable');
  const noProductsDescription = content.getText('noProductsDescription');
  const latestDrop = content.getText('latestDrop');
  const loadingProducts = content.getText('loadingProducts');

  const { defaultVariant, restVariants } = useMemo(() => {
    // Handle case when products array is empty
    if (!products || products.length === 0) {
      return {
        defaultVariant: null,
        restVariants: [],
      };
    }

    const [firstProduct] = products;

    // Handle case when first product has no variants
    if (!firstProduct?.variants || firstProduct.variants.length === 0) {
      return {
        defaultVariant: null,
        restVariants: [],
      };
    }

    const defaultIndexVariant = firstProduct.variants.findIndex((variant) => variant.default);
    
    // Handle case when no default variant is found
    const defaultVariant = defaultIndexVariant >= 0 
      ? firstProduct.variants[defaultIndexVariant]
      : firstProduct.variants[0]; // Fallback to first variant

    const restVariants = firstProduct.variants.filter((variant) => variant.id !== defaultVariant.id);

    return {
      defaultVariant: defaultVariant as ProductVariant,
      restVariants: restVariants as Array<ProductVariant>,
    };
  }, [products]);
  
  if (isLoading) {
    return (
      <PageLayout>
        <SEO
          title={seoData.title}
          description={seoData.description}
          type="website"
          keywords={seoData.keywords}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader size="lg" />
            <p className="text-muted-foreground">{loadingProducts}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Handle case when no products are available
  if (!products || products.length === 0) {
    return (
      <PageLayout>
        <SEO
          title={seoData.title}
          description={seoData.description}
          type="website"
          keywords={seoData.keywords}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-semibold">{noProductsAvailable}</h2>
            <p className="text-muted-foreground">{noProductsDescription}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title={seoData.title}
        description={seoData.description}
        type="website"
        keywords={seoData.keywords}
        image={content.getAsset('logo')}
      />
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <div className="contents md:grid md:grid-cols-12 md:gap-sides">
        <HomeSidebar products={products} />
        <div className="flex relative flex-col grid-cols-2 col-span-8 w-full md:grid">
          <div className="fixed top-0 left-0 z-10 w-full pointer-events-none base-grid py-sides">
            <div className="col-span-8 col-start-5">
              <div className="hidden px-6 lg:block">
                <Badge variant="outline-secondary">{latestDrop}</Badge>
              </div>
            </div>
          </div>
          {defaultVariant && restVariants && (
            <>
              <LatestProductCard className="col-span-2" product={defaultVariant} principal />

              {restVariants.map((productVariant, index: number) => (
                <LatestProductCard
                  className="col-span-1"
                  key={productVariant.id}
                  product={productVariant}
                  labelPosition={getLabelPosition(index)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
