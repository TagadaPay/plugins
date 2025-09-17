import React from 'react';
import { useLandingPageController } from '../hooks/useLandingController';
import { getSectionText, isFeatureEnabled } from '../lib/config-helpers';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { ProductSection } from './sections/ProductSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { GuaranteeSection } from './sections/GuaranteeSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import { BuyerNotification } from './buyer-notification';
import { PressBar } from './press-bar';
import { Navigation } from './Navigation';
import { StickyCart } from './StickyCart';
import { VideoSection } from './sections/VideoSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { ResultsGallery } from './sections/ResultsGallery';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { BottomProductBar } from './BottomProductBar';
import { WhyChooseSection } from './sections/WhyChooseSection';
import { VisibleResultsSection } from './sections/VisibleResultsSection';
import { PainlessRemovalSection } from './sections/PainlessRemovalSection';
import { SeeItInActionSection } from './sections/SeeItInActionSection';

export function DermaPenLanding() {
    const controller = useLandingPageController();

    if (controller.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-xl font-medium">Loading your personalized experience...</p>
                    <p className="text-gray-600 mt-2">Please wait while we fetch your products</p>
                </div>
            </div>
        );
    }

    if (!controller.config || !controller.product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h1>
                    <p className="text-gray-600 mb-6">
                        Unable to load plugin configuration or product data. Please check:
                    </p>
                    <ul className="text-left text-sm text-gray-500 space-y-2 mb-6">
                        <li>• Your config/default.tgd.json file exists</li>
                        <li>• Product ID in config matches store product</li>
                        <li>• Store connection is working</li>
                    </ul>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn-primary"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <Navigation controller={controller} />

            {/* Hero Section */}
            <HeroSection controller={controller} />

            {/* Press Bar - After Hero */}
            {isFeatureEnabled(controller.config, 'enablePressBar') && (
                <PressBar />
            )}

            {/* Why Choose Section */}
            <WhyChooseSection controller={controller} />

            {/* Visible Results Section */}
            <VisibleResultsSection controller={controller} />

            {/* Painless Removal Section */}
            <PainlessRemovalSection controller={controller} />

            {/* How It Works Section */}
            <HowItWorksSection controller={controller} />

            {/* Certifications Section */}
            {isFeatureEnabled(controller.config, 'enableCertifications') && (
                <CertificationsSection controller={controller} />
            )}

            {/* See It In Action - Video Section */}
            <SeeItInActionSection controller={controller} />

            {/* Product Selection Section */}
            <ProductSection controller={controller} />
            
            {/* Reviews Section */}
            {isFeatureEnabled(controller.config, 'enableReviews') && (
                <ReviewsSection controller={controller} />
            )}
            
            {/* Guarantee Section */}
            {isFeatureEnabled(controller.config, 'enableGuaranteeSection') && (
                <GuaranteeSection controller={controller} />
            )}
            
            {/* Final CTA Section */}
            <FinalCtaSection controller={controller} />
            
            {/* Buyer Notifications */}
            {isFeatureEnabled(controller.config, 'enableBuyerNotifications') && (
                <BuyerNotification />
            )}

            {/* Bottom Product Bar */}
            <BottomProductBar controller={controller} />
            
            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
                    <strong>Debug Info:</strong><br/>
                    Config: {controller.config?.configName}<br/>
                    Product: {controller.product?.name}<br/>
                    Packs: {controller.packList.length}<br/>
                    Selected: {controller.selectedPack?.bundleName}
                </div>
            )}
        </div>
    );
}