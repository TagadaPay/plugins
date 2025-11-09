  # JointBoost Checkout Demo (Vite)

  A comprehensive checkout plugin demo built with Vite, showcasing the **TagadaPay Plugin SDK** capabilities. This implementation demonstrates a complete checkout flow with payment processing, order management, and thank-you page functionality.

  ## Features

  - ✅ **Complete Checkout Flow** - From product selection to order confirmation
  - ✅ **TagadaPay SDK Integration** - Uses the official `@tagadapay/plugin-sdk`
  - ✅ **Order Management** - Full order tracking and thank-you page
  - ✅ **Payment Processing** - Credit card payments with 3D Secure support
  - ✅ **Vite Build System** - Fast development and optimized builds
  - ✅ **React Router** - Client-side routing with dynamic parameters
  - ✅ **shadcn/ui Components** - Modern, accessible UI components
  - ✅ **Tailwind CSS** - Utility-first CSS styling
  - ✅ **TypeScript** - Full type safety
  - ✅ **React Hook Form** - Form validation with Zod schemas

  ## Live Demo

  This demo showcases:
  - **Checkout Page** (`/checkout`) - Product selection, customer info, payment
  - **Thank You Page** (`/thankyou/:orderId`) - Order confirmation and details

  ## Quick Start

  ### Prerequisites

  1. **Install the SDK dependencies:**
    ```bash
    cd ../plugin-sdk
    npm install && npm run build
    ```

  2. **Return to demo directory:**
    ```bash
    cd ../jointboost-vite
    ```

  ### Installation & Development

  1. **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

  2. **Configure the plugin:**
    
    Update `src/data/config.ts` with your store configuration:
    ```typescript
    export const pluginConfig = {
      storeId: 'your-store-id',
      variants: {
        regular: 'variant_regular_id',
        bogo: 'variant_bogo_id', 
        special: 'variant_special_id',
      },
      branding: {
        storeName: 'Your Store Name',
        companyName: 'Your Company',
        supportEmail: 'support@yourstore.com',
      },
      // ... other settings
    };
    ```

  3. **Start development server:**
    ```bash
    npm run dev
    # or
    pnpm dev
    ```

  4. **Open your browser:**
    ```
    http://localhost:5173
    ```

  ## SDK Usage Examples

  This demo demonstrates various TagadaPay SDK features:

  ### 🎯 Checkout Management (`useCheckout`)

  ```tsx
  // Initialize and manage checkout sessions
  const { checkout, init, updateLineItems, updateCustomerAndSessionInfo } = useCheckout({
    checkoutToken,
    autoRefresh: false,
  });

  // Start new checkout
  await init({
    storeId: pluginConfig.storeId,
    lineItems: [{ variantId: selectedVariant, quantity: 1 }],
  });

  // Update cart items
  await updateLineItems([
    { variantId: 'variant-1', quantity: 2 }
  ]);
  ```

  ### 💳 Payment Processing (`usePayment`)

  ```tsx
  // Process card payments with 3DS support
  const { processCardPayment, isLoading, error } = usePayment();

  await processCardPayment(
    checkoutSessionId,
    {
      cardNumber: formData.cardNumber,
      expiryDate: formData.expiryDate,
      cvc: formData.cvc,
    },
    {
      enableThreeds: true,
      onSuccess: (payment) => {
        // Redirect to thank you page
        navigate(`/thankyou/${payment.orderId}`);
      },
    }
  );
  ```

  ### 🛒 Order Management (`useOrder`)

  ```tsx
  // Fetch and display order details
  const { order, isLoading, error } = useOrder({
    orderId,
    autoFetch: true,
  });

  // Display order information
  if (order) {
    return (
      <div>
        <h1>Order #{order.id}</h1>
        <p>Status: {order.status}</p>
        <p>Total: {formatMoney(order.paidAmount, order.currency)}</p>
        {/* Order items, shipping info, etc. */}
      </div>
    );
  }
  ```

  ### 📦 Product Management (`useProducts`)

  ```tsx
  // Get product variants for bundle selection
  const { getVariant } = useProducts({
    enabled: true,
    includeVariants: true,
    includePrices: true,
  });

  const regularVariant = getVariant(pluginConfig.variants.regular);
  const bogoVariant = getVariant(pluginConfig.variants.bogo);
  ```

  ### 🎨 Money Formatting (`formatMoney`)

  ```tsx
  import { formatMoney } from '@tagadapay/plugin-sdk';

  // Format prices with proper currency symbols
  formatMoney(2999, 'USD'); // "$29.99"
  formatMoney(2999, 'EUR'); // "€29.99"
  ```

  ## Project Structure

  ```
  src/
  ├── components/
  │   ├── ui/                    # shadcn/ui components
  │   ├── CheckoutPage.tsx       # Main checkout component
  │   ├── ThankYouPage.tsx       # Order confirmation page
  │   └── Providers.tsx          # TagadaPay SDK provider setup
  ├── data/
  │   ├── config.ts              # Plugin configuration
  │   ├── testimonials.ts        # Customer testimonials
  │   └── reviews.ts             # Product reviews
  ├── lib/
  │   └── utils.ts               # Utility functions
  ├── App.tsx                    # Main app with routing
  ├── main.tsx                   # Entry point
  └── index.css                  # Global styles with Tailwind
  ```

  ## Key Implementation Details

  ### Routing Structure

  ```tsx
  // App.tsx - Dynamic routing
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/checkout" element={<CheckoutRoute />} />
    <Route path="/thankyou/:orderId" element={<ThankYouRoute />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  ```

  ### SDK Provider Setup

  ```tsx
  // Providers.tsx - SDK configuration
  <TagadaProvider 
    storeId={storeId}
    accountId={accountId}
    environment="development"
  >
    {children}
  </TagadaProvider>
  ```

  ### Form Validation

  ```tsx
  // Zod schema for checkout form
  const checkoutFormSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    email: z.string().email('Valid email is required'),
    cardNumber: z.string().min(15, 'Valid card number is required'),
    // ... other fields
  });
  ```

  ## Available Scripts

  - `npm run dev` - Start development server with hot reload
  - `npm run build` - Build for production  
  - `npm run preview` - Preview production build locally
  - `npm run lint` - Run ESLint for code quality
  - `npm run type-check` - Run TypeScript type checking

  ## Development Workflow

  ### 1. Local Development

  ```bash
  # Terminal 1: Build and watch SDK changes
  cd ../plugin-sdk
  npm run dev

  # Terminal 2: Run demo with hot reload
  cd ../jointboost-vite  
  npm run dev
  ```

  ### 2. Testing Checkout Flow

  1. **Access checkout:** `http://localhost:5173/checkout`
  2. **Select bundle:** Choose from available product variants
  3. **Fill customer info:** Name, email, phone, address
  4. **Process payment:** Enter test card details
  5. **View confirmation:** Automatic redirect to `/thankyou/:orderId`

  ### 3. Test Payment Cards

  ```
  Card Number: 4242 4242 4242 4242
  Expiry: 12/34
  CVC: 123
  ```

  ## Customization

  ### Styling & Branding

  1. **Update brand colors in `tailwind.config.js`:**
    ```js
    theme: {
      extend: {
        colors: {
          'brand-green-dark': '#your-color',
          'brand-yellow': '#your-color',
        }
      }
    }
    ```

  2. **Modify product data in `src/data/config.ts`**

  3. **Update testimonials and reviews in `src/data/`**

  ### Adding New Features

  1. **New hooks:** Import from `@tagadapay/plugin-sdk`
  2. **New pages:** Add routes in `App.tsx`
  3. **New components:** Follow existing patterns in `src/components/`

  ## Environment Configuration

  ### Development
  ```typescript
  // Uses development API endpoints
  environment: "development"
  ```

  ### Production  
  ```typescript
  // Uses production API endpoints
  environment: "production"
  ```

  ### Local Testing
  ```typescript
  // Uses local API endpoints
  environment: "local"
  ```

  ## SDK Integration Benefits

  This demo showcases the advantages of using the TagadaPay SDK:

  - **🚀 Rapid Development** - Pre-built hooks for common e-commerce operations
  - **🔒 Type Safety** - Full TypeScript support prevents runtime errors
  - **🎯 Best Practices** - Built-in error handling, loading states, and optimizations
  - **🔄 Real-time Updates** - Automatic state synchronization with TagadaPay APIs
  - **📱 Responsive Design** - Mobile-first approach with responsive components
  - **⚡ Performance** - Optimized API calls and efficient state management

  ## Comparison: Next.js vs Vite

  | Feature | Next.js Version | Vite Version (This Demo) |
  |---------|----------------|--------------------------|
  | **Build Tool** | Next.js bundler | Vite (faster builds) |
  | **Routing** | App Router | React Router |
  | **Images** | `next/image` | Standard `<img>` tags |
  | **SSR** | Server-side rendering | Client-side rendering |
  | **Dev Speed** | Good | Excellent (HMR) |
  | **Bundle Size** | Larger | Smaller |

  ## Troubleshooting

  ### Common Issues

  1. **SDK Not Found**
    ```bash
    cd ../plugin-sdk && npm run build
    ```

  2. **Type Errors**
    ```bash
    npm run type-check
    ```

  3. **Build Failures**
    ```bash
    rm -rf node_modules && npm install
    ```

  ### Debug Mode

  Enable debug logging in the SDK:
  ```tsx
  <TagadaProvider debugMode={true}>
  ```

  ## Production Deployment

  ### Build Process

  ```bash
  # 1. Build the SDK
  cd ../plugin-sdk
  npm run build

  # 2. Build the demo
  cd ../jointboost-vite
  npm run build

  # 3. Deploy dist/ folder to your hosting platform
  ```

  ### Environment Variables

  No environment variables required - configuration is handled in `src/data/config.ts`.

  ## Support & Resources

  - **📖 [TagadaPay SDK Documentation](../plugin-sdk/README.md)**
  - **🎯 [Checkout Hook Guide](../plugin-sdk/README-useCheckout.md)**
  - **💰 [Money Formatting Guide](../plugin-sdk/README-money.md)**
  - **🔗 [URL Utilities Guide](../plugin-sdk/README-urlUtils.md)**

  ## Contributing

  1. Fork the repository
  2. Create a feature branch: `git checkout -b feature/new-feature`
  3. Make your changes
  4. Test thoroughly: `npm run lint && npm run type-check`
  5. Submit a pull request

  ## License

  MIT License - see LICENSE file for details. 