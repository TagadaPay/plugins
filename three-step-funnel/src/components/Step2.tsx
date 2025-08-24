import { useNavigate } from "react-router-dom";
import { usePluginConfig, useProducts } from "@tagadapay/plugin-sdk/react";
import { ArrowRight, Star, Quote, CheckCircle, Award, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Step2() {
  const navigate = useNavigate();
  const { config } = usePluginConfig();

  // Fetch products data using SDK hook
  const { getVariant } = useProducts({
    enabled: true,
    includeVariants: true,
    includePrices: true,
  });

  const handleContinue = () => {
    navigate("/step3");
  };

  // Get configuration from default.tgd.json
  const branding = config?.branding || {};
  const products = config?.products || {};
  const funnel = config?.funnel?.step2 || {};

  // Get variant data from API using the configured variant ID
  const variantData = getVariant(products.variantId);
  const product = variantData?.product;
  const variant = variantData?.variant;

  // Default testimonials if not in config
  const defaultTestimonials = [
    {
      name: "Sarah M.",
      age: 52,
      text: "After just 2 weeks, I could climb stairs without pain. This stuff really works!",
      rating: 5,
      verified: true
    },
    {
      name: "Dr. Michael Chen",
      title: "Orthopedic Surgeon",
      text: "I recommend NutraVital Pro to my patients. The clinical results speak for themselves.",
      rating: 5,
      verified: true
    },
    {
      name: "Robert K.",
      age: 67,
      text: "I was skeptical, but after 30 days I'm moving like I'm 20 years younger!",
      rating: 5,
      verified: true
    }
  ];

  const testimonials = funnel.testimonials || defaultTestimonials;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-4 sm:py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-md lg:max-w-lg">
        {/* Progress indicator */}
        <div className="mb-6 sm:mb-8 flex items-center justify-center space-x-2 sm:space-x-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-600 text-white text-sm sm:text-base font-semibold shadow-lg">
            ✓
          </div>
          <div className="h-1 w-8 sm:w-12 bg-green-300 rounded-full"></div>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-600 text-white text-sm sm:text-base font-semibold shadow-lg">
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
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs sm:text-sm px-3 py-1">
                <Award className="w-3 h-3 mr-1" />
                Doctor Recommended
              </Badge>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {funnel.title || "Here's What Makes NutraVital Pro Different"}
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                {funnel.subtitle || "See why doctors recommend our formula"}
              </p>
            </div>

            {/* Scientific backing */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 text-center">
                Clinically Proven Ingredients
              </h3>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                {(() => {
                  // Get ingredients from API data or fallback to config
                  const apiIngredients = (variant as any)?.ingredients || (product as any)?.ingredients;
                  const configIngredients = products.ingredients;
                  const defaultIngredients = [
                    "Glucosamine Sulfate 1500mg",
                    "Chondroitin Sulfate 1200mg",
                    "MSM (Methylsulfonylmethane) 1000mg",
                    "Turmeric Extract 500mg"
                  ];
                  
                  const ingredients = apiIngredients || configIngredients || defaultIngredients;
                  
                  return ingredients.slice(0, 4).map((ingredient: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 bg-green-50 p-3 sm:p-4 rounded-lg">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">{ingredient}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">
                What Our Customers Say
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                {testimonials.map((testimonial: any, index: number) => (
                  <Card key={index} className="bg-white border border-gray-200 rounded-xl">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 italic leading-relaxed">
                            "{testimonial.text}"
                          </p>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                {testimonial.name}
                                {testimonial.age && <span className="text-gray-500">, {testimonial.age}</span>}
                              </p>
                              {testimonial.title && (
                                <p className="text-xs sm:text-sm text-gray-600">{testimonial.title}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                              <div className="flex items-center">
                                {[...Array(testimonial.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              {testimonial.verified && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 px-2 py-1">
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-gray-600 leading-tight">FDA Approved</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-gray-600 leading-tight">GMP Certified</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-gray-600 leading-tight">50,000+ Customers</p>
              </div>
            </div>

            {/* Social proof */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
              <div className="text-center">
                <p className="text-blue-800 font-semibold mb-1 text-sm sm:text-base">
                  🔥 2,847 people bought this in the last 24 hours
                </p>
                <p className="text-blue-600 text-xs sm:text-sm">
                  Join thousands who've transformed their joint health
                </p>
              </div>
            </div>

            {/* Urgency banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6">
              <p className="text-center text-red-800 font-semibold text-sm sm:text-base">
                ⏰ Special Offer Expires in: 23:47:12
              </p>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handleContinue}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-4 sm:py-5 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
              size="lg"
            >
              {funnel.ctaText || "Get My Bottle Now"}
              <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Guarantee */}
            <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
              ✅ 60-Day Money-Back Guarantee • Free Shipping
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}