import type { useProducts } from "@tagadapay/plugin-sdk/react";

export type Product = ReturnType<typeof useProducts>['products'][number];
export type ProductVariant = Product['variants'][number] & {
  productId: string;
  createdAt: string;
};