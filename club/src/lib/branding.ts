import { usePluginConfig } from '@tagadapay/plugin-sdk/react'

/**
 * Hook to get branding colors from plugin config
 */
export function useBrandingColors() {
  const { config } = usePluginConfig()
  
  const primaryColor = config?.branding?.primaryColor || '#3b82f6'
  
  // Generate lighter and darker variants
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 } // fallback to blue
  }
  
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }
  
  const adjustBrightness = (hex: string, percent: number) => {
    const { r, g, b } = hexToRgb(hex)
    const adjust = (color: number) => {
      const adjusted = Math.round(color + (255 - color) * (percent / 100))
      return Math.min(255, Math.max(0, adjusted))
    }
    return rgbToHex(adjust(r), adjust(g), adjust(b))
  }
  
  const adjustDarkness = (hex: string, percent: number) => {
    const { r, g, b } = hexToRgb(hex)
    const adjust = (color: number) => {
      const adjusted = Math.round(color * (1 - percent / 100))
      return Math.min(255, Math.max(0, adjusted))
    }
    return rgbToHex(adjust(r), adjust(g), adjust(b))
  }
  
  return {
    primary: primaryColor,
    primary50: adjustBrightness(primaryColor, 90),   // Very light
    primary100: adjustBrightness(primaryColor, 80),  // Light
    primary200: adjustBrightness(primaryColor, 60),  // Medium light
    primary400: adjustBrightness(primaryColor, 20),  // Medium
    primary700: adjustDarkness(primaryColor, 20),    // Medium dark
    primary800: adjustDarkness(primaryColor, 40),    // Dark
  }
}

/**
 * Get CSS custom properties for branding colors
 */
export function getBrandingCSSVars() {
  const colors = useBrandingColors()
  
  return {
    '--brand-primary': colors.primary,
    '--brand-primary-50': colors.primary50,
    '--brand-primary-100': colors.primary100,
    '--brand-primary-200': colors.primary200,
    '--brand-primary-400': colors.primary400,
    '--brand-primary-700': colors.primary700,
    '--brand-primary-800': colors.primary800,
  }
}
