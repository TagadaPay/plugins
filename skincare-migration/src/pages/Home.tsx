import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Droplets,
  Shield,
  Clock,
  Sparkles,
  Heart,
  ArrowRight,
  Star,
} from "lucide-react";
import { useCartContext } from "../contexts/CartProvider";
import { useConfigProducts } from "../hooks/useConfigProducts";
import { useConfigContext } from "../contexts/ConfigProvider";
import { getContentForLocale, getLocalizedContent } from "../types/config";
import { SocialLinks } from "../components/SocialLinks";

export function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { addItem, openCart } = useCartContext();
  const { products, loading } = useConfigProducts();
  const { config } = useConfigContext();

  // Get the hero product - use configured heroProductId or fallback to first product
  const heroProduct = config?.heroProductId 
    ? products?.find(product => product.id === config.heroProductId)
    : products?.[0];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleQuickAdd = () => {
    if (!heroProduct) {
      return;
    }

    // Get the first variant and price for the real product
    const firstVariant = heroProduct.variants?.[0];
    const firstPrice = firstVariant?.prices?.[0];
    const realPriceAmount = firstPrice?.currencyOptions?.USD?.amount;

    addItem({
      productId: heroProduct.id,
      variantId: firstVariant?.id || "default",
      priceId: firstPrice?.id || "default",
      name: heroProduct.name,
      price: realPriceAmount ? realPriceAmount / 100 : 29.99, // Convert from cents to dollars
      image: firstVariant?.imageUrl || "/images/hero-products.jpg",
      category: "skincare",
    });
    openCart();
  };

  // Get the hero image with priority: assets.heroImage > heroProduct image > fallback
  const heroImage = 
    config?.assets?.heroImage ||
    heroProduct?.variants?.[0]?.imageUrl || 
    "/images/hero-products.jpg";

  // Get localized content
  const locale = "en"; // TODO: Add locale detection/selection
  const content = config?.content?.sections ? getContentForLocale(config.content.sections, locale) : {};
  const tagline = config?.content?.tagline ? getLocalizedContent(config.content.tagline, locale) : "Celebrating Australian Nature";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative hero-background min-h-screen flex items-center pt-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/40 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/40 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/30 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={`space-y-8 transform transition-all duration-1000 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
            >
              <div className="space-y-6">
                <p className="text-primary text-sm uppercase tracking-wider font-medium">
                  {content.heroSubtitle || "Premium Australian Skincare"}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-800 leading-tight">
                  {content.heroTitle ? (
                    content.heroTitle.split('\n').map((line, index) => (
                      <span key={index}>
                        {index === content.heroTitle!.split('\n').length - 1 ? (
                          <span className="text-primary relative">
                            {line}
                            <svg
                              className="absolute -bottom-2 left-0 w-full h-3"
                              viewBox="0 0 300 12"
                              fill="none"
                            >
                              <path
                                d="M0 6C50 2 100 10 150 6C200 2 250 10 300 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="animate-draw"
                              />
                            </svg>
                          </span>
                        ) : (
                          line
                        )}
                        {index < content.heroTitle!.split('\n').length - 1 && <br />}
                      </span>
                    ))
                  ) : (
                    <>
                      {tagline.split(' ').slice(0, -2).join(' ')}
                      <br />
                      <span className="text-primary relative">
                        {tagline.split(' ').slice(-2).join(' ')}
                        <svg
                          className="absolute -bottom-2 left-0 w-full h-3"
                          viewBox="0 0 300 12"
                          fill="none"
                        >
                          <path
                            d="M0 6C50 2 100 10 150 6C200 2 250 10 300 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="animate-draw"
                          />
                        </svg>
                      </span>
                    </>
                  )}
                </h1>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                {content.heroDescription || "Discover our range of premium skincare products crafted with native Australian botanicals for radiant, healthy skin."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="btn-primary group">
                  {content.primaryButton || "OUR PRODUCTS"}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <button
                  onClick={handleQuickAdd}
                  className="btn-secondary"
                  disabled={loading || !heroProduct}
                >
                  {loading ? "LOADING..." : (content.secondaryButton || "TRY SAMPLE")}
                </button>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {content.trustText || "Trusted by 10,000+ customers"}
                  </p>
                </div>
                <SocialLinks 
                  socialLinks={config?.content?.socialLinks} 
                  className="hidden sm:flex"
                />
              </div>
            </div>

            <div
              className={`relative transform transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <div className="relative group">
                <div className="aspect-square overflow-hidden rounded-3xl shadow-primary-lg">
                  <img
                    src={heroImage}
                    alt={
                      config?.assets?.heroImage
                        ? "Premium skincare hero image"
                        : heroProduct
                        ? `${heroProduct.name} - Premium skincare product`
                        : "Premium skincare products with pink flowers and facial tools"
                    }
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="floating-element -top-4 -right-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div className="floating-element -bottom-4 -left-4 animation-delay-500">
                <Sparkles className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="section-title">
              {content.featuresTitle || "Natural skincare with scientifically proven results"}
            </h2>
            <p className="section-subtitle">
              {content.featuresSubtitle || "Harness the power of Australian botanicals with our carefully formulated products."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {config?.content?.features ? (
              // Use configured features with image icons
              config.content.features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card group"
                  style={{ animationDelay: feature.delay || `${index * 100}ms` }}
                >
                  <div className="icon-container">
                    <img 
                      src={feature.iconUrl} 
                      alt={`${feature.title.replace('\n', ' ')} icon`}
                      className="w-6 h-6 md:w-8 md:h-8 object-contain group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                  <p className="feature-text">{feature.title}</p>
                </div>
              ))
            ) : (
              // Use fallback Lucide React icons
              [
                { icon: Shield, title: "NO NASTY\nCHEMICALS", delay: "0ms" },
                { icon: Leaf, title: "VEGAN\nINGREDIENTS", delay: "100ms" },
                { icon: Droplets, title: "CRUELTY\nFREE", delay: "200ms" },
                { icon: Clock, title: "FAST\nDELIVERY", delay: "300ms" },
                { icon: Sparkles, title: "CLINICALLY\nTESTED", delay: "400ms" },
                { icon: Heart, title: "MADE WITH\nLOVE", delay: "500ms" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="feature-card group"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="icon-container">
                    <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <p className="feature-text">{feature.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary-50 to-secondary-50 text-center">
        {config?.content?.ctaButton ? (
          config.content.ctaButton.external ? (
            <a
              href={config.content.ctaButton.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors duration-200 group"
            >
              {config.content.ctaButton.text}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
            </a>
          ) : (
            <Link
              to={config.content.ctaButton.url}
              className="inline-flex items-center bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors duration-200 group"
            >
              {config.content.ctaButton.text}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          )
        ) : (
          <Link
            to="/products"
            className="inline-flex items-center bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors duration-200 group"
          >
            {content.ctaButton || "SHOP NOW"}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        )}
      </section>
    </div>
  );
}
