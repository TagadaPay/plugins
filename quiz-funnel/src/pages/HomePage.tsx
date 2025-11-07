import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/v2";
import { Award, CheckCircle, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { config } = usePluginConfig<PluginConfig>();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1
              className="text-2xl font-bold"
              style={{ color: config.primaryColor }}
            >
              {config.title}
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: `${config.primaryColor}10`,
              color: config.primaryColor,
            }}
          >
            <Sparkles className="w-4 h-4" />
            {config.home.badge}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {config.home.title}
            <span style={{ color: config.primaryColor }} className="block">
              {config.home.accentuatedTitle}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {config.home.subtitle}
          </p>

          <Link to="/quiz">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Let's Start
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${config.primaryColor}10` }}
              >
                <Users
                  className="w-8 h-8"
                  style={{ color: config.primaryColor }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Personalized Analysis
              </h3>
              <p className="text-muted-foreground">
                {config.home.cards.personalizedAnalysis}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${config.primaryColor}10` }}
              >
                <Award
                  className="w-8 h-8"
                  style={{ color: config.primaryColor }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Formulated</h3>
              <p className="text-muted-foreground">
                {config.home.cards.expertFormulated}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${config.primaryColor}10` }}
              >
                <CheckCircle
                  className="w-8 h-8"
                  style={{ color: config.primaryColor }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Proven Results</h3>
              <p className="text-muted-foreground">
                {config.home.cards.provenResults}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quiz Preview */}
      <section className="container mx-auto px-4 py-8">
        <Card
          className="max-w-2xl mx-auto border-0 shadow-xl"
          style={{ backgroundColor: `${config.primaryColor}10` }}
        >
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Our quick 4-question quiz will analyze your skin and recommend the
              perfect products for you.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle
                  className="w-4 h-4"
                  style={{ color: config.primaryColor }}
                />
                2 minutes
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle
                  className="w-4 h-4"
                  style={{ color: config.primaryColor }}
                />
                Personalized results
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle
                  className="w-4 h-4"
                  style={{ color: config.primaryColor }}
                />
                Expert recommendations
              </div>
            </div>

            <Link to="/quiz">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Take the Quiz Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
