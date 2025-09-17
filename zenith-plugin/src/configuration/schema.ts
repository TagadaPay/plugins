// Configuration schema types for the Tagada app
import { z } from 'zod';

// Individual Zod schemas for better type safety and validation
export const CustomerReviewSchema = z.object({
  author: z.string(),
  rating: z.number(),
  comment: z.string(),
  verified: z.boolean(),
});

export const FAQItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const USPItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  desc: z.string(),
});

export const LogoItemSchema = z.object({
  src: z.string(),
  alt: z.string(),
  href: z.string(),
});

export const HeroImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

export const HeroBenefitSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const HeroReviewsSchema = z.object({
  rating: z.string(),
  text: z.string(),
  reviews: z.array(CustomerReviewSchema),
  faq: z.array(FAQItemSchema),
});

export const HeroDataSchema = z.object({
  title1: z.string(),
  title2: z.string(),
  description: z.string(),
  benefits: z.array(HeroBenefitSchema),
  usps: z.array(USPItemSchema),
  productCardText: z.string(),
  reviews: HeroReviewsSchema,
});

export const FeaturedDataSchema = z.object({
  title: z.string(),
  logos: z.array(LogoItemSchema),
});

// Additional schemas extracted from TextContent
export const ProductCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  image: z.string(),
  quantity: z.number(),
});

export const ResultsDataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  image: z.string(),
  alt: z.string(),
  points: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
});

export const CompareDataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  image: z.string(),
  alt: z.string(),
});

export const FactsAndCertificationsSchema = z.object({
  title: z.string(),
  image: z.string(),
  rightText: z.string(),
  rightPoints: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
});

export const WhyChooseZenithSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  images: z.array(z.object({
    src: z.string(),
    alt: z.string(),
  })),
  points: z.array(z.object({
    title: z.string(),
    subtitle: z.string(),
    icon: z.string(),
  })),
});

export const ProductDetailsSchema = z.object({
  title: z.string(),
  sections: z.array(z.object({
    title: z.string(),
    points: z.array(z.string()),
  })),
});

export const WorkForYouSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  paragraphs: z.array(z.object({
    title: z.string(),
    subtitle: z.string(),
  })),
});

export const VideoDataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  videos: z.array(z.object({
    src: z.string(),
    poster: z.string(),
    title: z.string(),
  })),
});

export const ChooseYourSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  perks: z.array(z.string()),
});

export const ReviewsDataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  basedOn: z.string(),
  rating: z.string(),
  reviews: z.array(z.object({
    author: z.string(),
    rating: z.number(),
    comment: z.string(),
    verified: z.boolean(),
  })),
});

export const GuaranteeSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  points: z.array(z.object({
    title: z.string(),
    icon: z.string(),
  })),
});

export const FooterSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  button: z.string(),
  perks: z.array(z.string()),
});

export const AnnouncementBarSchema = z.object({
  enabled: z.boolean(),
  text: z.string(),
  backgroundColor: z.string(),
});

export const UITextSchema = z.object({
  // Button texts
  buyNow: z.string(),
  buyNowWithEmoji: z.string(),
  loading: z.string(),
  readAllReviews: z.string(),
  
  // Section titles
  bundleAndSave: z.string(),
  quickFAQ: z.string(),
  
  // UI elements
  verified: z.string(),
  toggleNavigationMenu: z.string(),
  
  // Product information
  productAltTextPrefix: z.string(),
  youSaveText: z.string(),
  
  // Image and navigation
  logoAlt: z.string(),
  previousImage: z.string(),
  nextImage: z.string(),
  
  
  // Recent purchase popup
  recentPurchase: z.object({
    firstNames: z.array(z.string()),
    flavors: z.array(z.string()),
    messageTemplate: z.string(),
  }),
});

export const KlaviyoSchema = z.object({
  enabled: z.boolean(),
  scriptId: z.string().optional(),
});

export const SEODataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  image: z.string().optional(),
  url: z.string().optional(),
  type: z.enum(['website', 'article', 'product']).optional(),
  siteName: z.string().optional(),
  locale: z.string().optional(),
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).optional(),
  twitterSite: z.string().optional(),
  twitterCreator: z.string().optional(),
  author: z.string().optional(),
  robots: z.string().optional(),
  canonical: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  availability: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
});

export const AssetsSchema = z.object({
  logo: z.string(),
  heroImages: z.array(HeroImageSchema),
  thumbnails: z.record(z.string(), z.string()).optional(),
});

