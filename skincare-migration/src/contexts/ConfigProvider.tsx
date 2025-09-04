import { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { usePluginConfig } from '@tagadapay/plugin-sdk/react'
import { useConfig } from '../hooks/useConfig'
import type { Config } from '../types/config'
import { getLocalizedContent, getSectionContent, validateConfig } from '../types/config'

interface ConfigContextValue {
  config: Config | null
  loading: boolean
  error: string | null
  configName: string | null
  loadConfig: (configName: string) => Promise<void>
  reloadConfig: () => Promise<void>
  resetToDefault: () => void
  // Helper functions for localized content
  getTagline: (locale?: string) => string
  getSectionText: (sectionKey: string, locale?: string) => string
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

interface ConfigProviderProps {
  children: ReactNode
  defaultConfig?: string
  locale?: string
}

/**
 * ConfigProvider supports both development and production environments:
 * 
 * - **Development**: Uses local config files from /config/*.tgd.json via useConfig hook
 * - **Production**: Uses Tagada SDK config injection via usePluginConfig hook
 * 
 * The provider automatically detects which environment it's running in and
 * uses the appropriate config source. This ensures seamless operation both
 * during local development and when deployed via Tagada CLI.
 */

export function ConfigProvider({ 
  children, 
  defaultConfig = 'skincare-demo',
  locale = 'en' 
}: ConfigProviderProps) {
  // Get SDK config (available when deployed via Tagada CLI)
  const { config: sdkConfig, loading: sdkLoading } = usePluginConfig()
  
  // Get local config (for development)
  const localConfigState = useConfig(defaultConfig)
  
  // Determine which config source to use
  // If we have SDK config, we're deployed and should use that
  // Otherwise, use local config for development
  const configState = sdkConfig ? {
    config: validateConfig(sdkConfig) as Config,
    loading: sdkLoading,
    error: null,
    configName: (sdkConfig as any)?.configName || 'deployed',
    loadConfig: async () => {},
    reloadConfig: async () => {},
    resetToDefault: () => {}
  } : localConfigState
  
  // Log which config source is being used for debugging
  useEffect(() => {
    if (sdkConfig) {
    } else {
    }
  }, [sdkConfig, configState.config])
  
  // Apply branding colors to CSS custom properties when config loads
  useEffect(() => {
    if (configState.config?.branding) {
      const { branding } = configState.config
      const root = document.documentElement
      
      // Helper function to lighten/darken hex colors
      const adjustBrightness = (hex: string, percent: number): string => {
        const num = parseInt(hex.replace('#', ''), 16)
        const amt = Math.round(2.55 * percent)
        const R = (num >> 16) + amt
        const G = (num >> 8 & 0x00FF) + amt
        const B = (num & 0x0000FF) + amt
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
          (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
          (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
      }
      
      // Apply primary color and variants
      root.style.setProperty('--color-primary', branding.primaryColor)
      root.style.setProperty('--color-primary-light', adjustBrightness(branding.primaryColor, 20))
      root.style.setProperty('--color-primary-dark', adjustBrightness(branding.primaryColor, -20))
      
      // Apply secondary color and variants if provided
      if (branding.secondaryColor) {
        root.style.setProperty('--color-secondary', branding.secondaryColor)
        root.style.setProperty('--color-secondary-light', adjustBrightness(branding.secondaryColor, 20))
        root.style.setProperty('--color-secondary-dark', adjustBrightness(branding.secondaryColor, -20))
      }
    }
  }, [configState.config?.branding])

  // Apply SEO configuration when config loads
  useEffect(() => {
    if (configState.config?.seo) {
      const { seo } = configState.config
      
      // Update document title with localized content
      const title = getLocalizedContent(seo.title, locale)
      if (title) {
        document.title = title
      }
      
      // Update meta description with localized content
      const description = getLocalizedContent(seo.description, locale)
      if (description) {
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
          metaDescription.setAttribute('content', description)
        } else {
          const meta = document.createElement('meta')
          meta.name = 'description'
          meta.content = description
          document.head.appendChild(meta)
        }
      }
      
      // Update Open Graph image
      if (seo.socialImageUrl) {
        const ogImage = document.querySelector('meta[property="og:image"]')
        if (ogImage) {
          ogImage.setAttribute('content', seo.socialImageUrl)
        } else {
          const meta = document.createElement('meta')
          meta.setAttribute('property', 'og:image')
          meta.content = seo.socialImageUrl
          document.head.appendChild(meta)
        }
      }
    }
  }, [configState.config?.seo, locale])

  // Helper functions for localized content
  const getTagline = (currentLocale?: string) => {
    if (!configState.config?.content?.tagline) return ''
    return getLocalizedContent(configState.config.content.tagline, currentLocale || locale)
  }

  const getSectionText = (sectionKey: string, currentLocale?: string) => {
    if (!configState.config?.content?.sections) return ''
    return getSectionContent(configState.config.content.sections, sectionKey, currentLocale || locale)
  }

  const contextValue: ConfigContextValue = {
    ...configState,
    getTagline,
    getSectionText
  }
  
  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfigContext(): ConfigContextValue {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider')
  }
  return context
}

// Convenience hooks for specific config sections
export function useBrandingContext() {
  const { config } = useConfigContext()
  return config?.branding
}

export function useProductIdsContext() {
  const { config } = useConfigContext()
  return config?.productIds
}

export function useContentContext() {
  const { config } = useConfigContext()
  return config?.content
}

export function useAssetsContext() {
  const { config } = useConfigContext()
  return config?.assets
}

export function useSeoContext() {
  const { config } = useConfigContext()
  return config?.seo
}

// Localization helpers
export function useLocalizedContent() {
  const { getTagline, getSectionText } = useConfigContext()
  return { getTagline, getSectionText }
}