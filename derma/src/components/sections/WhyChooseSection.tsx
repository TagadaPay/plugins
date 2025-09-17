import React from 'react';
import { getSectionText } from '../../lib/config-helpers';

interface WhyChooseSectionProps {
    controller: any;
}

export function WhyChooseSection({ controller }: WhyChooseSectionProps) {
    const { config } = controller;

    const features = [
        {
            icon: '🎯',
            title: 'Advanced CO2 Laser Technology',
            description: 'Precisely targets skin imperfections without damaging surrounding tissue using professional-grade laser technology.'
        },
        {
            icon: '🏠',
            title: 'Safe Home Treatment & Portable',
            description: 'FDA-approved technology allows you to achieve professional results from the comfort of your home.'
        },
        {
            icon: '💰',
            title: 'Cost-Effective Solution',
            description: 'Save thousands compared to expensive clinic visits while getting the same professional results.'
        },
        {
            icon: '⚡',
            title: 'Fast, Visible Results',
            description: 'See improvements in just 7-14 days with our clinically proven laser technology.'
        }
    ];

    return (
        <section id="why-choose-section" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Single large image */}
                    <div className="relative">
                        <img
                            src="/images/hero-image.png"
                            alt="Kidsneed Laser Pen - Professional Treatment"
                            className="w-full h-auto object-cover rounded-2xl shadow-2xl"
                            style={{ maxHeight: '500px' }}
                        />
                    </div>

                    {/* Right side - Content */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                            {getSectionText(config, 'featuresTitle') || 'Why Choose the Kidsneed® Laser Pen?'}
                        </h2>

                        <div className="space-y-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">{feature.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-8 flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-sm font-medium text-gray-900">FDA Approved</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-sm font-medium text-gray-900">Clinically Tested</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-sm font-medium text-gray-900">180-Day Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}