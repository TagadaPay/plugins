# TagadaPay Demo Plugin V2 - Deployment Guide

## 🚀 Quick Deploy

```bash
# Install dependencies
npm install

# Build and deploy with default config
npm run deploy

# Deploy with green theme
npm run deploy:green

# Deploy with blue theme  
npm run deploy:blue
```

## 🎯 Advanced Deployment

```bash
# Deploy with custom routing (both / and /config paths)
tgdcli deploy --base-path "/" --path "^(|/|/config.*)$" --alias "demo-v2" --config config/green-theme.tgd.json

# Deploy with wildcard matching (all paths except /checkout)
tgdcli deploy --base-path "/" --path ".*" --exclude-path "/checkout" --alias "demo-all"
```

## 🌐 URLs After Deployment

- **Main Plugin**: `https://demo-v2--<storeId>.cdn.tagadapay.com/`
- **Config Viewer**: `https://demo-v2--<storeId>.cdn.tagadapay.com/config`
- **Green Theme**: `https://demo-green--<storeId>.cdn.tagadapay.com/`
- **Blue Theme**: `https://demo-blue--<storeId>.cdn.tagadapay.com/`

## 📋 What This Demo Shows

✅ **V2 Routing System** - Pattern matching and multi-deployment  
✅ **Live Configuration** - Real-time config via React hooks  
✅ **Generic Config** - Any JSON structure supported  
✅ **Development/Production** - Seamless environment switching  
✅ **Multiple Themes** - A/B testing with different configs

---

**Ready to build your own plugin? Check out the [Plugin SDK documentation](../../../tagadapay/packages/plugin-sdk/README.md)**
