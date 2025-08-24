import { useNavigate } from "react-router-dom";
import { usePluginConfig, useProducts } from "@tagadapay/plugin-sdk/react";
import { ArrowRight, CheckCircle, Star, Shield, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Step1() {
  const navigate = useNavigate();
  const { config } = usePluginConfig();

  // Fetch products data using SDK hook
  const { getVariant } = useProducts({
    enabled: true,
    includeVariants: true,
    includePrices: true,
  });

  // Get configuration from default.tgd.json
  const products = config?.products || {};
  
  // Get variant data from API using the configured variant ID (no hardcoded fallback)
  const variantData = getVariant(products.variantId);
  const product = variantData?.product;
  const variant = variantData?.variant;

  const handleContinue = () => {
    navigate("/step2");
  };

  const funnel = config?.funnel?.step1 || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-4 sm:py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-md lg:max-w-lg">
        {/* Progress indicator */}
        <div className="mb-6 sm:mb-8 flex items-center justify-center space-x-2 sm:space-x-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-600 text-white text-sm sm:text-base font-semibold shadow-lg">
            1
          </div>
          <div className="h-1 w-8 sm:w-12 bg-gray-300 rounded-full"></div>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gray-300 text-gray-600 text-sm sm:text-base font-semibold">
            2
          </div>
          <div className="h-1 w-8 sm:w-12 bg-gray-300 rounded-full"></div>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gray-300 text-gray-600 text-sm sm:text-base font-semibold">
            3
          </div>
        </div>

        {/* Main content */}
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800 hover:bg-green-100 text-xs sm:text-sm px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                #1 Doctor Recommended
              </Badge>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {funnel.title || "Discover the #1 Joint Pain Solution"}
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                {funnel.subtitle || "Thousands are already pain-free. Are you next?"}
              </p>
            </div>

            {/* Product highlight */}
            <div className="mb-6 sm:mb-8">
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 h-32 w-32 sm:h-40 sm:w-40 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden shadow-lg">
                  {(() => {
                    // Priority: variant image > config image > placeholder
                    const imageUrl = variant?.imageUrl || products.imageUrl;
                    const productName = product?.name || variant?.name || products.name || "NutraVital Pro";
                    
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="text-4xl sm:text-6xl">💊</div>
                    );
                  })()}
                  {/* Fallback emoji (hidden by default, shown on image error) */}
                  <div className="hidden text-4xl sm:text-6xl">💊</div>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {product?.name || variant?.name || products.name || "NutraVital Pro"}
                </h2>
                
                <p className="text-sm sm:text-base text-gray-600 mb-4 px-2">
                  {product?.description || (variant as { description?: string })?.description || products.description || "Advanced Joint Support Formula"}
                </p>

                {/* Star rating */}
                <div className="flex items-center justify-center mb-4 flex-wrap">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-xs sm:text-sm text-gray-600">(2,847 reviews)</span>
                </div>
              </div>

              {/* Key benefits */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {(products.benefits || [
                  "Reduces joint pain in 7 days",
                  "Improves flexibility and mobility", 
                  "100% natural ingredients",
                  "Clinically tested formula"
                ]).slice(0, 4).map((benefit: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-2 sm:p-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">FDA Approved Facility</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">GMP Certified</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">50,000+ Happy Customers</p>
                </div>
              </div>

              {/* Urgency banner */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6">
                <p className="text-center text-red-800 font-semibold text-sm sm:text-base">
                  ⚡ Limited Time: Free Shipping + 20% Off Today Only!
                </p>
              </div>

              {/* CTA Button */}
              <Button 
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-4 sm:py-5 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                size="lg"
              >
                {funnel.ctaText || "Yes, I Want Pain-Free Joints!"}
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              {/* Guarantee */}
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
                ✅ 60-Day Money-Back Guarantee
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}