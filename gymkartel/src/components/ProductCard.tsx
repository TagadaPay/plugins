// import { formatMoney } from '@tagadapay/plugin-sdk';
import { formatMoney } from '@tagadapay/plugin-sdk';
import React from 'react';
import Image from './Image';
import { useSelection } from './providers';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBrandingContext } from '../contexts/ConfigProvider';

// Simple money formatting function

interface ProductColor {
  name: string;
  image: string;
}

export enum ProductPackageName {
  ONE_PAIR = 1,
  TWO_PAIRS = 2,
  THREE_PAIRS = 3,
}

export interface ProductPackage {
  name: ProductPackageName;
  colors: ProductColor[];
  price: number;
  originalPrice: number;
  pricePerUnit: number;
  originalPricePerUnit: number;
  savings: number;
  popular: boolean;
}

interface ProductCardProps {
  pkg: ProductPackage;
  requiredSelections: number;
  sizes: string[];
  onBuyNow: (packageName: ProductPackageName, colors: string[], sizes: string[]) => void;
  initLoading?: boolean;
  isLoading?: boolean;
}

const productPackageTitle: Record<ProductPackageName, string> = {
  [ProductPackageName.ONE_PAIR]: '1 Pair',
  [ProductPackageName.TWO_PAIRS]: '2 Pairs',
  [ProductPackageName.THREE_PAIRS]: '3 Pairs',
};

export const ProductCard = React.memo(function ProductCard({
  pkg,
  requiredSelections,
  sizes,
  onBuyNow,
  initLoading = false,
  isLoading = false,
}: ProductCardProps) {
  const branding = useBrandingContext();
  const { selectedPackageColors, selectedPackageSizes, setPackageColor, setPackageSize, setActivePackage } =
    useSelection();
  const selectedColors = selectedPackageColors[pkg.name] || [];
  const selectedSizes = selectedPackageSizes[pkg.name] || [];
  const isComplete =
    selectedColors.length === requiredSelections &&
    selectedSizes.length === requiredSelections &&
    selectedColors.every(Boolean) &&
    selectedSizes.every(Boolean);

  const handleCardClick = () => {
    setActivePackage(pkg.name);
  };

  return (
    <Card
      className={`relative mt-4 cursor-pointer overflow-hidden rounded-2xl border-0 bg-white/95 p-4 pt-6 text-center shadow-xl backdrop-blur-sm transition-all duration-200`}
      style={pkg.popular ? {
        boxShadow: `0 0 0 2px ${branding?.primaryColor || '#e11d48'}`
      } : {}}
      onClick={handleCardClick}
    >
      {pkg.popular && (
        <Badge 
          className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 px-3 pb-1 pt-3 text-xs font-semibold text-white"
          style={{ backgroundColor: branding?.primaryColor || '#dc2626' }}
        >
          MOST POPULAR
        </Badge>
      )}
      <CardContent className="flex h-full flex-col space-y-4 p-0">
        <h3 className="mb-3 text-xl font-semibold text-gray-900 md:text-2xl">
          {productPackageTitle[pkg.name]}
        </h3>
        {/* Product Image Preview */}
        <div className="mb-4 flex justify-center gap-2">
          {Array.from({ length: requiredSelections }).map((_, index) => (
            <div key={index} className="h-32 w-20 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={
                  pkg.colors.find((c) => c.name === selectedColors[index])?.image ||
                  '/images/leggings-black.png'
                }
                alt={`${selectedColors[index]} Leggings`}
                width={100}
                height={150}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        {/* Pricing */}
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-pink-200 bg-pink-50 p-3">
            <p className="text-3xl font-bold text-rose-600">{formatMoney(pkg.pricePerUnit)}</p>
            <p className="text-sm font-medium text-rose-700">per pair</p>
          </div>
          {pkg.pricePerUnit < pkg.originalPricePerUnit && (
            <p className="text-lg text-gray-500 line-through">
              {formatMoney(pkg.originalPricePerUnit)} per pair
            </p>
          )}
          <p className="text-xl font-bold text-gray-800">Total: {formatMoney(pkg.price)}</p>
          {pkg.savings > 0 && (
            <div className="rounded-lg bg-green-50 p-2">
              <p className="text-sm font-semibold text-green-600">Save {formatMoney(pkg.savings)}</p>
            </div>
          )}
        </div>
        {/* Multiple Color and Size Selections */}
        <div className="mt-4 space-y-4">
          {Array.from({ length: requiredSelections }).map((_, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">
                {requiredSelections === 1 ? 'Selection' : `Pair ${index + 1}`}
              </h4>
              {/* Color Selection */}
              <Select
                onValueChange={(value) => setPackageColor(pkg.name, index, value)}
                value={selectedColors[index] || ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select Color ${requiredSelections === 1 ? '' : index + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {pkg.colors.map((color) => (
                    <SelectItem key={color.name} value={color.name}>
                      {color.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Size Selection */}
              <Select
                onValueChange={(value) => setPackageSize(pkg.name, index, value)}
                value={selectedSizes[index] || ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select Size ${requiredSelections === 1 ? '' : index + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        {/* Buy Button */}
        <Button
          className={`border-1 mt-auto w-full transform rounded-full bg-white px-8 py-4 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-xl disabled:cursor-not-allowed disabled:border-0 disabled:opacity-50`}
          style={{
            borderColor: branding?.primaryColor || '#dc2626',
            color: branding?.primaryColor || '#dc2626'
          }}
          disabled={!isComplete || isLoading || initLoading}
          onClick={() => onBuyNow(pkg.name, selectedColors, selectedSizes)}
        >
          {initLoading
            ? 'LOADING...'
            : isLoading
              ? 'BUYING...'
              : !isComplete
                ? 'SELECT ALL COLORS & SIZES'
                : 'BUY IT NOW'}
        </Button>
      </CardContent>
    </Card>
  );
});
