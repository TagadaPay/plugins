import { useCartContext } from '@/src/context/cart-context';
import { useCheckout } from '@tagadapay/plugin-sdk/react';
import { useCallback } from 'react';

interface UseCartCheckoutParams {
  [key: string]: any;
}

export const useCartCheckout = (params: UseCartCheckoutParams = {}) => {
  const { cartToken, generateCartToken } = useCartContext();
  const checkout = useCheckout(params);

  // Enhanced init function that automatically handles cartToken
  const initWithCartToken = useCallback(
    async (initParams: any) => {
      // Ensure we have a cart token
      let currentCartToken = cartToken;
      if (!currentCartToken) {
        currentCartToken = generateCartToken();
      }

      // Add cartToken to init parameters
      const enhancedParams = {
        ...initParams,
        cartToken: currentCartToken,
      };

      return await checkout.init(enhancedParams);
    },
    [cartToken, generateCartToken, checkout.init]
  );

  return {
    ...checkout,
    init: initWithCartToken,
    cartToken,
  };
};
