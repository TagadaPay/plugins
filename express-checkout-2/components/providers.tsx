import { TooltipProvider } from "@/components/ui/tooltip";
import {
  RawPluginConfig,
  TagadaProvider,
  createRawPluginConfig,
} from "@tagadapay/plugin-sdk/v2";
import { PropsWithChildren, useEffect, useState } from "react";

function Providers({ children }: PropsWithChildren) {
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
    <TooltipProvider>
      <TagadaProvider
        environment={"development"}
        rawPluginConfig={rawPluginConfig}
      >
        {children}
      </TagadaProvider>
    </TooltipProvider>
  );
}

export default Providers;
