import { PluginConfig } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { Helmet } from 'react-helmet-async';
export function SEO() {
  const { config } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();

  const title = t(config?.content?.seo?.title);
  const finalTitle = t(config?.content?.siteName);
  const finalDescription = t(config?.content?.siteDescription);
  const finalSiteName = t(config?.content?.siteName);
  const finalBrand = t(config?.content?.brandName);
  const finalImage = config?.content?.assets?.logo || '/placeholder-logo.png';
  const fullTitle = finalTitle.includes(finalSiteName)
    ? finalTitle
    : `${finalTitle} | ${finalSiteName}`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonicalUrl = currentUrl;
  const imageUrl = finalImage.startsWith('http')
    ? finalImage
    : `${
        typeof window !== 'undefined' ? window.location.origin : ''
      }${finalImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content="index, follow" />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={finalSiteName} />
      <meta property="og:locale" content="en_US" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta property="og:image:alt" content={title} />}
      {currentUrl && <meta property="og:url" content={currentUrl} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {/* Product-specific Open Graph Tags */}
      {finalBrand && <meta property="product:brand" content={finalBrand} />}

      {/* Additional SEO Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>
  );
}

export default SEO;
