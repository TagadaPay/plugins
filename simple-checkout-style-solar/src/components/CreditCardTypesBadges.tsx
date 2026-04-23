import { CARD_NETWORK_IMAGES } from '@/data/card-network';
import { CardNetwork } from '@/types/card-network';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface CardNetworkDisplay {
  id: string;
  imageUrl: string;
  displayName: string;
  isCustom: boolean;
}

const PLACEHOLDER_IMAGE = '/brandnetwork/bankaccount.svg';

export const CreditCardTypesBadges = memo(() => {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();
  const cardNetworks = config?.cardNetworks;

  // Build the list of card networks to display — no component-level fallback,
  // defaults come from the config schema
  const acceptedCardTypes = useMemo<CardNetworkDisplay[]>(() => {
    if (!cardNetworks) return [];
    return cardNetworks
      .filter((network) => network.id)
      .map((network) => {
        const isStandardNetwork = Object.values(CardNetwork).includes(network.id as CardNetwork);
        const standardImage = isStandardNetwork
          ? CARD_NETWORK_IMAGES[network.id as CardNetwork]
          : undefined;

        return {
          id: network.id,
          imageUrl: network.imageUrl || standardImage || PLACEHOLDER_IMAGE,
          displayName: network.name || network.id.charAt(0).toUpperCase() + network.id.slice(1),
          isCustom: !isStandardNetwork,
        };
      });
  }, [cardNetworks]);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(acceptedCardTypes.length);
  const prevCountRef = useRef(acceptedCardTypes.length);
  const rafIdRef = useRef<number | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Get tooltip text for a card network
  const getCardTooltipText = (cardDisplayName: string): string => {
    return t(config?.checkout?.payment?.cardNetworksTooltipText, '{cardNetwork} accepted', {
      cardNetwork: cardDisplayName,
    }) as string;
  };

  // Update visible count when card networks change
  useEffect(() => {
    prevCountRef.current = acceptedCardTypes.length;
    setVisibleCount(acceptedCardTypes.length);
  }, [acceptedCardTypes.length]);

  // Detect overflow by measuring items in a separate measurement container
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !measureRef.current) return;

      const container = containerRef.current;
      const measureContainer = measureRef.current;
      const maxWidth = container.clientWidth;

      if (maxWidth === 0) return; // Container not yet sized

      const items = Array.from(measureContainer.children) as HTMLElement[];
      if (items.length === 0) return;

      // Reserve space for the "+X" indicator (approximately 45px)
      const reserveSpace = 45;
      let totalWidth = 0;
      let count = 0;
      const gapWidth = 6; // gap-1.5 = 0.375rem = 6px

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemWidth = item.offsetWidth;

        // If item hasn't loaded yet (width is 0), wait
        if (itemWidth === 0 && items[i].tagName === 'IMG') {
          const img = items[i] as HTMLImageElement;
          if (!img.complete) {
            // Image still loading, skip this check
            return;
          }
        }

        const nextTotal = totalWidth + (itemWidth || 40) + (count > 0 ? gapWidth : 0);

        if (nextTotal + reserveSpace <= maxWidth) {
          totalWidth = nextTotal;
          count++;
        } else {
          break;
        }
      }

      // Ensure at least one item is visible, but only update if we got a valid count
      if (count > 0) {
        const finalCount = count;
        // Only update state if the count actually changed
        if (finalCount !== prevCountRef.current) {
          prevCountRef.current = finalCount;
          setVisibleCount(finalCount);
        }
      }
    };

    // Use requestAnimationFrame for smooth updates with debouncing
    const scheduleCheck = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        checkOverflow();
      });
    };

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(scheduleCheck, 150);
    };

    // Initial check after a delay to ensure images are rendered
    const initialTimeout = setTimeout(scheduleCheck, 300);

    // Set up image load listeners to check overflow after images load
    const imageLoadHandlers: Array<() => void> = [];
    const processedImages = new WeakSet<HTMLImageElement>();

    const setupImageListeners = () => {
      if (!measureRef.current) return;

      const images = Array.from(measureRef.current.querySelectorAll('img')) as HTMLImageElement[];

      images.forEach((img) => {
        // Skip if we've already processed this image
        if (processedImages.has(img)) return;
        processedImages.add(img);

        const handleLoad = () => {
          scheduleCheck();
        };
        if (img.complete) {
          // Image already loaded, schedule check immediately
          scheduleCheck();
        } else {
          // Image not yet loaded, add listener
          img.addEventListener('load', handleLoad, { once: true });
          img.addEventListener('error', handleLoad, { once: true }); // Also check on error
          imageLoadHandlers.push(() => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleLoad);
          });
        }
      });
    };

    // Set up image listeners - try immediately and also after a delay to ensure DOM is ready
    requestAnimationFrame(() => {
      setupImageListeners();
    });
    const imageListenerTimeout = setTimeout(setupImageListeners, 50);

    window.addEventListener('resize', handleResize, { passive: true });

    // Use ResizeObserver for more accurate detection (with debouncing)
    let resizeObserver: ResizeObserver | null = null;
    let resizeObserverTimeout: NodeJS.Timeout | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // Debounce ResizeObserver callbacks to prevent excessive checks
        if (resizeObserverTimeout) clearTimeout(resizeObserverTimeout);
        resizeObserverTimeout = setTimeout(scheduleCheck, 100);
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(imageListenerTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (resizeObserverTimeout) clearTimeout(resizeObserverTimeout);
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (resizeObserver && containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      // Clean up image load listeners
      imageLoadHandlers.forEach((cleanup) => cleanup());
    };
  }, [acceptedCardTypes.length]);

  const visibleCards = acceptedCardTypes.slice(0, visibleCount);
  const hiddenCards = acceptedCardTypes.slice(visibleCount);
  const showOverflowIndicator = hiddenCards.length > 0;

  return (
    <div className="relative ml-3 flex flex-grow justify-end">
      {/* Hidden measurement container - always rendered for accurate measurements */}
      <div
        ref={measureRef}
        className="pointer-events-none invisible absolute -left-[9999px] flex items-center gap-1.5"
        aria-hidden="true"
      >
        {acceptedCardTypes.map((card) => (
          <img
            key={`measure-${card.id}`}
            src={card.imageUrl}
            alt={card.displayName}
            className="h-6 w-auto object-contain sm:h-8"
            width={40}
            height={24}
          />
        ))}
      </div>
      <div ref={containerRef} className="flex flex-grow items-center justify-end gap-1.5">
        {/* Render only visible items */}
        {visibleCards.map((card) => (
          <img
            key={card.id}
            src={card.imageUrl}
            alt={card.displayName}
            className="h-6 w-auto flex-shrink-0 object-contain sm:h-8"
            width={40}
            height={24}
            title={getCardTooltipText(card.displayName)}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              if (target.src !== PLACEHOLDER_IMAGE) {
                target.src = PLACEHOLDER_IMAGE;
              }
            }}
          />
        ))}
        {showOverflowIndicator && (
          <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
            <TooltipTrigger asChild>
              <span
                className="money flex-shrink-0 cursor-pointer rounded-[3px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-[3px] text-[11px] font-medium text-[var(--ink-500)] transition-colors hover:text-[var(--ink-900)]"
                onClick={() => {
                  setIsTooltipOpen((prev) => !prev);
                }}
              >
                +{hiddenCards.length}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="flex flex-wrap gap-2 p-3">
              {hiddenCards.map((card) => (
                <img
                  key={card.id}
                  src={card.imageUrl}
                  alt={card.displayName}
                  className="h-6 w-auto object-contain"
                  width={40}
                  height={24}
                  title={getCardTooltipText(card.displayName)}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== PLACEHOLDER_IMAGE) {
                      target.src = PLACEHOLDER_IMAGE;
                    }
                  }}
                />
              ))}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
});

CreditCardTypesBadges.displayName = 'CreditCardTypesBadges';
