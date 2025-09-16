import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useCart } from './use-cart';


export function useTransactionComplete() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const transactionComplete = searchParams.get('transaction-complete');
    
    if (transactionComplete === '1' || transactionComplete === 'true') {
      // Clear the cart from localStorage
      clearCart();
      
      // Remove the transaction-complete parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('transaction-complete');
      
      // Update URL without the parameter
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, clearCart]);
}
