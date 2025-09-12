// Configuration schema for Gymkartel plugin
import { z } from "zod";

// Branding configuration
const BrandingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  logoText: z.string().optional(),
  logoSize: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  logoHeight: z.number().min(16).max(200).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color")
    .optional(),
  logoUrl: z.string().optional(),
});

// Variant colors configuration
const VariantColorsSchema = z.record(z.string(), z.string()); // color name -> variant ID

// Product mapping for different colors/options  
const ProductMappingSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantIds: z.array(z.string()).optional(), // For size variants within this product
  colorName: z.string().optional(), // Optional override for color name if needed
});

// Product configuration specific to gymkartel
const ProductConfigSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  defaultVariantId: z.string().min(1, "Default variant ID is required"),
  defaultPriceId: z.string().min(1, "Default price ID is required"),
  variants: VariantColorsSchema.optional(),
  // New: Support for multiple products (e.g., different colors as separate products)
  productMapping: z.array(ProductMappingSchema).optional(),
});

// Multi-language content support
const LocalizedStringSchema = z.record(z.string(), z.string());

// Content sections for multi-language support
const ContentSectionsSchema = z.record(
  z.string(),
  z.object({
    // Hero section
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().optional(),
    heroDescription: z.string().optional(),
    primaryButton: z.string().optional(),
    secondaryButton: z.string().optional(),
    trustText: z.string().optional(),
    
    // Announcement bar
    announcementText: z.string().optional(),
    
    // Features section
    featuresTitle: z.string().optional(),
    featuresSubtitle: z.string().optional(),
    featuresDescription: z.string().optional(),
    
    // Color showcase section
    colorShowcaseTitle: z.string().optional(),
    colorShowcaseDescription: z.string().optional(),
    
    // Product technology section
    productTechTitle: z.string().optional(),
    productTechDescription: z.string().optional(),
    
    // Technology section
    technologyTitle: z.string().optional(),
    technologyDescription: z.string().optional(),
    scientificTitle: z.string().optional(),
    
    // Videos section
    videosTitle: z.string().optional(),
    videosDescription: z.string().optional(),
    
    // Package section
    packageTitle: z.string().optional(),
    packageDescription: z.string().optional(),
    
    // Reviews section
    reviewsTitle: z.string().optional(),
    reviewsSubtitle: z.string().optional(),
    
    // FAQ section
    faqTitle: z.string().optional(),
    faqSubtitle: z.string().optional(),
    
    // Guarantee section
    guaranteeTitle: z.string().optional(),
    guaranteeDescription: z.string().optional(),
    
    // CTA section
    ctaTitle: z.string().optional(),
    ctaDescription: z.string().optional(),
    ctaButton: z.string().optional(),
    
    // Footer
    footerCopyright: z.string().optional(),
    footerDescription: z.string().optional(),
    footerRating: z.string().optional(),
    footerQuickLinksTitle: z.string().optional(),
    footerLegalTitle: z.string().optional(),
    footerContactTitle: z.string().optional(),
    footerSocialTitle: z.string().optional(),
    guarantee: z.string().optional(),
    
    // Image alt text
    heroImageAlt: z.string().optional(),
    featuresImageAlt: z.string().optional(),
    celluliteImageAlt: z.string().optional(),
    calorieImageAlt: z.string().optional(),
    sslSecureAlt: z.string().optional(),
  })
);

// Navigation link configuration
const NavLinkSchema = z.object({
  label: z.string().min(1, "Navigation label is required"),
  url: z.string().min(1, "Navigation URL is required"), 
  external: z.boolean().optional(),
});

// Feature item configuration
const FeatureItemSchema = z.object({
  iconName: z.string().min(1, "Icon name is required"), // Lucide icon name
  title: z.string().min(1, "Feature title is required"),
  description: z.string().optional(),
  delay: z.string().optional(),
});

// Social media links configuration  
const SocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Must be a valid URL"),
  label: z.string().optional(),
  iconName: z.string().min(1, "Icon name is required"), // Lucide icon name
});

// FAQ item configuration
const FaqItemSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

// Package configuration for gymkartel
const PackageConfigSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  originalPrice: z.number().min(0, "Original price must be positive"),
  discountedPrice: z.number().min(0, "Discounted price must be positive"),
  savingsPercentage: z.number().min(0).max(100, "Savings percentage must be between 0-100"),
  isPopular: z.boolean().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
});

// Product option configuration (replaces ColorOption for genericity)
const ProductOptionSchema = z.object({
  name: z.string().min(1, "Product option name is required"),
  image: z.string().min(1, "Product option image URL is required"),
  variantId: z.string().optional(),
});

// Legacy color option configuration (for backward compatibility)
const ColorOptionSchema = ProductOptionSchema;

