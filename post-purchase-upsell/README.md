# Post-Purchase Upsell Plugin

A modern post-purchase upsell plugin built with the enhanced `usePostPurchases` hook from the TagadaPay Plugin SDK.

## Features

- **Enhanced SDK Integration**: Uses the `usePostPurchases` hook from TagadaPay Plugin SDK v2.2.2
- **Variant Selection**: Real-time variant changes with automatic price updates
- **Multi-Offer Support**: Navigate through multiple offers with progress indicators
- **Countdown Timer**: Creates urgency with a countdown timer
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Granular Loading States**: Per-variant loading indicators and order summary updates
- **Modern UI**: Beautiful, professional interface with trust badges
- **Enhanced Checkout Flow**: Streamlined offer acceptance with variant customization

## How usePostPurchases Hook Works

The `usePostPurchases` hook is the core of this plugin and handles the complete post-purchase upsell flow:

### Backend Offer Matching
- **Offer matching is configured backend-side in the CRM** based on the main `orderId`
- The hook fetches offers that match rules set up in the TagadaPay admin panel
- Rules can include: product categories, order value, customer segments, purchase history, etc.
- **No client-side logic needed** - the backend determines which offers to show

### Order Flow
1. **Main Order**: Customer completes their primary purchase (gets an `orderId`)
2. **Offer Fetching**: Plugin calls `/api/v1/post-purchase/{orderId}/offers` to get matched offers
3. **Display**: Plugin shows offers one by one with variant selection
4. **Upsell Orders**: Each accepted offer creates a **new separate upsell order** in the background
5. **Fire-and-Forget Payment**: Uses the **proven payment method** from the main order with immediate progression

> **Note**: In development, offers may fail due to mock authentication tokens without valid payment instruments. In production, the customer has just completed a successful payment, so their payment method is proven and reliable.

### Key Benefits
- ✅ **No payment re-entry**: Uses proven payment method from main order
- ✅ **Instant progression**: Fire-and-forget payment with immediate advancement
- ✅ **Separate order tracking**: Each upsell is a distinct order for fulfillment
- ✅ **Backend-controlled**: Offer rules managed in CRM, not hardcoded in plugin
- ✅ **Real-time variant selection**: Prices update automatically when variants change

### Alternative Approach: useOffers()
For more control over offer logic, you can use the lower-level `useOffers()` hook:
- Fetches all available offers (not filtered by order)
- Requires **client-side logic** to determine which offers to show
- More flexible but requires more implementation work
- Useful for custom offer selection algorithms

## Current Implementation

This plugin uses the published SDK with core post-purchase functionality:

1. **Backend-Managed Offers**: Offers are matched server-side based on main order rules
2. **Basic Checkout Session Management**: Initialize and process checkout sessions
3. **Variant Display**: Shows selected variant information (selection coming in enhanced SDK)
4. **Order Summaries**: Display offer summaries with pricing information
5. **Fire-and-Forget Payment**: Uses proven payment method from main order with immediate progression
6. **Separate Upsell Orders**: Each accepted offer creates a new order in background
7. **Resilient Error Handling**: Auto-skip to next offer on errors, never break the user flow
8. **Multi-Offer Navigation**: Support for multiple offers with navigation
9. **Countdown Timer**: Creates urgency with a countdown timer
10. **Perfect UX Layout**: Optimized layout for both desktop and mobile with premium design elements
11. **Granular Loading States**: Per-variant loading indicators and order summary updates
12. **Dynamic Branding**: Configurable themes and colors that adapt to your brand

## Usage

### Plugin Installation & Mounting

When installing this plugin in your TagadaPay dashboard, you can configure it to only handle specific paths while keeping your native checkout intact.

#### Example: Replace Only Post-Purchase Pages

```
🌐 Mount post-purchase-upsell-pro to Custom Domain
=============================================
✔ Enter custom domain: yourdomain.com
✔ Enter base path: /
✔ Enter path matcher (optional): /post.*
✔ Enter path excluder (optional): 
```

