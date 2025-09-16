import React, { createContext, useMemo, useEffect, type JSX } from 'react';
import { useProducts, useCurrency, type CheckoutLineItem } from "@tagadapay/plugin-sdk/react";
import { useCartStore, type CartState } from '@/storage/cart';
import { useTagataConfig } from '@/hooks/use-tagata-config';
// import { useSearchParams } from 'react-router';

// Cart context type
export interface CartContextType extends CartState {
  addProduct: (productId: string, variantId: string, costId: string, quantity?: number) => void;
  removeProduct: (productId: string, variantId: string, costId: string, quantity?: number) => void;
  updateProductQuantity: (productId: string, variantId: string, costId: string, quantity: number) => void;
  clearCart: () => void;
  resetCart: () => void;
  getCartLines: () => Array<CheckoutLineItem>;
  getCartToken: () => string;
  setCartToken: (token: string) => void;
  generateCartToken: () => string;
  filterVariants: ReturnType<typeof useProducts>['filterVariants'];
}

// Create context
// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext<CartContextType>({
  products: [],
  cart: {},
  subtotal: 0,
  isLoading: false,
  currencyCode: 'USD',
  cartToken: '',
  addProduct: () => {},
  removeProduct: () => {},
  updateProductQuantity: () => {},
  clearCart: () => {},
  resetCart: () => {},
  getCartLines: () => [],
  getCartToken: () => '',
  setCartToken: () => {},
  generateCartToken: () => '',
  filterVariants: () => [],
});

// Cart provider component
export function CartProvider({ children }: { children: JSX.Element | React.ReactNode }) {
  const { config } = useTagataConfig();
  const { products, isLoading, filterVariants } = useProducts({ productIds: config?.products?.productIds,  enabled: true });
  const currency = useCurrency();
  const cartStore = useCartStore();

  // Auto-update products, loading state, and currency in store when they change
  useEffect(() => {
    if (products) {
      cartStore.setProducts(products);
    }

    cartStore.setIsLoading(isLoading);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, isLoading]);

  // Update currency when it changes
  useEffect(() => {
    if (currency?.code) {
      cartStore.setCurrencyCode(currency.code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency?.code]);

  const value = useMemo<CartContextType>(() => ({
    products,
    cart: cartStore.cart,
    subtotal: cartStore.subtotal,
    currencyCode: cartStore.currencyCode,
    cartToken: cartStore.cartToken,
    addProduct: cartStore.addProduct,
    isLoading: cartStore.isLoading,
    removeProduct: cartStore.removeProduct,
    updateProductQuantity: cartStore.updateProductQuantity,
    clearCart: cartStore.clearCart,
    resetCart: cartStore.resetCart,
    getCartLines: cartStore.getCartLines,
    getCartToken: cartStore.getCartToken,
    setCartToken: cartStore.setCartToken,
    generateCartToken: cartStore.generateCartToken,
    filterVariants: filterVariants,
  }), [products, cartStore, filterVariants]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}