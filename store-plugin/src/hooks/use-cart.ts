import { CartContext, type CartContextType } from "@/context/cart/context";
import { useContext } from "react";

// Custom hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}