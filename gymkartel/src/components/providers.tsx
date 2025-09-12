'use client';

import { TagadaProvider } from '@tagadapay/plugin-sdk/react';
import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react';
import { ProductPackageName } from './ProductCard';
import { ConfigProvider } from '../contexts/ConfigProvider';

type SelectionContextType = {
  selectedPackageColors: Record<ProductPackageName, string[]>;
  selectedPackageSizes: Record<ProductPackageName, string[]>;
  setPackageColor: (packageName: ProductPackageName, index: number, color: string) => void;
  setPackageSize: (packageName: ProductPackageName, index: number, size: string) => void;
  updateSelectedPackage: (packageName: ProductPackageName) => void;
  setActivePackage: (packageName: ProductPackageName) => void;
  activePackage: ProductPackageName;
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const Providers = ({ children }: PropsWithChildren<{}>) => {
  return (
    <TagadaProvider environment={'production'} debugMode={false} localConfig="default" blockUntilSessionReady={true}>
      <ConfigProvider defaultConfig="default">
        {children}
      </ConfigProvider>
    </TagadaProvider>
  );
};

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPackageColors, setSelectedPackageColors] = useState<Record<ProductPackageName, string[]>>({
    [ProductPackageName.ONE_PAIR]: [],
    [ProductPackageName.TWO_PAIRS]: [],
    [ProductPackageName.THREE_PAIRS]: [],
  });
  const [selectedPackageSizes, setSelectedPackageSizes] = useState<Record<ProductPackageName, string[]>>({
    [ProductPackageName.ONE_PAIR]: [],
    [ProductPackageName.TWO_PAIRS]: [],
    [ProductPackageName.THREE_PAIRS]: [],
  });
  const [activePackage, setActivePackageState] = useState<ProductPackageName>(ProductPackageName.TWO_PAIRS);

  const setPackageColor = useCallback((packageName: ProductPackageName, index: number, color: string) => {
    setSelectedPackageColors((prev) => {
      const newColors = [...prev[packageName]];
      newColors[index] = color;
      return { ...prev, [packageName]: newColors };
    });
  }, []);

  const setPackageSize = useCallback((packageName: ProductPackageName, index: number, size: string) => {
    setSelectedPackageSizes((prev) => {
      const newSizes = [...prev[packageName]];
      newSizes[index] = size;
      return { ...prev, [packageName]: newSizes };
    });
  }, []);

  const updateSelectedPackage = useCallback((packageName: ProductPackageName) => {
    // This function can be used by the sticky add to cart to notify about package changes
    // For now, we'll just ensure the arrays are properly initialized
    setSelectedPackageColors((prev) => {
      if (!prev[packageName]) {
        return { ...prev, [packageName]: [] };
      }
      return prev;
    });

    setSelectedPackageSizes((prev) => {
      if (!prev[packageName]) {
        return { ...prev, [packageName]: [] };
      }
      return prev;
    });
  }, []);

  const setActivePackage = useCallback((packageName: ProductPackageName) => {
    setActivePackageState(packageName);
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selectedPackageColors,
        selectedPackageSizes,
        setPackageColor,
        setPackageSize,
        updateSelectedPackage,
        setActivePackage,
        activePackage,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within a SelectionProvider');
  return ctx;
};
