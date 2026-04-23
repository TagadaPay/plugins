'use client';

import { StoreConfig, useStoreConfig } from '@tagadapay/plugin-sdk/v2';
import { createContext, useContext, useMemo } from 'react';

interface StoreConfigContextValue {
  storeConfig: StoreConfig | undefined;
  isLoading: boolean;
}

const StoreConfigContext = createContext<StoreConfigContextValue | undefined>(undefined);

interface StoreConfigProviderProps {
  children: React.ReactNode;
}

export function StoreConfigProvider({ children }: StoreConfigProviderProps) {
  const { storeConfig, isLoading } = useStoreConfig();

  const value = useMemo<StoreConfigContextValue>(
    () => ({
      storeConfig,
      isLoading,
    }),
    [storeConfig, isLoading],
  );

  return <StoreConfigContext.Provider value={value}>{children}</StoreConfigContext.Provider>;
}

export function useStoreConfigContext(): StoreConfigContextValue {
  const ctx = useContext(StoreConfigContext);
  if (!ctx) {
    throw new Error('useStoreConfigContext must be used within a StoreConfigProvider');
  }
  return ctx;
}
