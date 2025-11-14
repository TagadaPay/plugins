import { TranslationText } from '@tagadapay/plugin-sdk/v2';

export interface HeroImage {
  src: string;
  alt: string;
}

export interface HeroBenefit {
  title: TranslationText;
  description: TranslationText;
}

export interface USPItem {
  icon: string;
  title: TranslationText;
  desc: TranslationText;
}

export interface CustomerReview {
  author: string;
  rating: number;
  comment: TranslationText;
  verified: boolean;
}

export interface FAQItem {
  question: TranslationText;
  answer: TranslationText;
}

export interface HeroReviews {
  rating: TranslationText;
  text: TranslationText;
  reviews: CustomerReview[];
  faq: FAQItem[];
}

export interface HeroData {
  title1: TranslationText;
  title2: TranslationText;
  description: TranslationText;
  benefits: HeroBenefit[];
  usps: USPItem[];
  productCardText: TranslationText;
  reviews: HeroReviews;
}

export interface LogoItem {
  src: string;
  alt: TranslationText;
  href: string;
}

export interface FeaturedData {
  title: TranslationText;
  logos: LogoItem[];
}

export interface ResultsPoint {
  title: TranslationText;
  description: TranslationText;
}

export interface ResultsData {
  title: TranslationText;
  subtitle: TranslationText;
  image: string;
  alt: TranslationText;
  points: ResultsPoint[];
}

export interface CompareData {
  title: TranslationText;
  subtitle: TranslationText;
  image: string;
  alt: TranslationText;
}

export interface CertificationPoint {
  title: TranslationText;
  description: TranslationText;
}

export interface FactsAndCertifications {
  title: TranslationText;
  image: string;
  rightText: TranslationText;
  rightPoints: CertificationPoint[];
}

export interface WhyChooseImage {
  src: string;
  alt: TranslationText;
}

export interface WhyChoosePoint {
  title: TranslationText;
  subtitle: TranslationText;
  icon: string;
}

export interface WhyChooseZenith {
  title: TranslationText;
  subtitle: TranslationText;
  images: WhyChooseImage[];
  points: WhyChoosePoint[];
}

export interface ProductDetailSection {
  title: TranslationText;
  points: TranslationText[];
}

export interface ProductDetails {
  title: TranslationText;
  sections: ProductDetailSection[];
}

export interface WorkForYouParagraph {
  title: TranslationText;
  subtitle: TranslationText;
}

export interface WorkForYou {
  title: TranslationText;
  subtitle: TranslationText;
  paragraphs: WorkForYouParagraph[];
}

export interface VideoItem {
  src: string;
  poster: string;
  title: TranslationText;
}

export interface VideoData {
  title: TranslationText;
  subtitle: TranslationText;
  videos: VideoItem[];
}

export interface ChooseYour {
  title: TranslationText;
  subtitle: TranslationText;
  perks: TranslationText[];
}

export interface ReviewItem {
  author: string;
  rating: number;
  comment: TranslationText;
  verified: boolean;
}

export interface ReviewsData {
  title: TranslationText;
  subtitle: TranslationText;
  basedOn: TranslationText;
  rating: TranslationText;
  reviews: ReviewItem[];
}

export interface GuaranteePoint {
  title: TranslationText;
  icon: string;
}

export interface Guarantee {
  title: TranslationText;
  subtitle: TranslationText;
  points: GuaranteePoint[];
}

export interface Footer {
  title: TranslationText;
  subtitle: TranslationText;
  button: TranslationText;
  perks: TranslationText[];
}

export interface AnnouncementBar {
  enabled: boolean;
  text: TranslationText;
  backgroundColor: string;
}

export interface RecentPurchase {
  firstNames: string[];
  flavors: string[];
  messageTemplate: TranslationText;
}

export interface UIText {
  buyNow: TranslationText;
  buyNowWithEmoji: TranslationText;
  loading: TranslationText;
  readAllReviews: TranslationText;
  bundleAndSave: TranslationText;
  quickFAQ: TranslationText;
  verified: TranslationText;
  toggleNavigationMenu: TranslationText;
  productAltTextPrefix: TranslationText;
  youSaveText: TranslationText;
  logoAlt: TranslationText;
  previousImage: TranslationText;
  nextImage: TranslationText;
  recentPurchase: RecentPurchase;
}

export interface Assets {
  logo: string;
  heroImages: HeroImage[];
  thumbnails?: Record<string, string>;
}

export interface SEOData {
  title?: TranslationText;
  description?: TranslationText;
  keywords?: TranslationText;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: TranslationText;
  locale?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  author?: TranslationText;
  robots?: string;
  canonical?: string;
  price?: string;
  currency?: string;
  availability?: string;
  brand?: TranslationText;
  category?: TranslationText;
}

export interface NavItem {
  label: TranslationText;
  href: string;
}

export interface Navigation {
  header: NavItem[];
}

export interface Klaviyo {
  enabled: boolean;
  scriptId?: string;
}

export interface Content {
  assets: Assets;
  hero: HeroData;
  featured: FeaturedData;
  faq: FAQItem[];
  benefitsBar: TranslationText[];
  results: ResultsData;
  compare: CompareData;
  factsAndCertifications: FactsAndCertifications;
  whyChooseZenith: WhyChooseZenith;
  productDetails: ProductDetails;
  workForYou: WorkForYou;
  video: VideoData;
  chooseYour: ChooseYour;
  reviews: ReviewsData;
  guarantee: Guarantee;
  footer: Footer;
  siteName: TranslationText;
  siteDescription: TranslationText;
  brandName: TranslationText;
  announcementBar: AnnouncementBar;
  uiText: UIText;
  seo: SEOData;
  navigation: Navigation;
  klaviyo: Klaviyo;
}

export interface Promotion {
  id: string;
  name: TranslationText;
  quantity: number;
  subtitle: TranslationText;
  image: string;
  freeGift?: TranslationText;
  badge?: TranslationText;
}

export interface StoreData {
  productId: string;
  variantId: string;
  priceId: string;
  promotions: Promotion[];
}

export interface ProductData {
  productName: string;
  categories: string[];
}

export interface ThemeColors {
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  primary50: string;
  footerColor: string;
}

export interface ThemeFonts {
  body?: string;
  heading?: string;
  mono?: string;
}

export interface Theme {
  colors: ThemeColors;
  fonts?: ThemeFonts;
}

export interface PluginConfig {
  configName: string;
  storeData: StoreData;
  productData: ProductData;
  content: Content;
  theme: Theme;
}
