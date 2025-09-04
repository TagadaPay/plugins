import { useCheckout as useTagadaCheckout } from "@tagadapay/plugin-sdk/react";
import { useCartContext } from "../contexts/CartProvider";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";

export function useCheckout() {
  const { items, cartToken } = useCartContext();
  const { storeId } = usePluginConfig();

  // Get the raw SDK checkout hook
  const { init, isLoading, error } = useTagadaCheckout();

  const initializeCheckout = async () => {
    if (!items.length) {
      throw new Error("Cart is empty");
    }

    // SPECIFICATION: "Build lineItems from the cart (variantId, priceId, quantity)"
    const lineItems = items.map((item) => ({
      variantId: item.variantId,
      priceId: item.priceId,
      quantity: item.quantity,
    }));

    try {
      const result = await init({
        lineItems,
        cartToken,
        ...(storeId && { storeId }),
      });

      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return result;
      } else {
        throw new Error("No checkout URL received from Tagada");
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    initializeCheckout,
    isLoading,
    error,
  };
}

// Legacy export for backward compatibility with existing code
export const useCheckout_Legacy = (options?: { checkoutToken?: string }) => {
  return useTagadaCheckout(options);
};

// Helper functions for existing code
export const cartToLineItems = (
  cartItems: Array<{
    productId: string;
    variantId: string;
    priceId: string;
    quantity: number;
  }>
): Array<{
  variantId: string;
  priceId?: string;
  quantity: number;
}> => {
  return cartItems.map((item) => ({
    variantId: item.variantId,
    priceId: item.priceId,
    quantity: item.quantity,
  }));
};

export const initializeCheckout = async (
  init: any,
  cartItems: Array<{
    productId: string;
    variantId: string;
    priceId: string;
    quantity: number;
  }>,
  options?: {
    storeId?: string;
    cartToken?: string;
  }
) => {
  const lineItems = cartToLineItems(cartItems);

  return init({
    lineItems,
    ...(options?.storeId && { storeId: options.storeId }),
    ...(options?.cartToken && { cartToken: options.cartToken }),
  });
};