// Trust badge configuration
const TrustBadgeSchema = z.object({
  text: LocalizedStringSchema,
  icon: z.string().optional(), // Lucide icon name
});

// Scientific statistic configuration
const ScientificStatSchema = z.object({
  value: LocalizedStringSchema,
  label: LocalizedStringSchema,
});

// Technology feature configuration
const TechnologyFeatureSchema = z.object({
  title: LocalizedStringSchema,
  description: LocalizedStringSchema,
  icon: z.string().optional(), // Lucide icon name
});

// Media partner/logo configuration
const MediaPartnerSchema = z.object({
  name: z.string().min(1, "Partner name is required"),
  logoUrl: z.string().min(1, "Logo URL is required"),
  altText: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Review generation configuration
const ReviewConfigSchema = z.object({
  firstNames: z.array(z.string()).optional(),
  fiveStarComments: z.array(z.string()).optional(),
  fourStarComments: z.array(z.string()).optional(),
  fiveStarCount: z.number().min(0).optional(),
  fourStarCount: z.number().min(0).optional(),
});

// Contact information configuration
const ContactInfoSchema = z.object({
  supportText: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  chatText: z.string().optional(),
  hours: z.string().optional(),
});

// Footer link configuration
const FooterLinkSchema = z.object({
  text: LocalizedStringSchema,
  url: z.string().min(1, "URL is required"),
  external: z.boolean().optional(),
});

// Result image configuration
const ResultImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  altText: z.string().optional(),
  title: z.string().optional(),
});

// Payment method configuration
const PaymentMethodSchema = z.object({
  name: z.string().min(1, "Payment method name is required"),
  logoUrl: z.string().min(1, "Logo URL is required"),
  altText: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Guarantee item configuration
const GuaranteeItemSchema = z.object({
  title: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  icon: z.string().optional(), // Lucide icon name
  iconUrl: z.string().optional(), // Custom icon URL
});

// Technology showcase image configuration
const TechImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  altText: z.string().optional(),
  title: LocalizedStringSchema.optional(),
});

// Content configuration with i18n support
const ContentSchema = z.object({
  tagline: LocalizedStringSchema.optional(),
  sections: ContentSectionsSchema.optional(),
  navigationLinks: z.array(NavLinkSchema).optional(),
  features: z.array(FeatureItemSchema).optional(),
  technologyFeatures: z.array(TechnologyFeatureSchema).optional(),
  scientificStats: z.array(ScientificStatSchema).optional(),
  socialLinks: z.array(SocialLinkSchema).optional(),
  faqItems: z.array(FaqItemSchema).optional(),
  packages: z.array(PackageConfigSchema).optional(),
  colorOptions: z.array(ColorOptionSchema).optional(),
  productOptions: z.array(ProductOptionSchema).optional(),
  trustBadges: z.array(TrustBadgeSchema).optional(),
  mediaPartners: z.array(MediaPartnerSchema).optional(),
  resultImages: z.array(ResultImageSchema).optional(),
  paymentMethods: z.array(PaymentMethodSchema).optional(),
  guaranteeItems: z.array(GuaranteeItemSchema).optional(),
  technologyImages: z.array(TechImageSchema).optional(),
  reviewConfig: ReviewConfigSchema.optional(),
  contactInfo: ContactInfoSchema.optional(),
  footerQuickLinks: z.array(FooterLinkSchema).optional(),
  footerLegalLinks: z.array(FooterLinkSchema).optional(),
  footerDescription: z.string().optional(),
  footerRating: z.string().optional(),
});

// Store configuration
const StoreConfigSchema = z.object({
  storeId: z.string().optional(),
  accountId: z.string().optional(),
});

// API Keys configuration
const ApiKeysSchema = z.object({
  googleApiKey: z.string().optional(),
});

// Feature flags configuration
const FeatureFlagsSchema = z.object({
  enableAdvancedRouting: z.boolean().optional(),
  showConfigViewer: z.boolean().optional(),
  demoMode: z.boolean().optional(),
  enableRecentPurchasePopup: z.boolean().optional(),
  enableStickyAddToCart: z.boolean().optional(),
  enableReviews: z.boolean().optional(),
  enableFaq: z.boolean().optional(),
});

// Routes configuration
const RoutesSchema = z.object({
  basePath: z.string().optional(),
});

// Assets configuration
const AssetsSchema = z.object({
  logoImage: z.string().optional(),
  heroImage: z.string().optional(),
  productImages: z.array(z.string()).optional(),
  placeholderImage: z.string().optional(),
  videos: z.array(z.string()).optional(),
}).optional();

// SEO configuration with multi-language support
const SeoSchema = z.object({
  title: LocalizedStringSchema.optional(),
  description: LocalizedStringSchema.optional(),
  socialImageUrl: z.string().optional(),
}).optional();

