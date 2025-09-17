import React from 'react';
import { getSectionText, getAssetUrl } from '../../lib/config-helpers';

interface HeroSectionProps {
    controller: any;
}

export function HeroSection({ controller }: HeroSectionProps) {
    const { config, product, productImage } = controller;

    // Get hero image from config
    const heroImage = getAssetUrl(config, 'assets.heroImages.0') || config?.assets?.heroImages?.[0];

    return (
        <section id="hero-section" className="relative py-20 bg-gradient-to-br from-gray-50 to-white">
            <div className="container mx-auto px-4">
                {/* Main Content */}
                <div className="text-center mb-12">
                    {/* Trust Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6">
                        <span className="text-primary font-semibold text-sm">
                            {getSectionText(config, 'trustText')}
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
                        {getSectionText(config, 'heroTitle')}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        {getSectionText(config, 'heroSubtitle')}
                    </p>

                    {/* Limited Time Offer Badge */}
                    <div className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full font-semibold text-lg mb-12">
                        LIMITED TIME OFFER - 24H ONLY
                    </div>
                </div>

                {/* Hero Image Card */}
                {heroImage && (
                    <div className="max-w-6xl mx-auto mb-12">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={heroImage}
                                alt="Kidsneed Laser Pen - Flawless Skin"
                                className="w-full h-auto object-cover"
                                style={{ maxHeight: '700px' }}
                            />
                        </div>
                    </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button
                        className="btn-primary text-xl px-12 py-4"
                        onClick={() => {
                            document.getElementById('product-section')?.scrollIntoView({
                                behavior: 'smooth'
                            });
                        }}
                    >
                        {getSectionText(config, 'primaryButton')}
                    </button>

                    <button className="btn-secondary text-xl px-12 py-4">
                        {getSectionText(config, 'secondaryButton')}
                    </button>
                </div>

                {/* Success Rate Badges */}
                <div className="flex items-center justify-center space-x-8">
                    <div className="text-center bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold text-primary mb-2">
                            {getSectionText(config, 'successRate')}
                        </div>
                        <div className="text-sm text-gray-500">Success Rate</div>
                    </div>

                    <div className="text-center bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold text-primary mb-2">
                            {config?.features?.reviewCount || 1000}+
                        </div>
                        <div className="text-sm text-gray-500">Happy Customers</div>
                    </div>

                    <div className="text-center bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold text-primary mb-2">
                            ⭐ {config?.features?.averageRating || 4.9}
                        </div>
                        <div className="text-sm text-gray-500">Average Rating</div>
                    </div>
                </div>
            </div>
        </section>
    );
}