export const ContactLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  target: z.string().optional(),
});

export const NavItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const ThemeSchema = z.object({
  colors: z.object({
    primaryColor: z.string(),
    primaryDark: z.string(),
    primaryLight: z.string(),
    primary50: z.string(),
    footerColor: z.string(),
  }),
  fonts: z.object({
    body: z.string().optional(),
    heading: z.string().optional(),
    mono: z.string().optional(),
  }).optional(),
});

export const TextContentSchema = z.object({
  hero: HeroDataSchema,
  featured: FeaturedDataSchema,
  faq: z.array(FAQItemSchema),
  benefitsBar: z.array(z.string()),
  results: ResultsDataSchema,
  compare: CompareDataSchema,
  factsAndCertifications: FactsAndCertificationsSchema,
  whyChooseZenith: WhyChooseZenithSchema,
  productDetails: ProductDetailsSchema,
  workForYou: WorkForYouSchema,
  video: VideoDataSchema,
  chooseYour: ChooseYourSchema,
  reviews: ReviewsDataSchema,
  guarantee: GuaranteeSchema,
  footer: FooterSchema,
  // SEO-related text fields
  siteName: z.string(),
  siteDescription: z.string(),
  brandName: z.string(),
  // Announcement bar
  announcementBar: AnnouncementBarSchema,
  // UI text elements
  uiText: UITextSchema,
});

export const PromotionSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  subtitle: z.string(),
  image: z.string(),
  freeGift: z.string().optional(),
  badge: z.string().optional(),
});

// StoreData schema with all fields required (not optional)
export const StoreDataSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  priceId: z.string(),
  promotions: z.array(PromotionSchema),
});

export const AppConfigSchema = z.object({
  configName: z.string(),
  productData: z.object({
    productName: z.string(),
    categories: z.array(z.string()),
  }),
  content: z.object({
    assets: AssetsSchema,
    text: z.record(z.string(), TextContentSchema),
    seo: z.record(z.string(), z.record(z.string(), SEODataSchema)),
    navigation: z.object({
      header: z.array(NavItemSchema),
    }),
    klaviyo: KlaviyoSchema,
  }),
  theme: ThemeSchema,
  storeData: StoreDataSchema,
});

// Export TypeScript types inferred from Zod schemas
export type CustomerReview = z.infer<typeof CustomerReviewSchema>;
export type FAQItem = z.infer<typeof FAQItemSchema>;
export type USPItem = z.infer<typeof USPItemSchema>;
export type LogoItem = z.infer<typeof LogoItemSchema>;
export type HeroImage = z.infer<typeof HeroImageSchema>;
export type HeroBenefit = z.infer<typeof HeroBenefitSchema>;
export type HeroReviews = z.infer<typeof HeroReviewsSchema>;
export type HeroData = z.infer<typeof HeroDataSchema>;
export type FeaturedData = z.infer<typeof FeaturedDataSchema>;
export type ProductCard = z.infer<typeof ProductCardSchema>;
export type ResultsData = z.infer<typeof ResultsDataSchema>;
export type CompareData = z.infer<typeof CompareDataSchema>;
export type FactsAndCertifications = z.infer<typeof FactsAndCertificationsSchema>;
export type WhyChooseZenith = z.infer<typeof WhyChooseZenithSchema>;
export type ProductDetails = z.infer<typeof ProductDetailsSchema>;
export type WorkForYou = z.infer<typeof WorkForYouSchema>;
export type VideoData = z.infer<typeof VideoDataSchema>;
export type ChooseYour = z.infer<typeof ChooseYourSchema>;
export type ReviewsData = z.infer<typeof ReviewsDataSchema>;
export type Guarantee = z.infer<typeof GuaranteeSchema>;
export type Footer = z.infer<typeof FooterSchema>;
export type AnnouncementBar = z.infer<typeof AnnouncementBarSchema>;
export type UIText = z.infer<typeof UITextSchema>;
export type Klaviyo = z.infer<typeof KlaviyoSchema>;
export type SEOData = z.infer<typeof SEODataSchema>;
export type Assets = z.infer<typeof AssetsSchema>;
export type ContactLink = z.infer<typeof ContactLinkSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type TextContent = z.infer<typeof TextContentSchema>;
export type Promotion = z.infer<typeof PromotionSchema>;
export type StoreData = z.infer<typeof StoreDataSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