**What this configuration does:**
- **Native checkout** (`/checkout`) continues to work normally ✅
- **Post-purchase pages** (`/post/:orderId`) are replaced with this plugin 🔄
- **CMS assets** (`/_next/static/...`, fonts, etc.) continue to work normally ✅
- **All other pages** remain unchanged ✅

#### Path Matcher Explanation

The path matcher `/post.*` means:
- `/post` - Match paths starting with "/post"
- `.*` - Followed by any characters (like the orderId)
- This captures routes like:
  - `/post/order_123abc` ✅ (handled by plugin)
  - `/post` ✅ (handled by plugin)
  - `/checkout` ❌ (not matched, uses native CMS)
  - `/dashboard` ❌ (not matched, uses native CMS)
  - `/_next/static/...` ❌ (not matched, uses native CMS assets)

> **Important**: When using specific path matchers, only matching paths and their assets are served by the plugin. All other paths (including CMS assets like fonts, stylesheets, etc.) continue to be served by the native CMS system.

### ⚠️ CRITICAL: Matcher Configuration for /post Routes

**When deploying this plugin to replace only `/post` routes, you MUST use the correct matcher pattern:**

```json
{
  "pluginId": "post-purchase-upsell-pro",
  "deploymentId": "4z4z0p",
  "basePath": "/",
  "customDomain": true,
  "storeId": "store_b9dd071b3e3a",
  "accountId": "acc_47a93cc912de",
  "config": {
    "name": "Green Theme",
    "description": "Green theme for post-purchase upsell",
    "theme": {
      "primary": "#10b981",
      "primaryForeground": "#ffffff",
      "secondary": "#f0fdf4",
      "accent": "#059669",
      "background": "#ffffff",
      "foreground": "#0f172a",
      "muted": "#f7fee7",
      "border": "#d1fae5"
    },
    "settings": {
      "countdownDuration": 120,
      "showTrustBadges": true,
      "enableVariantSelection": true,
      "autoInitializeCheckout": true
    }
  },
  "createdAt": "2025-08-25T11:41:58.427Z",
  "matcher": "/post.*",
  "hostname": "tagadademo.xyz"
}
```

**Key Points:**
- ✅ **Correct matcher**: `"/post.*"` - Matches `/post` and all sub-paths like `/post/order_123`
- ❌ **Incorrect matcher**: `"/post/:path*"` - This is Next.js syntax, not regex
- ❌ **Too broad**: `".*"` - This would capture ALL routes including CMS assets
- ✅ **Result**: Only `/post/*` routes are handled by plugin, everything else (checkout, assets, etc.) stays with CMS

**Why this matters:**
- Prevents plugin from interfering with native checkout (`/checkout`)
- Ensures CMS assets (`/_next/static/`, fonts, etc.) are served correctly
- Maintains proper separation between plugin and CMS functionality

#### Smart Matcher-Aware Cookie Routing

The system uses intelligent **matcher-aware** cookie-based routing:

1. **Valid Cookie + Matcher Allows Path** → Serves from plugin (sticky experience)
2. **Invalid Cookie OR Matcher Rejects Path** → Check other deployments
3. **No Deployment Matches Path** → **Fallback to CMS** (native assets)

**Key Innovation**: Cookies are **matcher-specific**! A cookie from `/post/order_123` (matcher: `/post.*`) won't incorrectly serve CMS assets like `/_next/static/...` because the matcher validation fails.

This ensures that:
- Users get consistent experience for **matching paths only** (smart stickiness)
- CMS assets automatically fallback to CMS when plugin matchers don't allow them
- No "matcher pollution" where one plugin tries to serve assets it shouldn't handle

**Example Flow**:
```
1. User visits /post/order_123 → Sets cookie: deploymentId=4z4z0p (matcher: /post.*)
2. User requests /_next/static/font.woff2 → Cookie exists BUT matcher /post.* rejects /_next/static/...
3. System ignores cookie, checks other deployments, finds none match → Fallback to CMS ✅
```

#### Alternative Mounting Configurations

**Only post-purchase offers (keep native thank you):**
```
Path matcher: /post/:path*
```

**Only thank you pages:**
```
Path matcher: /thankyou/:path*
```