// Main configuration schema for gymkartel
export const ConfigSchema = z.object({
  configName: z.string().min(1, "Config name is required"),
  product: ProductConfigSchema,
  storeConfig: StoreConfigSchema.optional(),
  branding: BrandingSchema.optional(),
  content: ContentSchema.optional(),
  assets: AssetsSchema,
  seo: SeoSchema,
  apiKeys: ApiKeysSchema.optional(),
  features: FeatureFlagsSchema.optional(),
  routes: RoutesSchema.optional(),
});

// Export types
export type Config = z.infer<typeof ConfigSchema>;
export type Branding = z.infer<typeof BrandingSchema>;
export type ProductConfig = z.infer<typeof ProductConfigSchema>;
export type ProductMapping = z.infer<typeof ProductMappingSchema>;
export type VariantColors = z.infer<typeof VariantColorsSchema>;
export type StoreConfig = z.infer<typeof StoreConfigSchema>;
export type Content = z.infer<typeof ContentSchema>;
export type LocalizedString = z.infer<typeof LocalizedStringSchema>;
export type ContentSections = z.infer<typeof ContentSectionsSchema>;
export type NavLink = z.infer<typeof NavLinkSchema>;
export type FeatureItem = z.infer<typeof FeatureItemSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;
export type PackageConfig = z.infer<typeof PackageConfigSchema>;
export type ProductOption = z.infer<typeof ProductOptionSchema>;
export type ColorOption = z.infer<typeof ColorOptionSchema>;
export type TrustBadge = z.infer<typeof TrustBadgeSchema>;
export type ScientificStat = z.infer<typeof ScientificStatSchema>;
export type TechnologyFeature = z.infer<typeof TechnologyFeatureSchema>;
export type MediaPartner = z.infer<typeof MediaPartnerSchema>;
export type ReviewConfig = z.infer<typeof ReviewConfigSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type FooterLink = z.infer<typeof FooterLinkSchema>;
export type ResultImage = z.infer<typeof ResultImageSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type GuaranteeItem = z.infer<typeof GuaranteeItemSchema>;
export type TechImage = z.infer<typeof TechImageSchema>;
export type ApiKeys = z.infer<typeof ApiKeysSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type Routes = z.infer<typeof RoutesSchema>;
export type Assets = z.infer<typeof AssetsSchema>;
export type Seo = z.infer<typeof SeoSchema>;

// Configuration validation helper
export const validateConfig = (config: unknown): Config => {
  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Configuration validation failed: ${error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
};

// Helper to get localized content with fallback
export const getLocalizedContent = (
  localizedContent: LocalizedString | undefined,
  locale: string = "en",
  fallbackLocale: string = "en"
): string => {
  if (!localizedContent) return "";
  return (
    localizedContent[locale] ||
    localizedContent[fallbackLocale] ||
    Object.values(localizedContent)[0] ||
    ""
  );
};

// Helper to get section content with locale fallback
export const getSectionContent = (
  sections: ContentSections | undefined,
  sectionKey: string,
  locale: string = "en",
  fallbackLocale: string = "en"
): string => {
  if (!sections) return "";
  
  const localeSection = sections[locale] as any;
  const fallbackSection = sections[fallbackLocale] as any;
  const firstAvailable = Object.values(sections)[0] as any;

  return localeSection?.[sectionKey] || fallbackSection?.[sectionKey] || firstAvailable?.[sectionKey] || "";
};

// Helper to get content sections for a specific locale
export const getContentForLocale = (
  sections: ContentSections | undefined,
  locale: string = "en",
  fallbackLocale: string = "en"
) => {
  if (!sections) return {};
  
  const localeContent = sections[locale];
  const fallbackContent = sections[fallbackLocale];
  const firstAvailable = Object.values(sections)[0];

  return localeContent || fallbackContent || firstAvailable || {};
};

// Default minimal configuration template
export const DEFAULT_CONFIG: Config = {
  configName: "default-gymkartel",
  product: {
    productId: "product_ed740eb97672",
    defaultVariantId: "variant_6ebfc7156948",
    defaultPriceId: "price_992f48a688bd",
    variants: {
      "Black": "variant_5beb73de7618",
      "Beige": "variant_e9d422178fa5",
      "Pink": "variant_6ebfc7156948",
      "Blue": "variant_adbf0746f4ef"
    }
  },
  features: {
    enableAdvancedRouting: true,
    showConfigViewer: true,
    demoMode: true,
    enableRecentPurchasePopup: true,
    enableStickyAddToCart: true,
    enableReviews: true,
    enableFaq: true,
  },
  routes: {
    basePath: "/"
  }
};