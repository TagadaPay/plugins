import { TagadaProvider } from "@tagadapay/plugin-sdk/v2";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <TagadaProvider>{children}</TagadaProvider>;
}
