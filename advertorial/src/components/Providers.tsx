import { TagadaProvider } from "@tagadapay/plugin-sdk/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TagadaProvider environment="production" localConfig="default">
      {children}
    </TagadaProvider>
  );
}
