import * as React from 'react';
import { createContext, useMemo } from 'react';
import { ConfigSchema, type Config } from '../../configuration/schema';
import { usePluginConfig } from '@tagadapay/plugin-sdk/react';

// Types
export interface UseAppConfigResult {
  config: Config | null;
  isLoading: boolean;
}

// Configuration Context
// eslint-disable-next-line react-refresh/only-export-components
export const ConfigContext = createContext<UseAppConfigResult | null>(null);

// Context Provider
export interface ConfigProviderProps {
  children: React.ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const { config, loading } = usePluginConfig();

  const validatedConfig = useMemo(() => {
    if (loading) {
      return null;
    }

    return ConfigSchema.parse(config);
    
  }, [config, loading]);

  return (
    <ConfigContext.Provider value={{ config: validatedConfig, isLoading: loading }}>
      {children}
    </ConfigContext.Provider>
  );
}
