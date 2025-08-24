# Advertorial Plugin

A TagadaPay plugin template for creating advertorial-style checkout experiences.

## Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
# Google Maps API Key for address autocomplete
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**To get a Google Maps API Key:**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Places API" and "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to your domains for security

### 3. Configuration Files

#### `.local.json`
Contains store and account IDs for local development:
```json
{
  "storeId": "store_your_store_id",
  "accountId": "acc_your_account_id",
  "basePath": "/"
}
```

#### `config/default.tgd.json`
Contains plugin-specific configuration:
```json
{
  "products": {
    "productId": "product_your_product_id",
    "variantId": "variant_your_variant_id"
  },
  "branding": {
    "companyName": "Your Company Name"
  }
}
```

## Development

### Start Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

## Features

- ✅ **TagadaPay Plugin SDK v2.1.3** integration
- ✅ **Smart Card Input** - Auto-formatting (4242 4242 4242 4242) and field navigation
- ✅ **Google Autocomplete v2** for address input with Places API
- ✅ **Country-first Address Selection** - Intelligent address flow
- ✅ **ISO Standards Mapping** - State/province mapping with ISO 3166-2
- ✅ **Responsive Checkout Form** - Mobile-optimized design
- ✅ **Payment Processing** with BasisTheory and 3DS support
- ✅ **Order Summary & Confirmation** - Complete checkout flow
- ✅ **Real-time Validation** - Form validation with error handling

## Plugin Structure

```
├── plugin.manifest.json       # Plugin metadata and configuration
├── .local.json                # Local development store/account IDs
├── config/
│   └── default.tgd.json       # Plugin deployment configuration
├── src/
│   ├── components/
│   │   ├── AdvertorialPage.tsx    # Main landing page
│   │   ├── CheckoutPage.tsx       # Checkout form
│   │   ├── ThankYouPage.tsx       # Order confirmation
│   │   └── Providers.tsx          # SDK providers
│   ├── data/
│   │   └── config.ts              # Static configuration
│   └── App.tsx                    # Main app component
└── README.md                   # This file
```

## Configuration Priority

The plugin uses a layered configuration system:
1. **Dynamic Config** (from `.tgd.json`) - Takes priority
2. **Static Config** (from `config.ts`) - Fallback values

This allows for flexible deployment while maintaining sensible defaults.

## Card Input Features

The checkout form includes advanced card input functionality:

### Smart Formatting
- **Card Number**: Automatically formats as `4242 4242 4242 4242`
- **Expiry Date**: Auto-inserts slash (`12/28`) as user types
- **CVC**: Digit-only input with appropriate length limits

### Auto-Navigation
- **Card → Expiry**: Auto-focus when 16 digits entered
- **Expiry → CVC**: Auto-focus when MM/YY format complete
- **Seamless UX**: No manual tab navigation needed

### Test Credentials
```plaintext
💳 Card Number: 4242 4242 4242 4242
📅 Expiry: 12/28 (any future date)
🔒 CVC: 123 (any 3-4 digits)
```

## Deployment

### Quick Deploy
```bash
# Build and deploy
pnpm run deploy

# Deploy to specific environments
pnpm run deploy:dev      # Development environment
pnpm run deploy:staging  # Staging environment  
pnpm run deploy:prod     # Production environment
```

### Interactive CLI
```bash
# Interactive deployment manager
npx tgdcli int

# Interactive deploy with configuration
npx tgdcli ideploy
```

## Plugin Manifest

The `plugin.manifest.json` file contains metadata about the plugin:

```json
{
  "name": "Advertorial Plugin",
  "pluginId": "advertorial-template",
  "description": "A complete advertorial-style checkout experience...",
  "version": "1.0.0",
  "mode": "direct-mode",
  "category": "ecommerce",
  "features": {
    "googleAutocomplete": true,
    "paymentProcessing": true,
    "orderConfirmation": true
  },
  "requirements": {
    "sdk": "^2.1.3",
    "environment": {
      "VITE_GOOGLE_MAPS_API_KEY": "required"
    }
  }
}
```

This manifest is used by the TagadaPay CLI for deployment and plugin management.
