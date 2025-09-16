import { Link } from 'react-router';
import { PageLayout } from '@/components/layout/page-layout';
import { useTagataConfig } from '@/hooks/use-tagata-config';
import SEO from '@/components/seo';

export default function NotFound() {
  const { content } = useTagataConfig();
  
  // Get SEO data from config
  const seoData = content.getSEO('/not-found');
  
  const pageNotFound = content.getText('pageNotFound');
  const goBackHome = content.getText('goBackHome');
  const pageNotFoundDescription = content.getText('pageNotFoundDescription');

  return (
    <PageLayout>
      <SEO
        title={seoData.title}
        description={seoData.description}
        type="website"
        keywords={seoData.keywords}
        robots="noindex, nofollow"
      />
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-primary/20 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {pageNotFound}{' '}
              <Link to="/" className="underline">
                {goBackHome}
              </Link>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {pageNotFoundDescription}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
