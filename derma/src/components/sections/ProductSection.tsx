import React from 'react';
import { formatCurrency } from '../../lib/config-helpers';

interface ProductSectionProps {
    controller: any;
}

export function ProductSection({ controller }: ProductSectionProps) {
    const {
        config,
        product,
        productImage,
        packOne,
        packTwo,
        packThree,
        selectedPack,
        onSelectPack,
        onBuyNow,
        initLoading
    } = controller;

    if (!packOne || !packTwo || !packThree) {
        return (
            <section id="product-section" className="py-20 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-xl">Loading product packages...</p>
                </div>
            </section>
        );
    }

    const packages = [
        {
            ...packOne,
            popular: false,
            savings: packOne?.displayDiscount || 0,
            description: "Perfect for trying our technology",
            quantity: 1
        },
        {
            ...packTwo,
            popular: true,
            savings: packTwo?.displayDiscount || 25,
            description: "Most popular choice - Best value",
            quantity: 2
        },
        {
            ...packThree,
            popular: false,
            savings: packThree?.displayDiscount || 40,
            description: "Maximum savings - Best for sharing",
            quantity: 3
        }
    ];

    return (
        <section id="product-section" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Package
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Select the perfect package for your skin transformation journey.
                        All packages include our {config?.content?.sections?.en?.guaranteeText || '180-day guarantee'}.
                    </p>

                    {/* Limited Time Offer Banner */}
                    <div className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-full font-semibold text-lg mb-8">
                        <span className="mr-2">🔥</span>
                        LIMITED TIME OFFER - UP TO 40% OFF
                    </div>
                </div>

                {/* Product Packages Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                    {packages.map((pkg, index) => {
                        const isSelected = selectedPack?.bundleName === pkg.bundleName;
                        const discountPercent = pkg.savings;

                        // Use config-based pricing from the updated controller
                        const basePrice = pkg.basePrice || 0; // Already in cents
                        const finalPrice = pkg.discountedPrice || basePrice; // Already in cents

                        // Calculate per device pricing
                        const getPerDeviceText = () => {
                            if (pkg.quantity === 1) return 'Single device';
                            const perDevice = (finalPrice / 100) / pkg.quantity;
                            return `$${perDevice.toFixed(2)} per device`;
                        };

                        return (
                            <div
                                key={pkg.bundleName}
                                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2 ${
                                    pkg.popular
                                        ? 'border-primary ring-4 ring-primary/20'
                                        : isSelected
                                            ? 'border-primary'
                                            : 'border-gray-200 hover:border-primary/50'
                                }`}
                                onClick={() => onSelectPack(pkg.bundleName)}
                            >
                                {/* Popular Badge */}
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            MOST POPULAR
                                        </div>
                                    </div>
                                )}

                                {/* Savings Badge */}
                                {pkg.savings > 0 && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-sm font-bold">
                                        SAVE<br/>{pkg.savings}%
                                    </div>
                                )}

                                <div className="p-8">
                                    {/* Package Title */}
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {pkg.bundleName}
                                        </h3>
                                        <p className="text-gray-600">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    {/* Product Image */}
                                    <div className="mb-6">
                                        <img
                                            src={productImage || '/placeholders/product.jpg'}
                                            alt={product?.name}
                                            className="w-32 h-32 object-contain mx-auto"
                                        />
                                    </div>

                                    {/* Pricing */}
                                    <div className="text-center mb-6">
                                        <div className="mb-2">
                                            <span className="text-3xl font-bold text-primary">
                                                ${(finalPrice / 100).toFixed(2)}
                                            </span>
                                            {pkg.savings > 0 && (
                                                <span className="text-lg text-gray-400 line-through ml-2">
                                                    ${(basePrice / 100).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {getPerDeviceText()}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-2 mb-8 text-sm">
                                        <li className="flex items-center">
                                            <span className="text-green-500 mr-2">✓</span>
                                            Free worldwide shipping
                                        </li>
                                        <li className="flex items-center">
                                            <span className="text-green-500 mr-2">✓</span>
                                            180-day money-back guarantee
                                        </li>
                                        <li className="flex items-center">
                                            <span className="text-green-500 mr-2">✓</span>
                                            FDA approved technology
                                        </li>
                                        {pkg.savings > 0 && (
                                            <li className="flex items-center text-primary font-semibold">
                                                <span className="text-primary mr-2">★</span>
                                                Save ${((basePrice - finalPrice) / 100).toFixed(2)}
                                            </li>
                                        )}
                                    </ul>

                                    {/* Select Button */}
                                    <button
                                        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                            isSelected
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectPack(pkg.bundleName);
                                        }}
                                    >
                                        {isSelected ? 'SELECTED' : 'SELECT PACKAGE'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Purchase Button */}
                <div className="text-center">
                    <button
                        className={`btn-primary text-xl px-12 py-4 ${initLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => selectedPack && onBuyNow(selectedPack.bundleName)}
                        disabled={initLoading || !selectedPack}
                    >
                        {initLoading ? (
                            <span className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing...
                            </span>
                        ) : (
                            `BUY ${selectedPack?.bundleName?.toUpperCase()} NOW`
                        )}
                    </button>

                    <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                            <span className="text-green-500 mr-1">🔒</span>
                            Secure Checkout
                        </span>
                        <span className="flex items-center">
                            <span className="text-blue-500 mr-1">🚚</span>
                            Free Shipping
                        </span>
                        <span className="flex items-center">
                            <span className="text-purple-500 mr-1">↩️</span>
                            180-Day Guarantee
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}