# BOGO Checkout Plugin

A production-ready Buy One Get One (BOGO) plugin for TagadaPay with multiple bundle options and subscription support.

## Features

✅ **3 Bundle Options**: Display 1-pack, 2-pack, and 3-pack variants  
✅ **Subscribe & Save**: Toggle between one-time and recurring pricing  
✅ **Dynamic Pricing**: Real-time price updates when switching bundles  
✅ **Order Bumps**: Optional upsell offers  
✅ **Auto-validation**: Smart checkout session initialization  
✅ **Mobile Optimized**: Responsive design with sticky CTAs  
✅ **Production Ready**: Debug logs wrapped for production builds

## Configuration

### Static Resources

Configure your product variants in the Funnel Builder (CRM):

- `variant1`: One item pack (Regular)
- `variant2`: Two items pack (Popular)
- `variant3`: Three items pack (Best Value) - **Default**
- `orderBump`: Optional upsell offer

Or use local configuration for development:

```json
// config/resources.static.json
{
  "variant1": { "id": "variant_79d799783df1" },
  "variant2": { "id": "variant_dfc884f7912f" },
  "variant3": { "id": "variant_6535d90a93d2" },
  "orderBump": { "id": "up_sell_ob_offer_6fbaec5b49a4" }
}
```

### Environment Variables

```env
# Development (.env.local)
VITE_TAGADA_STORE_ID=your_store_id
VITE_TAGADA_ACCOUNT_ID=your_account_id
VITE_TAGADA_ENVIRONMENT=local
```

## Installation

### Prerequisites

- Node.js 18+ and pnpm
- TagadaPay Plugin SDK v3.0.0+
- Access to TagadaPay CRM

### Setup

```bash
# Install dependencies
pnpm install

# Link local SDK (for development)
pnpm run sdk:link

# Start development server
pnpm run dev
```

## Development

### Local Development

```bash
# Start dev server (port 5173)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Debug Mode

Debug logging is automatically enabled in development:
- All `console.log` statements wrapped in `isDev` checks
- Full context debugging available
- No performance impact in production

## Deployment

### Build for Production

```bash
# Create optimized production build
pnpm run build

# Output: dist/ folder
```

### Deploy to TagadaPay

```bash
# Deploy using TagadaPay CLI
cd /Users/lolo/projects/tagadapay
pnpm cli deploy mount --config ../plugins/bogo/plugin.manifest.json

# Follow interactive prompts to select:
# - Target store
# - Deployment environment (staging/production)
# - Confirm deployment
```

### Verify Deployment

1. **Check Funnel Builder**:
   - Open your funnel in TagadaPay CRM
   - Verify static resources (variant1, variant2, variant3) are configured
   - Ensure variants have both one-time and recurring prices

2. **Test Checkout**:
   - Visit your funnel's checkout URL
   - Verify all 3 bundle options display
   - Test Subscribe & Save toggle
   - Test variant switching
   - Complete a test payment

3. **Monitor Console** (production):
   - Only errors and warnings should appear
   - No debug logs in production builds

## Plugin Behavior

### Initialization Logic

#### New Sessions (no `checkoutToken`)
- Automatically initializes with `variant3` (Best Value - 3-pack)
- Waits for funnel context to load static resources
- Creates checkout session with default variant

#### Existing Sessions (`checkoutToken` present)
- Validates current variant against configured variants
- Auto-updates to `variant3` if invalid variant detected
- Preserves valid existing selections

### Bundle Selection

- **Instant UI Update**: Immediate visual feedback
- **Background Sync**: Updates checkout session without blocking
- **Optimistic UI**: Shows selection immediately, reverts on error
- **Price Toggle**: Live price updates for subscription changes

## Troubleshooting

### No Variants Displayed

**Symptom**: Empty checkout or "No variants found" error

**Solution**:
1. Check static resources in Funnel Builder
2. Verify variant IDs match product catalog
3. Ensure variants have active prices
4. Check browser console for warnings

### Variant Not Updating

**Symptom**: Clicking bundle doesn't change selection

**Solution**:
1. Check network tab for failed API calls
2. Verify `updateLineItems` permission
3. Check checkout session is active
4. Review error logs in console

### Prices Not Showing

**Symptom**: "$0.00" or blank prices

**Solution**:
1. Ensure variants have both price types (one-time & recurring)
2. Check currency settings match store config
3. Verify `includePrices: true` in product fetch
4. Check price `recurring` boolean field

## Architecture

```
bogo/
├── src/
│   ├── components/
│   │   ├── CheckoutPage.tsx    # Main checkout logic
│   │   ├── OrderBump.tsx       # Upsell component
│   │   └── Providers.tsx       # SDK provider setup
│   ├── types/
│   │   └── plugin-config.ts    # TypeScript types
│   └── App.tsx                 # Routes & navigation
├── config/
│   ├── resources.static.json   # Local variant config
│   └── schema.json             # Plugin schema
├── plugin.manifest.json        # Plugin metadata
└── package.json                # Dependencies
```

## Best Practices

### Performance
- ✅ Debug logs wrapped in dev-only checks
- ✅ Optimistic UI for instant feedback
- ✅ Background API calls don't block UI
- ✅ Lazy loading for non-critical components

### Error Handling
- ✅ Graceful fallbacks for missing data
- ✅ User-friendly error messages
- ✅ Automatic rollback on failures
- ✅ Console errors preserved in production

### User Experience
- ✅ Instant visual feedback on actions
- ✅ Clear price display (per unit + total)
- ✅ Mobile-first responsive design
- ✅ Accessible form validation

## API Integration

### Required SDK Hooks

- `useFunnel()`: Funnel session management
- `useCheckout()`: Checkout session operations
- `useProducts()`: Product data fetching
- `usePayment()`: Payment processing
- `usePluginConfig()`: Plugin configuration

### Key Methods

```typescript
// Initialize new checkout
await init({
  storeId,
  lineItems: [{ variantId, quantity: 1 }]
});

// Update line items
await updateLineItems([
  { variantId, priceId, quantity }
]);

// Process payment
await processCardPayment({
  checkoutSessionId,
  paymentData: { ... }
});
```

## Support

- **Documentation**: https://docs.tagadapay.com
- **API Reference**: https://api.tagadapay.com/docs
- **Plugin SDK**: https://github.com/tagadapay/plugin-sdk

## License

Proprietary - TagadaPay Internal Use Only

---

**Version**: 3.0.0  
**Last Updated**: December 3, 2025  
**Maintainer**: TagadaPay Development Team


