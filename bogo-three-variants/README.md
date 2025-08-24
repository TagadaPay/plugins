# BOGO Three Variants Plugin - TagadaPay V2

A complete BOGO (Buy One Get One) checkout experience with three variant options, built with modern React and the TagadaPay V2 Plugin SDK.

## 🌐 Live Demo

**Experience the plugin in action:**
- **Live Demo**: [https://bogo-three-variants-01--store_b9dd071b3e3a.cdn.tagadapay.com/](https://bogo-three-variants-01--store_b9dd071b3e3a.cdn.tagadapay.com/)

> 🎯 **Try the checkout flow** with test card: `4242 4242 4242 4242`, expiry: `12/28`, CVC: `123`

## Features

- 🎯 **BOGO Variants**: Three different bundle options (Buy 1 Get 1, Buy 2 Get 1, Buy 3 Get 2)
- 💳 **Complete Checkout**: Embedded payment processing with card validation
- 🌍 **Google Autocomplete**: Smart address completion with ISO mapping
- 📱 **Responsive Design**: Mobile-first design with desktop optimization
- 🔒 **Secure Payment**: BasisTheory integration with 3DS support
- ⚡ **Modern Stack**: React 19, TypeScript, Vite, Tailwind CSS
- 🎨 **Professional UI**: Clean, modern interface with top navigation bar
- 🔄 **Real-time Updates**: Instant bundle selection with optimistic UI

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

This will start the development server at `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

## Project Structure

```
src/
├── App.tsx                 # Main app component with routing
├── CheckoutPageSimple.tsx  # BOGO checkout page with variant selection
├── Logo.tsx               # Logo component
├── main.tsx               # Entry point
├── globals.css            # Global styles with Tailwind
├── components/            # UI components (shadcn/ui)
├── data/                  # Configuration and data files
├── lib/                   # Utility functions
└── thankyou/              # Thank you page components
```

## Key Changes from Next.js

- Replaced Next.js routing with simple client-side routing
- Removed Next.js specific imports and configurations
- Converted to Vite build system
- Replaced geist fonts with system fonts
- Simplified routing logic

## Dependencies

- **React 19**: Latest React with concurrent features
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **TagadaPay SDK v2.2.0**: Payment processing integration
- **React Hook Form**: Form validation and management
- **Zod**: Schema validation
- **Lucide React**: Modern icon library

## Scripts

- `pnpm dev` - Start development server (port 5173)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm deploy` - Build and deploy to TagadaPay
- `pnpm deploy:dev` - Deploy to development environment

## Environment Variables

Create a `.env.local` file with:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Plugin Configuration

The plugin uses `config/default.tgd.json` for variant configuration:

```json
{
  "products": {
    "variants": {
      "bogo": {
        "name": "Buy 1 Get 1 Free",
        "quantity": 2,
        "variantId": "your-variant-id",
        "priceId": "your-price-id"
      },
      "buy2get1": {
        "name": "Buy 2 Get 1",
        "quantity": 3,
        "variantId": "your-variant-id",
        "priceId": "your-price-id"
      },
      "buy3get2": {
        "name": "Buy 3 Get 2",
        "quantity": 5,
        "variantId": "your-variant-id",
        "priceId": "your-price-id"
      }
    }
  }
}
```

## Deployment

### Quick Deploy
```bash
pnpm run deploy
```

### Interactive Deploy
```bash
npx @tagadapay/plugin-cli int
```

## Browser Support

Modern browsers with ES2020+ support.

## Related Plugins

- **[Express Checkout](../express-checkout/)** - Modern express checkout flow
- **[Advertorial](../advertorial/)** - Complete advertorial checkout experience
- **[Demo Plugin V2](../demo-plugin-v2/)** - Advanced routing and configuration showcase
