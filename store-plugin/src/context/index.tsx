import { TagadaProvider } from "@tagadapay/plugin-sdk/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import type { FC, PropsWithChildren } from "react";
import { HelmetProvider } from 'react-helmet-async'
import { ConfigProvider } from "./config";
import { CartProvider } from "./cart";

export const Contexts: FC<PropsWithChildren<object>> = ({ children }) => {
  return (
    <HelmetProvider>
      <NuqsAdapter>
        <TagadaProvider
          environment={import.meta.env.VITE_PUBLIC_TGD_PLUGIN_ENV_MODE || 'production'}
          localConfig={import.meta.env.VITE_PUBLIC_TGD_PLUGIN_CONFIG_NAME}
          blockUntilSessionReady
        >
          <ConfigProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </ConfigProvider>
        </TagadaProvider>
      </NuqsAdapter>
    </HelmetProvider>
  )
};