'use client';

import { CartProvider } from '@/context/cart-context';
import { CheckoutSuccessProvider } from '@/context/checkout-success-context';
import ThemeSetter from '@/context/theme-setter';
import {
  RawPluginConfig,
  TagadaProvider,
  createRawPluginConfig,
} from '@tagadapay/plugin-sdk/v2';
import { PropsWithChildren, useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

type ProvidersProps = PropsWithChildren<{}>;

export default function Providers({ children }: ProvidersProps) {
  const [rawPluginConfig, setRawPluginConfig] = useState<
    RawPluginConfig | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    createRawPluginConfig().then(config => {
      setRawPluginConfig(config);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return null;
  }
  return (
    <HelmetProvider>
      <BrowserRouter>
        <CartProvider>
          <CheckoutSuccessProvider>
            <TagadaProvider
              environment={'development'}
              rawPluginConfig={rawPluginConfig}
            >
              <ThemeSetter>{children}</ThemeSetter>
            </TagadaProvider>
          </CheckoutSuccessProvider>
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
