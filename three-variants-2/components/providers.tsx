"use client";

import { pluginConfig } from "@/data/config";
import { TagadaProvider } from "@tagadapay/plugin-sdk";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { storeId, accountId } = pluginConfig;

  return (
    <TagadaProvider
      storeId={storeId}
      accountId={accountId}
      environment="production"
      debugMode={false}
    >
      {children}
    </TagadaProvider>
  );
}
