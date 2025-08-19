import { pluginConfig } from "@/data/config";
import { useProducts } from "@tagadapay/plugin-sdk";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Step1() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/step2");
  };

  const { getVariant } = useProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="mx-auto max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
            1
          </div>
          <div className="h-1 w-12 bg-gray-300"></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-600 text-sm font-semibold">
            2
          </div>
          <div className="h-1 w-12 bg-gray-300"></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-600 text-sm font-semibold">
            3
          </div>
        </div>

        {/* Main content */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {/* {pluginConfig.funnel.step1.title} */}
              {getVariant(pluginConfig.product.variantId)?.product.name}
            </h1>
            <p className="text-lg text-gray-600">
              {/* {pluginConfig.funnel.step1.subtitle} */}
              {getVariant(pluginConfig.product.variantId)?.product.description}
            </p>
          </div>

          {/* Product highlight */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    getVariant(pluginConfig.product.variantId)?.variant.imageUrl
                  }
                  alt="Product Image"
                  className="h-full w-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {/* {pluginConfig.branding.productName} */}
                {getVariant(pluginConfig.product.variantId)?.product.name}
              </h2>
              <p className="text-gray-600">
                The solution you've been waiting for
              </p>
            </div>

            {/* Key benefits */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">
                  Premium quality guaranteed
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Fast and secure delivery</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">
                  30-day money-back guarantee
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Continue to Next Step</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Step 1 of 3 - This will only take a minute
          </p>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Trusted by thousands of customers
          </p>
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            4.9/5 stars from 1,000+ reviews
          </p>
        </div>
      </div>
    </div>
  );
}
