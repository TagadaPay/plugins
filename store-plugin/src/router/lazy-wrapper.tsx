import { Suspense } from "react";
import PageLoader from "./page-loader";

// Wrapper component to add Suspense to lazy-loaded components
const LazyWrapper = ({ Component }: { Component: React.ComponentType }) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export default LazyWrapper;
