import { useCart } from "@/hooks/use-cart";
import { useParams, useSearchParams } from "react-router";
import ResultsControls from "./results-controls";
import { ProductGrid } from "./product-grid";
import { Card } from "@/components/ui/card";
import { ProductCard } from "./product-card";
import { useCallback, useMemo } from "react";
import type { ProductVariant } from "@/storage/cart/types";
import { useCurrency } from "@tagadapay/plugin-sdk/react";

export default function ProductList() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { products } = useCart();
  const { code } = useCurrency();
  const sort = searchParams.get('sort');

  const getProductVariantPrice = useCallback((variant: ProductVariant) => {
    return variant.prices.find((p) => p.currencyOptions[code])?.currencyOptions[code].amount || 0;
  }, [code]);

  // Apply client-side filtering whenever products or color filters change
  const filteredProducts = useMemo<Array<ProductVariant>>(() => {
    let allVariants: Array<ProductVariant> = [];
    products.forEach(product => {
      product.variants.forEach(variant => {
        allVariants.push(variant as ProductVariant);
      });
    });

    if (params.productId) {
      allVariants = allVariants.filter(variant => variant.productId === params.productId);
    }

    const sorted = allVariants.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return getProductVariantPrice(a) - getProductVariantPrice(b);
        case 'price-desc':
          return getProductVariantPrice(b) - getProductVariantPrice(a);
        case 'newest':
          return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        case 'oldest':
          return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        default:
          return 0;
      }
    });

    return sorted;
  }, [getProductVariantPrice, products, sort, params]);

  return (
    <>
      <ResultsControls className="max-md:hidden" products={filteredProducts} />

      {filteredProducts.length > 0 ? (
        <ProductGrid>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      ) : (
        <Card className="flex mr-sides flex-1 items-center justify-center">
          <p className="text text-muted-foreground font-medium">No products found</p>
        </Card>
      )}
    </>
  );
}
