import { useEffect, useRef, useState } from 'react';

const THREEDS_BACKDROP_SELECTOR = '#threedscontainer-backdrop';

interface UseIsThreedsActiveResult {
  isThreedsActive: boolean;
  wasThreedsTriggered: boolean;
}

/**
 * Detects the SDK's 3DS challenge modal by observing DOM mutations on document.body.
 * Returns whether the 3DS modal is currently visible, and whether it was triggered
 * during the current payment cycle (stays true until isPaymentLoading resets).
 */
export function useIsThreedsActive(isPaymentLoading: boolean): UseIsThreedsActiveResult {
  const [isThreedsActive, setIsThreedsActive] = useState(false);
  const wasThreedsTriggeredRef = useRef(false);

  // Reset wasThreedsTriggered when payment loading ends
  useEffect(() => {
    if (!isPaymentLoading) {
      wasThreedsTriggeredRef.current = false;
    }
  }, [isPaymentLoading]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkForThreeds = () => {
      const exists = !!document.querySelector(THREEDS_BACKDROP_SELECTOR);
      setIsThreedsActive(exists);
      if (exists) {
        wasThreedsTriggeredRef.current = true;
      }
    };

    // Check initial state
    checkForThreeds();

    const observer = new MutationObserver(() => {
      checkForThreeds();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return {
    isThreedsActive,
    wasThreedsTriggered: wasThreedsTriggeredRef.current,
  };
}
