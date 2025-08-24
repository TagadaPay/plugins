import { BrowserRouter } from 'react-router-dom';
import { TagadaProvider } from '@tagadapay/plugin-sdk/react';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <TagadaProvider localConfig="default" environment="production">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        {children}
      </TagadaProvider>
    </BrowserRouter>
  );
} 