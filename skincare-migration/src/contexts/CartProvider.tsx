import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useCart } from '../hooks/useCart'
import { useConfigContext } from './ConfigProvider'
import type { CartHookReturn } from '../types/cart'

const CartContext = createContext<CartHookReturn | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { config } = useConfigContext()
  const cart = useCart(config)
  
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext(): CartHookReturn {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}