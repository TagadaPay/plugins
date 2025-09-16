

import type { Cart, CartItem, Product, ProductVariant } from '@/lib/shopify/types';

const CART_STORAGE_KEY = 'local-cart';

// Local storage utilities for cart persistence
class CartStorage {
  static get(): Cart | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading cart from storage:', error);
      return null;
    }
  }

  static set(cart: Cart): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}

// Create empty cart
function createEmptyCart(): Cart {
  return {
    id: `local-cart-${Date.now()}`,
    checkoutUrl: '',
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' },
    },
    totalQuantity: 0,
    lines: [],
  };
}

// Calculate cart totals
function calculateCartTotals(lines: CartItem[]): Pick<Cart, 'totalQuantity' | 'cost'> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce((sum, item) => sum + Number(item.cost.totalAmount.amount), 0);
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode || 'USD';

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: '0', currencyCode },
    },
  };
}

// Create cart item from variant and product
function createCartItem(variant: ProductVariant, product: Product, quantity: number): CartItem {
  const totalAmount = (Number(variant.price.amount) * quantity).toString();
  
  return {
    id: `line-${variant.id}-${Date.now()}`,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product,
    },
  };
}

// Get current cart
export async function getCart(): Promise<Cart | null> {
  return CartStorage.get();
}

// Add item to cart
export async function addItem(variant: ProductVariant, product: Product): Promise<Cart | null> {
  try {
    let cart = CartStorage.get() || createEmptyCart();
    
    // Check if item already exists
    const existingItemIndex = cart.lines.findIndex(
      item => item.merchandise.id === variant.id
    );
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const existingItem = cart.lines[existingItemIndex];
      const newQuantity = existingItem.quantity + 1;
      const newTotalAmount = (Number(variant.price.amount) * newQuantity).toString();
      
      cart.lines[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        cost: {
          totalAmount: {
            amount: newTotalAmount,
            currencyCode: variant.price.currencyCode,
          },
        },
      };
    } else {
      // Add new item
      const newItem = createCartItem(variant, product, 1);
      cart.lines.unshift(newItem);
    }
    
    // Recalculate totals
    const totals = calculateCartTotals(cart.lines);
    cart = { ...cart, ...totals };
    
    CartStorage.set(cart);
    return cart;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return null;
  }
}

// Update item quantity
export async function updateItem({ lineId, quantity }: { lineId: string; quantity: number }): Promise<Cart | null> {
  try {
    let cart = CartStorage.get();
    if (!cart) return null;
    
    if (quantity <= 0) {
      // Remove item
      cart.lines = cart.lines.filter(item => item.id !== lineId);
    } else {
      // Update quantity
      const itemIndex = cart.lines.findIndex(item => item.id === lineId);
      if (itemIndex >= 0) {
        const item = cart.lines[itemIndex];
        const pricePerUnit = Number(item.cost.totalAmount.amount) / item.quantity;
        const newTotalAmount = (pricePerUnit * quantity).toString();
        
        cart.lines[itemIndex] = {
          ...item,
          quantity,
          cost: {
            totalAmount: {
              amount: newTotalAmount,
              currencyCode: item.cost.totalAmount.currencyCode,
            },
          },
        };
      }
    }
    
    // Recalculate totals
    if (cart.lines.length === 0) {
      cart = createEmptyCart();
    } else {
      const totals = calculateCartTotals(cart.lines);
      cart = { ...cart, ...totals };
    }
    
    CartStorage.set(cart);
    return cart;
  } catch (error) {
    console.error('Error updating item:', error);
    return null;
  }
}

// Clear entire cart
export async function clearCart(): Promise<Cart> {
  const emptyCart = createEmptyCart();
  CartStorage.set(emptyCart);
  return emptyCart;
}
