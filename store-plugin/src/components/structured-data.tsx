import { Helmet } from 'react-helmet-async'
import { useTagataConfig } from '@/hooks/use-tagata-config'

interface ProductStructuredDataProps {
  product: {
    name: string
    description?: string
    image?: string
    price?: string
    currency?: string
    availability?: string
    brand?: string
    category?: string
  }
}

interface OrganizationStructuredDataProps {
  name?: string
  url?: string
  logo?: string
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency,
      "availability": `https://schema.org/${product.availability === 'in stock' ? 'InStock' : 'OutOfStock'}`
    }
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}

export function OrganizationStructuredData({ 
  name, 
  url = typeof window !== 'undefined' ? window.location.origin : '',
  logo
}: OrganizationStructuredDataProps = {}) {
  const { content } = useTagataConfig()
  
  const finalName = name || content.getText('siteName')
  const finalLogo = logo || content.getAsset('logo') || "/placeholder-logo.png"
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": finalName,
    "url": url,
    "logo": finalLogo.startsWith('http') ? finalLogo : `${url}${finalLogo}`,
    "sameAs": []
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}

export function WebsiteStructuredData() {
  const { content } = useTagataConfig()
  
  const siteName = content.getText('siteName')
  const siteDescription = content.getText('siteDescription')
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": typeof window !== 'undefined' ? window.location.origin : '',
    "description": siteDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${typeof window !== 'undefined' ? window.location.origin : ''}/shop?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}
