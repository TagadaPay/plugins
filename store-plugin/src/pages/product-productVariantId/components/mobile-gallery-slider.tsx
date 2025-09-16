

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { ProductVariant } from '@/storage/cart/types';

interface MobileGallerySliderProps {
  product: ProductVariant;
}

export function MobileGallerySlider({ product }: MobileGallerySliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    loop: false,
  });
  const [, setSelectedIndex] = useState(0);

  const onInit = useCallback(() => {
    // Initialize carousel
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit();
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  if (!product.imageUrl) return null;

  return (
    <div className="relative w-full h-full">
      {/* Embla Carousel */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {[product.imageUrl].map((image) => (
            <div
              key={image}
              className="flex-shrink-0 w-full h-full relative"
            >
              <img
                src={image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
