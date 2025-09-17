import { useEffect } from 'react';
import { useTagataConfig } from '@/src/hooks/use-tagada-context';

export function KlaviyoScript() {
  const { config } = useTagataConfig();
  const klaviyoConfig = config?.content?.klaviyo;

  useEffect(() => {
    if (!klaviyoConfig?.enabled || !klaviyoConfig?.scriptId) {
      return;
    }

    // Check if Klaviyo script is already loaded
    if (document.querySelector(`script[src*="klaviyo.com/onsite/js/${klaviyoConfig.scriptId}"]`)) {
      return;
    }

    // Create and load the Klaviyo script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://static.klaviyo.com/onsite/js/${klaviyoConfig.scriptId}/klaviyo.js`;
    
    // Add to head
    document.head.appendChild(script);

    // Initialize Klaviyo safety fallback
    if (typeof window !== 'undefined') {
      (window as any).klaviyo = (window as any).klaviyo || [];
      if (!(window as any).klaviyo.identify) {
        (window as any).klaviyo.identify = function() {
          (window as any).klaviyo.push(['identify'].concat(Array.prototype.slice.call(arguments)));
        };
      }
      if (!(window as any).klaviyo.track) {
        (window as any).klaviyo.track = function() {
          (window as any).klaviyo.push(['track'].concat(Array.prototype.slice.call(arguments)));
        };
      }
    }

    // Cleanup function
    return () => {
      const existingScript = document.querySelector(`script[src*="klaviyo.com/onsite/js/${klaviyoConfig.scriptId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [klaviyoConfig?.enabled, klaviyoConfig?.scriptId]);

  return null; // This component doesn't render anything
}
