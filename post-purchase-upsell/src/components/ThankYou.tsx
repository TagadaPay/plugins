import React from 'react';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { usePluginConfig } from '@tagadapay/plugin-sdk/react';

interface ThankYouProps {
  orderId?: string;
}

const ThankYou: React.FC<ThankYouProps> = ({ orderId }) => {
  // Get branding configuration
  const config = usePluginConfig();
  const theme = config?.config?.theme || {};
  
  // Generate dynamic styles based on theme
  const primaryColor = theme.primary || '#3b82f6';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You!
          </h1>
          <p className="text-gray-600">
            Your order has been successfully processed
          </p>
        </div>

        {/* Order Details */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
              <Package className="w-4 h-4" />
              Order ID
            </div>
            <p className="font-mono text-lg font-semibold text-gray-900">
              #{orderId}
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 text-left">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Confirmation Email</h3>
              <p className="text-sm text-gray-600">
                You'll receive an email confirmation shortly
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Processing</h3>
              <p className="text-sm text-gray-600">
                Your order is being prepared for shipment
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Shipping</h3>
              <p className="text-sm text-gray-600">
                You'll receive tracking information once shipped
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => window.location.href = '/'}
          className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:brightness-90"
          style={{ backgroundColor: primaryColor }}
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Support */}
        <p className="text-sm text-gray-500 mt-6">
          Need help? Contact our{' '}
          <a 
            href="#" 
            className="underline hover:brightness-90 transition-all"
            style={{ color: primaryColor }}
          >
            customer support
          </a>
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
