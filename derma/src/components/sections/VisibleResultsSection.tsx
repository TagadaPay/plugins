import React from 'react';

interface VisibleResultsSectionProps {
    controller: any;
}

export function VisibleResultsSection({ controller }: VisibleResultsSectionProps) {
    const { config } = controller;

    const results = [
        {
            title: 'Day 1-3',
            subtitle: 'Treatment Begins',
            image: '/images/skin-conditions.webp',
            description: 'Gentle laser treatment begins working on targeted imperfections'
        },
        {
            title: 'Day 7',
            subtitle: 'Visible Improvements',
            image: '/images/results-7-days.webp',
            description: 'Clear improvements visible as imperfections begin to fade'
        },
        {
            title: 'Day 14',
            subtitle: 'Dramatic Results',
            image: '/images/skin-tags-results.webp',
            description: 'Complete transformation with smooth, flawless skin'
        },
        {
            title: 'Day 21+',
            subtitle: 'Perfect Results',
            image: '/images/results-image.png',
            description: 'Professional-grade results achieved at home'
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Visible Results in Just 7 Days
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        See the amazing transformation timeline with our advanced CO₂ laser technology
                    </p>
                </div>

                {/* Results Timeline Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {results.map((result, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="relative">
                                <img
                                    src={result.image}
                                    alt={result.title}
                                    className="w-full h-48 object-cover"
                                />
                                {/* Timeline badge */}
                                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                                    {result.title}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-gray-900 text-lg mb-2">
                                    {result.subtitle}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {result.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Success Stats */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">98%</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Success Rate</h3>
                            <p className="text-gray-600 text-sm">Clinical trials show 98% effectiveness</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">7-14</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Days to Results</h3>
                            <p className="text-gray-600 text-sm">Visible improvements in just one week</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Success Stories</h3>
                            <p className="text-gray-600 text-sm">Thousands of satisfied customers</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}