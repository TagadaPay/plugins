'use client';

import { useGeoLocation } from '@tagadapay/plugin-sdk/v2';
import { createContext, useContext, useMemo } from 'react';

interface GeoLocationData {
  country_code?: string | null;
  country_name?: string | null;
  city?: string | null;
  region?: string | null;
  postal?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface GeoLocationContextValue {
  data: GeoLocationData | null;
  isLoading: boolean;
  error: string | null;
  countryCode: string | null | undefined;
}

const GeoLocationContext = createContext<GeoLocationContextValue | undefined>(undefined);

interface GeoLocationProviderProps {
  children: React.ReactNode;
}

export function GeoLocationProvider({ children }: GeoLocationProviderProps) {
  const { data, isLoading, error } = useGeoLocation();

  const value = useMemo<GeoLocationContextValue>(
    () => ({
      data: data ?? null,
      isLoading: isLoading ?? false,
      error: error?.message ?? null,
      countryCode: data?.country_code,
    }),
    [data, isLoading, error],
  );

  return <GeoLocationContext.Provider value={value}>{children}</GeoLocationContext.Provider>;
}

export function useGeoLocationContext(): GeoLocationContextValue {
  const ctx = useContext(GeoLocationContext);
  if (!ctx) {
    throw new Error('useGeoLocationContext must be used within a GeoLocationProvider');
  }
  return ctx;
}
