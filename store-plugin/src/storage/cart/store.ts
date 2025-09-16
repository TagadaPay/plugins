import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useProducts } from "@tagadapay/plugin-sdk/react";
import type { CheckoutLineItem } from "@tagadapay/plugin-sdk/react";
import type { Product } from './types';
import { v4 } from "uuid";

// Cart state interface - now stores: cart[productId][variantId][costId] = quantity
export interface CartState {
  cart: Record<string, Record<string, Record<string, number>>>;
  subtotal: number;
  products: Array<Product>;
  isLoading: boolean;
  currencyCode: string;
  cartToken: string;
}

// Cart item interface for helper methods
export interface CartItem {
  productId: string;
  variantId: string;
  costId: string;
  quantity: number;
}

// Cart actions interface
export interface CartActions {
  addProduct: (productId: string, variantId: string, costId: string, quantity?: number) => void;
  removeProduct: (productId: string, variantId: string, costId: string, quantity?: number) => void;
  updateProductQuantity: (productId: string, variantId: string, costId: string, quantity: number) => void;
  clearCart: () => void;
  resetCart: () => void;
  getCartItems: () => CartItem[];
  getTotalItems: () => number;
  getCartLines: () => CheckoutLineItem[];
  getCartLinesCount: () => number;
  setProducts: (products: ReturnType<typeof useProducts>['products']) => void;
  setIsLoading: (isLoading: boolean) => void;
  setCurrencyCode: (currencyCode: string) => void;
  setCartToken: (token: string) => void;
  getCartToken: () => string;
  generateCartToken: () => string;
  _calculateSubtotal: () => void;
}

// Combined cart store interface
export type CartStore = CartState & CartActions;

