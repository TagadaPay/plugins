'use client';

import { formatMoney } from '@tagadapay/plugin-sdk';
import { Loader2, Loader2Icon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from './Image';

import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { useGymkartelController } from '@/src/hooks/use-controller';
import { Colors } from '@/src/types/colors';
import { ProductPackageName } from './ProductCard';
import { useSelection } from './providers';

export function StickyAddToCart() {
  const {
    isLoading: controllerLoading,
    onBuyNow,
    initLoading,
    packOne,
    packTwo,
    packThree,
    getAvailableColors,
    getAvailableSizes,
  } = useGymkartelController();

  const {
    selectedPackageColors,
    selectedPackageSizes,
    updateSelectedPackage,
    setPackageColor,
    setPackageSize,
    activePackage,
  } = useSelection();

  const [selectedPack, setSelectedPack] = useState<ProductPackageName>(ProductPackageName.TWO_PAIRS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Record<number, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  // Get all possible sizes from the controller
  const allSizes = getAvailableSizes();

  // Generate colors and packs data
  const availableColors = getAvailableColors();
  const colors = availableColors.map((color) => ({
    name: color,
    image:
      color === Colors.BLACK
        ? '/images/leggings-black.png'
        : color === Colors.BEIGE
          ? '/images/leggings-beige.png'
          : color === Colors.PINK
            ? '/images/leggings-pink.png'
            : color === Colors.BLUE
              ? '/images/leggings-light-blue.png'
              : '/images/leggings-black.png',
  }));

  const packs: Record<ProductPackageName, { image: string; quantity: number; description: string }> = {
    [ProductPackageName.ONE_PAIR]: {
      image: '/images/leggings-black.png',
      quantity: 1,
      description: '1 pair',
    },
    [ProductPackageName.TWO_PAIRS]: {
      image: '/images/leggings-pink.png',
      quantity: 2,
      description: '2 pairs',
    },
    [ProductPackageName.THREE_PAIRS]: {
      image: '/images/leggings-light-blue.png',
      quantity: 3,
      description: '3 pairs',
    },
  };

  // Sync with ProductCard selections when they change
  useEffect(() => {
    // Find the package with the most complete selections
    let mostCompletePackage = selectedPack;
    let maxCompleteness = 0;

    Object.entries(selectedPackageColors).forEach(([packageName, colors]) => {
      const packageNum = Number(packageName) as ProductPackageName;
      const sizes = selectedPackageSizes[packageNum] || [];
      const completeness = colors.filter(Boolean).length + sizes.filter(Boolean).length;

      if (completeness > maxCompleteness) {
        maxCompleteness = completeness;
        mostCompletePackage = packageNum;
      }
    });

    // Update selected pack if a different one has more complete selections
    if (mostCompletePackage !== selectedPack && maxCompleteness > 0) {
      setSelectedPack(mostCompletePackage);
    }

    // Sync colors and sizes for the selected package
    const packageColors = selectedPackageColors[selectedPack] || [];
    const packageSizes = selectedPackageSizes[selectedPack] || [];

    const newColors: Record<number, string> = {};
    const newSizes: Record<number, string> = {};

    packageColors.forEach((color, index) => {
      if (color) newColors[index] = color;
    });

    packageSizes.forEach((size, index) => {
      if (size) newSizes[index] = size;
    });

    setSelectedColors(newColors);
    setSelectedSizes(newSizes);
  }, [selectedPackageColors, selectedPackageSizes, selectedPack]);

  // Sync with activePackage changes from ProductCard clicks
  useEffect(() => {
    if (activePackage !== selectedPack) {
      setSelectedPack(activePackage);
      updateSelectedPackage(activePackage);

      // Sync colors and sizes for the new active package
      const packageColors = selectedPackageColors[activePackage] || [];
      const packageSizes = selectedPackageSizes[activePackage] || [];

      const newColors: Record<number, string> = {};
      const newSizes: Record<number, string> = {};

      packageColors.forEach((color, index) => {
        if (color) newColors[index] = color;
      });

      packageSizes.forEach((size, index) => {
        if (size) newSizes[index] = size;
      });

      setSelectedColors(newColors);
      setSelectedSizes(newSizes);
    }
  }, [activePackage, selectedPack, selectedPackageColors, selectedPackageSizes, updateSelectedPackage]);

  // Handle manual package selection changes
  const handlePackageChange = (newPackage: ProductPackageName) => {
    setSelectedPack(newPackage);
    updateSelectedPackage(newPackage);

    // Clear current selections when switching packages
    setSelectedColors({});
    setSelectedSizes({});
  };

  const handleColorChange = (pairIndex: number, colorName: string) => {
    setSelectedColors((prev) => ({
      ...prev,
      [pairIndex]: colorName,
    }));

    // Clear size when color changes
    setSelectedSizes((prev) => ({
      ...prev,
      [pairIndex]: '',
    }));

    // Sync back to selection provider
    setPackageColor(selectedPack, pairIndex, colorName);
  };

  const handleSizeChange = (pairIndex: number, sizeName: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [pairIndex]: sizeName,
    }));

    // Sync back to selection provider
    setPackageSize(selectedPack, pairIndex, sizeName);
  };

  const getSelectedColor = (pairIndex: number) => {
    return selectedColors[pairIndex] || '';
  };

  const getSelectedSize = (pairIndex: number) => {
    return selectedSizes[pairIndex] || '';
  };

  const handleBuyNow = async () => {
    // Convert selected colors and sizes to arrays for the controller
    const packQuantity = packs[selectedPack]?.quantity || 1;
    const colorsArray: string[] = [];
    const sizesArray: string[] = [];

    for (let i = 0; i < packQuantity; i++) {
      colorsArray.push(selectedColors[i] || availableColors[0] || Colors.BLACK);
      sizesArray.push(selectedSizes[i] || allSizes[0] || 'M');
    }

    await onBuyNow(selectedPack, colorsArray, sizesArray);
  };

  // Helper function to get pricing data for a pack
  const getPackPricing = (packName: ProductPackageName) => {
    switch (packName) {
      case ProductPackageName.ONE_PAIR:
        return packOne;
      case ProductPackageName.TWO_PAIRS:
        return packTwo;
      case ProductPackageName.THREE_PAIRS:
        return packThree;
      default:
        return null;
    }
  };

  // Check if pricing is loading
  const isPricingLoading = !packOne || !packTwo || !packThree;
  const pricingData = getPackPricing(selectedPack);
  const originalPrice = pricingData?.preview?.totalAmount || 0;
  const adjustedPrice = pricingData?.preview?.totalAdjustedAmount || 0;
  const savings = originalPrice - adjustedPrice;
  const packQuantity = packs[selectedPack]?.quantity || 1;
  const pricePerUnit = packQuantity > 0 ? adjustedPrice / packQuantity : 0;

  return (
    <>
      {/* Collapsed sticky bar */}
      {!isExpanded && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-white px-2 py-4 shadow-lg md:hidden">
          <div className="flex items-center gap-4">
            <Image
              src={packs[selectedPack]?.image || '/images/leggings-black.png'}
              alt="Gymkartel Leggings"
              width={50}
              height={50}
              className="rounded-md object-cover"
            />
            <div className="flex shrink-0 flex-col gap-1">
              {isPricingLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin text-rose-600" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <>
                  {/* Price per unit - highlighted */}
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-rose-600">{formatMoney(pricePerUnit)}</span>
                    <span className="text-xs text-gray-500">/ per pair</span>
                  </div>

                  {/* Total price */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-base font-semibold text-gray-900">
                        {formatMoney(adjustedPrice)}
                      </span>
                    </div>

                    {/* Original price before discount */}
                    {originalPrice > adjustedPrice && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-400 line-through">
                          {formatMoney(originalPrice)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {/* Pack name and pairs */}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-lg font-bold text-rose-600">
                {packQuantity} pair{packQuantity > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              onClick={() => setIsExpanded(true)}
              className="rounded-md bg-rose-600 px-4 py-2 text-base text-white hover:bg-rose-700"
            >
              Customize
            </Button>
            <Button
              onClick={handleBuyNow}
              className="rounded-md bg-rose-600 px-6 py-2 text-base text-white hover:bg-rose-700"
              disabled={controllerLoading || initLoading}
            >
              {controllerLoading || initLoading ? 'Loading...' : 'Buy now'}
            </Button>
          </div>
        </div>
      )}

      {/* Expanded sticky form */}
      {isExpanded && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg md:hidden">
          <div className="p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Customize Your Pack</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Pack selector */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Select Pack</label>
              <Select
                value={selectedPack.toString()}
                onValueChange={(value) => handlePackageChange(Number(value) as ProductPackageName)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(packs).map(([packName, pack]) => (
                    <SelectItem key={packName} value={packName}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={pack.image || '/images/leggings-black.png'}
                          alt={packName}
                          width={32}
                          height={32}
                          className="rounded-sm object-cover"
                        />
                        <span>{pack.description}</span>
                        <span className="text-sm text-gray-500">({pack.quantity} pairs)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price display */}
            <div className="mb-4 rounded-lg bg-rose-50 p-3">
              <div className="flex shrink-0 flex-col gap-1">
                {isPricingLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <>
                    {/* Price per unit - highlighted */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price per pair:</span>
                      <span className="text-lg font-bold text-rose-600">{formatMoney(pricePerUnit)}</span>
                    </div>

                    {/* Total price */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total:</span>
                      <span className="text-base font-semibold text-gray-900">
                        {formatMoney(adjustedPrice)}
                      </span>
                    </div>

                    {/* Original price before discount */}
                    {originalPrice > adjustedPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Original price:</span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatMoney(originalPrice)}
                        </span>
                      </div>
                    )}

                    {/* Savings */}
                    {savings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">You save:</span>
                        <span className="text-sm font-semibold text-green-600">{formatMoney(savings)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Pairs selection */}
            <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
              {Array.from({ length: packQuantity }, (_, pairIndex) => {
                const selectedColor = getSelectedColor(pairIndex);
                const selectedSize = getSelectedSize(pairIndex);

                return (
                  <div key={pairIndex} className="flex items-center gap-2">
                    <span className="w-8 text-sm font-semibold text-gray-700">#{pairIndex + 1}</span>
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      {/* Color selector */}
                      <Select
                        value={selectedColor}
                        onValueChange={(value) => handleColorChange(pairIndex, value)}
                      >
                        <SelectTrigger className="w-full">
                          {selectedColor ? (
                            <span className="text-sm font-medium">{selectedColor}</span>
                          ) : (
                            <SelectValue placeholder="Color" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color.name} value={color.name}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={color.image}
                                  alt={color.name}
                                  width={32}
                                  height={32}
                                  className="rounded-sm object-cover"
                                  loading="lazy"
                                />
                                <span className="text-sm">{color.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Size selector */}
                      <Select
                        value={selectedSize}
                        onValueChange={(value) => handleSizeChange(pairIndex, value)}
                      >
                        <SelectTrigger className="w-full">
                          {selectedSize ? (
                            <span className="text-sm font-medium">{selectedSize}</span>
                          ) : (
                            <SelectValue placeholder="Size" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {allSizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button onClick={() => setIsExpanded(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-1 bg-rose-600 text-white hover:bg-rose-700"
                disabled={controllerLoading || initLoading}
              >
                {controllerLoading || initLoading ? 'Loading...' : 'Buy now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
