import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { CartItem, CartHookReturn } from "../types/cart";
import type { Config } from "../types/config";

const CART_STORAGE_KEY = "tagada-skincare-cart";
const CART_TOKEN_KEY = "tagada-skincare-cart-token";

// Generate a stable UUID for cartToken
const generateCartToken = (): string => {
  return `cart_${uuidv4()}`;
};

// BOGO discount logic - Buy 2 get 1 free on same category
const calculateDiscount = (items: CartItem[], enableBogo: boolean = true): number => {
  // If BOGO is disabled, return 0 discount
  if (!enableBogo) {
    return 0;
  }
  const categoryGroups = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  let totalDiscount = 0;

  Object.values(categoryGroups).forEach((categoryItems) => {
    // Sort by price (highest first) to give discount on cheapest items
    const sortedItems = categoryItems.sort((a, b) => b.price - a.price);
    const totalQuantity = sortedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    let freeItems = Math.floor(totalQuantity / 3); // Every 3rd item is free

    // Apply discount to cheapest items first
    for (let i = sortedItems.length - 1; i >= 0 && freeItems > 0; i--) {
      const item = sortedItems[i];
      const freeFromThisItem = Math.min(freeItems, item.quantity);
      totalDiscount += freeFromThisItem * item.price;
      freeItems -= freeFromThisItem;
    }
  });

  return totalDiscount;
};

const calculateTotals = (items: CartItem[], enableBogo: boolean = true) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = calculateDiscount(items, enableBogo);
  const total = subtotal - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discount, total, itemCount };
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Handle storage errors gracefully
  }
};

const loadOrCreateCartToken = (): string => {
  try {
    const stored = localStorage.getItem(CART_TOKEN_KEY);
    if (stored) return stored;

    const newToken = generateCartToken();
    localStorage.setItem(CART_TOKEN_KEY, newToken);
    return newToken;
  } catch {
    return generateCartToken();
  }
};

const resetCartToken = (): string => {
  const newToken = generateCartToken();
  try {
    localStorage.setItem(CART_TOKEN_KEY, newToken);
  } catch {
    // Handle storage errors gracefully
  }
  return newToken;
};

export const useCart = (config?: Config | null): CartHookReturn => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartToken, setCartToken] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const storedItems = loadCartFromStorage();
    const token = loadOrCreateCartToken();
    setItems(storedItems);
    setCartToken(token);
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever items change (but only after initialization)
  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    saveCartToStorage(items);
  }, [items, isInitialized]);

  // Calculate totals with BOGO config consideration
  const enableBogo = config?.content?.enableBogo !== false; // Default true, explicitly false to disable
  const { subtotal, discount, total, itemCount } = calculateTotals(items, enableBogo);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((currentItems) => {
        const existingIndex = currentItems.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.variantId === newItem.variantId
        );

        if (existingIndex >= 0) {
          // Update existing item quantity
          return currentItems.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
              : item
          );
        } else {
          // Add new item
          return [
            ...currentItems,
            { ...newItem, quantity: newItem.quantity || 1 },
          ];
        }
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity }
            : item
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    // Reset cart token when cart is cleared (new cart lifecycle)
    const newToken = resetCartToken();
    setCartToken(newToken);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // Prepare line items for Tagada checkout
  const getLineItems = useCallback(() => {
    return items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      priceId: item.priceId,
      quantity: item.quantity,
    }));
  }, [items]);

  return {
    items,
    cartToken,
    itemCount,
    subtotal,
    discount,
    total,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    getLineItems,
  };
};