**Specific subdirectory:**
```
Base path: /upsells/
Path matcher: /((post|thankyou)/:path*)
```
This would handle `/upsells/post/:orderId` and `/upsells/thankyou/:orderId`

### Basic Setup

```tsx
import { usePostPurchases, formatMoney } from '@tagadapay/plugin-sdk/react';

const {
  offers,
  isLoading,
  error,
  // Enhanced methods for variant selection
  getAvailableVariants,
  selectVariant,
  getOrderSummary,
  isLoadingVariants,
  isUpdatingOrderSummary,
  confirmPurchase,
} = usePostPurchases({
  orderId: 'your-order-id',
  enabled: true,
  autoInitializeCheckout: true, // Auto-initialize with variant options
});
```

### Accept Offer with Variant Selection

```tsx
// Accept an offer with current variant selections
const handleAcceptOffer = async (offerId: string) => {
  try {
    // Confirm purchase with selected variants (creates new upsell order)
    await confirmPurchase(offerId, {
      draft: false,
      returnUrl: window.location.href,
    });
    
    // Success! New upsell order created using main order's payment method
  } catch (error) {
    // Handle error
  }
};

// Handle variant selection with real-time price updates
const handleVariantSelect = async (offerId: string, productId: string, variantId: string) => {
  try {
    await selectVariant(offerId, productId, variantId);
    // Prices update automatically via getOrderSummary()
  } catch (error) {
    // Handle error
  }
};

// Display offer with proper money formatting
const currentOffer = offers[0];
const orderSummary = getOrderSummary(currentOffer.id);
const summary = orderSummary || currentOffer.summaries[0];

return (
  <div>
    <h2>{currentOffer.titleTrans?.en}</h2>
    <p>Price: {formatMoney(summary.totalAdjustedAmount, summary.currency)}</p>
    
    {summary.items.map((item) => {
      const variants = getAvailableVariants(currentOffer.id, item.productId);
      const isLoading = isLoadingVariants(currentOffer.id, item.productId);
      
      return (
        <div key={item.id}>
          <h4>{item.product.name}</h4>
          <p>{formatMoney(item.unitAmount, summary.currency)}</p>
          
          {variants.length > 1 && (
            <select 
              value={item.variantId}
              onChange={(e) => handleVariantSelect(currentOffer.id, item.productId, e.target.value)}
              disabled={isLoading}
            >
              {variants.map((variant) => (
                <option key={variant.variantId} value={variant.variantId}>
                  {variant.variantName}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    })}
    
    <button 
      onClick={() => handleAcceptOffer(currentOffer.id)}
      disabled={isUpdatingOrderSummary(currentOffer.id)}
    >
      Accept Offer
    </button>
  </div>
);
```

### Multi-Offer Navigation

```tsx
// Navigate through multiple offers
const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

const handleNextOffer = () => {
  if (currentOfferIndex < offers.length - 1) {
    setCurrentOfferIndex(currentOfferIndex + 1);
  }
};

const handlePreviousOffer = () => {
  if (currentOfferIndex > 0) {
    setCurrentOfferIndex(currentOfferIndex - 1);
  }
};
```

### Enhanced Variant Selection

The plugin now includes full variant selection functionality using the enhanced SDK:

```tsx
// Enhanced SDK usage with auto-initialization
const {
  offers,
  isLoading,
  error,
  getAvailableVariants,
  selectVariant,
  getOrderSummary,
  isLoadingVariants,
  isUpdatingOrderSummary,
  confirmPurchase,
} = usePostPurchases({
  orderId,
  enabled: true,
  autoInitializeCheckout: true, // Auto-initialize with variant options
});

// Variant selection workflow:
// 1. SDK auto-initializes checkout sessions with variant options
// 2. Uses /api/v1/checkout-sessions/{sessionId}/order-summary endpoint
// 3. Real-time variant changes update prices automatically
// 4. Granular loading states for each variant operation
// 5. Enhanced order summaries with variant options

// The UI features:
// - Dropdown selectors for products with multiple variants
// - Per-variant loading indicators
// - Real-time price updates
// - Disabled states during processing
// - Enhanced order summaries with variant data
```

### Alternative: useOffers() for Custom Logic

