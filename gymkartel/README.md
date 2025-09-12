# Gymkartel Plugin

A React/TypeScript e-commerce landing page plugin for Tagada, featuring 3D sculpting leggings with dynamic product showcase and real store integration.

## 🚀 Features

- **Real Store Integration** - Connect to actual Tagada store data with multiple products
- **Dynamic Product Options** - Automatically load products from store with variants
- **Complete Checkout Flow** - Seamless integration with Tagada checkout system
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Customizable Content** - Extensive configuration options for branding and content
- **Multi-language Support** - Localized content management system
- **✅ Production Ready** - Successfully deployed with working store integration

## 📦 Installation & Deployment

### Prerequisites

- Node.js 18+
- npm or yarn
- Tagada CLI installed
- Access to Tagada store with product data

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd gymkartel

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start on `http://localhost:3004` (or next available port).

### Plugin Deployment

```bash
# Build the plugin
npm run build

# Deploy to Tagada (using Tagada CLI)
tagada deploy
```

### ✅ Deployment Status

**Current Status**: Successfully deployed and working in production

**Latest Build (2025-09-12)**:

- Bundle: 1.45MB (334.76KB gzipped)
- CSS: 99.25KB (15.79KB gzipped)
- TypeScript: 0 errors
- Build time: 5.35 seconds

**Verified Working Features**:

- ✅ Store authentication and session management
- ✅ Real product loading (4 colors: Pink, Light Blue, Beige, Black)
- ✅ Product images loaded from actual store variants
- ✅ Dynamic pricing and variant selection
- ✅ Complete checkout flow integration
- ✅ **Dynamic branding colors** (user-configurable primary/secondary colors)
- ✅ **Full text customization system** (every text element configurable)
- ✅ **Showcase configuration** demonstrating all customization options
- ✅ Responsive design and image optimization
- ✅ Multi-language content support

## 🛠 Configuration

### Store Configuration

Configure your store details in a `.tgd.json` file:

```json
{
  "configName": "production-store",
  "storeConfig": {
    "storeId": "store_your_store_id",
    "accountId": "acc_your_account_id"
  },
  "product": {
    "productMapping": [
      { "productId": "product_id_1" },
      { "productId": "product_id_2" },
      { "productId": "product_id_3" },
      { "productId": "product_id_4" }
    ]
  }
}
```

### Branding Configuration

```json
{
  "branding": {
    "companyName": "Your Company",
    "primaryColor": "#e11d48",
    "secondaryColor": "#9333ea",
    "logoHeight": 40
  }
}
```

### Content Customization

```json
{
  "content": {
    "sections": {
      "en": {
        "heroTitle": "Transform Your Body with 3D Sculpting Technology",
        "heroDescription": "Revolutionary leggings that shape and contour",
        "announcementText": "🔥 LIMITED TIME: Up to 62% OFF + FREE Shipping!"
      }
    },
    "features": [
      {
        "iconName": "zap",
        "title": "3D SCULPTING TECHNOLOGY",
        "description": "Advanced fabric technology that shapes and contours"
      }
    ]
  }
}
```

## 🏗 Project Structure

```
gymkartel/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   └── Landing.tsx          # Main landing page
│   │   ├── ProductCard.tsx          # Product showcase
│   │   ├── ui/                      # UI components
│   │   └── sticky-add-to-cart/      # Cart component
│   ├── hooks/
│   │   ├── use-controller.tsx       # Main business logic
│   │   ├── useStoreData.ts         # Store integration
│   │   └── useConfig.ts            # Configuration management
│   ├── contexts/
│   │   └── ConfigProvider.tsx       # Context providers
│   ├── types/
│   │   └── config.ts               # TypeScript schemas
│   └── globals.css                  # Global styles
├── config/                          # Configuration files
├── public/                          # Static assets
└── package.json
```

## 🔧 Key Technologies

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Tagada Plugin SDK** for store integration
- **Zod** for configuration validation
- **Lucide React** for icons

## 📋 Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 🧪 Testing Configurations

### Development Testing

Test different configurations via URL parameters:

```bash
http://localhost:3004/?config=production-store
http://localhost:3004/?config=showcase-customization
```

### Configuration Files

- `config/default.tgd.json` - Default working configuration with real store data
- `config/production-store.tgd.json` - Production store integration
- `config/showcase-customization.tgd.json` - StyleForge showcase demonstrating all customization options

## 🔗 Store Integration

### Real Store Data

The plugin integrates with actual Tagada store data:

- **Product Loading** - Fetches real products with variants and pricing
- **Image Management** - Uses product images from store data
- **Checkout Flow** - Direct integration with Tagada checkout system
- **Size/Variant Selection** - Dynamic options based on store inventory

### Supported Store Structure

```
Store
├── Product 1 (e.g., Pink Leggings)
│   ├── Variant S
│   ├── Variant M
│   └── Variant L
├── Product 2 (e.g., Blue Leggings)
│   └── [Size variants]
└── [Additional products...]
```

## 🎨 Customization Features

### 🎯 **Complete Customization System**

This plugin features a comprehensive customization system where **every element** can be configured without touching code.

### **Dynamic Branding Colors**

- **Primary/Secondary Colors**: Set `primaryColor` and `secondaryColor` in branding config
- **Auto-Applied**: Colors automatically applied to buttons, headers, accents, borders
- **Example**: Set `"primaryColor": "#7c3aed"` to make entire interface purple instead of default red

### **Complete Text Customization**

- **All Text Configurable**: Hero titles, descriptions, buttons, sections, footer content
- **Multi-language Support**: English, French, Spanish sections
- **Schema Validated**: All text keys validated through TypeScript/Zod schemas

### **Real Store Integration**

- **Product Images**: Automatically uses actual store variant images
- **Dynamic Products**: Loads real products with variants and pricing
- **Live Checkout**: Direct integration with Tagada checkout system

### **Showcase Configuration**

Try the StyleForge showcase config to see all customization options:

```bash
http://localhost:3002/?config=showcase-customization
```

**What's Customizable:**

- Hero sections, product descriptions, CTA text
- Company branding, colors, logos
- Feature lists, guarantees, testimonials
- Footer content, contact information
- Button text, announcement messages
- Multi-language content for global markets

## 🐛 Troubleshooting

### Common Issues

**Blank Page**

- Check browser console for JavaScript errors
- Verify all required functions are defined
- Ensure config file is valid JSON

**Products Not Loading**

- Verify store ID and product IDs are correct
- Check network tab for failed API requests
- Ensure Tagada session is authenticated

**Checkout Failures**

- Verify lineItems structure (variantId, priceId, quantity only)
- Check store ID configuration
- Ensure variants have valid price data

**Custom Text Not Showing**

- Check that custom keys are added to `ContentSectionsSchema` in `src/types/config.ts`
- Config validation strips out any keys not defined in the schema
- See CLAUDE.md for detailed troubleshooting steps

**Colors Still Red Despite Custom Config**

- Ensure you're using the correct config via `?config=your-config-name`
- Check that `primaryColor` and `secondaryColor` are set in branding section
- Clear browser cache if colors aren't updating

### Debug Mode

Enable detailed logging by checking browser console for:

- `[useStoreData]` - Store data loading
- `[Checkout]` - Checkout process
- `[Landing]` - Component rendering

## 📄 License

[Add your license information here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:

- Check the troubleshooting section above
- Review `CLAUDE.md` for detailed technical documentation
- Contact the development team

---

**Built with ❤️ for Tagada Platform**
