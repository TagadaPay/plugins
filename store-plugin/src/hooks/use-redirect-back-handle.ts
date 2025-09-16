import { useCartStore } from "@/storage";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

export const useRedirectBackHandle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cartStore = useCartStore();

  const paramsToHandle = {
    tgd_success: {
      predicate: (value: string | null) => value == '1',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      action: (_value: string) => {
        cartStore.clearCart();

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tgd_success');
        
        // Update URL without the parameter
        setSearchParams(newSearchParams, { replace: true });
      }
    },
  }

  useEffect(() => {
    searchParams.forEach((value, key) => {
      const handler = paramsToHandle[key as keyof typeof paramsToHandle];

      if (handler?.predicate(value)) {
        handler.action(value);
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};