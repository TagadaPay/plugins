# Express Checkout 2 Plugin

A modern, responsive checkout plugin built with React and TypeScript for TagadaPay. This plugin provides a streamlined checkout experience with support for multiple languages and comprehensive configuration options.

## Features

- **Multi-language Support**: English and French configurations
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dynamic Metadata**: SEO-optimized with configurable title, description, and keywords
- **Express Checkout Flow**: Streamlined checkout process for better conversion
- **Address Autocomplete**: Google Places API integration for address suggestions
- **Payment Integration**: Secure credit card processing
- **Order Summary**: Real-time order calculations with discount codes
- **Customer Reviews**: Social proof integration
- **Configurable Branding**: Customizable logo and styling

## Live Demos

### English Version

**[https://bt4q1s.cdn.tagadapay.com/checkout?checkoutToken=11ea7dee31382982228e7d5525ad](https://bt4q1s.cdn.tagadapay.com/checkout?checkoutToken=11ea7dee31382982228e7d5525ad)**

### French Version

**[https://6pjq07.cdn.tagadapay.com/checkout?checkoutToken=11ea7dee31382982228e7d5525ad](https://6pjq07.cdn.tagadapay.com/checkout?checkoutToken=11ea7dee31382982228e7d5525ad)**

## Configuration

The plugin supports two main configuration files:

### English Configuration (`config/default.tgd.json`)

- **Title**: "Tagada - Express Checkout"
- **Description**: "Complete your purchase with our secure and fast express checkout process. Shop the latest fashion trends with confidence."
- **Keywords**: fashion, checkout, shopping, express, secure, payment, dresses, clothing

### French Configuration (`config/default-french.tgd.json`)

- **Title**: "Tagada - Paiement Express"
- **Description**: "Finalisez votre achat avec notre processus de paiement express sécurisé et rapide. Achetez les dernières tendances mode en toute confiance."
- **Keywords**: mode, paiement, achat, express, sécurisé, robe, vêtements

## Configuration Structure

The plugin uses a comprehensive configuration system defined in `types/plugin-config.ts`:

```typescript
interface PluginConfig {
  configName: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  features: {
    enableAdvancedRouting: boolean;
    showConfigViewer: boolean;
    demoMode: boolean;
  };
  // ... additional configuration options
}
```

## Key Components

- **CheckoutPage**: Main checkout component with multi-step form
- **OrderSummary**: Real-time order calculations and discount application
- **AddressForm**: Google Places API integrated address input
- **PaymentForm**: Secure credit card processing
- **CustomerReviews**: Social proof display
- **Providers**: Context providers for state management

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **TagadaPay Plugin SDK** for payment processing
- **Google Places API** for address autocomplete
- **Vite** for build tooling

## Development

### Prerequisites

- Node.js 18+
- pnpm package manager

### Installation

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Plugin Manifest

The plugin is configured via `plugin.manifest.json` with:

- Plugin metadata
- Build configuration
- Deployment settings
- Feature flags

## SEO Features

The plugin automatically sets page metadata based on the selected configuration:

- Dynamic page titles
- Meta descriptions
- Meta keywords
- Responsive meta tags

## Customization

The plugin can be customized through:

- Configuration files for text and branding
- CSS variables for theming
- Component props for behavior modification
- Plugin manifest for feature toggles

## Support

For technical support or feature requests, please refer to the TagadaPay documentation or contact the development team.
