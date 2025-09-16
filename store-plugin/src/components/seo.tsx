import { Helmet } from 'react-helmet-async'
import { useTagataConfig } from '@/hooks/use-tagata-config'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  siteName?: string
  locale?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
  keywords?: string
  author?: string
  robots?: string
  canonical?: string
  price?: string
  currency?: string
  availability?: string
  brand?: string
  category?: string
}

const staticDefaults = {
  locale: 'en_US',
  type: 'website' as const,
  twitterCard: 'summary_large_image' as const,
  robots: 'index, follow',
}

export function SEO({
  title,
  description,
  image,
  url,
  type = staticDefaults.type,
  siteName,
  locale = staticDefaults.locale,
  twitterCard = staticDefaults.twitterCard,
  twitterSite,
  twitterCreator,
  keywords,
  author,
  robots = staticDefaults.robots,
  canonical,
  price,
  currency,
  availability,
  brand,
  category,
}: SEOProps) {
  const { content } = useTagataConfig()
  
  // Get values from config with fallbacks
  const finalTitle = title || content.getText('siteName')
  const finalDescription = description || content.getText('siteDescription')
  const finalSiteName = siteName || content.getText('siteName')
  const finalBrand = brand || content.getText('brandName')
  const finalImage = image || content.getAsset('logo') || '/placeholder-logo.png'
  const fullTitle = finalTitle.includes(finalSiteName) ? finalTitle : `${finalTitle} | ${finalSiteName}`
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const canonicalUrl = canonical || currentUrl
  const imageUrl = finalImage.startsWith('http') ? finalImage : `${typeof window !== 'undefined' ? window.location.origin : ''}${finalImage}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robots} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={finalSiteName} />
      <meta property="og:locale" content={locale} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta property="og:image:alt" content={title} />}
      {currentUrl && <meta property="og:url" content={currentUrl} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

      {/* Product-specific Open Graph Tags */}
      {type === 'product' && (
        <>
          {price && currency && (
            <>
              <meta property="product:price:amount" content={price} />
              <meta property="product:price:currency" content={currency} />
            </>
          )}
          {availability && <meta property="product:availability" content={availability} />}
          {finalBrand && <meta property="product:brand" content={finalBrand} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Additional SEO Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>
  )
}

export default SEO
