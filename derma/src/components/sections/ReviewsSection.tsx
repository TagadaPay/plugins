import React from 'react';
import { getSectionText } from '../../lib/config-helpers';

interface ReviewsSectionProps {
    controller: any;
}

export function ReviewsSection({ controller }: ReviewsSectionProps) {
    const { config } = controller;
    
    const reviews = config?.content?.customerReviews || [];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {getSectionText(config, 'reviewsTitle')}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {getSectionText(config, 'reviewsSubtitle')}
                    </p>
                    
                    {/* Rating Summary */}
                    <div className="flex items-center justify-center mt-8 space-x-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">
                                {config?.features?.averageRating || 4.9}
                            </div>
                            <div className="flex items-center justify-center mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500">Average Rating</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">
                                {config?.features?.reviewCount || 1000}+
                            </div>
                            <div className="text-sm text-gray-500">Verified Reviews</div>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.slice(0, 6).map((review, index) => (
                        <div 
                            key={index}
                            className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                        >
                            {/* Rating Stars */}
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span 
                                        key={i} 
                                        className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        ⭐
                                    </span>
                                ))}
                                {review.verified && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        Verified
                                    </span>
                                )}
                            </div>
                            
                            {/* Review Text */}
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                "{review.text}"
                            </p>
                            
                            {/* Reviewer Info */}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span className="font-medium">{review.name}</span>
                                <span>{review.location}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View More Reviews Button */}
                <div className="text-center mt-12">
                    <button className="btn-secondary">
                        View More Reviews
                    </button>
                </div>
            </div>
        </section>
    );
}