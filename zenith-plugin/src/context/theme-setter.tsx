import { PluginConfig } from '@/types/plugin-config';
import { usePluginConfig } from '@tagadapay/plugin-sdk';
import { PropsWithChildren, useEffect } from 'react';

function ThemeSetter({ children }: PropsWithChildren<{}>) {
  const { config } = usePluginConfig<PluginConfig>();

  useEffect(() => {
    if (config?.theme) {
      const root = document.documentElement;
      root.style.setProperty(
        '--primary-color',
        config.theme.colors.primaryColor
      );
      root.style.setProperty('--primary-dark', config.theme.colors.primaryDark);
      root.style.setProperty(
        '--primary-light',
        config.theme.colors.primaryLight
      );
      root.style.setProperty('--primary-50', config.theme.colors.primary50);
      root.style.setProperty('--footer-color', config.theme.colors.footerColor);
    }
  }, [config?.theme]);

  return children;
}

export default ThemeSetter;
