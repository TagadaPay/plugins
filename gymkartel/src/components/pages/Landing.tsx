'use client';

import {
  Badge,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Headset,
  Heart,
  Instagram,
  Lock,
  MenuIcon,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import * as React from 'react';
import { useGymkartelController } from '../../hooks/use-controller';
import { useStoreData } from '../../hooks/useStoreData';
import { ProductCard, ProductPackageName } from '../ProductCard';
import { SelectionProvider } from '../providers';
import { StickyAddToCart } from '../sticky-add-to-cart';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { UserAvatar } from '../user-avatar';
import { useConfigContext, useBrandingContext, useContentContext, useAssetsContext } from '../../contexts/ConfigProvider';
import * as LucideIcons from 'lucide-react';

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate review data
const generateReviews = () => {
  const reviews = [];
  const firstNames = [
    'Sarah',
    'Emily',
    'Jessica',
    'Laura',
    'Olivia',
    'Sophia',
    'Ava',
    'Mia',
    'Isabella',
    'Charlotte',
    'Amelia',
    'Harper',
    'Evelyn',
    'Abigail',
    'Elizabeth',
    'Sofia',
    'Madison',
    'Avery',
    'Ella',
    'Scarlett',
  ];
  const fiveStarComments = [
    'These leggings are incredible! I can already see a difference in my cellulite after just 2 weeks.',
    'The 3D compression technology really works. My legs look so much smoother and toned!',
    "I've tried so many anti-cellulite products, but these leggings actually deliver results.",
    'Love how they instantly lift and shape my bum. I feel so confident wearing them!',
    "The quality is amazing and they're so comfortable to wear all day long.",
    'My legs have never looked better! The cellulite reduction is real.',
    'These leggings are a game-changer. I can see visible results after 3 months.',
    'Perfect fit and the 3D sculpting effect is noticeable immediately.',
    'I wear them during workouts and daily activities. The results speak for themselves!',
    'Finally found leggings that actually help with cellulite. Highly recommend!',
    'The compression feels amazing and my legs look so much more toned.',
    "Best investment I've made for my body confidence. Results are incredible!",
    "I can't believe how much my legs have improved. These leggings work!",
    'The before and after difference is amazing. So happy with my purchase!',
    'Comfortable, stylish, and actually effective. What more could you want?',
  ];
  const fourStarComments = [
    'Great leggings with noticeable results. Just wish they came in more colors.',
    'Really effective for cellulite reduction. Took about a month to see significant changes.',
    'Love the compression and comfort. The anti-cellulite effect is gradual but real.',
    'Good quality leggings that actually work. The 3D technology is impressive.',
    'Happy with the results so far. My legs definitely look smoother and more toned.',
  ];

  // 180 five-star reviews
  for (let i = 0; i < 180; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastNameInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    reviews.push({
      rating: 5,
      author: `${firstName} ${lastNameInitial}.`,
      comment: fiveStarComments[Math.floor(Math.random() * fiveStarComments.length)],
      verified: true,
    });
  }

  // 20 four-star reviews
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastNameInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    reviews.push({
      rating: 4,
      author: `${firstName} ${lastNameInitial}.`,
      comment: fourStarComments[Math.floor(Math.random() * fourStarComments.length)],
      verified: true,
    });
  }

  return shuffleArray(reviews);
};

// Add ReviewType type

type ReviewType = {
  rating: number;
  author: string;
  comment: string;
  verified: boolean;
};

// Helper function for localized content
function getLocalizedContent(content: any): string {
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content?.en) return content.en;
  return content?.toString() || '';
}

type ProductGridProps = {
  packages: any[];
  sizes: string[];
  onBuyNow: (packageName: ProductPackageName, colors: string[], sizes: string[]) => void;
  initLoading?: boolean;
  isLoading?: boolean;
};

const ProductGrid = React.memo(function ProductGrid({
  packages,
  sizes,
  onBuyNow,
  initLoading = false,
  isLoading = false,
}: ProductGridProps) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
      {packages.map((pkg) => {
        const requiredSelections = pkg.name as ProductPackageName;
        return (
          <ProductCard
            key={pkg.name}
            pkg={pkg}
            requiredSelections={requiredSelections}
            sizes={sizes}
            onBuyNow={onBuyNow}
            initLoading={initLoading}
            isLoading={isLoading}
          />
        );
      })}
    </div>
  );
});