If you need more control over offer selection logic, use the lower-level `useOffers()` hook:

```tsx
import { useOffers } from '@tagadapay/plugin-sdk/react';

const { offers, isLoading, error } = useOffers({
  enabled: true,
});

// Custom logic to filter offers based on order
const filteredOffers = offers.filter(offer => {
  // Your custom logic here
  // e.g., check order value, customer segment, product categories
  return shouldShowOffer(offer, currentOrder);
});

// Manual checkout session management
const handleAcceptOffer = async (offerId: string) => {
  try {
    // You handle the checkout flow manually
    const { checkoutSessionId } = await initCheckoutSession(offerId, orderId);
    await payWithCheckoutSession(checkoutSessionId, orderId);
  } catch (error) {
    // Handle error
  }
};
```

**When to use `useOffers()` vs `usePostPurchases()`:**

| Feature | usePostPurchases() | useOffers() |
|---------|-------------------|-------------|
| **Offer Filtering** | ✅ Backend-managed (CRM rules) | ❌ Manual client-side logic |
| **Variant Selection** | ✅ Built-in with auto-updates | ❌ Manual implementation |
| **Payment Flow** | ✅ Automatic (uses main order payment) | ❌ Manual checkout management |
| **Order Creation** | ✅ Auto-creates upsell orders | ❌ Manual order management |
| **Setup Complexity** | ✅ Simple (just provide orderId) | ❌ Complex (custom logic needed) |
| **Flexibility** | ❌ Limited to backend rules | ✅ Full control over offer logic |

**Recommendation:** Use `usePostPurchases()` for most cases. Only use `useOffers()` if you need custom offer selection algorithms that can't be configured in the CRM.

## Resilient Error Handling

The plugin is designed to never break the user flow, even when errors occur:

### 🔄 Auto-Recovery Behavior
- **Offer Processing Errors**: If an offer fails to process, automatically skip to the next offer
- **Variant Selection Errors**: Silent recovery with user notification, doesn't break the flow
- **Loading Errors**: Auto-redirect after brief error message (3 seconds)
- **Network Issues**: Graceful degradation with user-friendly messaging

### 🎯 Error Flow Logic
```
Offer Processing Error → Show brief notification → Auto-skip to next offer
↓
Last Offer Error → Show notification → Auto-redirect to completion
↓
Loading Error → Show friendly message → Auto-redirect after 3s
```

### ✅ User Experience Benefits
- **Never Stuck**: Users never get stuck on a broken offer
- **Seamless Flow**: Errors don't interrupt the purchase journey
- **Clear Communication**: Users understand what's happening
- **Automatic Recovery**: No manual intervention required

## Development vs Production Behavior

### 🔧 Development Environment
In development, offers may fail because:
- **Generated Auth Tokens**: The plugin uses generated authentication tokens that aren't associated with a real customer
- **No Payment Instrument**: Development tokens don't have valid payment methods attached
- **Mock Data**: The customer context is simulated, not from a real completed order

### 🚀 Production Environment
In production, the plugin works seamlessly because:
- **Real Customer Context**: The auth token belongs to a customer who just completed their main order
- **Valid Payment Instrument**: The customer has a proven payment method from their recent purchase
- **Automatic Payment**: Uses the same payment method from the main order (no re-entry needed)

### ⚡ Fire-and-Forget Payment Flow
When a user clicks "Accept Offer":
1. **Immediate Progression**: We don't wait for the payment response
2. **Auto-Advance**: Immediately move to the next offer or completion
3. **Background Processing**: Payment processes in the background
4. **Why This Works**: In production, payment success is virtually guaranteed since we're using the customer's proven payment method

```typescript
// Payment flow - no waiting for response
await confirmPurchase(offerId, { draft: false });
// ↓ Immediately continue (don't await response)
moveToNextOffer(); // Fire-and-forget approach
```

This approach provides the smoothest user experience since customers don't need to wait for payment confirmation on each offer.

## Dynamic Branding Configuration

The plugin supports dynamic theming through configuration files that allow you to customize colors and settings.

### 🎨 Theme Configuration

Create theme configuration files in the `config/` directory:

