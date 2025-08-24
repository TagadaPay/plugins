# TagadaPay Demo Plugin V2

A demonstration plugin showcasing the TagadaPay V2 routing system and configuration management.

## 🎯 Features

- ✅ **V2 Routing System** - Advanced pattern matching and multi-deployment support
- ✅ **Live Configuration** - Real-time config injection via React hooks
- ✅ **Generic Config Structure** - Supports any configuration schema
- ✅ **Development & Production** - Works seamlessly in both environments

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for deployment
pnpm build

# Deploy to TagadaPay
tgdcli deploy --base-path "/" --path "^(|/|/config.*)$" --alias "demo-v2"
```

## 📁 Project Structure

```
demo-plugin-v2/
├── plugin.manifest.json    # Plugin metadata & routing
├── .local.json            # Local dev context (auto-injected in production)
├── config/                # Optional deployment configs
│   ├── green-theme.tgd.json
│   └── blue-theme.tgd.json
├── src/
│   ├── App.tsx           # Main plugin component
│   └── components/       # Reusable components
└── dist/                 # Built files
```

## 🎨 Pages

- **`/`** - Welcome page with dynamic theming
- **`/config`** - Configuration viewer showing live plugin config

## 🔧 Configuration

This plugin demonstrates how to use the TagadaPay SDK for configuration access:

```tsx
import { usePluginConfig } from '@tagadapay/plugin-sdk/react';

function MyComponent() {
  const { storeId, accountId, basePath, config, loading } = usePluginConfig();
  
  // Access any config properties
  const primaryColor = config?.branding?.primaryColor || '#059669';
  const companyName = config?.branding?.companyName || 'Demo Store';
  
  return (
    <div style={{ '--primary': primaryColor }}>
      <h1>{companyName}</h1>
    </div>
  );
}
```

## 🚀 Deployment

Deploy with different configurations:

```bash
# Green theme
tgdcli deploy --config config/green-theme.tgd.json --alias "demo-green"

# Blue theme  
tgdcli deploy --config config/blue-theme.tgd.json --alias "demo-blue"

# Multiple paths
tgdcli deploy --path "^(|/|/config.*)$" --alias "demo-multi"
```

---

**Built with TagadaPay Plugin SDK v2.0+**