export default function GymkartelLandingPage() {
  const { onBuyNow, initLoading, isLoading, packList, getAvailableSizes } = useGymkartelController();
  const { productOptions: storeProductOptions, availableSizes, isLoading: storeLoading } = useStoreData();
  const { getSectionText } = useConfigContext();
  const branding = useBrandingContext();
  const content = useContentContext();
  const assets = useAssetsContext();
  const [carouselApi, setCarouselApi] = React.useState<any>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Assets and videos for dynamic content
  console.log('[DEBUG] Assets:', assets);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Use store data for color options, fallback to config if store is loading or empty
  const productOptions = (storeLoading || storeProductOptions.length === 0) ? (content?.colorOptions || []) : storeProductOptions;
  
  
  // Use store data for sizes
  const sizes = availableSizes.length > 0 ? availableSizes : getAvailableSizes();

  // Debug logging
  console.log('[Landing] Store loading:', storeLoading);
  console.log('[Landing] Store product options:', storeProductOptions);
  console.log('[Landing] Final product options:', productOptions);
  console.log('[Landing] Available sizes:', availableSizes);

  const packages = packList.map((pack, idx) => {
    const items = pack.preview.items;
    const total = pack.preview.totalAdjustedAmount;
    const originalTotal = pack.preview.totalAmount;
    const pricePerUnit = items.length > 0 ? Math.round(items[0].adjustedAmount / items[0].quantity) : 0;
    const originalPricePerUnit = items.length > 0 ? Math.round(items[0].amount / items[0].quantity) : 0;
    const savings = originalTotal - total;
    return {
      name: pack.bundleName,
      colors: productOptions,
      price: total,
      originalPrice: originalTotal,
      pricePerUnit,
      originalPricePerUnit,
      savings,
      popular: idx === 1, // e.g. make the 2-pair pack popular
      preview: pack.preview,
      promotionIds: pack.promotionIds,
    };
  });


  React.useEffect(() => {
    if (!carouselApi) return;

    let intervalId: NodeJS.Timeout | null = null;

    if (!isHovered) {
      intervalId = setInterval(() => {
        if (carouselApi) {
          carouselApi.scrollNext();
        }
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [carouselApi, isHovered]);

  // Replace direct assignment with state and effect
  const [customerReviews, setCustomerReviews] = React.useState<ReviewType[]>([]);
  React.useEffect(() => {
    setCustomerReviews(generateReviews());
  }, []);

  return (
    <SelectionProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
            <svg
              className="h-10 w-10 animate-spin"
              style={{ color: branding?.primaryColor || '#dc2626' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        )}
        {/* Top Announcement Bar */}
        <div 
          className="w-full py-2 text-center text-sm font-medium text-white"
          style={{ backgroundColor: branding?.primaryColor || '#dc2626' }}
        >
          {getSectionText('announcementText') || '🔥 LIMITED TIME: Up to 62% OFF + FREE Worldwide Shipping!'}
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-white px-4 py-4 shadow-sm">
          <a href="#" className="text-2xl font-bold text-gray-800">
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={`${branding.companyName || 'Gymkartel'} Logo`}
                width={150}
                height={branding.logoHeight || 40}
                className="object-contain"
              />
            ) : (
              <span className="text-2xl font-bold" style={{ color: branding?.primaryColor || '#dc2626' }}>
                {branding?.logoText || branding?.companyName || 'Gymkartel'}
              </span>
            )}
          </a>
          <nav className="hidden space-x-6 md:flex">
            {content?.navigationLinks?.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-gray-600 hover:text-gray-900"
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                {link.label}
              </a>
            )) || (
              <>
                <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                <a href="#results" className="text-gray-600 hover:text-gray-900">Results</a>
                <a href="#choose-package" className="text-gray-600 hover:text-gray-900">Shop</a>
                <a href="#reviews" className="text-gray-600 hover:text-gray-900">Reviews</a>
              </>
            )}
          </nav>
          <Button
            className="hidden rounded-full px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl md:block"
            style={{ 
              backgroundColor: branding?.primaryColor || '#dc2626',
              '--hover-color': branding?.primaryColor ? `color-mix(in srgb, ${branding.primaryColor} 85%, black)` : '#b91c1c'
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              if (branding?.primaryColor) {
                e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${branding.primaryColor} 85%, black)`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = branding?.primaryColor || '#dc2626';
            }}
            asChild
          >
            <a href="#choose-package">{getSectionText('primaryButton') || 'Shop Now'}</a>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 py-6">
                <a href="#features" className="text-lg font-medium hover:text-gray-900">
                  Features
                </a>
                <a href="#results" className="text-lg font-medium hover:text-gray-900">
                  Results
                </a>
                <a href="#choose-package" className="text-lg font-medium hover:text-gray-900">
                  Shop
                </a>
                <a href="#reviews" className="text-lg font-medium hover:text-gray-900">
                  Reviews
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section
            id="hero"
            className="w-full bg-gradient-to-br from-pink-50 to-purple-50 px-4 py-8 text-center md:py-16"
          >
            <div className="container mx-auto flex flex-col items-center justify-center space-y-6 px-0 md:px-6">
              <h1 className="max-w-4xl text-2xl font-black leading-tight tracking-tight text-gray-900 sm:text-3xl md:text-5xl lg:text-6xl">
                {getSectionText('heroTitle') || 'Transform Your Business Today'}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
                {getSectionText('heroDescription') || 'Discover our premium products designed to deliver exceptional results for your needs'}
              </p>

              {/* Star Rating */}
              <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-800">4.9/5</span>
                <span className="text-sm text-gray-600">• {getSectionText('trustText') || 'Trusted by customers'}</span>
              </div>

              <Button
                variant="outline"
                className="rounded-full bg-transparent px-6 py-2 text-sm font-medium hover:bg-opacity-10"
                style={{
                  borderColor: branding?.primaryColor || '#dc2626',
                  color: branding?.primaryColor || '#dc2626'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${branding?.primaryColor || '#dc2626'}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                asChild
              >
                <a href="#choose-package">{getSectionText('secondaryButton') || 'Special Offer - Save Today'}</a>
              </Button>

              {/* Hero image - only show if configured */}
              {assets?.heroImage && (
                <div className="relative mx-auto mt-8 w-full max-w-md">
                  <img
                    src={assets.heroImage}
                    alt={getSectionText('heroImageAlt') || 'Product showcase'}
                    width={400}
                    height={400}
                    className="mx-auto h-auto w-full object-contain"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Media Bar Section - Only show if configured */}
          {content?.mediaPartners && content.mediaPartners.length > 0 && (
            <section className="w-full border-b border-t border-gray-100 bg-white px-4 py-8">
              <div className="container mx-auto px-0 text-center md:px-6">
                <p className="mb-6 text-xs font-medium uppercase tracking-wider text-gray-500">
                  AS FEATURED IN
                </p>
                <div className="relative overflow-hidden">
                  <div className="animate-scroll flex items-center gap-8 md:gap-12">
                    {/* First set of logos */}
                    {content.mediaPartners.map((partner, index) => (
                      <div key={index} className={`flex h-12 flex-shrink-0 transform items-center justify-center opacity-70 transition-all duration-300 hover:scale-105 hover:opacity-100`} style={{ width: `${(partner.width || 80) / 4}rem` }}>
                        <img
                          src={partner.logoUrl}
                          alt={partner.altText || partner.name}
                          width={partner.width || 80}
                          height={partner.height || 48}
                          className="h-auto max-h-full w-auto max-w-full object-contain grayscale filter transition-all duration-300 hover:grayscale-0"
                        />
                      </div>
                    ))}

                    {/* Duplicate set for seamless loop */}
                    {content.mediaPartners.map((partner, index) => (
                      <div key={`duplicate-${index}`} className={`flex h-12 flex-shrink-0 transform items-center justify-center opacity-70 transition-all duration-300 hover:scale-105 hover:opacity-100`} style={{ width: `${(partner.width || 80) / 4}rem` }}>
                        <img
                          src={partner.logoUrl}
                          alt={partner.altText || partner.name}
                          width={partner.width || 80}
                          height={partner.height || 48}
                          className="h-auto max-h-full w-auto max-w-full object-contain grayscale filter transition-all duration-300 hover:grayscale-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Color Showcase Section - Only show if colors are available from store */}
          {productOptions && productOptions.length > 0 && (
            <section className="w-full bg-white px-4 py-12 md:py-24">
              <div className="container mx-auto px-0 text-center md:px-6">
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                  {getSectionText('colorShowcaseTitle') || `Available in ${productOptions.length} Colors`}
                </h2>
                <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
                  {getSectionText('colorShowcaseDescription') || 'Choose your favorite color and find your perfect style'}
                </p>
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
                  {productOptions.map((color, index) => (
                    <div key={index} className="text-center">
                      <img
                        src={color.image}
                        alt={`${color.name} Product`}
                        width={200}
                        height={300}
                        className="mb-4 h-auto w-full rounded-xl shadow-lg"
                      />
                      <h3 className="mb-3 text-xl font-semibold text-gray-900 md:text-2xl">{color.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Before/After Results Section - Only show if result images are configured */}
          {content?.resultImages && content.resultImages.length > 0 && (
            <section id="results" className="w-full bg-gray-50 px-4 py-12 md:py-24">
              <div className="container mx-auto px-0 text-center md:px-6">
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                  {getSectionText('resultsTitle') || 'Real Results'}
                </h2>
                <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
                  {getSectionText('resultsDescription') || 'See the incredible transformations our customers have achieved'}
                </p>
                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
                  {content.resultImages.slice(0, 3).map((resultImage, index) => (
                    <div key={index} className="relative">
                      <img
                        src={resultImage.url}
                        alt={resultImage.altText || `Result ${index + 1}`}
                        width={400}
                        height={400}
                        className="h-auto w-full rounded-xl shadow-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Features Section */}
          <section id="features" className="w-full bg-white px-4 py-12 md:py-24">
            <div className="container mx-auto px-0 text-center md:px-6">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                {getSectionText('productTechTitle') || 'Revolutionary 3D Technology'}
              </h2>
              <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
                {getSectionText('productTechDescription') || 'Advanced compression technology that targets cellulite at the source and sculpts your body'}
              </p>
              <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
                <img
                  src="/images/leggings-features.png"
                  alt={getSectionText('featuresImageAlt') || 'Leggings Features'}
                  width={400}
                  height={400}
                  className="h-auto w-full rounded-xl shadow-lg"
                />
                <img
                  src="/images/3d-compression-tech.png"
                  alt="3D Compression Technology"
                  width={400}
                  height={400}
                  className="h-auto w-full rounded-xl shadow-lg"
                />
              </div>
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
                <img
                  src="/images/fights-cellulite-source.png"
                  alt={getSectionText('celluliteImageAlt') || 'Fights Cellulite at Source'}
                  width={400}
                  height={400}
                  className="h-auto w-full rounded-xl shadow-lg"
                />
                <img
                  src="/images/calorie-burn-comparison.png"
                  alt={getSectionText('calorieImageAlt') || 'Calorie Burn Comparison'}
                  width={400}
                  height={400}
                  className="h-auto w-full rounded-xl shadow-lg"
                />
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="w-full bg-gray-50 px-4 py-12 md:py-24">
            <div className="container mx-auto px-0 text-center md:px-6">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                {getSectionText('featuresTitle') || 'How It Works'}
              </h2>
              <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
                {getSectionText('featuresDescription') || 'Our technology works to transform your body'}
              </p>
              <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
                {content?.features?.map((feature, index) => {
                  const IconComponent = feature.iconName ? LucideIcons[feature.iconName as keyof typeof LucideIcons] as React.ComponentType<any> : null
                  return (
                    <Card key={index} className="overflow-hidden rounded-2xl border-0 bg-white/95 shadow-xl backdrop-blur-sm">
                      <CardContent className="space-y-3 p-6 text-center">
                        {IconComponent && (
                          <IconComponent 
                            className="mx-auto h-12 w-12" 
                            style={{ color: branding?.primaryColor || '#e11d48' }}
                          />
                        )}
                        <h3 className="mb-3 text-xl font-semibold text-gray-900 md:text-2xl">
                          {getLocalizedContent(feature.title)}
                        </h3>
                        <p className="text-base leading-relaxed text-gray-600 md:text-lg">
                          {getLocalizedContent(feature.description)}
                        </p>
                      </CardContent>
                    </Card>
                  )
                }) || (
                  // Fallback features if none in config
                  <>
                    <Card className="overflow-hidden rounded-2xl border-0 bg-white/95 shadow-xl backdrop-blur-sm">
                      <CardContent className="space-y-3 p-6 text-center">
                        <Target className="mx-auto h-12 w-12" style={{ color: branding?.primaryColor || '#e11d48' }} />
                        <h3 className="mb-3 text-xl font-semibold text-gray-900 md:text-2xl">Target Cellulite</h3>
                        <p className="text-base leading-relaxed text-gray-600 md:text-lg">
                          3D compression lines target stubborn fat cells and increase blood flow by 30% to smooth your skin
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden rounded-2xl border-0 bg-white/95 shadow-xl backdrop-blur-sm">
                      <CardContent className="space-y-3 p-6 text-center">
                        <Zap className="mx-auto h-12 w-12" style={{ color: branding?.primaryColor || '#e11d48' }} />
                        <h3 className="mb-3 text-xl font-semibold text-gray-900 md:text-2xl">Burn 3X More Calories</h3>
                        <p className="text-base leading-relaxed text-gray-600 md:text-lg">
                          Advanced compression activates your muscles to work harder, burning 3X more calories with every step
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden rounded-2xl border-0 bg-white/95 shadow-xl backdrop-blur-sm">
                      <CardContent className="space-y-3 p-6 text-center">
                        <TrendingUp className="mx-auto h-12 w-12" style={{ color: branding?.primaryColor || '#e11d48' }} />
                        <h3 className="mb-3 text-xl font-semibold text-gray-900 md:text-2xl">Instant Lift & Shape</h3>
                        <p className="text-base leading-relaxed text-gray-600 md:text-lg">
                          Immediately lifts and shapes your bum while toning your legs for a sleeker, sexier silhouette
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* See Product in Action Section - Only show if videos are configured */}
          {assets?.videos && assets.videos.length > 0 && (
            <section className="w-full bg-white px-4 py-12 md:py-24">
              <div className="container mx-auto px-0 text-center md:px-6">
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                  {getSectionText('videosTitle') || 'See Product in Action'}
                </h2>
                <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
                  {getSectionText('videosDescription') || 'Watch real customers experience the transformation'}
                </p>

                {/* Desktop: Carousel, Mobile: 2x2 Grid */}
                <div className="mx-auto max-w-6xl">
                  {/* Mobile Grid (2x2) */}
                  <div className="grid grid-cols-2 gap-4 md:hidden">
                    {assets.videos.slice(0, 4).map((videoUrl, index) => (
                      <div key={index} className="relative aspect-[9/16] overflow-hidden rounded-xl shadow-lg">
                        <video className="h-full w-full object-cover" autoPlay muted loop playsInline controls>
                          <source src={videoUrl} type="video/mp4" />
                        </video>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Carousel */}
                  <div className="scrollbar-hide -mx-2 hidden gap-6 overflow-x-auto px-2 pb-4 md:flex">
                    {assets.videos.map((videoUrl, index) => (
                      <div key={index} className="relative aspect-[9/16] w-64 flex-shrink-0 overflow-hidden rounded-xl shadow-lg">
                        <video className="h-full w-full object-cover" autoPlay muted loop playsInline controls>
                          <source src={videoUrl} type="video/mp4" />
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Technology Section - Only show if technology features are configured */}
          {content?.technologyFeatures && content.technologyFeatures.length > 0 && (
            <section 
              className="w-full px-4 py-12 text-white md:py-24"
              style={{ 
                background: branding?.secondaryColor 
                  ? `linear-gradient(to bottom right, ${branding.primaryColor}, ${branding.secondaryColor})` 
                  : `linear-gradient(to bottom right, ${branding?.primaryColor || '#e11d48'}, #9333ea)`
              }}
            >
              <div className="container mx-auto px-0 text-center md:px-6">
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                  {getSectionText('technologyTitle') || 'Revolutionary Technology'}
                </h2>
                <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-pink-100 md:text-lg">
                  {getSectionText('technologyDescription') || 'Discover the science behind our technology'}
                </p>

                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {content?.technologyFeatures && content.technologyFeatures.map((feature, index) => {
                    const IconComponent = feature.icon ? LucideIcons[feature.icon as keyof typeof LucideIcons] as React.ComponentType<any> : null
                    return (
                      <div key={index} className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-sm">
                        <div 
                          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                          style={{ backgroundColor: branding?.primaryColor || '#e11d48' }}
                        >
                          {IconComponent && <IconComponent className="h-8 w-8 text-white" />}
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-white md:text-2xl">
                          {getLocalizedContent(feature.title)}
                        </h3>
                        <p className="text-base leading-relaxed text-pink-100 md:text-lg">
                          {getLocalizedContent(feature.description)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Scientific Benefits - Only show if scientific stats are configured */}
          {content?.scientificStats && content.scientificStats.length > 0 && (
            <section className="w-full bg-gradient-to-br from-purple-600 to-pink-600 px-4 py-12 md:py-24">
              <div className="container mx-auto px-0 text-center md:px-6">
                <div className="mx-auto mt-16 max-w-4xl rounded-2xl bg-white/5 p-8 backdrop-blur-sm">
                  <h3 className="mb-3 text-xl font-semibold text-white md:text-2xl">
                    {getSectionText('scientificTitle') || 'Scientifically Proven Results'}
                  </h3>
                  <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                    {content?.scientificStats?.map((stat, index) => (
                      <div key={index}>
                        <div className="mb-2 text-4xl font-bold text-pink-300">
                          {getLocalizedContent(stat.value)}
                        </div>
                        <p className="text-base leading-relaxed text-pink-100 md:text-lg">
                          {getLocalizedContent(stat.label)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Choose Package Section */}
          <section id="choose-package" className="w-full bg-white px-4 py-12 md:py-24">
            <div className="container mx-auto px-0 text-center md:px-6">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                {getSectionText('packageTitle') || 'Choose Your Package'}
              </h2>
              <p className="mb-12 text-base leading-relaxed text-gray-600 md:text-lg">
                {getSectionText('packageDescription') || 'Select the package that best fits your needs and budget'}
              </p>
              <ProductGrid
                packages={packages}
                sizes={sizes}
                onBuyNow={onBuyNow}
                initLoading={initLoading}
                isLoading={isLoading}
              />
              <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
                {content?.trustBadges?.map((badge, index) => (
                  <span key={index} className="flex items-center gap-1">
                    <CheckCircle 
                      className="h-4 w-4" 
                      style={{ color: branding?.primaryColor || '#e11d48' }}
                    /> 
                    {getLocalizedContent(badge.text)}
                  </span>
                )) || (
                  // Fallback trust badges
                  <>
                    <span className="flex items-center gap-1">
                      <CheckCircle 
                        className="h-4 w-4" 
                        style={{ color: branding?.primaryColor || '#e11d48' }}
                      /> 
                      Free worldwide shipping
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle 
                        className="h-4 w-4" 
                        style={{ color: branding?.primaryColor || '#e11d48' }}
                      /> 
                      180-day money-back guarantee
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle 
                        className="h-4 w-4" 
                        style={{ color: branding?.primaryColor || '#e11d48' }}
                      /> 
                      Scientifically proven results
                    </span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Customer Reviews Section - Only show if review config is provided */}
          {content?.reviewConfig && (
            <section id="reviews" className="w-full bg-pink-50 px-4 py-12 md:py-24">
              <div className="container mx-auto px-0 text-center md:px-6">
                <div className="mb-4 flex items-center justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-2xl font-bold text-gray-800">4.9/5</span>
                </div>
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                  {getSectionText('reviewsTitle') || 'Customer Reviews'}
                </h2>
                <p className="mb-2 text-base leading-relaxed text-gray-600 md:text-lg">
                  {getSectionText('reviewsDescription') || 'See what our customers are saying'}
                </p>
                <p className="mb-12 text-sm text-gray-600">Based on verified customer reviews</p>

                {/* Reviews Carousel */}
                <div className="relative mx-auto max-w-6xl px-4">
                  <Carousel
                    opts={{
                      align: 'start',
                      loop: true,
                    }}
                    className="w-full"
                    setApi={(api) => {
                      // Store the API for external navigation
                      if (api) {
                        // We'll use this API for external navigation
                        setCarouselApi(api);
                      }
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <CarouselContent className="-ml-4">
                      {customerReviews.length > 0 &&
                        customerReviews.map((review, index) => (
                          <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="h-full p-2">
                              <Card className="flex h-full flex-col p-6 text-left shadow-md">
                                <CardContent className="flex flex-1 flex-col space-y-3 p-0">
                                  <div className="mb-2 flex items-center gap-2">
                                    <UserAvatar
                                      initials={review.author
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('. ')}
                                    />
                                    <span className="font-semibold text-gray-800">{review.author}</span>
                                    {review.verified && (
                                      <Badge className="bg-green-100 text-green-700">Verified</Badge>
                                    )}
                                  </div>
                                  <div className="mb-2 flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="flex-1 text-gray-700">{`"${review.comment}"`}</p>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                    </CarouselContent>
                  </Carousel>

                  {/* Navigation Buttons - Outside the carousel */}
                  <div className="mt-6 flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer rounded-full bg-white/80 shadow-md transition-colors hover:bg-gray-100"
                      onClick={() => {
                        if (carouselApi) {
                          carouselApi.scrollPrev();
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous slide</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer rounded-full bg-white/80 shadow-md transition-colors hover:bg-gray-100"
                      onClick={() => {
                        if (carouselApi) {
                          carouselApi.scrollNext();
                        }
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next slide</span>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Guarantee Section - Only show if guarantee items are configured */}
          {content?.guaranteeItems && content.guaranteeItems.length > 0 && (
            <section className="w-full bg-pink-50 px-4 py-12 md:py-24">
              <div className="container mx-auto px-0 text-center md:px-6">
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                  {getSectionText('guaranteeTitle') || 'Our Guarantee'}
                </h2>
                <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
                  {getSectionText('guaranteeDescription') || 'We stand behind our products with these guarantees'}
                </p>
                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
                  {content.guaranteeItems.map((item, index) => {
                    const IconComponent = item.icon ? LucideIcons[item.icon as keyof typeof LucideIcons] as React.ComponentType<any> : null;
                    return (
                      <div key={index} className="flex flex-col items-center space-y-3">
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt="" className="h-12 w-12" />
                        ) : IconComponent ? (
                          <IconComponent 
                            className="h-12 w-12" 
                            style={{ color: branding?.primaryColor || '#dc2626' }}
                          />
                        ) : (
                          <ShieldCheck 
                            className="h-12 w-12" 
                            style={{ color: branding?.primaryColor || '#dc2626' }}
                          />
                        )}
                        <span className="text-lg font-semibold text-gray-800">
                          {getLocalizedContent(item.title)}
                        </span>
                        {item.description && (
                          <p className="text-sm text-gray-600">
                            {getLocalizedContent(item.description)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Final CTA Section */}
          <section 
            className="w-full px-4 py-12 text-center text-white md:py-24"
            style={{ backgroundColor: branding?.primaryColor || '#dc2626' }}
          >
            <div className="container mx-auto flex flex-col items-center justify-center space-y-6 px-0 md:px-6">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                {getSectionText('ctaTitle') || 'Transform Your Body Today'}
              </h2>
              <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">
                {getSectionText('ctaDescription') || 'Join thousands of women who have achieved their dream body with Gymkartel 3D Sculpting Leggings'}
              </p>
              <Button
                className="transform rounded-full bg-white px-8 py-4 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-xl"
                style={{ color: branding?.primaryColor || '#dc2626' }}
                asChild
              >
                <a href="#choose-package">Start Your Transformation Now</a>
              </Button>
              <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" /> Scientifically Proven
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> 3D Technology
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Instant Results
                </span>
              </div>
            </div>
          </section>

          {/* Payment Security Section */}
          <section className="w-full bg-gray-100 px-4 py-8">
            <div className="container mx-auto px-0 text-center md:px-6">
              <div className="flex flex-col items-center space-y-6">
                {/* Secure Payment Text */}
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-gray-800">Secure Payment</span>
                </div>

                {/* Payment Cards - Only show if payment methods are configured */}
                {content?.paymentMethods && content.paymentMethods.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                    {content.paymentMethods.map((payment, index) => (
                      <div key={index} className="flex h-10 w-16 items-center justify-center rounded-lg bg-white p-2 shadow-sm">
                        <img
                          src={payment.logoUrl}
                          alt={payment.altText || payment.name}
                          width={payment.width || 40}
                          height={payment.height || 24}
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* SSL Badge */}
                <div className="flex items-center gap-2">
                  <img
                    src="/images/ssl-secure.png"
                    alt={getSectionText('sslSecureAlt') || 'SSL Secure'}
                    width={80}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                  <span className="text-sm text-gray-600">256-bit SSL encryption</span>
                </div>

                <p className="max-w-md text-sm text-gray-600">
                  Your payment information is processed securely. We do not store credit card details nor have
                  access to your credit card information.
                </p>
              </div>
            </div>
          </section>

          {/* Footer Section */}
          <footer className="w-full bg-gray-900 px-4 py-12 text-white">
            <div className="container mx-auto px-0 md:px-6">
              <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
                {/* Company Info */}
                <div className="space-y-4">
                  {branding?.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt={`${branding.companyName} Logo`}
                      width={150}
                      height={40}
                      className="object-contain brightness-0 invert"
                    />
                  ) : (
                    <div className="text-xl font-bold text-white">
                      {branding?.logoText || branding?.companyName || 'Brand Name'}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-gray-300">
                    {getSectionText('footerDescription') || content?.footerDescription || 'Transform your body with our revolutionary technology.'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-300">
                      {content?.footerRating || '4.9/5 • 15,000+ reviews'}
                    </span>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {getSectionText('footerQuickLinksTitle') || 'Quick Links'}
                  </h3>
                  <ul className="space-y-2">
                    {content?.footerQuickLinks?.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url}
                          className="text-sm text-gray-300 transition-colors hover:text-white"
                        >
                          {getLocalizedContent(link.text)}
                        </a>
                      </li>
                    )) || (
                      // Fallback links
                      <>
                        <li>
                          <a
                            href="#features"
                            className="text-sm text-gray-300 transition-colors hover:text-white"
                          >
                            Features
                          </a>
                        </li>
                        <li>
                          <a href="#results" className="text-sm text-gray-300 transition-colors hover:text-white">
                            Results
                          </a>
                        </li>
                        <li>
                          <a
                            href="#choose-package"
                            className="text-sm text-gray-300 transition-colors hover:text-white"
                          >
                            Shop
                          </a>
                        </li>
                        <li>
                          <a href="#reviews" className="text-sm text-gray-300 transition-colors hover:text-white">
                            Reviews
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Legal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {getSectionText('footerLegalTitle') || 'Legal'}
                  </h3>
                  <ul className="space-y-2">
                    {content?.footerLegalLinks?.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url}
                          className="text-sm text-gray-300 transition-colors hover:text-white"
                        >
                          {getLocalizedContent(link.text)}
                        </a>
                      </li>
                    )) || (
                      // Fallback legal links
                      <>
                        <li>
                          <a
                            href="/privacy-policy"
                            className="text-sm text-gray-300 transition-colors hover:text-white"
                          >
                            Privacy Policy
                          </a>
                        </li>
                        <li>
                          <a
                            href="/terms-of-service"
                            className="text-sm text-gray-300 transition-colors hover:text-white"
                          >
                            Terms of Service
                          </a>
                        </li>
                        <li>
                          <a
                            href="/return-policy"
                            className="text-sm text-gray-300 transition-colors hover:text-white"
                          >
                            Return Policy
                          </a>
                        </li>
                        <li>
                          <a
                            href="/shipping-info"
                            className="text-sm text-gray-300 transition-colors hover:text-white"
                          >
                            Shipping Info
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {getSectionText('footerContactTitle') || 'Contact Us'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Headset 
                        className="h-4 w-4" 
                        style={{ color: branding?.primaryColor || '#fb7185' }}
                      />
                      <span className="text-sm text-gray-300">
                        {content?.contactInfo?.supportText || '24/7 Customer Support'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">
                        📞 {content?.contactInfo?.phone || '1-800-GYMKARTEL'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">
                        📧 {content?.contactInfo?.email || 'support@gymkartel.com'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">
                        💬 {content?.contactInfo?.chatText || 'Live Chat Available'}
                      </span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-gray-400">
                        {content?.contactInfo?.hours || 'Mon-Fri: 9AM-8PM EST\nSat-Sun: 10AM-6PM EST'}
                      </p>
                    </div>

                    {/* Social Media Links */}
                    <div className="pt-4">
                      <h4 className="mb-3 text-sm font-semibold text-white">
                        {getSectionText('footerSocialTitle') || 'Follow Us'}
                      </h4>
                      <div className="flex items-center gap-3">
                        {content?.socialLinks?.map((social, index) => {
                          const IconComponent = social.iconName ? LucideIcons[social.iconName as keyof typeof LucideIcons] as React.ComponentType<any> : null
                          return (
                            <a
                              key={index}
                              href={social.url}
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 ${
                                social.platform === 'instagram' 
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                  : social.platform === 'facebook'
                                  ? 'bg-blue-600'
                                  : social.platform === 'tiktok'
                                  ? 'bg-black'
                                  : 'bg-gray-600'
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {IconComponent && <IconComponent className="h-4 w-4 text-white" />}
                            </a>
                          )
                        }) || (
                          // Fallback social links
                          <>
                            <a
                              href="https://instagram.com/gymkartel"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-200 hover:scale-110"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="h-4 w-4 text-white" />
                            </a>
                            <a
                              href="https://facebook.com/gymkartel"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 transition-transform duration-200 hover:scale-110"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Facebook className="h-4 w-4 text-white" />
                            </a>
                            <a
                              href="https://tiktok.com/@gymkartel"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-black transition-transform duration-200 hover:scale-110"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                              </svg>
                            </a>
                          </>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        Join 500K+ followers for daily tips & transformations
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-700 pt-8">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <div className="text-sm text-gray-400">© 2024 Gymkartel. All rights reserved.</div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span>Made with ❤️ for women worldwide</span>
                    <span>•</span>
                    <span>FDA Approved Materials</span>
                    <span>•</span>
                    <span>Eco-Friendly Packaging</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
      <StickyAddToCart />
    </SelectionProvider>
  );
}
