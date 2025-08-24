import { usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { ArrowRight, CheckCircle, Clock, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import doctorChoiceImage from "../../assets/doctor-choice.png";
import authorPlaceholder from "../../assets/placeholder-author.png";
import { pluginConfig as staticConfig } from "@/data/config";

export function AdvertorialPage() {
  const navigate = useNavigate();
  const { config, loading } = usePluginConfig();

  // Handle CTA click - navigate to checkout page
  const handleGetAccess = () => {
    navigate("/checkout");
  };

  // Show loading state while config loads
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-news-red"></div>
          <p className="mt-2 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  // Types for testimonials
  interface Testimonial {
    name: string;
    age: number;
    location: string;
    quote: string;
    image?: string;
  }

  // Use injected config first, then fall back to static config
  const editorial = {
    siteName: config?.branding?.companyName || staticConfig.editorial.siteName,
    publishDate: staticConfig.editorial.publishDate,
    category: staticConfig.editorial.category,
    readTime: staticConfig.editorial.readTime,
    headline: staticConfig.editorial.headline,
    subheadline: staticConfig.editorial.subheadline,
    author: staticConfig.editorial.author,
    authorTitle: staticConfig.editorial.authorTitle,
    story: staticConfig.editorial.story,
    testimonials: staticConfig.editorial.testimonials as Testimonial[],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-news-red text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">
              {editorial.siteName}
            </div>
            <div className="text-xs">{editorial.publishDate}</div>
          </div>
        </div>
      </header>

      {/* Main Article */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span className="bg-news-red text-white px-3 py-1 rounded-full text-xs font-semibold">
              {editorial.category}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{editorial.readTime}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {editorial.headline}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {editorial.subheadline}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-600 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2">
              <img
                src={authorPlaceholder}
                alt={editorial.author}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNOCAzMkM4IDI2LjQ3NzIgMTIuNDc3MiAyMiAxOCAyMkMyMy41MjI4IDIyIDI4IDI2LjQ3NzIgMjggMzIiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+";
                }}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {editorial.author}
                </div>
                <div className="text-xs">
                  {editorial.authorTitle}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed mb-6">
            {editorial.story.introduction}
          </p>

          <p className="mb-6">{editorial.story.problem}</p>

          {/* Feature Image */}
          <div className="my-8">
            <img
              src={doctorChoiceImage}
              alt="Revolutionary breakthrough"
              className="w-full ratio-[1536/1024] h-auto object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNjAgMTgwSDQ0MFYyMjBIMzYwVjE4MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTM4MCAyMDBMMzk1IDIxNUwzODAgMjAwWiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K";
              }}
            />
            <p className="text-sm text-gray-500 mt-2 text-center italic">
              Scientists announce breakthrough discovery that could change
              everything
            </p>
          </div>

          <p className="mb-6">{editorial.story.solution}</p>

          <p className="mb-8">{editorial.story.proof}</p>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-8 my-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Get Instant Access to This Revolutionary Solution
              </h3>
              <p className="text-gray-700 mb-6">
                Don't miss out on this limited-time opportunity. Join thousands
                who have already transformed their lives.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Scientifically Proven</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold">100% Natural</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Star className="h-5 w-5" />
                  <span className="font-semibold">Trusted by Thousands</span>
                </div>
              </div>

              <button
                onClick={handleGetAccess}
                className="bg-news-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
              >
                Get Instant Access Now
                <ArrowRight className="h-5 w-5" />
              </button>

              <p className="text-sm text-gray-600 mt-4">
                ⚡ Limited time offer - Act now before it's too late!
              </p>
            </div>
          </div>

          <p className="mb-6">{editorial.story.urgency}</p>

          {/* Testimonials */}
          <div className="my-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Real Results from Real People
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {editorial.testimonials.map((testimonial: Testimonial, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyMCIgcj0iNiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTAgMzhDMTAgMzIuNDc3MiAxNC40NzcyIDI4IDIwIDI4QzI1LjUyMjggMjggMzAgMzIuNDc3MiAzMCAzOCIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                      }}
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Age {testimonial.age}, {testimonial.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gray-900 text-white rounded-xl p-8 my-12 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Don't Wait - Transform Your Life Today
            </h3>
            <p className="text-xl mb-6 text-gray-300">
              This breakthrough discovery is changing lives around the world
            </p>
            <button
              onClick={handleGetAccess}
              className="bg-news-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              Claim Your Solution Now
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              © 2024 {editorial.siteName}. All rights reserved.
            </p>
            <div className="flex justify-center gap-4">
              <a href="#" className="hover:text-news-red">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-news-red">
                Terms of Service
              </a>
              <a href="#" className="hover:text-news-red">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
