import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartContext } from './cart-context';

interface CheckoutSuccessContextType {
  // This context doesn't need to expose any methods as it works automatically
}

const CheckoutSuccessContext = createContext<CheckoutSuccessContextType | undefined>(undefined);

interface CheckoutSuccessProviderProps {
  children: ReactNode;
}

export const CheckoutSuccessProvider: React.FC<CheckoutSuccessProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCartToken } = useCartContext();

  useEffect(() => {
    // Check if the URL contains tgd_success=1 parameter
    const urlParams = new URLSearchParams(location.search);
    const successParam = urlParams.get('tgd_success');

    if (successParam === '1') {
      // Clear the cart token from localStorage
      clearCartToken();

      // Remove the tgd_success parameter from the URL
      urlParams.delete('tgd_success');
      
      // Create new URL without the parameter
      const newSearch = urlParams.toString();
      const newUrl = newSearch 
        ? `${location.pathname}?${newSearch}`
        : location.pathname;

      // Navigate to the clean URL without the parameter
      navigate(newUrl, { replace: true });
    }
  }, [location.search, location.pathname, navigate, clearCartToken]);

  const value: CheckoutSuccessContextType = {};

  return (
    <CheckoutSuccessContext.Provider value={value}>
      {children}
    </CheckoutSuccessContext.Provider>
  );
};

export const useCheckoutSuccess = (): CheckoutSuccessContextType => {
  const context = useContext(CheckoutSuccessContext);
  if (context === undefined) {
    throw new Error('useCheckoutSuccess must be used within a CheckoutSuccessProvider');
  }
  return context;
};
