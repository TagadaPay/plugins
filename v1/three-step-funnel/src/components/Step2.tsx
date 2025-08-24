import { pluginConfig } from "@/data/config";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Shield,
  Truck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import customerImg from "../assets/customer.jpg";

export function Step2() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/step3");
  };

  const handleBack = () => {
    navigate("/step1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="mx-auto max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-semibold">
            ✓
          </div>
          <div className="h-1 w-12 bg-green-600"></div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
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
              {pluginConfig.funnel.step2.title}
            </h1>
            <p className="text-lg text-gray-600">
              {pluginConfig.funnel.step2.subtitle}
            </p>
          </div>

          {/* Value propositions */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Premium Quality
                </h3>
                <p className="text-gray-600 text-sm">
                  Made with the finest materials and rigorous quality control to
                  ensure you get the best product.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Fast Shipping
                </h3>
                <p className="text-gray-600 text-sm">
                  Get your order delivered quickly with our expedited shipping
                  options. Most orders arrive within 3-5 days.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Award Winning
                </h3>
                <p className="text-gray-600 text-sm">
                  Recognized by industry experts and loved by customers
                  worldwide for its effectiveness and quality.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Trusted by Thousands
                </h3>
                <p className="text-gray-600 text-sm">
                  Join over 10,000 satisfied customers who have transformed
                  their lives with our product.
                </p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              What Our Customers Say
            </h3>
            <div className="text-center">
              <p className="text-gray-600 italic mb-4">
                "This product changed my life! I can't imagine going back to how
                things were before. The quality is outstanding and the results
                speak for themselves."
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="size-20 overflow-hidden rounded-full bg-gray-300">
                  <img
                    src={customerImg}
                    alt="Customer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">
                    Sarah Johnson
                  </p>
                  <p className="text-gray-500 text-xs">Verified Customer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <span>I'm Convinced - Let's Order!</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Previous Step</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Step 2 of 3 - Almost there!
          </p>
        </div>

        {/* Money back guarantee */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-semibold">
              30-Day Money Back Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
