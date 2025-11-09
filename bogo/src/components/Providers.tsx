import {
  createRawPluginConfig,
  RawPluginConfig,
  TagadaProvider,
} from "@tagadapay/plugin-sdk/v2";
import { useEffect, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [rawPluginConfig, setRawPluginConfig] = useState<
    RawPluginConfig | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    createRawPluginConfig().then((config) => {
      setRawPluginConfig(config);
      console.log("rawPluginConfig", config);
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
