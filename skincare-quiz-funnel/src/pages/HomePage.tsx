import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, CheckCircle, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">SkinCare</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Personalized Skincare Quiz
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Discover Your Perfect
            <span className="text-primary block">Skincare Routine</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Take our personalized quiz to find skincare products perfectly
            matched to your skin tone, type, and goals. Get professional
            recommendations in just 2 minutes.
          </p>

          <Link to="/quiz">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
            >
              Let's Start
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Personalized Analysis
              </h3>
              <p className="text-muted-foreground">
                Advanced skin tone matching and type analysis for precise
                product recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Formulated</h3>
              <p className="text-muted-foreground">
                Products developed by dermatologists and skincare experts for
                optimal results
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Proven Results</h3>
              <p className="text-muted-foreground">
                Join thousands of satisfied customers who found their perfect
                skincare match
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quiz Preview */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Our quick 4-question quiz will analyze your skin and recommend the
              perfect products for you.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />2 minutes
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                Personalized results
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                Expert recommendations
              </div>
            </div>

            <Link to="/quiz">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
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
