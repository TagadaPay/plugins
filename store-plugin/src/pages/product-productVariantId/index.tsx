import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { SidebarLinks } from '@/components/layout/sidebar/product-sidebar-links';
import { AddToCart, AddToCartButton } from '@/components/cart/add-to-cart';
import Prose from '@/components/prose';
import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { MobileGallerySlider } from './components/mobile-gallery-slider';
import { DesktopGallery } from './components/desktop-gallery';
import { useParams } from 'react-router';
import { Link } from 'react-router';
import { useCart } from '@/hooks/use-cart';
import type { Product, ProductVariant } from '@/storage/cart/types';
import { useCurrency } from '@tagadapay/plugin-sdk/react';
import SEO from '@/components/seo';
import { ProductStructuredData } from '@/components/structured-data';
import { useTagataConfig } from '@/hooks/use-tagata-config';

export default function ProductVariantPage() {
  const { productVariantId } = useParams();
  const { filterVariants } = useCart();
  const { format, code } = useCurrency();
  const { content } = useTagataConfig();

  const [found] = filterVariants((variant) => variant.id === productVariantId) as unknown as Array<{ variant: ProductVariant; product: Product }>;

  if (!found) {
    return (
      <PageLayout className="bg-muted">
        <SEO
          title="Product Not Found - Design Store"
          description="The product you're looking for is not available. Browse our collection of premium design products."
          type="website"
          robots="noindex, nofollow"
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive font-medium">{'Product not found'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-muted">
      <SEO
        title={`${found.variant.name} - ${found.product.name} | Design Store`}
        description={found.product.description || `Premium ${found.variant.name} from our design collection. ${found.variant.description?.replace(/<[^>]*>/g, '').substring(0, 160)}`}
        type="product"
        image={found.product.image || '/placeholder-logo.png'}
        keywords={`${found.product.name}, ${found.variant.name}, design, furniture, premium products`}
        price={found.variant.prices[0]?.currencyOptions[code]?.amount?.toString()}
        currency={code}
        availability="in stock"
        brand={content.getText('brandName')}
        category="Design Products"
      />
      <ProductStructuredData
        product={{
          name: `${found.variant.name} - ${found.product.name}`,
          description: found.product.description,
          image: found.product.image || '/placeholder-logo.png',
          price: found.variant.prices[0]?.currencyOptions[code]?.amount?.toString(),
          currency: code,
          availability: "in stock",
          brand: content.getText('brandName'),
          category: "Design Products"
        }}
      />
      <div className="flex flex-col md:grid md:grid-cols-12 md:gap-sides min-h-max">
        {/* Mobile Gallery Slider */}
        <div className="md:hidden col-span-full h-[60vh] min-h-[400px]">
          <Suspense fallback={null}>
            <MobileGallerySlider product={found.variant} />
          </Suspense>
        </div>

        <div className="flex sticky top-0 flex-col col-span-5 2xl:col-span-4 max-md:col-span-full md:h-screen min-h-max max-md:p-sides md:pl-sides md:pt-top-spacing max-md:static">
          <div className="col-span-full">
            <Breadcrumb className="col-span-full mb-4 md:mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/shop" prefetch="viewport">
                      Shop
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {found.product && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={`/shop/${found.product.id}`} prefetch="viewport">
                          {found.product.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{found.variant.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col col-span-full gap-4 md:mb-10 max-md:order-2">
              <div className="flex flex-col grid-cols-2 px-3 py-2 rounded-md bg-popover md:grid md:gap-x-4 md:gap-y-10 place-items-baseline">
                <h1 className="text-lg font-semibold lg:text-xl 2xl:text-2xl text-balance max-md:mb-4">
                  {found.product.name}
                </h1>
                <p className="text-sm font-medium">{found.product.description}</p>
                <p className="flex gap-3 items-center text-lg font-semibold lg:text-xl 2xl:text-2xl max-md:mt-8">
                  {format(found.variant.prices[0]?.currencyOptions[code]?.amount / 100)}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Suspense
                  fallback={
                    <AddToCartButton
                      className="'w-full col-span-full'"
                      product={found.variant}
                      size="lg"
                    />
                  }
                >
                  <AddToCart
                    product={found.variant}
                    size="lg"
                    className='w-full col-span-full'
                  />
                </Suspense>
              </div>
            </div>
          </div>

          <Prose
            className="col-span-full mb-auto opacity-70 max-md:order-3 max-md:my-6"
            html={found.variant.description}
          />

          <SidebarLinks className="flex-col-reverse max-md:hidden py-sides w-full max-w-[408px] pr-sides max-md:pr-0 max-md:py-0" />
        </div>

        {/* Desktop Gallery */}
        <div className="hidden overflow-y-auto relative col-span-7 col-start-6 w-full md:block">
          <Suspense fallback={null}>
            <DesktopGallery product={found.variant} />
          </Suspense>
        </div>
      </div>
    </PageLayout>
  );
}
