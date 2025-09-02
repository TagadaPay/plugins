# TagadaPay Plugin Examples

<div align="center">
  <img src="https://tagadapay.com/logo-landing.png" alt="TagadaPay Logo" width="200" />
</div>

Professional examples showcasing the TagadaPay V2 Plugin System with advanced routing, configuration management, and modern React development patterns.

## 🌐 Live Demos

Experience the plugins in action:

### **Express Checkout Plugin** - Dynamic Branding & Modern UI

**Full Checkout Experience:**

- **Red Theme**: [https://express-01-red--store_b9dd071b3e3a.cdn.tagadapay.com/](https://express-01-red--store_b9dd071b3e3a.cdn.tagadapay.com/)
- **Blue Theme**: [https://express-01-blue--store_b9dd071b3e3a.cdn.tagadapay.com/](https://express-01-blue--store_b9dd071b3e3a.cdn.tagadapay.com/)

**Minimalist Express Checkout:**

- **Red Theme**: [https://express-01-red--store_b9dd071b3e3a.cdn.tagadapay.com/checkout2](https://express-01-red--store_b9dd071b3e3a.cdn.tagadapay.com/checkout2)
- **Blue Theme**: [https://express-01-blue--store_b9dd071b3e3a.cdn.tagadapay.com/checkout2](https://express-01-blue--store_b9dd071b3e3a.cdn.tagadapay.com/checkout2)

### **V2 Demo Plugin** - Configuration & Theming

- **Green Theme**: [https://green--store_b9dd071b3e3a.cdn.tagadapay.com/](https://green--store_b9dd071b3e3a.cdn.tagadapay.com/)
- **Blue Theme**: [https://blue--store_b9dd071b3e3a.cdn.tagadapay.com/](https://blue--store_b9dd071b3e3a.cdn.tagadapay.com/)

### **Advertorial Plugin** - Complete Checkout Flow

- **Live Demo**: [https://advertorial--store_b9dd071b3e3a.cdn.tagadapay.com/](https://advertorial--store_b9dd071b3e3a.cdn.tagadapay.com/)

### **BOGO Three Variants Plugin** - Multi-Bundle Checkout

- **Live Demo**: [https://bogo-three-variants-01--store_b9dd071b3e3a.cdn.tagadapay.com/](https://bogo-three-variants-01--store_b9dd071b3e3a.cdn.tagadapay.com/)

### **Three-Step Funnel V2 Plugin** - High-Converting Sales Funnel

- **Live Demo**: [https://three-step-funnel--store_b9dd071b3e3a.cdn.tagadapay.com/](https://three-step-funnel--store_b9dd071b3e3a.cdn.tagadapay.com/)

### **Quiz Funnel Plugin** - Interactive Product Recommendation Quiz

- **Skincare**: https://lp5lef.cdn.tagadapay.com/
- **Supplements**: https://nroh5z.cdn.tagadapay.com/
  > 🎯 **Try the checkout flow** with test card: `4242 4242 4242 4242`, expiry: `12/28`, CVC: `123`

### **Post-Purchase Upsell Plugin** - Enhanced Upsell Experience

- **Live Demo**: [https://tagadademo.xyz/post/order_4b4b2df309ec](https://tagadademo.xyz/post/order_4b4b2df309ec)

> 🎯 **Try the checkout flow** with test card: `4242 4242 4242 4242`, expiry: `12/28`, CVC: `123`

## 🎯 What's Inside

This repository contains production-ready plugin examples demonstrating how to build custom checkout experiences, landing pages, and interactive components with the TagadaPay V2 platform.

### 🚀 **Plugin Examples**

| Plugin                                              | Description                             | Features                                                                                                                                                                                       | Status        |
| --------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **[three-step-funnel](./v1/three-step-funnel/)**    | High-converting sales funnel            | ✅ Three-step conversion flow<br/>✅ Smart checkout session init<br/>✅ Real order data display<br/>✅ Google Autocomplete + ISO mapping<br/>✅ shadcn/ui + React 19<br/>✅ SDK v2.2.0         | ✅ **Active** |
| **[express-checkout](./express-checkout/)**         | Modern express checkout flow            | ✅ Dynamic branding system<br/>✅ Multi-theme support<br/>✅ Two checkout variants (`/` & `/checkout2`)<br/>✅ ISO address validation<br/>✅ Real-time config injection<br/>✅ SDK v2.2.0      | ✅ **Active** |
| **[bogo-three-variants](./bogo-three-variants/)**   | BOGO multi-bundle checkout              | ✅ Three BOGO variants (1+1, 2+1, 3+2)<br/>✅ Instant bundle switching<br/>✅ Google Autocomplete<br/>✅ Professional top bar<br/>✅ Mobile-first responsive<br/>✅ SDK v2.2.0                 | ✅ **Active** |
| **[demo-plugin-v2](./demo-plugin-v2/)**             | Complete V2 plugin showcase             | ✅ Advanced routing<br/>✅ Live config injection<br/>✅ A/B testing<br/>✅ Modern React 19<br/>✅ TypeScript + Vite                                                                            | ✅ **Active** |
| **[advertorial](./advertorial/)**                   | Complete checkout experience            | ✅ Smart card formatting<br/>✅ Google Autocomplete<br/>✅ ISO address mapping<br/>✅ Payment processing<br/>✅ SDK v2.1.3                                                                     | ✅ **Active** |
| **[post-purchase-upsell](./post-purchase-upsell/)** | Enhanced post-purchase upsells          | ✅ Backend-managed offers<br/>✅ Variant selection with real-time pricing<br/>✅ Fire-and-forget payment flow<br/>✅ Multi-offer navigation<br/>✅ Dynamic branding & themes<br/>✅ SDK v2.2.2 | ✅ **Active** |
| **[quiz-funnel](./quiz-funnel/)**                   | Interactive product recommendation quiz | ✅ Multi-step quiz flow<br/>✅ Personalized product recommendations<br/>✅ Skin type assessment<br/>✅ Dynamic pricing display<br/>✅ Mobile-responsive design<br/>✅ SDK v2.2.0               | ✅ **Active** |

> **💡 Note**: These plugins demonstrate different aspects of the TagadaPay platform - express-checkout showcases dynamic branding and modern UI patterns, demo-plugin-v2 focuses on routing and configuration, while advertorial demonstrates a complete checkout flow.

## 🏗️ Architecture

### **V2 Plugin System**

Built on TagadaPay's advanced V2 architecture with:

- 🎯 **Advanced Routing**: Pattern matching, multi-deployment support
- ⚙️ **Live Configuration**: Real-time config injection via React hooks
- 🔄 **A/B Testing**: Multiple deployments with different configurations
- 🌐 **Custom Domains**: Production-ready domain mounting
- 📱 **Modern Stack**: React 19, TypeScript, Vite, Tailwind CSS

### **Development Tools**

- **[@tagadapay/plugin-sdk v2.1.3](https://www.npmjs.com/package/@tagadapay/plugin-sdk)**: React hooks and utilities
- **[@tagadapay/plugin-cli v2.0.19](https://www.npmjs.com/package/@tagadapay/plugin-cli)**: Interactive deployment and management

## 🚀 Quick Start

### **1. Clone and Explore**

````bash
# Clone the repository
git clone <repository-url>
cd plugins

# Explore the V2 demo plugin
cd demo-plugin-v2
pnpm install
pnpm dev

# Or try the BOGO checkout experience
cd ../bogo-three-variants
pnpm install
pnpm dev

# Or try the complete checkout experience
cd ../advertorial
pnpm install
pnpm dev

# Or try the three-step funnel
cd ../v1/three-step-funnel
pnpm install
pnpm dev

# Or try the skincare quiz funnel
cd ../skincare-quiz-funnel
pnpm install
pnpm dev

### **2. Deploy Your First Plugin**

```bash
# Build and deploy (uses local CLI - no global install needed)
pnpm run deploy

# Or use interactive mode for best experience
npx tgdcli int
````

### **3. Advanced Deployment**

```bash
# A/B testing with different themes
pnpm run deploy:green    # Green theme variant
pnpm run deploy:blue     # Blue theme variant

# Interactive deployment manager
npx tgdcli int --store-id your-store-id
```

**🌐 See Different Plugin Types in Action**:

- **Three-Step Funnel**: [Complete sales funnel](https://three-step-funnel--store_b9dd071b3e3a.cdn.tagadapay.com/) with discovery → social proof → checkout flow
- **Skincare Quiz Funnel**: [Interactive product quiz](https://wbpybq.cdn.tagadapay.com/) with personalized recommendations
- **Post-Purchase Upsells**: [Enhanced upsell experience](https://tagadademo.xyz/post/order_4b4b2df309ec) with variant selection and dynamic pricing
- **Express Checkout Themes**: Compare [Red](https://express-01-red--store_b9dd071b3e3a.cdn.tagadapay.com/) vs [Blue](https://express-01-blue--store_b9dd071b3e3a.cdn.tagadapay.com/) dynamic branding
- **Checkout Variants**: Compare [Full Checkout](https://express-01-blue--store_b9dd071b3e3a.cdn.tagadapay.com/) vs [Minimalist `/checkout2`](https://express-01-blue--store_b9dd071b3e3a.cdn.tagadapay.com/checkout2)
- **Demo Plugin**: Compare [Green Theme](https://green--store_b9dd071b3e3a.cdn.tagadapay.com/) vs [Blue Theme](https://blue--store_b9dd071b3e3a.cdn.tagadapay.com/) to see configuration changes

## 🎨 Plugin Development

### **Plugin Structure**

Every TagadaPay V2 plugin follows this modern structure:

```
my-plugin/
├── plugin.manifest.json    # Plugin metadata & routing configuration
├── .local.json            # Local development context (auto-injected in production)
├── config/                # Optional deployment configurations
│   ├── theme-green.json   # Configuration variant A
│   └── theme-blue.json    # Configuration variant B
├── src/
│   ├── App.tsx           # Main plugin component
│   └── components/       # Reusable components
├── dist/                 # Built plugin files
└── package.json          # Dependencies (includes CLI & SDK)
```

### **Configuration Management**

Access live configuration in your React components:

```tsx
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";

function MyComponent() {
  const { storeId, accountId, basePath, config, loading } = usePluginConfig();

  // Access any config properties
  const primaryColor = config?.branding?.primaryColor || "#059669";
  const companyName = config?.branding?.companyName || "Demo Store";

  return (
    <div style={{ "--primary": primaryColor }}>
      <h1>{companyName}</h1>
    </div>
  );
}
```

### **Checkout Integration**

Implement checkout flows with the SDK:

```tsx
import { useCheckout } from "@tagadapay/plugin-sdk/react";

function CheckoutButton() {
  const { initCheckout, loading } = useCheckout();

  const handleCheckout = () => {
    initCheckout({
      amount: 2999, // $29.99
      currency: "USD",
      productName: "Premium Plan",
    });
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? "Processing..." : "Buy Now"}
    </button>
  );
}
```

### **Complete Checkout Experience**

The **[advertorial plugin](./advertorial/)** demonstrates a full checkout implementation with:

- 🎯 **Smart Card Formatting**: Auto-format card numbers (4242 4242 4242 4242)
- 🔄 **Auto-Navigation**: Seamless field transitions (card → expiry → CVC)
- 🌍 **Global Address Support**: Google Autocomplete with ISO mapping
- 💳 **Payment Processing**: BasisTheory integration with 3DS support
- 📱 **Mobile Optimized**: Responsive design for all devices

**🌐 Live Demo**: [https://advertorial--store_b9dd071b3e3a.cdn.tagadapay.com/](https://advertorial--store_b9dd071b3e3a.cdn.tagadapay.com/)

```bash
# Try the complete checkout experience locally
cd advertorial
pnpm install
pnpm dev
```

## 🧪 Testing & Development

### **Test Payment Credentials**

Use these test credentials for checkout testing:

```plaintext
┌─────────────────────────────────────┐
│  🧪 Test Credit Card               │
│                                     │
│  💳 Number: 4242 4242 4242 4242    │
│  📅 Expiry: 12/29 (any future date) │
│  🔒 CVC: 333 (any 3 digits)        │
│  📧 Email: test@example.com         │
└─────────────────────────────────────┘
```

## 🚀 Deployment Options

### **Interactive Mode (Recommended)**

```bash
# Full deployment manager with visual interface
npx tgdcli int

# Interactive deploy with configuration options
npx tgdcli ideploy

# Interactive mount to alias or custom domain
npx tgdcli imount
```

### **Command Line Mode**

```bash
# Basic deployment
npx tgdcli deploy --store-id store123 --plugin-id my-plugin --name "My Plugin"

# Deploy with custom configuration
npx tgdcli deploy --config config/production.json --alias my-plugin-prod

# Mount to custom domain (production)
npx tgdcli mount-domain dep_abc123 mystore.com
```

### **NPM Scripts Integration**

Add to your `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && npx tgdcli deploy --verbose",
    "deploy:prod": "npm run build && npx tgdcli deploy --config config/production.json",
    "deploy:staging": "npm run build && npx tgdcli deploy --config config/staging.json --dev"
  },
  "devDependencies": {
    "@tagadapay/plugin-cli": "^2.0.19"
  }
}
```

## 📚 Resources

### **Documentation**

- 📖 **[Plugin SDK Documentation](https://www.npmjs.com/package/@tagadapay/plugin-sdk)**: Complete API reference
- 🛠️ **[Plugin CLI Documentation](https://www.npmjs.com/package/@tagadapay/plugin-cli)**: Deployment and management guide
- 🎯 **[TagadaPay Platform](https://tagadapay.com)**: Main platform documentation

### **Community**

- 💬 **Discord**: [discord.gg/tagadapay](https://discord.gg/tagadapay)
- 🐛 **Issues**: [GitHub Issues](https://github.com/tagadapay/plugins/issues)
- 📧 **Support**: support@tagadapay.com

## 🔄 Migration from V1

If you have existing V1 plugins, please migrate to V2 for:

- ✅ **Better Performance**: Advanced routing and caching
- ✅ **Modern Development**: React 19, TypeScript, Vite
- ✅ **Enhanced Features**: Live config injection, A/B testing
- ✅ **Improved DX**: Interactive CLI, better debugging

> **Migration Guide**: Contact support@tagadapay.com for assistance migrating V1 plugins to V2.

---

**Built with TagadaPay Plugin SDK v2.1.3 & CLI v2.0.19**

**Authors**:

- [Loïc Delobel](https://www.linkedin.com/in/loicdelobel/)
- [Etienne Guillet](https://www.linkedin.com/in/etienne-guillet/)
- [Stanislas Cuenat](https://www.linkedin.com/in/stanislas-cuenat-8939b3110/)
