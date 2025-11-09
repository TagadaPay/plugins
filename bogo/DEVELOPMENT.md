# Development Guide

## 🚀 Getting Started

### **1. Standard Development (Published SDK)**

```bash
# Install dependencies with published SDK
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### **2. SDK Development (Local SDK)**

```bash
# Link to local SDK for development
npm run sdk:link

# Start with local SDK mode
npm run dev:local-sdk

# When done, unlink back to published SDK
npm run sdk:unlink
```

## 🔧 Environment Setup

Create `.env.local` for local development:

```bash
# .env.local
VITE_SDK_MODE=published    # or 'local' for SDK development
VITE_DEBUG_MODE=true
VITE_API_ENDPOINT=http://localhost:3000
```

## 📦 SDK Management

### **Switch to Local SDK (for SDK development):**

```bash
npm run sdk:link
npm run dev:local-sdk
```

### **Switch back to Published SDK:**

```bash
npm run sdk:unlink
npm run dev
```

### **Update to Latest Published SDK:**

```bash
npm run sdk:update
```

## 🚀 Deployment Commands

### **Environment Deployments:**

```bash
npm run deploy:dev      # Development environment
npm run deploy:staging  # Staging environment
npm run deploy:prod     # Production environment
```

### **A/B Testing Variants:**

```bash
npm run deploy:variant-a  # Deploy variant A
npm run deploy:variant-b  # Deploy variant B
npm run deploy:variant-c  # Deploy variant C
```

### **Custom Deployment:**

```bash
npm run build
tgdcli deploy --plugin-id my-custom-id --name "My Custom Plugin"
```

## 🎯 A/B Testing Workflow

### **1. Create New Variant:**

```bash
git checkout -b variant-minimal-ui
# Make changes to styling/layout
npm run deploy:variant-a
```

### **2. Test Multiple Variants:**

```bash
# Deploy different variants
npm run deploy:variant-a  # Green theme
npm run deploy:variant-b  # Minimal UI
npm run deploy:variant-c  # Premium layout
```

### **3. Monitor Performance:**

- Check conversion rates in TagadaPay dashboard
- Compare variant performance
- Deploy winning variant to production

## 🔍 Development Tips

### **Hot Reload with Local SDK:**

1. Start SDK in watch mode: `cd ../plugin-sdk && npm run dev`
2. Link local SDK: `npm run sdk:link`
3. Start plugin: `npm run dev:local-sdk`
4. Changes to SDK will automatically reload plugin

### **Testing Different Configurations:**

```typescript
// src/data/config.ts
export const pluginConfig = {
  storeId: process.env.VITE_STORE_ID || 'default-store',
  variants: {
    regular: 'variant_123',
    bogo: 'variant_456',
    special: 'variant_789',
  },
  // Test different themes
  theme: process.env.VITE_PLUGIN_VARIANT || 'default',
};
```

### **Debug Mode:**

```typescript
// Enable debug logging
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('🐛 Debug mode enabled');
}
```

## ⚡ Performance

### **Build Optimization:**

```bash
# Build with bundle analysis
npm run build
npx vite build --analyze

# Test production build locally
npm run preview
```

### **SDK Bundle Size:**

- Published SDK: ~50KB gzipped
- Local SDK: Includes dev dependencies (larger)
- Production builds automatically tree-shake unused code

## 🔒 Security

### **Environment Variables:**

- Never commit `.env.local` with sensitive data
- Use `.env.example` for documentation
- Store IDs and API keys should be in `config.ts` or environment variables

### **SDK Security:**

- Published SDK has security patches
- Local SDK should only be used for development
- Always test with published SDK before deploying
