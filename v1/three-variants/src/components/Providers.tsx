import { TagadaProvider } from '@tagadapay/plugin-sdk';

interface ProvidersProps {
  children: React.ReactNode;
  storeId: string;
  accountId: string;
}

export function Providers({ children, storeId, accountId }: ProvidersProps) {
  console.log('🔧 Providers - storeId:', storeId, 'accountId:', accountId);

  return (
    <TagadaProvider storeId={storeId} accountId={accountId} environment="production" debugMode={true}>
      {children}
    </TagadaProvider>
  );
}
