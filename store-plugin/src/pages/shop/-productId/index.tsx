import ProductList from '@/pages/shop/shared/components/product-list';
import SEO from '@/components/seo';
import { useTagataConfig } from '@/hooks/use-tagata-config';

export default function ShopCategory() {
  const { content } = useTagataConfig();
  
  // Get SEO data from config - fallback to shop SEO if category-specific doesn't exist
  const seoData = content.getSEO('/shop');
  
  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        type="website"
        keywords={seoData.keywords}
      />
      <ProductList />
    </>
  );
}
