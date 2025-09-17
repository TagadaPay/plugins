import { usePluginConfig } from '@tagadapay/plugin-sdk/react';
import { useTagataConfig } from './use-tagada-context';

/**
 * Hook to access store data from the configuration
 * This replaces the need for a separate app.config.ts file
 */
export const useStoreData = () => {
  const { storeId, accountId } = usePluginConfig();
  const { config } = useTagataConfig();
  
  if (!config) {
    throw new Error('useStoreData must be used within a ConfigProvider');
  }
  
  return {
    storeId,
    accountId,
    productId: config.storeData.productId,
    variantId: config.storeData.variantId,
    priceId: config.storeData.priceId,
    promotions: config.storeData.promotions || [],
  };
};
