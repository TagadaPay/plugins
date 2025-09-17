import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface CartContextType {
  cartToken: string | null;
  generateCartToken: () => string;
  setCartToken: (token: string) => void;
  clearCartToken: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const CART_TOKEN_KEY = 'cartToken';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartToken, setCartTokenState] = useState<string | null>(null);

  // Initialize cart token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(CART_TOKEN_KEY);
    if (storedToken) {
      setCartTokenState(storedToken);
    }
  }, []);

  const generateCartToken = (): string => {
    const token = uuidv4();
    setCartToken(token);
    return token;
  };

  const setCartToken = (token: string): void => {
    setCartTokenState(token);
    localStorage.setItem(CART_TOKEN_KEY, token);
  };

  const clearCartToken = (): void => {
    setCartTokenState(null);
    localStorage.removeItem(CART_TOKEN_KEY);
  };

  const value: CartContextType = {
    cartToken,
    generateCartToken,
    setCartToken,
    clearCartToken,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
