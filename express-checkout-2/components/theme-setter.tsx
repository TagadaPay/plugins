import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/v2";
import { PropsWithChildren, useEffect } from "react";

function ThemeSetter({ children }: PropsWithChildren) {
  const { config } = usePluginConfig<PluginConfig>();

  useEffect(() => {
    if (config?.theme) {
      console.log("config?.theme", config?.theme);
      const root = document.documentElement;
      root.style.setProperty(
        "--checkout-page-bg",
        config.theme.colors?.pageBackground || "#FFFFFF"
      );
      root.style.setProperty(
        "--checkout-panel-bg",
        config.theme.colors?.panelBackground || "#ededed"
      );
      root.style.setProperty(
        "--checkout-panel-bg-soft",
        config.theme.colors?.panelBackgroundSoft || "#ededed"
      );
      root.style.setProperty(
        "--checkout-panel-hover-bg",
        config.theme.colors?.panelHoverBackground || "#f3f4f6"
      );
      root.style.setProperty(
        "--checkout-border-color",
        config.theme.colors?.border || "#dedede"
      );
      root.style.setProperty(
        "--checkout-muted-text",
        config.theme.colors?.mutedText || "#707070"
      );
      root.style.setProperty(
        "--checkout-badge-bg",
        config.theme.colors?.badgeBackground || "#666666"
      );
      root.style.setProperty(
        "--checkout-chart-accent",
        config.theme.colors?.chartAccent || "#00a57d"
      );
      root.style.setProperty(
        "--checkout-placeholder-color",
        config.theme.colors?.placeholder || "#9ca3af"
      );
    }
  }, [config?.theme]);

  return children;
}

export default ThemeSetter;
