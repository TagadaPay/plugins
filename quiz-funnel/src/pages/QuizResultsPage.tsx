import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PluginConfig } from "@/types/plugin-config";
import {
  formatMoney,
  Product,
  ProductVariant,
  usePluginConfig,
  useProducts,
} from "@tagadapay/plugin-sdk/v2";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Type definitions for product and variant data
type VariantData = {
  product: {
    id: string;
    name: string;
    description?: string;
  };
  variant: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    prices: Array<{
      currencyOptions: {
        [key: string]: { amount: number };
      };
    }>;
  };
};

type QuizResults = {
  [key: string]: string | string[];
};

type QuizResultsPageProps = {};

export default function QuizResultsPage({}: QuizResultsPageProps) {
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const navigate = useNavigate();
  const { config, storeId } = usePluginConfig<PluginConfig>();
  const { getVariant, products } = useProducts({
    enabled: true,
    includeVariants: true,
    includePrices: true,
  });

  const variants = config?.variants
    ?.map((variant) => {
      const result = getVariant(variant);
      console.log(result, variant);
      return result;
    })
    .filter((variant) => !!variant) as {
    product: Product;
    variant: ProductVariant;
  }[];

  // Helper function to get the label for an answer
  const getAnswerLabel = (questionIndex: number, answerId: string): string => {
    const question = config?.quizzQuestions?.[questionIndex];
    if (!question) return answerId;

    const option = question.options.find((opt: any) => opt.id === answerId);
    return option?.label || answerId;
  };

  const subtitlesDelays = [
    "animation-delay-500",
    "animation-delay-1000",
    "animation-delay-1500",
  ];

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
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"
              style={{ backgroundColor: `${config.primaryColor}10` }}
            >
              <div
                className="w-12 h-12 rounded-full animate-spin"
                style={{ backgroundColor: config.primaryColor }}
              >
                <div
                  className="w-3 h-3 rounded-full mt-2 ml-2"
                  style={{ backgroundColor: config.primaryColor }}
                ></div>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground animate-fade-in">
              {config.loading.title}
            </h2>
            <div className="space-y-2 text-muted-foreground">
              {config.loading.subtitles.map((subtitle, index) => (
                <p
                  key={`${subtitle}-${index}`}
                  className={`animate-fade-in ${
                    subtitlesDelays[index % config.loading.subtitles.length]
                  }`}
                >
                  {subtitle}
                </p>
              ))}
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: config.primaryColor }}
            ></div>
            <div
              className="w-2 h-2 rounded-full animate-bounce animation-delay-200"
              style={{ backgroundColor: config.primaryColor }}
            ></div>
            <div
              className="w-2 h-2 rounded-full animate-bounce animation-delay-400"
              style={{ backgroundColor: config.primaryColor }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  console.log(variants);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="border-b border-border backdrop-blur-sm"
        style={{ backgroundColor: `${config.primaryColor}10` }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1
              className="text-2xl font-bold"
              style={{ color: config.primaryColor }}
            >
              {config.title}
            </h1>
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
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in"
              style={{ backgroundColor: `${config.primaryColor}10` }}
            >
              <svg
                className="w-12 h-12 animate-check-mark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: config.primaryColor }}
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
              {config.results.title}
            </h2>
            <p className="text-xl text-muted-foreground animate-fade-in-up animation-delay-300">
              {config.results.subtitle}
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
              {config.results.answersTitle}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {config?.quizzQuestions?.map((question, index) => {
                const answerKey = `question${index + 1}`;
                const answerId = quizResults?.[answerKey] as string;
                const answerLabel = getAnswerLabel(index, answerId);

                return (
                  <div key={index}>
                    <span className="text-sm text-muted-foreground">
                      {question.label}:
                    </span>
                    <p className="font-semibold text-foreground capitalize">
                      {answerLabel}
                    </p>
                  </div>
                );
              })}
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
              {variants.map(({ variant }, index) => (
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
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${config.primaryColor}10`, color: config.primaryColor }}
                        >
                          {benefit}
                        </span>
                        ))} */}
                      </div>
                      <p
                        className="text-lg font-bold"
                        style={{ color: config.primaryColor }}
                      >
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
                className="px-12 py-4 text-lg font-semibold animate-fade-in-up animation-delay-1200 text-white"
                style={{ backgroundColor: config.primaryColor }}
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
