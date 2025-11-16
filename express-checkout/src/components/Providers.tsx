import {
  createRawPluginConfig,
  RawPluginConfig,
  TagadaProvider,
} from "@tagadapay/plugin-sdk/v2";
import { ReactNode, useEffect, useState } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [rawPluginConfig, setRawPluginConfig] = useState<
    RawPluginConfig | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    createRawPluginConfig()
      .then((config) => {
        if (!isMounted) return;
        setRawPluginConfig(config);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !rawPluginConfig) {
    return null;
  }

  return (
    <TagadaProvider
      environment={"development"}
      rawPluginConfig={rawPluginConfig}
    >
      {children}
    </TagadaProvider>
  );
}
