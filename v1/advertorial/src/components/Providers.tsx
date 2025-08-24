import { pluginConfig } from "@/data/config";
import { TagadaProvider } from "@tagadapay/plugin-sdk";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { storeId, accountId } = pluginConfig;
  console.log("🔧 Providers - storeId:", storeId, "accountId:", accountId);

  return (
    <TagadaProvider
      environment="production"
      debugMode={true}
      storeId={storeId}
      accountId={accountId}
    >
      {children}
    </TagadaProvider>
  );
}
