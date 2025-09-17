import { AppConfig } from '@/src/configuration/schema';
import React, { createContext, useContext, ReactNode } from 'react';

export interface UseAppConfigResult {
  config: AppConfig | null;
  isLoading: boolean;
  error: Error | null;
}

const ConfigContext = createContext<UseAppConfigResult | null>(null);

export interface ConfigProviderProps {
  children: ReactNode;
  config: AppConfig;
}

export function ConfigProvider({ children, config }: ConfigProviderProps) {
  const value: UseAppConfigResult = {
    config,
    isLoading: false,
    error: null,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export { ConfigContext };
