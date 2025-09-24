# Express Checkout 01 - TagadaPay Plugin

A professional express checkout experience inspired by Stripe Checkout, built with modern UI components using shadcn/ui.

## Features

- 🎨 **Modern Design**: Clean, professional interface inspired by Stripe Checkout
- 📱 **Responsive Layout**: Optimized for desktop and mobile devices
- 🔒 **Secure Forms**: Built-in form validation and security indicators
- 🚚 **Shipping Options**: Multiple shipping methods with real-time calculation
- 💳 **Payment Processing**: Secure payment form with card validation
- 🧩 **Modular Components**: Built with reusable shadcn/ui components
- ⚡ **Fast Performance**: Optimized with Vite and modern React patterns

## Components Used

This plugin leverages the following shadcn/ui components:
- Button
- Card (Header, Content, Footer)
- Input
- Label
- Radio Group
- Separator

## Development

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- TagadaPay CLI

### Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development server:**
   ```bash
   pnpm dev
   ```
   
   The plugin will be available at `http://localhost:5173`

3. **Build for production:**
   ```bash
   pnpm build
   ```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm dev:local-sdk` - Development with local SDK
- `pnpm dev:fast` - Fast development mode with auto-reload
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm deploy` - Deploy to TagadaPay (production)
- `pnpm deploy:dev` - Deploy to development environment
- `pnpm deploy:staging` - Deploy to staging environment

## Plugin Configuration

The plugin is configured via `plugin.manifest.json`:

```json
{
  "name": "Express Checkout 01",
  "pluginId": "express-checkout-01",
  "mode": "direct-mode",
  "category": "checkout"
}
```

## Component API

### ExpressCheckout01 Props

```typescript
interface ExpressCheckout01Props {
  orderItems?: OrderItem[]
  subtotal?: number
  tax?: number
  discount?: {
    code: string
    amount: number
  }
  currency?: string
  onCheckout?: (data: any) => void
  className?: string
}
```

### Order Item Structure

```typescript
interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  image?: string
}
```

### Shipping Options

The component includes three default shipping options:
- **Standard Shipping**: Free (5-7 business days)
- **Express Shipping**: $15.99 (2-3 business days)  
- **Overnight Shipping**: $29.99 (Next business day)

## Customization

### Styling

The plugin uses CSS variables for theming. You can customize colors by modifying the CSS variables in `src/index.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... other variables */
}
```

### Adding New Components

To add new shadcn/ui components:

1. Create the component file in `src/components/ui/`
2. Import and use in your components
3. Update the component exports if needed

## Integration with TagadaPay SDK v2

This plugin is fully integrated with TagadaPay SDK v2 and includes:

### SDK Hooks Used

- **`useCheckout`**: Manages checkout session initialization and customer info updates
- **`usePayment`**: Handles secure card payment processing with 3DS support
- **`usePluginConfig`**: Retrieves store configuration and product variants
- **`formatMoney`**: Consistent currency formatting

### Key Features

- **Automatic Checkout Initialization**: Creates checkout session with configured products
- **Real-time Form Validation**: Uses react-hook-form with Zod schema validation
- **Customer Info Management**: Automatically saves customer and shipping details
- **Secure Payment Processing**: Integrated card payment with 3D Secure support
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Configuration

The plugin reads configuration from:
- `.local.json` - Store and account IDs for local development
- `config/default.tgd.json` - Product variants and branding settings

### Payment Flow

1. **Form Validation**: All fields validated using Zod schema
2. **Customer Info Save**: Shipping and billing addresses saved to checkout session
3. **Payment Processing**: Secure card payment with 3DS authentication
4. **Success Handling**: Automatic redirect or success callback

## Deployment

### Development Environment
```bash
pnpm deploy:dev
```

### Staging Environment  
```bash
pnpm deploy:staging
```

### Production Environment
```bash
pnpm deploy:prod
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Private - TagadaPay Team

## Support

For support and questions, contact the TagadaPay development team.
