# Three-Step Funnel V2 Plugin

<div align="center">
  <img src="https://tagadapay.com/logo-landing.png" alt="TagadaPay Logo" width="200" />
</div>

A high-converting three-step funnel plugin built with React 19, TypeScript, and the TagadaPay V2 SDK. This professional template provides a complete sales funnel optimized for nutra products with embedded checkout functionality.

## 🌐 Live Demo

**Experience the full funnel**: [https://three-step-funnel--store_b9dd071b3e3a.cdn.tagadapay.com/](https://three-step-funnel--store_b9dd071b3e3a.cdn.tagadapay.com/)

> 🎯 **Try the complete checkout flow** with test card: `4242 4242 4242 4242`, expiry: `12/28`, CVC: `123`

## 🚀 Features

### **Complete Funnel Experience**
- **Step 1 (Discovery)**: Product introduction with benefits and trust indicators
- **Step 2 (Social Proof)**: Testimonials, ingredients, and value proposition
- **Step 3 (Checkout)**: Full checkout with payment processing and order confirmation
- **Thank You Page**: Order confirmation with real order data display

### **Advanced Checkout Features**
- ✅ **Smart Card Formatting**: Auto-format card numbers with field progression
- ✅ **Google Autocomplete**: Address autocomplete with country-specific validation
- ✅ **ISO Address Mapping**: Proper state/province handling by country
- ✅ **Real-time Validation**: Form validation with Zod and React Hook Form
- ✅ **Checkout Session Management**: Automatic session initialization
- ✅ **Payment Processing**: BasisTheory integration with 3DS support
- ✅ **Order Tracking**: Real order data display on thank you page

### **Modern Development Stack**
- ✅ **React 19**: Latest React with modern patterns
- ✅ **TypeScript**: Full type safety throughout
- ✅ **TagadaPay SDK v2.2.0**: Latest SDK with advanced features
- ✅ **Tailwind CSS + shadcn/ui**: Modern, responsive design system
- ✅ **Vite**: Fast development and build tooling
- ✅ **Mobile-First**: Optimized for all devices

## 📁 Project Structure

```
three-step-funnel/
├── plugin.manifest.json    # Plugin metadata & routing configuration
├── .local.json             # Local development context
├── config/
│   └── default.tgd.json    # Plugin configuration (branding, products, funnel)
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Step1.tsx      # Discovery/Introduction step
│   │   ├── Step2.tsx      # Social proof & testimonials step  
│   │   ├── Step3.tsx      # Complete checkout form
│   │   └── ThankYouPage.tsx # Order confirmation page
│   ├── App.tsx            # Main application with routing
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles and Tailwind imports
├── dist/                  # Built plugin files
└── package.json           # Dependencies (includes CLI & SDK v2.2.0)
```

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the plugin
cp -r plugins/v1/three-step-funnel your-funnel-name
cd your-funnel-name

# Install dependencies
pnpm install
# or npm install
```

### 2. Configure Your Plugin

Edit `config/default.tgd.json` with your store details:

```json
{
  "configName": "default",
  "branding": {
    "logoUrl": "https://your-domain.com/logo.png",
    "companyName": "Your Company Name",
    "supportEmail": "support@yourcompany.com",
    "websiteUrl": "https://yourcompany.com",
    "primaryColor": "#16a34a",
    "secondaryColor": "#15803d",
    "accentColor": "#22c55e"
  },
  "products": {
    "productId": "product_YOUR_PRODUCT_ID",
    "variantId": "variant_YOUR_VARIANT_ID",
    "name": "Your Product Name",
    "shortName": "Product",
    "description": "Your product description",
    "benefits": [
      "Benefit 1",
      "Benefit 2", 
      "Benefit 3"
    ],
    "ingredients": [
      "Ingredient 1",
      "Ingredient 2"
    ],
    "imageUrl": "https://your-domain.com/product-image.jpg"
  },
  "funnel": {
    "step1": {
      "title": "Discover Your Solution",
      "subtitle": "Transform your life today",
      "ctaText": "Yes, I Want This!"
    },
    "step2": {
      "title": "Why Choose Us?",
      "subtitle": "See what makes us different",
      "ctaText": "Get My Bottle Now"
    },
    "step3": {
      "title": "Secure Your Order",
      "subtitle": "Complete your purchase securely",
      "guarantee": "60-Day Money-Back Guarantee"
    }
  }
}
```

### 3. Set Up Local Development

Create `.local.json` for local development:

```json
{
  "storeId": "store_YOUR_STORE_ID",
  "accountId": "acc_YOUR_ACCOUNT_ID",
  "customerId": "cus_YOUR_CUSTOMER_ID",
  "sessionId": "session_YOUR_SESSION_ID"
}
```

### 4. Optional: Google Maps Integration

For enhanced address autocomplete, add your Google Maps API key:

```bash
# Create .env.local file
echo "VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key" > .env.local
```

## 🎯 Funnel Flow

### **Step 1: Discovery** (`/`)
- **Product Introduction**: Hero section with product benefits
- **Trust Indicators**: FDA approved, GMP certified badges
- **Social Proof**: Customer reviews and ratings
- **Clear CTA**: "Yes, I Want Pain-Free Joints!" button

### **Step 2: Social Proof** (`/step2`)
- **Scientific Backing**: Clinically proven ingredients list
- **Customer Testimonials**: Real customer reviews with ratings
- **Trust Indicators**: Certifications and guarantees
- **Urgency**: Limited time offers and social proof counters

### **Step 3: Checkout** (`/step3`)
- **Product Summary**: Real-time product display with pricing
- **Smart Forms**: Auto-formatting card inputs with field progression
- **Address Validation**: Google Autocomplete with ISO mapping
- **Payment Processing**: Secure BasisTheory integration with 3DS
- **Order Summary**: Real-time pricing with discounts

### **Thank You Page** (`/thankyou/:orderId`)
- **Order Confirmation**: Real order data display
- **Order Details**: Product info, pricing, and payment status
- **Next Steps**: Shipping timeline and tracking information
- **Support Information**: Contact details and guarantee info

## 🎨 Customization

### **Configuration-Driven Design**
All content is managed through `config/default.tgd.json`:

```json
{
  "branding": {
    "primaryColor": "#16a34a",    // Main theme color
    "companyName": "Your Brand",  // Company branding
    "supportEmail": "support@..."  // Contact information
  },
  "products": {
    "name": "Product Name",       // Product title
    "benefits": [...],            // Feature list
    "ingredients": [...],         // Ingredient list
    "imageUrl": "..."            // Product image
  },
  "funnel": {
    "step1": { "title": "...", "ctaText": "..." },
    "step2": { "testimonials": [...] },
    "step3": { "guarantee": "..." }
  }
}
```

### **Styling with Tailwind + shadcn/ui**
- **Modern Components**: Pre-built shadcn/ui components
- **Responsive Design**: Mobile-first approach
- **Theme Customization**: Easy color and typography changes
- **Consistent UI**: Professional design system

### **Advanced Features**
- ✅ **Real-time Product Data**: API-driven product information
- ✅ **Smart Checkout**: Auto-session initialization
- ✅ **Address Intelligence**: Country-specific validation
- ✅ **Payment Security**: BasisTheory + 3DS integration
- ✅ **Order Tracking**: Real order data display

## 🚦 Development

```bash
# Start development server (with hot reload)
pnpm dev

# Fast development mode (force reload)
pnpm run dev:fast

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Lint code
pnpm run lint
```

## 📦 Deployment

### **Interactive Deployment (Recommended)**

```bash
# Interactive deployment with visual interface
npx tgdcli int

# Interactive deploy with configuration selection
npx tgdcli ideploy
```

### **Command Line Deployment**

```bash
# Deploy to development environment
pnpm run deploy:dev

# Deploy to staging environment  
pnpm run deploy:staging

# Deploy to production environment
pnpm run deploy:prod

# Custom deployment with specific config
npx tgdcli deploy --config config/custom.json --alias my-funnel
```

### **Domain Mounting**

```bash
# Mount to custom domain (production)
npx tgdcli mount-domain deployment_id your-domain.com

# Interactive domain mounting
npx tgdcli imount
```

## 🔧 Technical Details

### **Core Dependencies**

**Framework & Routing:**
- **React 19** - Latest React with modern patterns
- **React Router DOM 6** - Client-side routing with nested routes
- **TypeScript 5** - Full type safety

**TagadaPay Integration:**
- **@tagadapay/plugin-sdk v2.2.0** - Payment processing and checkout management
- **@tagadapay/plugin-cli v2.0.19** - Deployment and management tools

**Forms & Validation:**
- **React Hook Form 7** - Performant form management
- **Zod 3** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation integration

**UI & Styling:**
- **Tailwind CSS 3** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications

**Payment & Security:**
- **@basis-theory/basis-theory-react** - Secure card tokenization
- **@basis-theory/web-threeds** - 3D Secure authentication

### **Performance Metrics**

- ✅ **Bundle Size**: ~180KB gzipped (optimized)
- ✅ **First Load**: <1s on 3G
- ✅ **Lighthouse Score**: 95+ Performance, 100 Accessibility
- ✅ **Mobile Optimized**: Touch-friendly interactions
- ✅ **SEO Ready**: Proper meta tags and structured data

### **Browser Support**

- ✅ **Chrome 90+**
- ✅ **Firefox 88+** 
- ✅ **Safari 14+**
- ✅ **Edge 90+**
- ✅ **Mobile Safari & Chrome**

## 🎯 Best Practices

### **Conversion Optimization**

1. **Step 1 (Discovery)**: 
   - Focus on pain points and emotional benefits
   - Use strong social proof (reviews, ratings)
   - Clear value proposition with trust indicators

2. **Step 2 (Social Proof)**:
   - Scientific backing with ingredient lists
   - Real customer testimonials with photos
   - Urgency elements (limited time, social proof counters)

3. **Step 3 (Checkout)**:
   - Minimize form friction with smart formatting
   - Real-time validation and error handling
   - Clear pricing with no hidden fees

### **Security & Compliance**

- ✅ **PCI Compliance**: BasisTheory handles card tokenization
- ✅ **3D Secure**: Built-in fraud protection
- ✅ **HTTPS Required**: SSL encryption for all traffic
- ✅ **Data Protection**: No sensitive data stored locally

### **Performance Optimization**

- ✅ **Code Splitting**: Lazy loading for optimal performance
- ✅ **Image Optimization**: WebP format with fallbacks
- ✅ **Bundle Analysis**: Tree shaking and dead code elimination
- ✅ **Caching Strategy**: Proper cache headers for static assets

## 🧪 Testing

### **Test Payment Credentials**

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

### **Development Testing**

```bash
# Test the complete funnel flow
pnpm dev

# Test production build locally
pnpm run build && pnpm run preview

# Test with different configurations
cp config/staging.json config/default.tgd.json && pnpm dev
```

## 🐛 Troubleshooting

### **Common Issues**

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
pnpm install
pnpm run build
```

**Payment Issues:**
- ✅ Verify `storeId` and `accountId` in `.local.json`
- ✅ Check product `variantId` exists in your store
- ✅ Ensure test mode is enabled for development

**Configuration Issues:**
- ✅ Validate JSON syntax in `config/default.tgd.json`
- ✅ Check all required fields are present
- ✅ Verify image URLs are accessible

### **Getting Help**

- 📖 **[TagadaPay Documentation](https://docs.tagadapay.com)**
- 🛠️ **[Plugin SDK Guide](https://www.npmjs.com/package/@tagadapay/plugin-sdk)**
- 💬 **Discord**: [discord.gg/tagadapay](https://discord.gg/tagadapay)
- 📧 **Support**: support@tagadapay.com

## 📊 Analytics & Tracking

### **Built-in Analytics**
- ✅ **Conversion Tracking**: Step completion rates
- ✅ **Payment Analytics**: Success/failure rates  
- ✅ **User Journey**: Funnel drop-off analysis
- ✅ **Performance Metrics**: Load times and interactions

### **Custom Tracking**
```typescript
// Add custom tracking events
import { usePluginConfig } from '@tagadapay/plugin-sdk/react';

function trackCustomEvent(eventName: string, properties: any) {
  // Your analytics implementation
  gtag('event', eventName, properties);
}
```

## 🚀 What's Next?

### **Advanced Features to Add**
- 🔄 **A/B Testing**: Multiple funnel variants
- 📱 **Progressive Web App**: Offline functionality
- 🎯 **Personalization**: Dynamic content based on user data
- 📧 **Email Integration**: Abandoned cart recovery
- 🛒 **Upsells/Cross-sells**: Order bumps and related products

### **Scaling Your Funnel**
1. **Multi-Product Support**: Handle product catalogs
2. **Internationalization**: Multi-language support
3. **Advanced Analytics**: Heat maps and user recordings
4. **Marketing Integration**: CRM and email automation

## 📄 License

This plugin is provided under the TagadaPay Plugin License. Customize and deploy as needed for your business.

---

**Built with TagadaPay Plugin SDK v2.2.0 & CLI v2.0.19**

**Ready to convert? Deploy your funnel today! 🚀** 