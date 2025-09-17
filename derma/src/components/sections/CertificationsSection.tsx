import React from 'react';
import { getSectionText } from '../../lib/config-helpers';

interface CertificationsSectionProps {
    controller: any;
}

export function CertificationsSection({ controller }: CertificationsSectionProps) {
    const { config } = controller;

    const certifications = config?.assets?.certificationLogos || [];

    if (!certifications.length) return null;

    return (
        <section id="certifications-section" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {getSectionText(config, 'certificationsTitle') || 'Trusted & Certified'}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        {getSectionText(config, 'certificationsSubtitle') ||
                         'Our technology meets the highest standards of safety and effectiveness, backed by leading regulatory bodies'}
                    </p>

                    {/* Trust Badge */}
                    <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-full border border-green-200">
                        <span className="text-green-600 font-semibold text-lg flex items-center">
                            <span className="mr-2">🛡️</span>
                            FDA Approved & Clinically Certified
                        </span>
                    </div>
                </div>

                {/* Certifications Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
                    {certifications.map((cert, index) => (
                        <div
                            key={cert.name}
                            className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                                    <img
                                        src={cert.imageUrl}
                                        alt={cert.alt}
                                        className="w-12 h-12 object-contain"
                                        onError={(e) => {
                                            // Fallback to text if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `<div class="text-2xl font-bold text-primary">${cert.name}</div>`;
                                            }
                                        }}
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">
                                    {cert.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {cert.alt}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Safety Information */}
                <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Clinical Safety & Efficacy
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <span className="text-green-500 text-lg mt-1">✓</span>
                                    <div>
                                        <strong>FDA Approved Technology:</strong>
                                        <p className="text-gray-600">CO₂ laser technology approved for safe home use</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <span className="text-green-500 text-lg mt-1">✓</span>
                                    <div>
                                        <strong>Clinically Tested:</strong>
                                        <p className="text-gray-600">98% success rate in clinical trials with over 1000 participants</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <span className="text-green-500 text-lg mt-1">✓</span>
                                    <div>
                                        <strong>Dermatologist Recommended:</strong>
                                        <p className="text-gray-600">Endorsed by leading skin care professionals worldwide</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {config?.features?.averageRating || 4.9}/5
                                </div>
                                <div className="flex items-center justify-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-xl">⭐</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 font-medium">
                                    Safety Rating
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Based on {config?.features?.reviewCount || 1000}+ user reviews
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}