import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getSectionText } from '../../lib/config-helpers';

interface ResultsGalleryProps {
    controller: any;
}

export function ResultsGallery({ controller }: ResultsGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const { config } = controller;

    const beforeAfterImages = config?.assets?.beforeAfterImages || [];

    if (!beforeAfterImages.length) return null;

    const openLightbox = (index: number) => {
        setSelectedImage(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'unset';
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (selectedImage === null) return;

        let newIndex;
        if (direction === 'prev') {
            newIndex = selectedImage === 0 ? beforeAfterImages.length - 1 : selectedImage - 1;
        } else {
            newIndex = selectedImage === beforeAfterImages.length - 1 ? 0 : selectedImage + 1;
        }
        setSelectedImage(newIndex);
    };

    return (
        <section id="results-section" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {getSectionText(config, 'resultsTitle') || 'Real Results From Real People'}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        {getSectionText(config, 'resultsSubtitle') ||
                         'See the amazing transformations achieved by our customers using the Kidsneed® Laser Pen'}
                    </p>

                    {/* Success Stats */}
                    <div className="flex items-center justify-center space-x-8 mb-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">98%</div>
                            <div className="text-sm text-gray-500">Success Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">7-14</div>
                            <div className="text-sm text-gray-500">Days to Results</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">1000+</div>
                            <div className="text-sm text-gray-500">Success Stories</div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {beforeAfterImages.map((result, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            onClick={() => openLightbox(index)}
                        >
                            <div className="relative">
                                <img
                                    src={result.imageUrl}
                                    alt={result.alt}
                                    className="w-full h-64 object-cover"
                                />
                                {/* Overlay with view button */}
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-white/90 rounded-full p-3">
                                            <span className="text-gray-900 font-semibold">View Full Size</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {result.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {result.alt}
                                </p>

                                {/* Timeline badges */}
                                <div className="flex items-center space-x-2">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                        Verified Result
                                    </span>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                        Real Customer
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Treatment Timeline */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                        Your Transformation Timeline
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📅</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Day 1-3</h4>
                            <p className="text-gray-600">
                                Initial application. Gentle treatment begins working on targeted imperfections.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🔄</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Day 7-10</h4>
                            <p className="text-gray-600">
                                Visible improvements appear. Skin imperfections begin to fade and shrink.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✨</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Day 14-21</h4>
                            <p className="text-gray-600">
                                Complete transformation. Clear, smooth skin with imperfections fully removed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Ready to See Your Own Transformation?
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who have achieved professional results at home
                    </p>
                    <button
                        onClick={() => {
                            document.getElementById('product-section')?.scrollIntoView({
                                behavior: 'smooth'
                            });
                        }}
                        className="btn-primary text-xl px-8 py-4"
                    >
                        Start Your Transformation
                    </button>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage !== null && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-full">
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                            onClick={() => navigateImage('prev')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>

                        <button
                            onClick={() => navigateImage('next')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>

                        {/* Image */}
                        <img
                            src={beforeAfterImages[selectedImage].imageUrl}
                            alt={beforeAfterImages[selectedImage].alt}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />

                        {/* Image Info */}
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                            <div className="bg-black/50 rounded-lg p-4 text-white">
                                <h3 className="text-xl font-bold mb-1">
                                    {beforeAfterImages[selectedImage].title}
                                </h3>
                                <p className="text-gray-200">
                                    {beforeAfterImages[selectedImage].alt}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}