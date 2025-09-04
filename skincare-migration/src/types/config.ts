// Configuration schema for Tagada skincare plugin (following SPECIFICATIONS.md)
import { z } from "zod";

// Branding configuration - exactly as per specifications
const BrandingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  logoText: z.string().optional(), // Text to show instead of "Olea"
  logoSize: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(), // Logo size preset
  logoHeight: z.number().min(16).max(200).optional(), // Custom height in pixels
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color")
    .optional(),
  logoUrl: z.string().optional(),
});

// Product IDs configuration - as suggested by team
const ProductIdsSchema = z.array(z.string().min(1, "Product ID cannot be empty"));

// Multi-language content support
const LocalizedStringSchema = z.record(z.string(), z.string()); // locale -> string

// Content sections for multi-language support
const ContentSectionsSchema = z.record(
  z.string(),
  z.object({
    // Hero section texts
    heroSubtitle: z.string().optional(),
    heroTitle: z.string().optional(), 
    heroDescription: z.string().optional(),
    primaryButton: z.string().optional(),
    secondaryButton: z.string().optional(),
    trustText: z.string().optional(),
    
    // Features section texts
    featuresTitle: z.string().optional(),
    featuresSubtitle: z.string().optional(),
    
    // CTA section text
    ctaButton: z.string().optional(),
    
    // Other existing content
    hero: z.string().optional(),
    about: z.string().optional(),
    guarantee: z.string().optional(),
  })
); // locale -> { content fields }

// Footer links configuration  
const FooterLinkSchema = z.object({
  label: z.string().min(1, "Link label is required"),
  url: z.string().min(1, "Link URL is required"),
  locale: z.string().optional(),
});

// Footer section configuration
const FooterSectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  links: z.array(FooterLinkSchema).min(1, "At least one link is required"),
});

// Navigation link configuration
const NavLinkSchema = z.object({
  label: z.string().min(1, "Navigation label is required"),
  url: z.string().min(1, "Navigation URL is required"), 
  external: z.boolean().optional(), // For external links vs internal routes
});

// Feature item configuration
const FeatureItemSchema = z.object({
  iconUrl: z.string().url("Must be a valid icon URL"),
  title: z.string().min(1, "Feature title is required"),
  delay: z.string().optional(), // Animation delay (e.g., "100ms")
});

// CTA Button configuration
const CtaButtonSchema = z.object({
  text: z.string().min(1, "CTA button text is required"),
  url: z.string().min(1, "CTA button URL is required"),
  external: z.boolean().optional(), // For external links vs internal routes
});

// Social media links configuration  
const SocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"), // Allow any platform name
  url: z.string().url("Must be a valid URL"),
  label: z.string().optional(), // Optional label for accessibility
  iconUrl: z.string().url("Must be a valid image URL"), // Required icon URL - only configured icons will show
});

// Content configuration with i18n support
const ContentSchema = z.object({
  tagline: LocalizedStringSchema,
  sections: ContentSectionsSchema,
  footerLinks: z.array(FooterLinkSchema).optional(),
  socialLinks: z.array(SocialLinkSchema).optional(),
  footerSections: z.array(FooterSectionSchema).optional(), // Configurable footer sections
  navigationLinks: z.array(NavLinkSchema).optional(), // Configurable navigation menu
  features: z.array(FeatureItemSchema).optional(), // Configurable features section
  ctaButton: CtaButtonSchema.optional(), // Configurable CTA button
  footerCopyright: z.string().optional(), // Footer copyright message
  enableBogo: z.boolean().optional(), // Enable/disable BOGO promotions across the site
});

// Assets configuration
const AssetsSchema = z
  .object({
    heroImage: z.string().optional(),
    logoImage: z.string().optional(),
    placeholderImage: z.string().optional(),
  })
  .optional();

// SEO configuration with multi-language support
const SeoSchema = z
  .object({
    title: LocalizedStringSchema,
    description: LocalizedStringSchema,
    socialImageUrl: z.string().optional(),
  })
  .optional();

// Main configuration schema - using product IDs as team suggested
export const ConfigSchema = z.object({
  configName: z.string().min(1, "Config name is required"),
  productIds: ProductIdsSchema,
  heroProductId: z.string().optional(), // Optional hero product ID for home section
  branding: BrandingSchema.optional(),
  content: ContentSchema.optional(),
  assets: AssetsSchema,
  seo: SeoSchema,
});

// Export types
export type Config = z.infer<typeof ConfigSchema>;
export type Branding = z.infer<typeof BrandingSchema>;
export type ProductIds = z.infer<typeof ProductIdsSchema>;
export type Content = z.infer<typeof ContentSchema>;
export type LocalizedString = z.infer<typeof LocalizedStringSchema>;
export type ContentSections = z.infer<typeof ContentSectionsSchema>;
export type FooterLink = z.infer<typeof FooterLinkSchema>;
export type FooterSection = z.infer<typeof FooterSectionSchema>;
export type NavLink = z.infer<typeof NavLinkSchema>;
export type FeatureItem = z.infer<typeof FeatureItemSchema>;
export type CtaButton = z.infer<typeof CtaButtonSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
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
  localizedContent: LocalizedString,
  locale: string = "en",
  fallbackLocale: string = "en"
): string => {
  return (
    localizedContent[locale] ||
    localizedContent[fallbackLocale] ||
    Object.values(localizedContent)[0] ||
    ""
  );
};

// Helper to get section content with locale fallback
export const getSectionContent = (
  sections: ContentSections,
  sectionKey: string,
  locale: string = "en",
  fallbackLocale: string = "en"
): string => {
  const localeSection = sections[locale] as any;
  const fallbackSection = sections[fallbackLocale] as any;
  const firstAvailable = Object.values(sections)[0] as any;

  return localeSection?.[sectionKey] || fallbackSection?.[sectionKey] || firstAvailable?.[sectionKey] || "";
};

// Helper to get content sections for a specific locale
export const getContentForLocale = (
  sections: ContentSections,
  locale: string = "en",
  fallbackLocale: string = "en"
) => {
  const localeContent = sections[locale];
  const fallbackContent = sections[fallbackLocale];
  const firstAvailable = Object.values(sections)[0];

  return localeContent || fallbackContent || firstAvailable || {};
};

// Default minimal configuration template
export const DEFAULT_CONFIG: Config = {
  configName: "default-skincare",
  productIds: [
    "product_example_1",
    "product_example_2", 
    "product_example_3",
  ],
};
