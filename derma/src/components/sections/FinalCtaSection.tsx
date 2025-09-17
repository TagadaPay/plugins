import React from 'react';
import { getSectionText } from '../../lib/config-helpers';

interface FinalCtaSectionProps {
    controller: any;
}

export function FinalCtaSection({ controller }: FinalCtaSectionProps) {
    const { config, selectedPack, onBuyNow, initLoading } = controller;

    return (
        <section className="py-20 hero-background">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Final CTA Header */}
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                        {getSectionText(config, 'finalCtaTitle')}
                    </h2>
                    
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        {getSectionText(config, 'finalCtaDescription')}
                    </p>

                    {/* Urgency Banner */}
                    <div className="bg-red-500 text-white rounded-2xl p-6 mb-8 inline-block">
                        <div className="flex items-center justify-center space-x-4">
                            <span className="text-2xl">⏰</span>
                            <div>
                                <div className="text-lg font-bold">LIMITED TIME OFFER</div>
                                <div className="text-sm opacity-90">Special pricing ends soon</div>
                            </div>
                        </div>
                    </div>

                    {/* Key Benefits Summary */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white/60 rounded-xl p-6 backdrop-blur-sm">
                            <div className="text-3xl mb-3">🏠</div>
                            <h3 className="font-bold text-gray-900 mb-2">Professional Results</h3>
                            <p className="text-sm text-gray-600">At-home treatment with clinical-grade technology</p>
                        </div>
                        
                        <div className="bg-white/60 rounded-xl p-6 backdrop-blur-sm">
                            <div className="text-3xl mb-3">💰</div>
                            <h3 className="font-bold text-gray-900 mb-2">Save Thousands</h3>
                            <p className="text-sm text-gray-600">Avoid expensive clinic visits and procedures</p>
                        </div>
                        
                        <div className="bg-white/60 rounded-xl p-6 backdrop-blur-sm">
                            <div className="text-3xl mb-3">🛡️</div>
                            <h3 className="font-bold text-gray-900 mb-2">Risk-Free Trial</h3>
                            <p className="text-sm text-gray-600">180-day money-back guarantee</p>
                        </div>
                    </div>

                    {/* Main CTA Button */}
                    <div className="mb-8">
                        <button 
                            className={`btn-primary text-xl px-12 py-4 ${initLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => {
                                if (selectedPack) {
                                    onBuyNow(selectedPack.bundleName);
                                } else {
                                    // Scroll to product section if no pack selected
                                    document.getElementById('product-section')?.scrollIntoView({ 
                                        behavior: 'smooth' 
                                    });
                                }
                            }}
                            disabled={initLoading}
                        >
                            {initLoading ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </span>
                            ) : selectedPack ? (
                                `ORDER ${selectedPack.bundleName.toUpperCase()} NOW`
                            ) : (
                                'CHOOSE YOUR PACKAGE'
                            )}
                        </button>
                        
                        <p className="text-sm text-gray-600 mt-4">
                            Free worldwide shipping • 180-day guarantee • FDA approved
                        </p>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center space-x-8 text-gray-500">
                        <div className="flex items-center space-x-2">
                            <span className="text-green-500">🔒</span>
                            <span className="text-sm font-medium">Secure Payment</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <span className="text-blue-500">✈️</span>
                            <span className="text-sm font-medium">Free Shipping</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <span className="text-purple-500">💎</span>
                            <span className="text-sm font-medium">Premium Quality</span>
                        </div>
                    </div>

                    {/* Social Links */}
                    {config?.content?.socialLinks && config.content.socialLinks.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <p className="text-gray-600 mb-4">Follow us for tips and results:</p>
                            <div className="flex items-center justify-center space-x-4">
                                {config.content.socialLinks.map((social, index) => (
                                    <a 
                                        key={index}
                                        href={social.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-gray-200 hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-colors duration-300"
                                        aria-label={social.label}
                                    >
                                        <img 
                                            src={social.iconUrl} 
                                            alt={`${social.platform} icon`}
                                            className="w-5 h-5 object-contain"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}