import { z } from 'zod';

// Products schema
const ProductsSchema = z.object({
  productIds: z.array(z.string()).optional(),
});

// Assets schema
const AssetsSchema = z.object({
  logo: z.string().optional(),
  heroImage: z.string().optional(),
  placeholderImage: z.string().optional(),
  thumbnails: z.record(z.string()).optional(), // For thumbnail URLs
});

// Navigation schema
const NavItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const NavigationSchema = z.object({
  header: z.array(NavItemSchema).optional(),
  footer: z.array(NavItemSchema).optional(),
});

// Text content for different languages
const TextContentSchema = z.object({
  // Hero/Home page content
  tagline: z.string().optional(),
  heroQuote: z.string().optional(),
  descriptionLines: z.array(z.string()).optional(),
  
  // Navigation labels
  home: z.string().optional(),
  shop: z.string().optional(),
  shopAll: z.string().optional(),
  categories: z.string().optional(),
  
  // Product labels
  latestDrop: z.string().optional(),
  bestSeller: z.string().optional(),
  addToCart: z.string().optional(),
  
  // Error pages
  pageNotFound: z.string().optional(),
  goBackHome: z.string().optional(),
  pageNotFoundDescription: z.string().optional(),
  noProductsAvailable: z.string().optional(),
  noProductsDescription: z.string().optional(),
  
  // Loading states
  loadingProducts: z.string().optional(),
  
  // Brand and SEO
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  brandName: z.string().optional(),
  
  // UI Text
  menu: z.string().optional(),
  close: z.string().optional(),
  cart: z.string().optional(),
  remove: z.string().optional(),
  sortBy: z.string().optional(),
  clearAllFilters: z.string().optional(),
  
  // Footer
  copyright: z.string().optional(),
  allRightsReserved: z.string().optional(),
});

// Multi-language text content - flexible for any language keys
const MultiLanguageTextSchema = z.record(z.string(), TextContentSchema.optional());

// SEO content for different pages
const SEOPageSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
});

// SEO content for different languages - flexible for any language keys
const SEOContentSchema = z.record(z.string(), z.record(z.string(), SEOPageSchema).optional());

// Theme configuration schema
const ThemeColorsSchema = z.object({
  background: z.string().optional(),
  foreground: z.string().optional(),
  card: z.string().optional(),
  cardForeground: z.string().optional(),
  popover: z.string().optional(),
  popoverForeground: z.string().optional(),
  primary: z.string().optional(),
  primaryForeground: z.string().optional(),
  secondary: z.string().optional(),
  secondaryForeground: z.string().optional(),
  muted: z.string().optional(),
  mutedForeground: z.string().optional(),
  accent: z.string().optional(),
  accentForeground: z.string().optional(),
  destructive: z.string().optional(),
  destructiveForeground: z.string().optional(),
  border: z.string().optional(),
  input: z.string().optional(),
  ring: z.string().optional(),
});

const ThemeSpacingSchema = z.object({
  sides: z.string().optional(),
  modalSides: z.string().optional(),
  topSpacing: z.string().optional(),
});

const ThemeTypographySchema = z.object({
  fontFamily: z.object({
    sans: z.string().optional(),
    mono: z.string().optional(),
  }).optional(),
  fontSize: z.object({
    xs: z.string().optional(),
    sm: z.string().optional(),
    base: z.string().optional(),
    lg: z.string().optional(),
    xl: z.string().optional(),
    '2xl': z.string().optional(),
  }).optional(),
});

const ThemeSchema = z.object({
  colors: ThemeColorsSchema.optional(),
  spacing: ThemeSpacingSchema.optional(),
  typography: ThemeTypographySchema.optional(),
  borderRadius: z.string().optional(),
});

// Links and contacts
const ContactLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  target: z.string().optional(),
});

const LinksSchema = z.object({
  contact: z.array(ContactLinkSchema).optional(),
  social: z.array(ContactLinkSchema).optional(),
});

// Main content schema
const ContentSchema = z.object({
  assets: AssetsSchema.optional(),
  text: MultiLanguageTextSchema.optional(),
  seo: SEOContentSchema.optional(),
  navigation: NavigationSchema.optional(),
  links: LinksSchema.optional(),
});

export const ConfigSchema = z.object({
  configName: z.string().min(1, 'Config name is required'),
  products: ProductsSchema.optional(),
  content: ContentSchema.optional(),
  theme: ThemeSchema.optional(),
});

// Types
export type Config = z.infer<typeof ConfigSchema>;
export type TextContent = z.infer<typeof TextContentSchema>;
export type Assets = z.infer<typeof AssetsSchema>;
export type ContactLink = z.infer<typeof ContactLinkSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;
export type ThemeSpacing = z.infer<typeof ThemeSpacingSchema>;
export type ThemeTypography = z.infer<typeof ThemeTypographySchema>;
