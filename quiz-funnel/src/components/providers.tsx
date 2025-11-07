"use client";

import {
  RawPluginConfig,
  TagadaProvider,
  createRawPluginConfig,
} from "@tagadapay/plugin-sdk/v2";
import { PropsWithChildren, useEffect, useState } from "react";

type ProvidersProps = PropsWithChildren<{}>;

function Providers({ children }: ProvidersProps) {
  const [rawPluginConfig, setRawPluginConfig] = useState<
    RawPluginConfig | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    createRawPluginConfig().then((config) => {
      console.log("config", config);
      setRawPluginConfig(config);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return null;
  }
  return (
    <TagadaProvider environment="development" rawPluginConfig={rawPluginConfig}>
      {children}
    </TagadaProvider>
  );
}

export default Providers;
