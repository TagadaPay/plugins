import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { useEffect } from 'react';

type PageKey = 'checkout' | 'offer' | 'thankyou' | 'club' | 'portal' | 'notfound';

/**
 * Hook to manage page metadata (title and favicon) based on current page
 * @param pageKey - The page identifier ('checkout' | 'offer' | 'thankyou' | 'club')
 */
export function usePageMetadata(pageKey: PageKey) {
    const { config } = usePluginConfig<PluginConfigData>();
    const { t } = useTranslation();

    useEffect(() => {
        const pageMeta = config?.pageMetadata?.[pageKey];

        // Set page title
        if (pageMeta?.title && t) {
            const title = t(pageMeta.title, 'Tagadapay');
            document.title = title;
        }

        // Resolve favicon: page-specific takes precedence, then universal
        const faviconUrl = pageMeta?.favicon || config?.pageMetadata?.favicon;

        // Set favicon
        if (faviconUrl) {
            // Find existing favicon links (can be 'icon' or 'shortcut icon')
            const existingFavicons = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");

            // Update existing favicon links
            existingFavicons.forEach((link) => {
                (link as HTMLLinkElement).href = faviconUrl;
            });

            // If no favicon exists, create a new one
            if (existingFavicons.length === 0) {
                const faviconLink = document.createElement('link');
                faviconLink.rel = 'icon';
                faviconLink.href = faviconUrl;
                document.head.appendChild(faviconLink);
            }
        }
    }, [config?.pageMetadata, pageKey, t]);
}

