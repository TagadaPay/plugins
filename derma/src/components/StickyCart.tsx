import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';

interface StickyCartProps {
    controller: any;
}

export function StickyCart({ controller }: StickyCartProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    const {
        product,
        productImage,
        selectedPack,
        onBuyNow,
        initLoading,
        config
    } = controller;

    useEffect(() => {
        const handleScroll = () => {
            // Show sticky cart after scrolling past hero section
            const heroSection = document.querySelector('.hero-background');
            if (heroSection) {
                const heroBottom = heroSection.getBoundingClientRect().bottom;
                setIsVisible(heroBottom < 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Pulse animation every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 2000);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible || !selectedPack || !product) return null;

    const baseTotal = selectedPack.preview?.total || 0;
    const discountPercent = selectedPack.displayDiscount || 0;
    const finalPrice = config?.pricing?.displayDiscountPricing && discountPercent > 0 ?
        Math.round(baseTotal * (1 - discountPercent / 100)) : baseTotal;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4">
                    {/* Product Info */}
                    <div className="flex items-center space-x-4">
                        <img
                            src={productImage || '/placeholders/product.jpg'}
                            alt={product.name}
                            className="w-12 h-12 object-contain rounded-lg"
                        />
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                                {selectedPack.bundleName}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-primary font-bold">
                                    ${(finalPrice / 100).toFixed(2)}
                                </span>
                                {discountPercent > 0 && (
                                    <>
                                        <span className="text-gray-400 line-through text-sm">
                                            ${(baseTotal / 100).toFixed(2)}
                                        </span>
                                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                            -{discountPercent}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Buy Button */}
                    <button
                        onClick={() => onBuyNow(selectedPack.bundleName)}
                        disabled={initLoading}
                        className={`btn-primary px-6 py-3 flex items-center space-x-2 transition-all duration-300 ${
                            isPulsing ? 'animate-pulse scale-105' : ''
                        } ${initLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {initLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                <span className="hidden sm:inline">Processing...</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="h-4 w-4" />
                                <span className="font-bold">BUY NOW</span>
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-6 pb-3 text-xs text-gray-600 border-t border-gray-100 pt-2">
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
    );
}