// Create the cart store with persistence
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: {},
      subtotal: 0,
      products: [],
      isLoading: false,
      currencyCode: 'USD', // Default currency
      cartToken: v4(),
      checkoutToken: '',

      // Actions
      addProduct: (productId: string, variantId: string, costId: string, quantity: number = 1) => {

        set((state) => {
          const newCart = { ...state.cart };
          
          // Initialize product object if it doesn't exist
          if (!newCart[productId]) {
            newCart[productId] = {};
          }
          
          // Initialize variant object if it doesn't exist
          if (!newCart[productId][variantId]) {
            newCart[productId][variantId] = {};
          }
          
          // Add or update the cost quantity
          if (newCart[productId][variantId][costId]) {
            // Update existing quantity
            newCart[productId][variantId][costId] += quantity;
          } else {
            // Add new cost with quantity
            newCart[productId][variantId][costId] = quantity;
          }
          
          return { cart: newCart };
        });
        
        // Auto-calculate subtotal
        get()._calculateSubtotal();
      },

      removeProduct: (productId: string, variantId: string, costId: string, quantity?: number) => {
        set((state) => {
          const newCart = { ...state.cart };
          
          if (newCart[productId] && newCart[productId][variantId] && newCart[productId][variantId][costId]) {
            if (quantity && quantity > 0) {
              // Reduce quantity by specified amount
              const currentQuantity = newCart[productId][variantId][costId];
              const newQuantity = currentQuantity - quantity;
              
              if (newQuantity <= 0) {
                // Remove cost if quantity becomes 0 or less
                delete newCart[productId][variantId][costId];
              } else {
                // Update with new quantity
                newCart[productId][variantId][costId] = newQuantity;
              }
            } else {
              // Remove cost completely if no quantity specified
              delete newCart[productId][variantId][costId];
            }
            
            // Remove variant object if no costs left
            if (Object.keys(newCart[productId][variantId]).length === 0) {
              delete newCart[productId][variantId];
            }
            
            // Remove product object if no variants left
            if (Object.keys(newCart[productId]).length === 0) {
              delete newCart[productId];
            }
          }
          
          return { cart: newCart };
        });
        
        // Auto-calculate subtotal
        get()._calculateSubtotal();
      },

      updateProductQuantity: (productId: string, variantId: string, costId: string, quantity: number) => {
        if (quantity <= 0) {
          // Remove the entire variant when quantity becomes 0
          set((state) => {
            const newCart = { ...state.cart };
            
            if (newCart[productId] && newCart[productId][variantId]) {
              // Remove the entire variant (all costs)
              delete newCart[productId][variantId];
              
              // Remove product object if no variants left
              if (Object.keys(newCart[productId]).length === 0) {
                delete newCart[productId];
              }
            }
            
            return { cart: newCart };
          });
          
          // Auto-calculate subtotal
          get()._calculateSubtotal();
          return;
        }
        
        set((state) => {
          const newCart = { ...state.cart };
          
          if (newCart[productId] && newCart[productId][variantId] && newCart[productId][variantId][costId]) {
            newCart[productId][variantId][costId] = quantity;
          }
          
          return { cart: newCart };
        });
        
        // Auto-calculate subtotal
        get()._calculateSubtotal();
      },

      clearCart: () => {
        set({ cart: {}, subtotal: 0 });
      },

      resetCart: () => {
        set({ 
          cart: {}, 
          subtotal: 0, 
          products: [],
          isLoading: false,
          currencyCode: 'USD',
          cartToken: v4(),
        });
      },

      getCartItems: () => {
        const { cart } = get();
        const items: CartItem[] = [];
        
        Object.entries(cart).forEach(([productId, productVariants]) => {
          Object.entries(productVariants).forEach(([variantId, variantCosts]) => {
            Object.entries(variantCosts).forEach(([costId, quantity]) => {
              items.push({
                productId,
                variantId,
                costId,
                quantity,
              });
            });
          });
        });
        
        return items;
      },

      getTotalItems: () => {
        const items = get().getCartItems();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getCartLines: () => {
        const { cart } = get();
        const lines: CheckoutLineItem[] = [];
        
        // Convert cart structure to CheckoutLineItem format
        Object.entries(cart).forEach(([, productVariants]) => {
          Object.entries(productVariants).forEach(([variantId, variantCosts]) => {
            Object.entries(variantCosts).forEach(([costId, quantity]) => {
              if (quantity > 0) {
                lines.push({
                  variantId: variantId,
                  priceId: costId,
                  quantity: quantity,
                });
              }
            });
          });
        });
        
        return lines;
      },

      getCartLinesCount: () => {
        const { cart } = get();
        let count = 0;
        
        // Count unique product-variant combinations (lines)
        Object.entries(cart).forEach(([, productVariants]) => {
          Object.entries(productVariants).forEach(([, variantCosts]) => {
            // Only count if there are any costs with quantity > 0
            const hasItems = Object.values(variantCosts).some(quantity => quantity > 0);
            if (hasItems) {
              count++;
            }
          });
        });
        
        return count;
      },

      setProducts: (products: ReturnType<typeof useProducts>['products']) => {
        set({ products });
        get()._calculateSubtotal();
      },

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setCurrencyCode: (currencyCode: string) => {
        set({ currencyCode });
        get()._calculateSubtotal();
      },

      setCartToken: (token: string) => {
        set({ cartToken: token });
      },

      getCartToken: () => {
        return get().cartToken;
      },

      generateCartToken: () => {
        // Generate a unique cart token (UUID-like)
        const token = v4();
        get().setCartToken(token);
        return token;
      },

      _calculateSubtotal: () => {
        const { cart, products, currencyCode } = get();
        let subtotal = 0;
        
        Object.entries(cart).forEach(([productId, productVariants]) => {
          Object.entries(productVariants).forEach(([variantId, variantCosts]) => {
            Object.entries(variantCosts).forEach(([, quantity]) => {
              const product = products.find(p => p.id === productId);
              if (product) {
                const variant = product.variants?.find((v) => v.id === variantId);
                if (!variant) return;

                // Use the new pricing approach with currencyOptions
                const price = variant.prices?.find((p) => p.currencyOptions?.[currencyCode])?.currencyOptions?.[currencyCode];
                if (price?.amount) {
                  subtotal += price.amount * quantity;
                }
              }
            });
          });
        });
        
        set({ subtotal });
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist cart, subtotal, currencyCode, and cartToken, not products, isLoading or functions
      partialize: (state) => ({
        cart: state.cart,
        subtotal: state.subtotal,
        currencyCode: state.currencyCode,
        cartToken: state.cartToken,
      }),
    }
  )
);
