import React from 'react';

interface PainlessRemovalSectionProps {
    controller: any;
}

export function PainlessRemovalSection({ controller }: PainlessRemovalSectionProps) {
    const { config, product, productImage } = controller;

    const conditions = [
        {
            name: 'Skin Tags',
            image: '/images/skin-tags-results.webp',
            description: 'Remove unwanted skin tags safely and painlessly'
        },
        {
            name: 'Moles',
            image: '/images/results-7-days.webp',
            description: 'Eliminate moles without scarring or damage'
        },
        {
            name: 'Warts',
            image: '/images/skin-conditions.webp',
            description: 'Effective wart removal with professional results'
        },
        {
            name: 'Age Spots',
            image: '/images/results-image.png',
            description: 'Clear age spots for younger-looking skin'
        }
    ];

    return (
        <section id="painless-removal-section" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Content */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Painless, non-invasive removal of skin growths
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Fast and after 7 days it leaves the skin clean. For Nodules and Warts.
                        </p>

                        {/* Features grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {conditions.map((condition, index) => (
                                <div key={index} className="bg-gray-50 rounded-xl p-4">
                                    <img
                                        src={condition.image}
                                        alt={condition.name}
                                        className="w-full h-40 object-cover rounded-lg mb-3"
                                    />
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">
                                        {condition.name}
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        {condition.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Key benefits */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <span className="text-green-500 text-lg">✓</span>
                                <span className="text-gray-900 font-medium">No pain during treatment</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-green-500 text-lg">✓</span>
                                <span className="text-gray-900 font-medium">Results visible in 7 days</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-green-500 text-lg">✓</span>
                                <span className="text-gray-900 font-medium">No scarring or skin damage</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-green-500 text-lg">✓</span>
                                <span className="text-gray-900 font-medium">FDA approved technology</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Product showcase */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8">
                            {/* Main product image */}
                            <div className="text-center mb-6">
                                <img
                                    src={productImage || '/images/single-pack-product.png'}
                                    alt="Kidsneed Laser Pen"
                                    className="w-48 h-48 object-contain mx-auto mb-4"
                                />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Kidsneed® Laser Pen
                                </h3>
                                <p className="text-gray-600">
                                    Professional-grade CO₂ laser technology
                                </p>
                            </div>

                            {/* Before/After showcase */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <img
                                        src="/images/skin-conditions.webp"
                                        alt="Before Treatment"
                                        className="w-full h-40 object-cover rounded-lg mb-2"
                                    />
                                    <span className="text-sm font-medium text-gray-900">Before</span>
                                </div>
                                <div className="text-center">
                                    <img
                                        src="/images/results-7-days.webp"
                                        alt="After Treatment"
                                        className="w-full h-40 object-cover rounded-lg mb-2"
                                    />
                                    <span className="text-sm font-medium text-gray-900">After 7 Days</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-4 -right-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold">
                            FDA Approved
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                            98% Success Rate
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}