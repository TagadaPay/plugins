import { useCart } from '@/hooks/use-cart';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Loader } from '@/components/ui/loader';
import { useRedirectBackHandle } from '@/hooks/use-redirect-back-handle';

export const PageLayout = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { products, isLoading } = useCart();

  useRedirectBackHandle();

  // Show minimal loading state for layout
  if (isLoading) {
    return (
      <div className="font-geist-sans font-geist-mono">
        <Header products={products} />
        <div className={className}>
          <main>
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader size="default" />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="font-geist-sans font-geist-mono">
      <Header products={products} />
      <div className={className}>
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
};
