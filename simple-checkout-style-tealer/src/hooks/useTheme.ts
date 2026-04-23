import { usePluginConfig } from '@tagadapay/plugin-sdk/v2';
import { useEffect } from 'react';

// Font family mapping
const FONT_FAMILIES = {
  inter: 'var(--font-inter)',
  poppins: 'var(--font-poppins)',
  roboto: 'var(--font-roboto)',
  'open-sans': 'var(--font-open-sans)',
  montserrat: 'var(--font-montserrat)',
} as const;

export type FontFamily = keyof typeof FONT_FAMILIES;

export function useTheme() {
  const { config, loading } = usePluginConfig();

  // Default fallback values
  const primaryColor = config?.branding?.primaryColor || "#16A34A";
  const textColorOnPrimary = config?.branding?.textColorOnPrimary || '#FFFFFF';
  const fontFamily = config?.branding?.fontFamily || 'inter';
  const headerBackgroundColor = config?.header?.backgroundColor || '#FFFFFF';

  useEffect(() => {
    // Apply the primary color as CSS custom property
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--text-color-on-primary', textColorOnPrimary);
    document.documentElement.style.setProperty('--header-background-color', headerBackgroundColor);
    const fontFamilyValue = FONT_FAMILIES[fontFamily as FontFamily] || FONT_FAMILIES.inter;

    document.documentElement.style.setProperty('--font-brand', fontFamilyValue);
  }, [primaryColor, fontFamily]);

  return {
    primaryColor,
    textColorOnPrimary,
    fontFamily,
    loading,
  };
}
