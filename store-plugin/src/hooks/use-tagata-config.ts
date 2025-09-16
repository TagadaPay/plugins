import { useContext, useMemo } from "react";
import { ConfigContext, type UseAppConfigResult } from "@/context/config/context";
import { useLocale, type Locale } from '@tagadapay/plugin-sdk/react';
import type { TextContent, Assets, ContactLink, NavItem, Theme } from "@/configuration/schema";

// Default language fallback
const DEFAULT_LANGUAGE = 'en';

export interface ContentHelpers {
  // Text content helpers (from config)
  getText: (key: keyof TextContent, language?: string) => string;
  getTextArray: (key: keyof TextContent, language?: string) => string[];
  
  // Tagata SDK message helpers (from SDK)
  getMessage: (key: string) => string;
  getMessages: () => Record<string, string>;
  
  // Unified text helper (tries config first, then SDK messages)
  getAnyText: (key: string, language?: string) => string;
  
  // Asset helpers
  getAsset: (key: keyof Assets) => string;
  getThumbnail: (key: string) => string;
  
  // Navigation helpers
  getNavigation: (section: 'header' | 'footer') => NavItem[];
  
  // Links helpers
  getContactLinks: () => ContactLink[];
  
  // SEO helpers
  getSEO: (path: string, language?: string) => { title?: string; description?: string; keywords?: string };
  
  // Language helpers
  getAvailableLanguages: () => string[];
  
  // Current language and locale info
  currentLanguage: string;
  locale: Locale; // Tagata SDK locale object
}

export interface ExtendedUseAppConfigResult extends UseAppConfigResult {
  content: ContentHelpers;
  theme?: Theme;
}

export function useTagataConfig(): ExtendedUseAppConfigResult {
  const context = useContext(ConfigContext);
  const locale = useLocale();
  
  const contentHelpers = useMemo((): ContentHelpers => {
    const config = context?.config;
    
    // Extract language from locale with multiple fallback strategies
    let currentLanguage = DEFAULT_LANGUAGE;
    
    if (locale?.language) {
      // Use locale.language directly if it's already a language code (e.g., 'en', 'fr')
      currentLanguage = locale.language.toLowerCase();
    } else if (locale?.locale) {
      // Extract language code from locale.locale if it's a full locale (e.g., 'en-US' -> 'en')
      currentLanguage = locale.locale.split('-')[0].toLowerCase();
    }
    
    // Check if the detected language exists in config, fallback to DEFAULT_LANGUAGE if not
    const availableLanguages = Object.keys(config?.content?.text || {});
    if (!availableLanguages.includes(currentLanguage)) {
      currentLanguage = availableLanguages.includes(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : availableLanguages[0] || DEFAULT_LANGUAGE;
    }
    
    const getText = (key: keyof TextContent, language = currentLanguage): string => {
      const textContent = config?.content?.text?.[language];
      const fallbackContent = config?.content?.text?.[DEFAULT_LANGUAGE];
      
      return (textContent?.[key] || fallbackContent?.[key] || '') as string;
    };

    const getTextArray = (key: keyof TextContent, language = currentLanguage): string[] => {
      const textContent = config?.content?.text?.[language];
      const fallbackContent = config?.content?.text?.[DEFAULT_LANGUAGE];
      
      const result = textContent?.[key] || fallbackContent?.[key];
      return Array.isArray(result) ? result : [];
    };

    const getMessage = (key: string): string => {
      // Get from Tagata SDK messages (these are already localized based on current locale)
      const messages = locale?.messages || {};
      return messages[key] || '';
    };

    const getMessages = (): Record<string, string> => {
      return locale?.messages || {};
    };

    const getAnyText = (key: string, language = currentLanguage): string => {
      // First try to get from config text content
      const textContent = config?.content?.text?.[language];
      const fallbackContent = config?.content?.text?.[DEFAULT_LANGUAGE];
      
      // Check if key exists in TextContent type (config-based keys)
      const configText = (textContent?.[key as keyof TextContent] || fallbackContent?.[key as keyof TextContent]) as string;
      if (configText) {
        return configText;
      }
      
      // Fallback to SDK messages
      return getMessage(key);
    };

    const getAsset = (key: keyof Assets): string => {
      return (config?.content?.assets?.[key] || '') as string;
    };

    const getThumbnail = (key: string): string => {
      return config?.content?.assets?.thumbnails?.[key] || '';
    };

    const getNavigation = (section: 'header' | 'footer'): NavItem[] => {
      return config?.content?.navigation?.[section] || [];
    };

    const getContactLinks = (): ContactLink[] => {
      return config?.content?.links?.contact || [];
    };

    const getSEO = (path: string, language = currentLanguage) => {
      const seoContent = config?.content?.seo?.[language];
      const fallbackSEO = config?.content?.seo?.[DEFAULT_LANGUAGE];
      
      return seoContent?.[path] || fallbackSEO?.[path] || {};
    };

    const getAvailableLanguages = (): string[] => {
      return Object.keys(config?.content?.text || {});
    };

    return {
      getText,
      getTextArray,
      getMessage,
      getMessages,
      getAnyText,
      getAsset,
      getThumbnail,
      getNavigation,
      getContactLinks,
      getSEO,
      getAvailableLanguages,
      currentLanguage,
      locale,
    };
  }, [context?.config, locale]);

  if (!context) {
    throw new Error('useTagataConfig must be used within a ConfigProvider');
  }

  return {
    ...context,
    content: contentHelpers,
    theme: context.config?.theme,
  };
}