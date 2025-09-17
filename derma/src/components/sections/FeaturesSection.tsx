import React from 'react';
import { getSectionText } from '../../lib/config-helpers';

interface FeaturesSectionProps {
    controller: any;
}

const defaultFeatures = [
    {
        icon: "🎯",
        title: "Precision Technology",
        description: "Advanced CO₂ laser precisely targets imperfections without damaging surrounding skin"
    },
    {
        icon: "🏠", 
        title: "Home Treatment",
        description: "Professional-grade results in the comfort and privacy of your own home"
    },
    {
        icon: "⚡",
        title: "Fast Results", 
        description: "See visible improvements in just 7-14 days with continued use"
    },
    {
        icon: "🔒",
        title: "Safe & Approved",
        description: "FDA approved technology with built-in safety mechanisms"
    },
    {
        icon: "💰",
        title: "Cost Effective", 
        description: "Save thousands compared to professional clinic treatments"
    },
    {
        icon: "🌟",
        title: "No Side Effects",
        description: "Gentle, non-invasive treatment with minimal to no side effects"
    }
];

export function FeaturesSection({ controller }: FeaturesSectionProps) {
    const { config } = controller;

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {getSectionText(config, 'featuresTitle')}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {getSectionText(config, 'featuresSubtitle')}
                    </p>
                </div>
                
                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {defaultFeatures.map((feature, index) => (
                        <div 
                            key={index}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                        >
                            {/* Feature Icon */}
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <span className="text-3xl">{feature.icon}</span>
                            </div>
                            
                            {/* Feature Content */}
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
                
                {/* Certifications Row */}
                <div className="mt-16 pt-12 border-t border-gray-200">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Trusted & Certified
                        </h3>
                        <p className="text-gray-600">
                            Our device meets the highest safety and quality standards
                        </p>
                    </div>
                    
                    {/* Certification Logos */}
                    <div className="flex items-center justify-center space-x-12 opacity-70">
                        {config?.assets?.certificationLogos?.map((cert, index) => (
                            <div key={index} className="text-center">
                                <img 
                                    src={cert.imageUrl}
                                    alt={cert.alt}
                                    className="h-12 mx-auto mb-2 grayscale hover:grayscale-0 transition-all duration-300"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {cert.name}
                                </span>
                            </div>
                        )) || (
                            // Fallback certification badges
                            <>
                                <div className="text-center">
                                    <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <span className="text-xs font-bold">FDA</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">FDA</span>
                                </div>
                                <div className="text-center">
                                    <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <span className="text-xs font-bold">CE</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">CE</span>
                                </div>
                                <div className="text-center">
                                    <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <span className="text-xs font-bold">ISO</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">ISO</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}