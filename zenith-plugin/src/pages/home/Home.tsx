import { Button } from '@/src/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { UserAvatar } from '@/src/components/user-avatar';
import {
  CheckCircle,
  Star,
  MenuIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/src/components/ui/sheet';
import { useRef, useState, Suspense, lazy } from 'react';
import { useSwipeable } from 'react-swipeable';

// Lazy load components that appear lower on the page or are less critical for initial render
const BenefitsBar = lazy(() => import('@/src/components/benefits-bar').then(module => ({ default: module.BenefitsBar })));
const LogoBar = lazy(() => import('@/src/components/logo-bar').then(module => ({ default: module.LogoBar })));
const SectionSeparator = lazy(() => import('@/src/components/section-separator').then(module => ({ default: module.SectionSeparator })));
const StickyAddToCart = lazy(() => import('@/src/components/sticky-add-to-cart').then(module => ({ default: module.StickyAddToCart })));
import { useLandingPageController } from '@/src/hooks/use-controller';
import { ProductCard } from '@/src/components/ProductCard';
import { Spinner } from '@/src/components/ui/spinner';

// Lazy load Accordion components since they appear lower on the page
const Accordion = lazy(() => import('@/src/components/ui/accordion').then(module => ({ default: module.Accordion })));
const AccordionContent = lazy(() => import('@/src/components/ui/accordion').then(module => ({ default: module.AccordionContent })));
const AccordionItem = lazy(() => import('@/src/components/ui/accordion').then(module => ({ default: module.AccordionItem })));
const AccordionTrigger = lazy(() => import('@/src/components/ui/accordion').then(module => ({ default: module.AccordionTrigger })));
import { formatSimpleMoney } from '@tagadapay/plugin-sdk';
import { useKlaviyoTracking } from '@/src/hooks/use-klaviyo-tracking';
import { useEffect } from 'react';
import { useStoreData } from '@/src/hooks/use-store-data';
import { useTagataConfig } from '@/src/hooks/use-tagada-context';
import SEO from '@/src/components/seo';

// Types are already defined in the schema and will be inferred
import type { IconName } from '@/src/components/ui/universal-icon';
// Lazy load UniversalIcon since it's used throughout but not critical for initial render
const UniversalIcon = lazy(() => import('@/src/components/ui/universal-icon').then(module => ({ default: module.UniversalIcon })));

export default function Home() {
  const {
    packList,
    selectedPack,
    onSelectPack,
    onBuyNow,
    initLoading,
    isLoading,
    product,
  } = useLandingPageController();

  const { trackActiveOnSite, trackViewedProduct } = useKlaviyoTracking();
  const { productId, variantId, promotions } = useStoreData();
  const { content, config } = useTagataConfig();

  // Import all components from config
  const heroData = config?.content?.text?.en?.hero;
  const featuredData = config?.content?.text?.en?.featured;
  const faq = config?.content?.text?.en?.faq;
  const benefitsBar = config?.content?.text?.en?.benefitsBar;
  const results = config?.content?.text?.en?.results;
  const compare = config?.content?.text?.en?.compare;
  const factsAndCertifications =
    config?.content?.text?.en?.factsAndCertifications;
  const whyChooseZenith = config?.content?.text?.en?.whyChooseZenith;
  const productDetails = config?.content?.text?.en?.productDetails;
  const workForYou = config?.content?.text?.en?.workForYou;
  const video = config?.content?.text?.en?.video;
  const chooseYour = config?.content?.text?.en?.chooseYour;
  const reviews = config?.content?.text?.en?.reviews;
  const guarantee = config?.content?.text?.en?.guarantee;
  const footer = config?.content?.text?.en?.footer;
  const announcementBar = config?.content?.text?.en?.announcementBar;
  const uiText = config?.content?.text?.en?.uiText;
  const assets = config?.content?.assets;
  const header = config?.content?.navigation?.header;
  const productData = config?.productData;

  // Extract specific data from hero section
  const customerReviews = heroData?.reviews?.reviews || [];
  const faqItems = heroData?.reviews?.faq || [];
  const usps = heroData?.usps || [];
  const logoBarImages = featuredData?.logos || [];

  // Track Klaviyo events when component mounts
  useEffect(() => {
    // Small delay to ensure Klaviyo script is loaded
    const timer = setTimeout(() => {
      // Track Active on Site
      trackActiveOnSite();

      // Track Viewed Product if we have product data
      if (product) {
        trackViewedProduct({
          productId: productId,
          productName: productData?.productName || '',
          variantId: variantId,
          price: selectedPack?.preview?.totalAdjustedAmount || 0,
          currency: 'USD',
          sku: variantId,
          categories: productData?.categories || [],
          imageUrl:
            product.variants[0]?.imageUrl || assets?.heroImages[0]?.src || '',
          url: window.location.href,
        });
      }
    }, 1000); // 1 second delay to ensure scripts are loaded

    return () => clearTimeout(timer);
  }, [product, selectedPack, trackActiveOnSite, trackViewedProduct]);

  const reviewsRef = useRef<HTMLDivElement>(null);
  const scrollReviews = (direction: 'left' | 'right') => {
    if (reviewsRef.current) {
      const scrollAmount = reviewsRef.current.offsetWidth / 2; // Scroll half the visible width
      if (direction === 'left') {
        reviewsRef.current.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth',
        });
      } else {
        reviewsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // --- Hero Image Carousel ---
  const heroImages = assets?.heroImages || [];
  const [heroIndex, setHeroIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Enhanced swipe functionality for better mobile experience
  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setHeroIndex(i => (i < heroImages.length - 1 ? i + 1 : 0));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setHeroIndex(i => (i > 0 ? i - 1 : heroImages.length - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrev,
    onSwiping: eventData => {
      // Prevent default scrolling behavior during horizontal swipes
      if (Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY)) {
        eventData.event.preventDefault();
      }
    },
    trackMouse: false, // Disable mouse tracking for better mobile experience
    trackTouch: true,
    delta: 60, // Minimum distance for swipe detection (more responsive)
    preventScrollOnSwipe: true, // Prevent page scroll during swipe
    rotationAngle: 0,
    swipeDuration: 500, // Maximum time for swipe
    touchEventOptions: { passive: false }, // Allow preventDefault
  });

  // --- Mobile Menu Sheet State ---
  const [menuOpen, setMenuOpen] = useState(false);
  const handleMenuLinkClick = () => setMenuOpen(false);

  // Show loading spinner if initializing
  if (initLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <SEO {...content.getSEO('/')} />
      {/* Top Announcement Bar */}
      {announcementBar?.enabled && (
        <div
          className={`w-full text-white text-center py-2 text-sm font-medium bg-${announcementBar.backgroundColor}`}
        >
          {announcementBar.text}
        </div>
      )}
      {/* Header */}
      <header className="w-full bg-white py-4 px-4 flex items-center justify-between shadow-md sticky top-0 z-50 border-b border-gray-100">
        {/* Mobile: Centered logo, Desktop: left-aligned */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 z-10">
          <Link to="#" className="text-2xl font-bold text-gray-800">
            <img
              src={assets?.logo}
              alt={uiText?.logoAlt || "Logo"}
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>
        <nav className="hidden md:flex space-x-3 lg:space-x-6">
          {header?.map(item => (
            <a
              href={item.href}
              className="text-gray-800 hover:text-primary-color transition-colors duration-200 text-sm lg:text-base font-medium px-2 py-1 rounded hover:bg-primary-50"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Button
          className="hidden md:block text-white font-semibold px-4 lg:px-6 transition-all duration-200 hover:shadow-lg"
          style={{ backgroundColor: 'var(--primary-color)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
          onClick={() => onBuyNow(selectedPack?.bundleName || '')}
        >
          {uiText?.buyNow || 'Buy Now'}
        </Button>

        {/* Mobile Menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-300 hover:bg-primary-50"
              onMouseEnter={e =>
                (e.currentTarget.className = e.currentTarget.className.replace('hover:bg-primary-50', 'bg-primary-50'))
              }
              onMouseLeave={e =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">{uiText?.toggleNavigationMenu || 'Toggle navigation menu'}</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="pt-8 px-6 w-4/5 max-w-xs bg-white"
          >
            <div className="flex flex-col gap-6">
              <div className="text-center pb-4 border-b border-gray-200">
                <img
                  src={assets?.logo}
                  alt={uiText?.logoAlt || "Logo"}
                  width={80}
                  height={27}
                  className="object-contain mx-auto"
                />
              </div>
              {header?.map(item => (
                <a
                  href={item.href}
                  className="flex items-center text-lg font-medium text-gray-800 hover:text-primary-color py-3 px-2 rounded hover:bg-primary-50 transition-all duration-200"
                  onClick={handleMenuLinkClick}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <Button
                  className="w-full text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 bg-primary-color"
                  onMouseEnter={e =>
                    (e.currentTarget.className = e.currentTarget.className.replace('bg-primary-color', 'bg-primary-dark'))
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.className = e.currentTarget.className.replace('bg-primary-dark', 'bg-primary-color'))
                  }
                  onClick={() => {
                    onBuyNow(selectedPack?.bundleName || '');
                    handleMenuLinkClick();
                  }}
                >
                  {uiText?.buyNowWithEmoji || '🚀 Buy Now -'}{' '}
                  {formatSimpleMoney(
                    selectedPack?.preview.totalAdjustedAmount ?? 0,
                    'USD'
                  )}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1">
        {/* New Hero Section */}
        <section id="hero" className="w-full py-8 px-4 bg-gray-100 md:py-16">
          <div className="container mx-auto px-0 md:px-6 flex flex-col items-center gap-8 md:flex-row md:justify-center md:items-start">
            {/* Left Column: Image, Title, Benefits */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-1/2">
              <div
                className="relative w-full max-w-full aspect-square mb-2 md:mb-4 select-none touch-pan-y"
                {...swipeHandlers}
                style={{ touchAction: 'pan-y pinch-zoom' }}
              >
                <img
                  src={heroImages[heroIndex].src}
                  alt={heroImages[heroIndex].alt}
                  style={{ objectFit: 'contain' }}
                  className={`object-center transition-all duration-300 absolute inset-0 w-full h-full object-cover ${
                    isTransitioning ? 'scale-95' : 'scale-100'
                  }`}
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Left arrow */}
                <button
                  type="button"
                  aria-label={uiText?.previousImage || "Previous image"}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10 hidden sm:block"
                  onClick={goToPrev}
                  disabled={isTransitioning}
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                {/* Right arrow */}
                <button
                  type="button"
                  aria-label={uiText?.nextImage || "Next image"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10 hidden sm:block"
                  onClick={goToNext}
                  disabled={isTransitioning}
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>
              </div>
              {/* Thumbnails below image */}
              <div className="flex gap-2 justify-center mb-4">
                {heroImages.map((img, idx) => (
                  <button
                    key={img.src}
                    type="button"
                    aria-label={`Show image ${idx + 1}`}
                    className={`w-10 h-10 rounded border-2 ${
                      heroIndex === idx
                        ? 'border-primary-color'
                        : 'border-transparent'
                    } overflow-hidden focus:outline-none bg-white`}
                    onClick={() => setHeroIndex(idx)}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Reviews, Bundle Offers, FAQ */}
            <div className="flex flex-col w-full md:w-1/2 space-y-4">
              {/* Hero Title and Description */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 !leading-tight">
                {heroData?.title1} <br className="hidden md:inline" />{' '}
                {heroData?.title2}
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                {heroData?.description}
              </p>
              {/* Dopamine-inducing Benefits List */}
              <ul className="space-y-4 mb-4 w-full max-w-sm md:max-w-none">
                {heroData?.benefits.map((benefit, index) => (
                  <li className="flex items-start gap-4">
                    <span
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full shadow bg-gradient-primary"
                    >
                      <CheckCircle className="h-6 w-6 text-black" />
                    </span>
                    <span>
                      <span className="font-semibold text-lg text-gray-900">
                        {benefit.title}
                      </span>
                      <br />
                      <span className="text-sm text-gray-600">
                        {benefit.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {/* USP Row - smaller and below benefits */}
              <ul className="flex flex-wrap gap-2 mb-8 mt-2">
                {usps.map((usp, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 bg-gray-900 rounded-lg px-2 py-1 shadow-sm"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black">
                      <Suspense fallback={<div className="h-5 w-5 bg-gray-300 animate-pulse rounded" />}>
                        <UniversalIcon
                          name={usp.icon as IconName}
                          className="h-5 w-5 text-white"
                        />
                      </Suspense>
                    </span>
                    <span className="font-medium text-xs text-white">
                      {usp.title}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Bundle Offers */}
              <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {uiText?.bundleAndSave || 'Bundle & Save!'}
                </h2>
                <div className="flex flex-col w-full gap-8">
                  {packList.map((pack) => (
                    <ProductCard
                      key={pack.bundleName}
                      pack={pack}
                      selected={selectedPack?.bundleName === pack.bundleName}
                      title={pack.bundleName}
                      currency={'USD'}
                      subtitle={pack.subtitle || ''}
                      image={pack.image || ''}
                      onSelect={onSelectPack}
                      onBuyNow={onBuyNow}
                      disabled={isLoading}
                      showBuyNow={false}
                    />
                  ))}
                </div>
              </div>

              {/* Buy Now Button - outside the bundle block, styled larger with shadow dropdown */}
              <div
                className="flex justify-center"
                style={{ marginTop: '-.5rem' }}
              >
                <Button
                  onClick={() => onBuyNow(selectedPack?.bundleName || '')}
                  className="w-full py-5 px-12 text-2xl font-extrabold text-white shadow-2xl transition-all duration-200 hover:-translate-y-1 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--primary-color) 10%, transparent)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px -12px color-mix(in srgb, var(--primary-dark) 30%, transparent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px -12px color-mix(in srgb, var(--primary-color) 20%, transparent)';
                  }}
                  onFocus={e => {
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px -12px color-mix(in srgb, var(--primary-color) 20%, transparent), 0 0 0 4px color-mix(in srgb, var(--primary-color) 30%, transparent)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px -12px color-mix(in srgb, var(--primary-color) 20%, transparent)';
                  }}
                >
                  {uiText?.buyNow?.toUpperCase() || 'BUY NOW'} -{' '}
                  {formatSimpleMoney(
                    selectedPack?.preview.totalAdjustedAmount ?? 0,
                    'USD'
                  )}
                </Button>
              </div>

              {/* Reviews Section */}
              <div className="text-center md:text-left p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-center md:justify-start mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-6 w-6 fill-primary-color text-primary-color"
                    />
                  ))}
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    {heroData?.reviews?.rating}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{heroData?.reviews?.text}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customerReviews.slice(0, 4).map((review, index) => (
                    <Card
                      key={index}
                      className="p-4 text-left shadow-md bg-gray-50 border border-gray-200"
                    >
                      <CardContent className="p-0 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <UserAvatar
                            initials={review.author
                              .split(' ')
                              .map(n => n[0])
                              .join('. ')}
                          />
                          <span className="font-semibold text-gray-900 text-sm">
                            {review.author}
                          </span>
                          {review.verified && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {uiText?.verified || 'Verified'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-primary-color text-primary-color'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-800 text-sm italic">{`"${review.comment.slice(
                          0,
                          70
                        )}..."`}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-6 text-white font-semibold bg-transparent border-primary-color text-primary-color"
                  onMouseEnter={e => {
                    e.currentTarget.className = e.currentTarget.className.replace('hover:bg-primary-50', 'bg-primary-50');
                    e.currentTarget.className = e.currentTarget.className.replace('text-primary-color', 'text-primary-dark');
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.className = e.currentTarget.className.replace('text-primary-dark', 'text-primary-color');
                  }}
                  asChild
                >
                  <a href="#reviews">{uiText?.readAllReviews || 'Read all reviews'}</a>
                </Button>
              </div>

              {/* Quick FAQ / How it works */}
              <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {uiText?.quickFAQ || 'Quick FAQ'}
                </h2>
                <Suspense fallback={<div className="w-full h-32 bg-gray-100 animate-pulse rounded" />}>
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-gray-200"
                      >
                        <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-gray-900">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Suspense>
              </div>
            </div>
          </div>
        </section>
        {/* Logo Bar Section - As Featured In */}
        <Suspense fallback={<div className="w-full h-16 bg-gray-100 animate-pulse rounded" />}>
          <LogoBar logos={logoBarImages} />
        </Suspense>
        {/* Product Info Accordion Section - between logo marquee and BenefitsBar */}
        <section className="w-full max-w-3xl mx-auto my-8">
          <Suspense fallback={<div className="w-full h-48 bg-gray-100 animate-pulse rounded-xl" />}>
            <Accordion
              type="single"
              collapsible
              className="rounded-xl bg-white/80 shadow-lg border border-gray-200 p-6 md:p-8"
            >
              {faq?.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger
                    className="text-lg font-bold text-primary-dark"
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Suspense>
        </section>
        <Suspense fallback={<div className="w-full h-32 bg-gray-100 animate-pulse rounded" />}>
          <BenefitsBar />
        </Suspense>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after How Shilajit Gummies Work */}
        {/* Results from our 6-Month Clinical Study */}
        <section
          id="clinical-study"
          className="scroll-mt-24 w-full py-12 md:py-24 lg:py-32 bg-gray-100 rounded-xl my-4 px-4"
        >
          <div className="container mx-auto px-0 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
              {results?.title}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-12">
              {results?.subtitle}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="relative aspect-[1/1] w-full overflow-hidden rounded-xl shadow-2xl">
                <img
                  src={results?.image}
                  alt={results?.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div className="space-y-8 text-left">
                {results?.points?.map((point, index) => (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-2 rounded-full bg-primary-color"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {point.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Zenith vs. The Rest Section */}
        <section
          id="comparison"
          className="scroll-mt-24 w-full py-12 md:py-24 lg:py-32 bg-white rounded-xl my-4 px-4"
        >
          <div className="container mx-auto px-0 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
              {compare?.title}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-12">
              {compare?.subtitle}
            </p>

            {/* Comparison Image */}
            <div className="max-w-4xl mx-auto mb-16">
              <img
                src={compare?.image}
                alt={compare?.alt}
                width={800}
                height={600}
                className="object-contain w-full h-auto"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>

            {/* Nutrition Facts */}
            <div className="max-w-6xl mx-auto mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {factsAndCertifications?.title}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Nutrition Facts Image */}
                <div className="flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-md lg:max-w-lg">
                    <img
                      src={factsAndCertifications?.image}
                      alt={factsAndCertifications?.title}
                      width={500}
                      height={650}
                      className="object-contain shadow-2xl rounded-2xl border border-gray-200 w-full h-auto"
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 500px"
                    />
                  </div>
                </div>

                {/* Certifications */}
                <div className="flex flex-col justify-center space-y-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-left">
                    {factsAndCertifications?.rightText}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {factsAndCertifications?.rightPoints.map((point, index) => (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <CheckCircle
                          className="h-6 w-6 mt-1 flex-shrink-0 text-primary-color"
                        />
                        <div className="text-left">
                          <span className="text-lg font-semibold text-gray-800 block">
                            {point.title}
                          </span>
                          <span className="text-sm text-gray-600">
                            {point.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after Comparison */}
        {/* Why Choose Zenith Section (Gummy Benefits) - Redesigned */}
        <section
          id="features"
          className="scroll-mt-24 w-full py-12 md:py-24 lg:py-32 bg-gray-100 rounded-xl my-4 px-4"
        >
          {' '}
          {/* Added px-4 */}
          <div className="container mx-auto px-0 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {whyChooseZenith?.title}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-12">
              {whyChooseZenith?.subtitle}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="relative aspect-[1/1] w-full max-w-md overflow-hidden rounded-xl shadow-2xl mb-8">
                  <img
                    src={whyChooseZenith?.images[0]?.src}
                    alt={whyChooseZenith?.images[0]?.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectFit: 'contain' }}
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="relative w-full max-w-md aspect-[1/1] overflow-hidden rounded-xl shadow-2xl">
                  <img
                    src={whyChooseZenith?.images[1]?.src}
                    alt={whyChooseZenith?.images[1]?.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectFit: 'contain' }}
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="space-y-8 text-left">
                {whyChooseZenith?.points.map((point, index) => (
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 p-3 rounded-full bg-gray-200 text-primary-color"
                    >
                      <Suspense fallback={<div className="h-6 w-6 bg-gray-300 animate-pulse rounded" />}>
                        <UniversalIcon
                          name={point.icon as IconName}
                          className="h-6 w-6"
                        />
                      </Suspense>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {point.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{point.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after Features */}
        {/* Product Details & Specifications - Redesigned */}
        <section className="scroll-mt-20 w-full py-12 md:py-24 lg:py-32 bg-white rounded-xl my-4 px-4">
          {' '}
          {/* Added px-4 */}
          <div className="container mx-auto px-0 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
              {productDetails?.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {productDetails?.sections.map((section, index) => (
                <Card className="p-6 text-left shadow-lg bg-gray-50 border border-gray-200">
                  <CardContent className="p-0 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {section.title}
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      {section.points.map((point, index) => (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary-color" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after Product Details */}
        {/* How Pure Shilajit Gummies Work for You Section */}
        <section className="scroll-mt-20 w-full py-12 md:py-24 lg:py-32 bg-gray-100 rounded-xl my-4 px-4">
          {' '}
          {/* Added px-4 */}
          <div className="container mx-auto px-0 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
              {workForYou?.title}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-12">
              {workForYou?.subtitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {workForYou?.paragraphs.map((paragraph, index) => (
                <Card className="p-6 text-center shadow-lg bg-white border border-gray-200">
                  <CardContent className="p-0 space-y-3">
                    <h3
                      className="text-2xl font-bold mb-2 text-primary-color"
                    >
                      {paragraph.title}
                    </h3>
                    <p className="text-gray-700">{paragraph.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after Clinical Study */}
        {/* See in Action Section */}
        <section
          id="see-in-action"
          className="scroll-mt-24 w-full py-12 md:py-24 lg:py-32 bg-white rounded-xl my-4 px-4"
        >
          {' '}
          {/* Added px-4 */}
          <div className="container mx-auto px-0 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              {video?.title}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-700 mb-12">
              {video?.subtitle}
            </p>
            <div className="flex overflow-x-auto flex-nowrap gap-6 pb-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:px-0 md:mx-auto max-w-6xl scrollbar-hide">
              {video?.videos.map(video => (
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg shadow-lg flex-shrink-0 min-w-[280px] max-w-[calc(33.33%-1rem)] sm:max-w-[calc(50%-0.75rem)] md:max-w-none md:min-w-0">
                  {/* Fallback background for when poster doesn't load */}
                  <div
                    className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg bg-gradient-primary-reverse"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶️</div>
                      <div>{video.title}</div>
                      <div className="text-sm opacity-80">Tap to Play</div>
                    </div>
                  </div>
                  <video
                    src={video.src}
                    poster={video.poster}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    controls
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after See in Action */}
        {/* Choose Your Flavor Section */}
        <section
          id="choose-flavor"
          className="scroll-mt-24 w-full py-12 md:py-24 lg:py-32 bg-gray-100 rounded-xl my-4 px-4"
        >
          {' '}
          {/* Added px-4 */}
          <div className="container mx-auto px-0 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {chooseYour?.title}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-12">
              {chooseYour?.subtitle}
            </p>
            <div className="w-full flex flex-col gap-8">
              {packList.map((pack) => {
                // Find the matching promotion to get the badge
                const matchingPromotion = promotions.find(promo => promo.name === pack.bundleName);
                const badge = matchingPromotion?.badge;
                
                return (
                  <ProductCard
                    key={pack.bundleName}
                    pack={pack}
                    selected={selectedPack?.bundleName === pack.bundleName}
                    title={pack.bundleName}
                    currency={'USD'}
                    subtitle={pack.subtitle || ''}
                    image={pack.image || ''}
                    onSelect={onSelectPack}
                    onBuyNow={onBuyNow}
                    showBuyNow={true}
                    disabled={isLoading}
                    badge={badge}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700 mt-12">
              {chooseYour?.perks.map((perk, index) => (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-primary-color" /> {perk}
                </span>
              ))}
            </div>
          </div>
        </section>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after Choose Your Flavor */}
        {/* Customer Satisfaction / Reviews Section */}
        <section
          id="reviews"
          className="scroll-mt-24 w-full py-12 md:py-24 lg:py-32 bg-white rounded-xl my-4 px-4"
        >
          {' '}
          {/* Added px-4 */}
          <div className="container mx-auto px-0 md:px-6 text-center">
            <div className="flex items-center justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-8 w-8 fill-primary-color text-primary-color"
                />
              ))}
              <span className="ml-2 text-2xl font-bold text-gray-800">
                {reviews?.rating || '4.9/5'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {reviews?.title}
            </h2>
            <p className="text-lg text-gray-700 mb-2">{reviews?.subtitle}</p>
            <p className="text-sm text-gray-600 mb-12">{reviews?.basedOn}</p>

            {/* Reviews Carousel */}
            <div className="relative max-w-6xl mx-auto">
              <div
                ref={reviewsRef}
                className="flex overflow-x-auto gap-6 pb-4 px-4 scrollbar-hide"
              >
                {reviews?.reviews.map((review, index) => (
                  <Card
                    key={index}
                    className="p-6 text-left shadow-lg flex-shrink-0 w-80 min-w-[280px] bg-gray-50 border border-gray-200"
                  >
                    <CardContent className="p-0 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <UserAvatar
                          initials={review.author
                            .split(' ')
                            .map(n => n[0])
                            .join('. ')}
                        />
                        <span className="font-semibold text-gray-800">
                          {review.author}
                        </span>
                        {review.verified && (
                          <Badge className="bg-amber-100 text-amber-700">
                            {uiText?.verified || 'Verified'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? 'fill-primary-color text-primary-color'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{`"${review.comment}"`}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200/80 hover:bg-gray-300 rounded-full shadow-md hidden md:block"
                onClick={() => scrollReviews('left')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200/80 hover:bg-gray-300 rounded-full shadow-md hidden md:block"
                onClick={() => scrollReviews('right')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            {/* <div className="mt-12 flex justify-center">
              <Image
                src="/images/trustpilot-logo.png"
                width={200}
                height={80}
                alt="Trustpilot Excellent 4.9/5 Reviews"
                className="object-contain"
              />
            </div> */}
          </div>
        </section>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after Reviews */}
        {/* 180-Day Money-Back Guarantee Section */}
        <section
          id="guarantee"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 rounded-xl my-4 px-4"
        >
          {' '}
          {/* Added px-4 */}
          <div className="container mx-auto px-0 md:px-6 text-center">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mb-8">
              {guarantee?.title}
            </h2>
            <p className="text-xs sm:text-base md:text-lg text-gray-600 mb-12">
              {guarantee?.subtitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {guarantee?.points.map((point, index) => (
                <div className="flex flex-col items-center space-y-3">
                  <Suspense fallback={<div className="h-12 w-12 bg-gray-300 animate-pulse rounded" />}>
                    <UniversalIcon
                      name={point.icon as IconName}
                      className="h-12 w-12 text-primary-color"
                    />
                  </Suspense>
                  <span className="text-lg font-semibold text-gray-700">
                    {point.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Suspense fallback={<div className="w-full h-4 bg-gray-200 animate-pulse my-4" />}>
          <SectionSeparator />
        </Suspense> {/* Separator after Guarantee */}
        {/* New Call to Action Section */}
        <section
          id="buy-now"
          className="w-full py-12 md:py-24 lg:py-32 bg-footer-color text-white text-center rounded-xl my-4 px-4"
        >
          {' '}
          {/* Added px-4 */}
          <div className="container mx-auto px-0 md:px-6 flex flex-col items-center justify-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold !leading-tight max-w-4xl">
              {footer?.title}
            </h2>
            <p className="text-lg md:text-xl max-w-2xl text-gray-300">
              {footer?.subtitle}
            </p>
            <Button
              className="bg-gray-900 text-white hover:bg-gray-900 text-lg px-8 py-3 rounded-full font-semibold shadow-lg"
              asChild
            >
              <a href="#choose-flavor">{footer?.button}</a>
            </Button>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-300 mt-4">
              {footer?.perks.map((perk, index) => (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-primary-color" /> {perk}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Suspense fallback={<div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-100 animate-pulse border-t" />}>
        <StickyAddToCart
          selectedPack={selectedPack}
          onBuyNow={onBuyNow}
          isLoading={isLoading}
          productImage={
            product?.variants[0]?.imageUrl ?? '/images/zenith-product.webp'
          }
        />
      </Suspense>
      {/* <RecentPurchasePopup /> */}
    </div>
  );
}

// Page component removed - now handled in App.tsx
