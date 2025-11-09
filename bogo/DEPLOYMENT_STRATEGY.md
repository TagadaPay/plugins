# Plugin Deployment Strategy

This document outlines the recommended workflow for managing TagadaPay plugins across internal teams and external merchants.

## 🏗️ Architecture Overview

```
┌─────────────────────┬─────────────────────┐
│   Internal Teams    │  External Merchants │
├─────────────────────┼─────────────────────┤
│ Git-based workflow  │ Template-based CLI  │
│ A/B testing         │ Simple customization│
│ Multiple variants   │ Single deployment   │
│ Advanced features   │ Standard features   │
└─────────────────────┴─────────────────────┘
```

## 👥 Internal Team Workflow

### **1. Repository Structure**

```
tagadapay-plugins/
├── templates/
│   ├── jointboost-base/        # Base template
│   ├── checkout-minimal/       # Minimal template
│   └── checkout-premium/       # Premium template
├── variants/
│   ├── jointboost-variant-a/   # A/B test variant A
│   ├── jointboost-variant-b/   # A/B test variant B
│   └── jointboost-variant-c/   # A/B test variant C
└── deployments/
    ├── production.yml          # Production configs
    ├── staging.yml             # Staging configs
    └── ab-testing.yml          # A/B test configs
```

### **2. Development Workflow**

```bash
# 1. Create new variant for A/B testing
git checkout main
git pull origin main
git checkout -b feature/variant-minimal-ui

# 2. Install dependencies (uses published SDK)
npm install

# 3. Develop and test locally
npm run dev

# 4. Deploy variant for testing
npm run deploy:staging

# 5. A/B test in production
npm run deploy:variant-a
npm run deploy:variant-b
```

### **3. Package.json Scripts for Internal Development**

```json
{
  "scripts": {
    "dev": "vite",
    "dev:local-sdk": "VITE_SDK_MODE=local vite",
    "build": "tsc && vite build",
    "deploy:dev": "npm run build && tgdcli deploy --dev",
    "deploy:staging": "npm run build && tgdcli deploy --staging",
    "deploy:prod": "npm run build && tgdcli deploy --prod",
    "deploy:variant-a": "npm run build && tgdcli deploy --plugin-id checkout-variant-a --name 'Checkout Variant A'",
    "deploy:variant-b": "npm run build && tgdcli deploy --plugin-id checkout-variant-b --name 'Checkout Variant B'",
    "sdk:link": "npm link ../plugin-sdk && npm install",
    "sdk:unlink": "npm unlink @tagadapay/plugin-sdk && npm install"
  }
}
```

### **4. A/B Testing Strategy**

```bash
# Deploy multiple variants with different plugin IDs
tgdcli deploy --plugin-id jointboost-green --name "JointBoost Green Theme"
tgdcli deploy --plugin-id jointboost-minimal --name "JointBoost Minimal UI"
tgdcli deploy --plugin-id jointboost-premium --name "JointBoost Premium"

# Configure traffic split in TagadaPay dashboard
# 50% → jointboost-green
# 30% → jointboost-minimal
# 20% → jointboost-premium
```

## 🏪 External Merchant Workflow

### **1. Plugin Creation from Template**

```bash
# Create new plugin from template
tgdcli init my-checkout "My Store Checkout" --template jointboost

cd my-checkout

# Customize configuration
vim src/data/config.ts
```

### **2. Merchant Customization**

```typescript
// src/data/config.ts
export const pluginConfig = {
  storeId: 'store_merchant123',
  branding: {
    storeName: 'Merchant Store',
    companyName: 'Merchant LLC',
    supportEmail: 'support@merchant.com',
    primaryColor: '#ff6b6b', // Custom brand color
    logo: '/merchant-logo.png',
  },
  variants: {
    regular: 'variant_reg_456',
    bogo: 'variant_bogo_789',
    special: 'variant_special_012',
  },
  features: {
    expeditedShipping: true,
    testimonials: true,
    reviews: false, // Disable reviews
    orderBumps: ['upsell_123'],
  },
};
```

### **3. Simple Deployment**

```bash
# Test locally
npm run dev

# Deploy to production
npm run deploy
```

## 🔧 SDK Development Workflow

### **For SDK Development (Internal Only)**

```bash
# 1. SDK development mode
cd examples/plugin-sdk
npm run dev  # Watch mode

# 2. Link SDK to plugin (separate terminal)
cd examples/jointboost-vite
npm run sdk:link  # Links local SDK

# 3. Develop with live SDK changes
npm run dev:local-sdk

# 4. Publish SDK when ready
cd examples/plugin-sdk
npm run publish:patch

# 5. Update plugins to use published version
cd examples/jointboost-vite
npm run sdk:unlink  # Back to published SDK
npm install @tagadapay/plugin-sdk@latest
```

### **Environment Variables for Development**

