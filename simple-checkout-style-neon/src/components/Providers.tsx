import { ThemeSetter } from '@/components/ThemeSetter';
import { TagadaProvider } from '@tagadapay/plugin-sdk/v2';
import React from 'react';
import { PaymentMethodsProvider } from '../contexts/PaymentMethods';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TagadaProvider>
      <PaymentMethodsProvider>
        <ThemeSetter />
        {children}
      </PaymentMethodsProvider>
    </TagadaProvider>
  );
}
