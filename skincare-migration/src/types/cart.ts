// Product and variant interfaces
export interface ProductVariant {
  id: string
  name: string
  description?: string
  sku?: string
  prices: ProductPrice[]
  inventory?: {
    quantity: number
    available: boolean
  }
  attributes?: Record<string, string> // size, color, etc.
}

export interface ProductPrice {
  id: string
  amount: number
  currency: string
  originalAmount?: number
  type: 'one-time' | 'recurring'
  interval?: 'monthly' | 'yearly'
}

// Tagada-compatible cart item structure
export interface CartItem {
  productId: string
  variantId: string
  priceId: string
  quantity: number
  // Additional display properties (not sent to Tagada)
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
}

export interface CartState {
  items: CartItem[]
  cartToken: string // Stable UUID for cart lifecycle
  itemCount: number
  subtotal: number
  discount: number
  total: number
  isOpen: boolean
}

export interface CartHookReturn extends CartState {
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string, variantId: string) => void
  updateQuantity: (productId: string, variantId: string, quantity: number) => void
  clearCart: () => void
  
  // Cart drawer
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  
  // Tagada checkout preparation
  getLineItems: () => LineItem[]
}

// Line item structure for Tagada checkout
export interface LineItem {
  productId: string
  variantId: string
  priceId: string
  quantity: number
}