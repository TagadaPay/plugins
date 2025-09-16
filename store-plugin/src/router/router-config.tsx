import { createBrowserRouter, Navigate } from "react-router";
import { lazy } from "react";
import LazyWrapper from "./lazy-wrapper";

// Lazy load all page components
const Root = lazy(() => import("@/pages/index"));
const NotFound = lazy(() => import("@/pages/not-found"));
const ProductVariant = lazy(() => import("@/pages/product-productVariantId"));
const ShopLayout = lazy(() => import("@/pages/shop/layout"));
const Shop = lazy(() => import("@/pages/shop/index"));
const ShopCategory = lazy(() => import("@/pages/shop/-productId"));

export const routerConfig = createBrowserRouter([
  {
    path: "/",
    element: <LazyWrapper Component={Root} />,
  },
  {
    path: "shop",
    element: <LazyWrapper Component={ShopLayout} />, // Nested layout for shop routes
    children: [
      {
        index: true, // This renders at "/shop"
        element: <LazyWrapper Component={Shop} />,
      },
      {
        path: ":productId", // This renders at "/shop/:productId"
        element: <LazyWrapper Component={ShopCategory} />,
      },
    ],
  },
  {
    path: "product/:productVariantId",
    element: <LazyWrapper Component={ProductVariant} />,
  },
  { 
    path: "/not-found", 
    element: <LazyWrapper Component={NotFound} /> 
  },
  { path: "*", element: <Navigate to="/not-found" /> },
]);