```bash
# .env.local (for SDK development)
VITE_SDK_MODE=local
VITE_API_ENDPOINT=http://localhost:3000
VITE_DEBUG_MODE=true

# .env.production (for published SDK)
VITE_SDK_MODE=production
VITE_API_ENDPOINT=https://app.tagadapay.com
VITE_DEBUG_MODE=false
```

## 📋 CLI Template Structure

### **Create Template in CLI**

```bash
# Add jointboost template to CLI
mkdir -p examples/plugin-cli/templates/jointboost
cp -r examples/jointboost-vite/* examples/plugin-cli/templates/jointboost/

# Update template variables
sed -i 's/jointivil-checkout-vite/{{pluginId}}/g' examples/plugin-cli/templates/jointboost/package.json
sed -i 's/JointBoost/{{name}}/g' examples/plugin-cli/templates/jointboost/src/data/config.ts
```

### **Template Variables**

```typescript
// templates/jointboost/src/data/config.ts
export const pluginConfig = {
  storeId: '{{storeId}}',
  branding: {
    storeName: '{{storeName}}',
    companyName: '{{companyName}}',
    supportEmail: '{{supportEmail}}',
  },
  // ... rest of config
};
```

## 🚀 Deployment Environments

### **Environment Configuration**

```yaml
# deployments/environments.yml
development:
  api_endpoint: 'https://app.tagadapay.dev'
  sdk_version: 'latest'
  debug_mode: true

staging:
  api_endpoint: 'https://staging.tagadapay.com'
  sdk_version: 'stable'
  debug_mode: true

production:
  api_endpoint: 'https://app.tagadapay.com'
  sdk_version: 'stable'
  debug_mode: false
```

### **CLI Deployment Commands**

```bash
# Internal team deployments
tgdcli deploy --env development --plugin-id checkout-dev
tgdcli deploy --env staging --plugin-id checkout-staging
tgdcli deploy --env production --plugin-id checkout-prod

# A/B testing deployments
tgdcli deploy --env production --plugin-id checkout-variant-a --traffic 50
tgdcli deploy --env production --plugin-id checkout-variant-b --traffic 30
tgdcli deploy --env production --plugin-id checkout-variant-c --traffic 20

# Merchant deployments (auto-detection)
tgdcli deploy --store-id store_merchant123
```

## 📊 A/B Testing Management

### **1. Variant Configuration**

```json
{
  "abTesting": {
    "enabled": true,
    "variants": [
      {
        "id": "variant-a",
        "name": "Green Theme",
        "traffic": 50,
        "config": {
          "theme": "green",
          "layout": "standard"
        }
      },
      {
        "id": "variant-b",
        "name": "Minimal UI",
        "traffic": 30,
        "config": {
          "theme": "minimal",
          "layout": "compact"
        }
      }
    ]
  }
}
```

### **2. Performance Tracking**

```typescript
// Automatic variant tracking
import { track } from '@tagadapay/plugin-sdk';

track('checkout_variant_loaded', {
  variant: 'variant-a',
  theme: 'green',
  timestamp: Date.now(),
});

track('checkout_conversion', {
  variant: 'variant-a',
  conversionRate: 0.125,
  revenue: 99.99,
});
```

## 🔄 CI/CD Integration

### **GitHub Actions for Internal Teams**

```yaml
# .github/workflows/deploy-variants.yml
name: Deploy Plugin Variants

on:
  push:
    branches: [main, staging, variant-*]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build plugin
        run: npm run build

      - name: Deploy to staging
        if: github.ref == 'refs/heads/staging'
        run: tgdcli deploy --env staging

      - name: Deploy variant A
        if: github.ref == 'refs/heads/variant-a'
        run: tgdcli deploy --plugin-id checkout-variant-a

      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: tgdcli deploy --env production
```

## 📈 Benefits of This Strategy

### **For Internal Teams:**

- ✅ **Git-based version control** for complex plugins
- ✅ **A/B testing** with multiple variants
- ✅ **Environment management** (dev/staging/prod)
- ✅ **Local SDK development** workflow
- ✅ **CI/CD integration** for automated deployments

### **For External Merchants:**

- ✅ **Simple template-based** plugin creation
- ✅ **Easy customization** through configuration
- ✅ **One-command deployment** with CLI
- ✅ **Stable SDK versions** from NPM
- ✅ **No Git knowledge required**

### **For SDK Maintenance:**

- ✅ **Published SDK** for stability
- ✅ **Local development** for SDK changes
- ✅ **Version management** through NPM
- ✅ **Backward compatibility** testing

## 🛠️ Quick Start Commands

### **Internal Developer:**

```bash
git clone https://github.com/tagadapay/plugin-templates
cd plugin-templates/jointboost-variants
npm install
npm run deploy:variant-a
```

### **External Merchant:**

```bash
tgdcli init my-checkout "My Checkout" --template jointboost
cd my-checkout
npm run deploy
```

### **SDK Developer:**

```bash
cd examples/plugin-sdk
npm run dev &
cd ../jointboost-vite
npm run sdk:link
npm run dev:local-sdk
```
