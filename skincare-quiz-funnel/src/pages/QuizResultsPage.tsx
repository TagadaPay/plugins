import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatMoney,
  usePluginConfig,
  useProducts,
} from "@tagadapay/plugin-sdk/react";
import {
  Product,
  ProductVariant,
} from "node_modules/@tagadapay/plugin-sdk/dist/react/hooks/useProducts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type QuizResults = {
  skinTone: string;
  skinType: string;
  goals: string[];
  frequency: string;
};

export type PluginConfig = {
  configName: string;
  variants: {
    moisturizer: string;
    serum: string;
  };
  googleApiKey: string;
  defaultCurrency: string;
};

type QuizResultsPageProps = {};

export default function QuizResultsPage({}: QuizResultsPageProps) {
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const navigate = useNavigate();
  const { config } = usePluginConfig<PluginConfig>();
  const { getVariant } = useProducts({
    enabled: true,
    includeVariants: true,
    includePrices: true,
  });

  const moisturizer = getVariant(config.variants.moisturizer);
  const serum = getVariant(config.variants.serum);
  const variants = [moisturizer, serum].filter((variant) => !!variant) as {
    product: Product;
    variant: ProductVariant;
  }[];

  useEffect(() => {
    // Get quiz results from localStorage
    const results = localStorage.getItem("quizResults");
    if (results) {
      const parsedResults: QuizResults = JSON.parse(results);
      setQuizResults(parsedResults);
    }

    // Simulate loading and analysis
    const timer1 = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const timer2 = setTimeout(() => {
      setShowResults(true);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Animated Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <div className="w-12 h-12 bg-primary rounded-full animate-spin">
                <div className="w-3 h-3 bg-primary-foreground rounded-full mt-2 ml-2"></div>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground animate-fade-in">
              Analyzing Your Skin Profile...
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <p className="animate-fade-in animation-delay-500">
                Evaluating your skin type and tone
              </p>
              <p className="animate-fade-in animation-delay-1000">
                Matching with our product database
              </p>
              <p className="animate-fade-in animation-delay-1500">
                Finding your perfect skincare routine
              </p>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  console.log(variants);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">SkinCare</h1>
            <Button variant="outline" onClick={() => navigate("/")}>
              Start Over
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Animation */}
          <div
            className={`text-center mb-8 transition-all duration-1000 ${
              showResults
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <svg
                className="w-12 h-12 text-primary animate-check-mark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
              Perfect Match Found!
            </h2>
            <p className="text-xl text-muted-foreground animate-fade-in-up animation-delay-300">
              We've found the ideal skincare products for your{" "}
              {quizResults?.skinType} skin
            </p>
          </div>

          {/* Quiz Summary */}
          <Card
            className={`p-6 mb-8 transition-all duration-1000 animation-delay-500 ${
              showResults
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h3 className="text-xl font-bold text-foreground mb-4">
              Your Skin Profile
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">
                  Skin Tone:
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {quizResults?.skinTone?.replace("-", " ")}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Skin Type:
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {quizResults?.skinType}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Main Goals:
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {quizResults?.goals?.[0]?.replace("-", " ") ||
                    "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Current Routine:
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {quizResults?.frequency?.replace("-", " ")}
                </p>
              </div>
            </div>
          </Card>

          {/* Recommended Products */}
          <div
            className={`transition-all duration-1000 animation-delay-700 ${
              showResults
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Your Personalized Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {variants?.map(({ variant }, index) => (
                <Card
                  key={variant.id}
                  className={`p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${800 + index * 200}ms` }}
                >
                  <div className="flex gap-4">
                    <img
                      src={variant.imageUrl || "/placeholder.svg"}
                      alt={variant.name}
                      className="w-20 h-20 object-cover rounded-lg bg-muted"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-2">
                        {variant.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {(variant as any).description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {/* {product.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                          >
                            {benefit}
                          </span>
                        ))} */}
                      </div>
                      <p className="text-lg font-bold text-primary">
                        {formatMoney(
                          variant.prices[0].currencyOptions["USD"].amount
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  navigate("/checkout");
                }}
                size="lg"
                className="px-12 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 animate-fade-in-up animation-delay-1200"
              >
                Discover Your Products
              </Button>
              <p className="text-sm text-muted-foreground mt-4 animate-fade-in-up animation-delay-1400">
                Free shipping on orders over $50 • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