```json
{
  "name": "Purple Theme",
  "description": "Purple theme for post-purchase upsell",
  "theme": {
    "primary": "#8b5cf6",
    "primaryForeground": "#ffffff",
    "secondary": "#faf5ff",
    "accent": "#7c3aed",
    "background": "#ffffff",
    "foreground": "#0f172a",
    "muted": "#f3f4f6",
    "border": "#e5e7eb"
  },
  "settings": {
    "countdownDuration": 120,
    "showTrustBadges": true,
    "enableVariantSelection": true,
    "autoInitializeCheckout": true
  }
}
```

### 🎯 Available Themes

The plugin comes with three pre-configured themes:

| Theme | Primary Color | Description |
|-------|---------------|-------------|
| **default** | Blue (#3b82f6) | Professional blue theme |
| **purple** | Purple (#8b5cf6) | Modern purple theme |
| **green** | Green (#10b981) | Fresh green theme |

### ⚙️ Theme Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `countdownDuration` | number | 120 | Countdown timer duration in seconds |
| `showTrustBadges` | boolean | true | Whether to show trust badges |
| `enableVariantSelection` | boolean | true | Enable variant selection feature |
| `autoInitializeCheckout` | boolean | true | Auto-initialize checkout sessions |

### 🔧 Usage

Specify the theme via URL parameter:
```
/post-purchase/order123?theme=purple
```

Or set it programmatically in the TagadaProvider:
```tsx
<TagadaProvider localConfig="purple" environment="production">
  {/* Your app */}
</TagadaProvider>
```

### 🎨 Dynamic Elements

The following elements adapt to your theme:
- **Progress indicators**: Use primary color for active states
- **Action buttons**: Gradient from primary to accent color
- **Variant selection**: Primary color for selected states
- **Navigation dots**: Primary color for current position
- **Links and accents**: Primary color throughout

This allows the plugin to seamlessly match your brand identity while maintaining optimal UX.

## Perfect UX Layout Design

This plugin features a premium, responsive design optimized for both desktop and mobile:

### 🎨 Premium Visual Design
- **Gradient Backgrounds**: Subtle gradients create depth and visual interest
- **Enhanced Shadows**: Multi-layered shadows provide premium card elevation
- **Rounded Corners**: Consistent border-radius creates modern, friendly appearance
- **Color Harmony**: Carefully chosen color palette with blue-purple gradients

### 🎯 Touch-Friendly Interactions
- **Large Touch Targets**: All interactive elements meet 52px+ minimum touch targets
- **Variant Cards**: Beautiful card-based variant selection with radio button styling
- **Hover & Active States**: Smooth scale animations and visual feedback on all interactions
- **Silent Updates**: No popup toasts for variant changes - visual feedback is immediate

### 📱 Responsive Excellence
- **Adaptive Typography**: Scales from mobile (text-lg) to desktop (text-4xl) for optimal readability
- **Smart Layout Logic**: Single items take full width, multiple items use grid layout
- **Flexible Grids**: Conditional grid systems based on content (single item = full width, multiple = 2-column)
- **Progressive Enhancement**: Mobile-first approach with desktop enhancements
- **Contextual Spacing**: Dynamic padding based on item count and screen size

### 🎪 Enhanced Visual Hierarchy
- **Hero Header**: Large, bold typography with emoji and compelling copy
- **Progress Indicators**: Animated dots with scale effects for current position
- **Countdown Timer**: Eye-catching gradient timer with urgency messaging
- **Trust Badges**: Professional trust indicators with hover effects

### 💎 Premium Components
- **Gradient Action Buttons**: Eye-catching gradient buttons with enhanced shadows
- **Product Cards**: Elevated cards with hover effects and improved image presentation
- **Navigation Elements**: Polished navigation with proper spacing and visual feedback
- **Loading States**: Smooth loading animations with proper visual hierarchy
- **Resilient Error Handling**: Auto-recovery from errors without breaking user flow

### Layout Comparison: Before vs After

| Feature | Before (Basic) | After (Premium UX) |
|---------|----------------|-------------------|
| **Overall Design** | Basic white cards | Premium gradients + shadows |
| **Typography** | Fixed sizes | Responsive scaling (text-lg → text-5xl) |
| **Variant Selection** | Small dropdown | Large interactive cards with radio buttons |
| **Touch Targets** | 32px buttons | 52px+ premium touch targets |
| **Product Cards** | Basic borders | Elevated cards with hover effects |
| **Action Buttons** | Solid colors | Gradient buttons with enhanced shadows |
| **Navigation** | Simple text links | Polished buttons with proper spacing |
| **Progress Indicators** | Basic dots | Animated dots with scale effects |
| **Trust Badges** | Simple text | Professional cards with icons |
| **Spacing** | Fixed padding | Contextual spacing (p-4 → p-8) |
| **Visual Feedback** | Basic hover | Multi-state animations + transitions |

## API Reference

### usePostPurchases Options

- `orderId`: The order ID to fetch post-purchase offers for
- `enabled`: Whether to fetch offers automatically (default: true)
- `autoInitializeCheckout`: Whether to automatically initialize checkout sessions with variant options (default: false, **recommended: true**)

### Available Methods

**Basic Methods:**
- `initCheckoutSession(offerId, orderId)`: Initialize checkout session for an offer
- `payWithCheckoutSession(checkoutSessionId, orderId?)`: Process payment with checkout session
- `getOffer(offerId)`: Get specific offer by ID
- `getTotalValue()`: Get total value of all offers
- `getTotalSavings()`: Get total savings across all offers

**Enhanced Methods (with autoInitializeCheckout: true):**
- `getOrderSummary(offerId)`: Get enhanced order summary with variant options
- `getAvailableVariants(offerId, productId)`: Get available variants for a product
- `selectVariant(offerId, productId, variantId)`: Change variant selection with real-time price updates
- `confirmPurchase(offerId, options?)`: Complete purchase with current variant selections
- `isLoadingVariants(offerId, productId)`: Check if variants are loading for a product
- `isUpdatingOrderSummary(offerId)`: Check if order summary is being updated
- `getCheckoutSessionState(offerId)`: Get checkout session state for an offer

**Utility:**
- `formatMoney(amountMinorUnits, currencyCode, locale?)`: Format money amounts properly
- `refetch()`: Manually refetch offers

### Return Values

- `offers`: Array of available post-purchase offers
- `isLoading`: Loading state for fetching offers
- `error`: Error state if fetching fails

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## File Structure

```
src/
├── components/
│   ├── PostPurchaseOffer.tsx  # Main offer component
│   └── ThankYou.tsx           # Thank you page
├── App.tsx                    # Main app with routing
├── main.tsx                   # Entry point
└── index.css                  # Styles

config/
├── default.tgd.json          # Default blue theme
├── green.tgd.json            # Green theme
└── purple.tgd.json           # Purple theme
```

## Themes

The plugin supports multiple themes:

- **Default**: Blue theme (#3b82f6)
- **Green**: Green theme (#10b981)  
- **Purple**: Purple theme (#8b5cf6)

Each theme includes customizable colors and settings.

## Configuration

Each theme configuration includes:

- **Theme Colors**: Primary, secondary, accent colors
- **Settings**: Countdown duration, trust badges, variant selection
- **Auto-initialization**: Automatic checkout session setup

## Integration

This plugin can be integrated into any e-commerce platform that supports the TagadaPay Plugin SDK. The enhanced hook provides all the necessary functionality for building sophisticated post-purchase experiences with variant selection capabilities.

## Benefits

1. **Better User Experience**: Customers can customize their offers before purchasing
2. **Higher Conversion**: Real-time price updates and variant selection increase engagement
3. **Developer Friendly**: Clean API with comprehensive TypeScript support
4. **Performance**: Optimized loading states and error handling
5. **Scalable**: Supports multiple offers and complex product configurations
6. **Customizable**: Multiple themes and configuration options

## Routes

- `/post-purchase/:orderId` - Main post-purchase offer page
- `/thankyou/:orderId` - Thank you page after completion

## Dependencies

- React 18+
- React Router DOM
- React Hot Toast
- Lucide React (icons)
- TagadaPay Plugin SDK
- Tailwind CSS
