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

- ✅ TagadaPay Plugin SDK v2 integration
- ✅ Google Autocomplete v2 for address input
- ✅ Country-first address selection
- ✅ State/province mapping with ISO standards
- ✅ Responsive checkout form
- ✅ Payment processing with BasisTheory
- ✅ Order summary and confirmation

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
    "sdk": "^2.1.0",
    "environment": {
      "VITE_GOOGLE_MAPS_API_KEY": "required"
    }
  }
}
```

This manifest is used by the TagadaPay CLI for deployment and plugin management.
