"use client";

import { TagadaProvider } from "@tagadapay/plugin-sdk/react";
import { PropsWithChildren } from "react";

type ProvidersProps = PropsWithChildren<{}>;

function Providers({ children }: ProvidersProps) {
  return (
    <TagadaProvider
      localConfig="supplements"
      environment="production"
      blockUntilSessionReady
    >
      {children}
    </TagadaProvider>
  );
}

export default Providers;
