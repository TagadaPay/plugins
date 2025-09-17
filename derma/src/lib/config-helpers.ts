export interface DermaPenConfig {
  configName: string;
  productIds: string[];
  pricing: {
    singlePackDiscount: number;
    dualPackDiscount: number;
    triplePackDiscount: number;
    displayDiscountPricing: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    companyName: string;
    logoText?: string;
    logoUrl?: string;
    logoSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  };
  assets: {
    heroImages: string[];
    beforeAfterImages: Array<{
      title: string;
      imageUrl: string;
      alt: string;
    }>;
    certificationLogos: Array<{
      name: string;
      imageUrl: string;
      alt: string;
    }>;
    videoUrl?: string;
    videoPoster?: string;
  };
  content: {
    sections: {
      [locale: string]: {
        heroTitle: string;
        heroSubtitle: string;
        heroDescription: string;
        primaryButton: string;
        secondaryButton: string;
        trustText: string;
        guaranteeText: string;
        successRate: string;
        featuresTitle: string;
        featuresSubtitle: string;
        advantagesTitle: string;
        advantagesDescription: string;
        howItWorksTitle: string;
        howItWorksDescription: string;
        reviewsTitle: string;
        reviewsSubtitle: string;
        guaranteeTitle: string;
        guaranteeDescription: string;
        finalCtaTitle: string;
        finalCtaDescription: string;
      };
    };
    customerReviews: Array<{
      name: string;
      rating: number;
      text: string;
      verified: boolean;
      location: string;
    }>;
    socialLinks: Array<{
      platform: string;
      url: string;
      iconUrl: string;
      label: string;
    }>;
    pressLogos: Array<{
      name: string;
      logoUrl: string;
      alt: string;
    }>;
  };
  features: {
    enableReviews: boolean;
    enableVideoSection: boolean;
    enableResultsGallery: boolean;
    enableCertifications: boolean;
    enablePressBar: boolean;
    reviewCount: number;
    averageRating: number;
    enableBuyerNotifications: boolean;
    enableGuaranteeSection: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const getSectionText = (
  config: DermaPenConfig | undefined,
  key: string,
  locale: string = 'en'
): string => {
  return config?.content?.sections?.[locale]?.[key as keyof typeof config.content.sections[typeof locale]] || 
         config?.content?.sections?.en?.[key as keyof typeof config.content.sections.en] || 
         '';
};

export const getAssetUrl = (
  config: DermaPenConfig | undefined,
  assetPath: string
): string | undefined => {
  // Navigate nested object paths like "assets.heroImages.0"
  return assetPath.split('.').reduce((obj: any, key) => obj?.[key], config);
};

export const isFeatureEnabled = (
  config: DermaPenConfig | undefined,
  feature: keyof DermaPenConfig['features']
): boolean => {
  return config?.features?.[feature] ?? false;
};

export const applyThemeColors = (config: DermaPenConfig | undefined) => {
  if (!config?.branding) return;
  
  const root = document.documentElement;
  root.style.setProperty('--color-primary', config.branding.primaryColor);
  root.style.setProperty('--color-secondary', config.branding.secondaryColor);
  root.style.setProperty('--color-accent', config.branding.accentColor);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};