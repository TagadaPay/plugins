'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { TagadaProvider } from '@tagadapay/plugin-sdk/react';
import { ReactNode } from 'react';

type ProvidersProps = {
  children: ReactNode;
};

function Providers({ children }: ProvidersProps) {
  return (
    <TooltipProvider>
      <TagadaProvider environment="production" localConfig="default">
        {children}
      </TagadaProvider>
    </TooltipProvider>
  );
}

export default Providers;
