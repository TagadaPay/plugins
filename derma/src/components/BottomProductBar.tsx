import React from 'react';

interface BottomProductBarProps {
    controller: any;
}

export function BottomProductBar({ controller }: BottomProductBarProps) {
    const {
        product,
        productImage,
        selectedPack,
        onBuyNow,
        initLoading,
        config
    } = controller;

    if (!selectedPack || !product) return null;

    // Use config-based pricing from the updated controller
    const basePrice = selectedPack.basePrice || 0;
    const finalPrice = selectedPack.discountedPrice || basePrice;
    const discountPercent = selectedPack.displayDiscount || 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Left side - Product info */}
                    <div className="flex items-center space-x-4">
                        <img
                            src={productImage || '/images/single-pack-product.png'}
                            alt={product.name}
                            className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-2"
                        />
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                                ${(finalPrice / 100).toFixed(2)}
                            </h3>
                            <div className="flex items-center space-x-2">
                                {discountPercent > 0 && (
                                    <span className="text-gray-400 line-through text-sm">
                                        ${(basePrice / 100).toFixed(2)}
                                    </span>
                                )}
                                <span className="text-sm text-gray-600">
                                    {selectedPack.bundleName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Buy button */}
                    <button
                        onClick={() => onBuyNow(selectedPack.bundleName)}
                        disabled={initLoading}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 ${
                            initLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {initLoading ? (
                            <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Processing...
                            </span>
                        ) : (
                            'BUY NOW'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}