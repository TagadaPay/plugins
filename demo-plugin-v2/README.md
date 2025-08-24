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

# Build and deploy to TagadaPay (uses local CLI)
pnpm run deploy

# Or deploy with specific themes
pnpm run deploy:green    # Green theme variant
pnpm run deploy:blue     # Blue theme variant
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

### Using NPM Scripts (Recommended)

The project includes convenient deployment scripts:

```bash
# Default deployment
pnpm run deploy

# Theme variants for A/B testing
pnpm run deploy:green    # Deploys with green theme config
pnpm run deploy:blue     # Deploys with blue theme config
```

### Manual CLI Usage

You can also use the CLI directly:

```bash
# Interactive deployment (best experience)
npx tgdcli int

# Interactive deploy with configuration
npx tgdcli ideploy

# Manual deployment with specific config
npx tgdcli deploy --config config/green-theme.tgd.json --alias "demo-green"
```

### CLI Features

- 🎛️ **Interactive Mode**: `npx tgdcli int` - Full deployment manager
- 🚀 **Interactive Deploy**: `npx tgdcli ideploy` - Guided deployment
- 🎯 **Interactive Mount**: `npx tgdcli imount` - Easy alias/domain mounting
- 📋 **Interactive List**: `npx tgdcli ilist` - Visual deployment tree

## 📦 Dependencies

This demo includes:
- **TagadaPay Plugin SDK v2.1.2**: React hooks and utilities for plugin development
- **TagadaPay Plugin CLI v2.0.19**: Local CLI for deployment and management (no global install needed)

## 🎯 Key Features

- ✅ **No Global CLI Required**: CLI is included as dev dependency
- ✅ **NPM Scripts**: Easy deployment with `pnpm run deploy`
- ✅ **Interactive Mode**: Best-in-class deployment experience
- ✅ **A/B Testing**: Multiple theme configurations
- ✅ **Modern Stack**: React 19, TypeScript, Vite, Tailwind CSS

---

**Built with TagadaPay Plugin SDK v2.1.2 & CLI v2.0.19**