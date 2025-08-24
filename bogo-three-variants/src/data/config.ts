// Plugin Configuration
// This plugin uses configuration from default.tgd.json via usePluginConfig() hook
// Only minimal fallback values are kept here

export const pluginConfig = {
  // Default currency (fallback if not provided by SDK)
  defaultCurrency: "USD",
  
  // Minimal branding fallbacks
  branding: {
    storeName: "BOGO Three Variants Demo",
    supportEmail: "support@example.com",
  },
};
