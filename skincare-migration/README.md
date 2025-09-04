# Tagada Skincare Store Plugin

A fully configurable, production-ready skincare store built with React 19, Vite 7, and the Tagada SDK. Transform your store's appearance, content, and functionality entirely through configuration files - no code changes required.

![Store Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-7-646cff)

## ✨ Features

### 🎨 **Complete Customization**
- **Brand Identity**: Logo, colors, company name with flexible sizing
- **Content Management**: All text content configurable with multi-language support
- **Product Control**: Choose which products to display and feature
- **Features Section**: Customize feature items with dual-icon system (image or vector) and CTA button
- **Navigation Menu**: Configure top navigation with internal/external links
- **Footer Layout**: Custom footer sections, copyright message, and social media links
- **BOGO Promotions**: Toggle Buy-2-Get-1-FREE promotions on/off across entire site
- **Social Media**: Add any social platform links with fully customizable icons (only configured platforms display)
- **Multi-language**: English/Spanish support (extensible to any language)

### 🛒 **E-commerce Essentials**
- **Real Tagada Integration**: Connected to live product data from store_d2b5940d2555
- **Smart Cart System**: Persistent cart with stable UUID tokens for checkout session tracking
- **BOGO Promotions**: Buy 2 Get 1 FREE logic built-in
- **Mobile Responsive**: Perfect experience on all devices
- **Accessibility**: WCAG 2.1 compliant components with keyboard navigation

### ⚡ **Developer Experience**
- **Type Safe**: Full TypeScript coverage with Zod runtime validation
- **Hot Reload**: Real-time config updates in development
- **Modern Stack**: React 19, Vite 7, Tailwind CSS 4
- **Zero Config**: Works out of the box with example configurations

## 🎯 Project Overview

This plugin demonstrates a complete e-commerce storefront that:

- **Displays real products** from a Tagada store via SDK integration
- **Manages shopping cart** entirely on the client-side with localStorage persistence
- **Handles checkout flow** by redirecting to Tagada's native checkout system
- **Supports full customization** through declarative JSON configuration files
- **Implements modern web standards** with React 19, TypeScript, and Vite 7

### Key Features

✅ **Complete Migration**: Successfully converted from Next.js to Vite + React  
✅ **Real Store Integration**: Connected to live Tagada store with 5 actual products  
✅ **Persistent Cart**: Cart survives page refreshes using localStorage with stable tokens  
✅ **Native Checkout**: Seamless integration with Tagada's checkout system  
✅ **Full Customization**: Theme, content, and products configurable via JSON files  
✅ **Multi-language Support**: Built-in internationalization (i18n) system  
✅ **Accessibility**: WCAG 2.1 compliant with proper ARIA labels and keyboard navigation  
✅ **Production Ready**: Clean builds with no console errors or warnings

## 🚀 Quick Start Guide

Get your skincare plugin running in under 5 minutes with this step-by-step guide.

### Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **npm** package manager (included with Node.js)
- [ ] **Git** for version control
- [ ] **VS Code** (recommended) with Tailwind CSS extension
- [ ] **Modern browser** (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Navigate to Project**

   ```bash
   cd skincare-migration
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   This installs all required packages including React 19, Vite 7, Tailwind CSS, and the Tagada SDK.

3. **Start Development Server**

   ```bash
   npm run dev
   ```

   The plugin will be available at `http://localhost:5173`

4. **Verify Everything Works**
   - [ ] Page loads without errors
   - [ ] Products display correctly
   - [ ] Cart opens and closes
   - [ ] Configuration switcher (⚙️) visible in top-left
   - [ ] Browser console shows no errors

### First Configuration Test

Test the configuration system immediately:

1. **Switch Configurations**

   - Visit: `http://localhost:5173/?config=skincare-demo`
   - Notice the theme change (different colors)
   - Try: `http://localhost:5173/?config=default`

2. **Test Cart Functionality**

   - Add a product to cart
   - Refresh the page → Cart should persist
   - Open browser DevTools → Check for cart logs in console

3. **Test Checkout Flow**
   - Add items to cart
   - Click "Checkout" button
   - Should redirect to Tagada checkout page
   - Cancel and return → Cart should remain intact

### Common First-Time Issues

#### Port Already in Use

```bash
# If port 5173 is busy
npm run dev -- --port 3000
```

#### Dependencies Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables

Create `.env` file if needed:

```bash
# .env
VITE_CONFIG_NAME=default
VITE_DEBUG=true
```

### Next Steps After Installation

1. **Explore Configurations**

   - Check `config/default.tgd.json` and `config/skincare-demo.tgd.json`
   - Understand the configuration schema
   - Try modifying colors or content

2. **Understand the Codebase**

   - Review `src/` directory structure
   - Check `src/hooks/` for cart and checkout logic
   - Explore `src/components/` for UI components

3. **Test Production Build**

   ```bash
   npm run build
   npm run preview
   ```

4. **Read Full Documentation**
   - Continue with the sections below for complete feature explanations
   - Check `SPECIFICATIONS.md` for compliance details
   - Review `CLAUDE.md` for migration history

### Development Workflow

Your typical development workflow should be:

1. **Start Dev Server**: `npm run dev`
2. **Open Browser**: Navigate to `http://localhost:5173`
3. **Open DevTools**: Keep console open for debugging
4. **Make Changes**: Edit configuration or code
5. **Test Changes**: Verify in browser immediately
6. **Switch Configs**: Use URL parameters to test different configurations
7. **Test Cart**: Verify cart persistence across refreshes

### Getting Help

If you encounter issues:

1. **Check Browser Console**: Look for error messages
2. **Verify File Paths**: Ensure all imports are correct
3. **Test Different Configs**: Try both `default` and `skincare-demo`
4. **Check Network Tab**: Verify Tagada API calls are working
5. **Review Logs**: Cart and SDK operations are logged to console

---

Now that you have the plugin running, let's dive into the detailed features and architecture.

## 🏪 Store Integration & Real Data

This plugin connects to a live Tagada store and displays real product data:

### Store Details

- **Store ID**: `store_d2b5940d2555`
- **Account**: Tagada Demo (`acc_47a93cc912de`)
- **Environment**: Production Tagada API
- **Products**: 5 real skincare products with actual pricing and images
- **Currency**: USD (United States Dollar)

### How Product Integration Works

1. **SDK Connection**: The plugin uses `@tagadapay/plugin-sdk/react` to connect to Tagada's API
2. **Authentication**: Automatic session initialization with the Tagada backend
3. **Product Fetching**: Real-time product data via `useProducts()` hook with variants and pricing
4. **Image Handling**: Product images are served directly from Tagada's CDN
5. **Price Extraction**: Prices are extracted from `currencyOptions.USD.amount` (in cents)

### Product Data Structure

Each product includes:

- **Basic Info**: Name, description, unique product ID
- **Variants**: Different sizes/types with their own IDs and images
- **Pricing**: Real USD prices from Tagada's pricing system
- **Images**: High-quality product photos hosted on Tagada's infrastructure

### Authentication & Session Management

The plugin handles Tagada authentication automatically:

- Sessions are initialized on app startup
- Authentication tokens are managed by the SDK
- Products only load after successful authentication
- Error handling for network issues or auth failures

## ⚙️ Configuration System (The Heart of Customization)

The plugin's configuration system is designed for maximum flexibility and future LLM integration. Every aspect of the store can be customized through declarative JSON files.

### Configuration Philosophy

- **Declarative**: Everything is defined in JSON files, no code changes needed
- **Type-Safe**: Full TypeScript support with runtime validation using Zod schemas
- **Hot-Swappable**: Switch configurations instantly during development
- **LLM-Ready**: Structured for automatic generation by AI systems
- **Multi-Language**: Built-in internationalization support

### Available Configurations

The plugin includes two example configurations:

1. **`config/default.tgd.json`** - Main store configuration with red/purple theme
2. **`config/skincare-demo.tgd.json`** - Alternative demo configuration

## 📋 Complete Configuration Reference

Every aspect of your store can be customized through configuration files. Here's the complete schema with all available options:

### Configuration Fields Reference

#### Core Configuration
```json
{
  "configName": "my-custom-store"  // Required: Unique identifier for this config
}
```

#### Branding & Visual Identity
```json
{
  "branding": {
    "companyName": "My Skincare Brand",     // Required: Company/store name
    "logoText": "My Brand",                 // Optional: Text logo fallback
    "primaryColor": "#f6413b",              // Required: Primary brand color (hex)
    "secondaryColor": "#763bf6",            // Required: Secondary brand color (hex)
    "logoUrl": "/images/my-logo.png",       // Optional: Logo image URL
    "logoSize": "xl",                       // Optional: xs|sm|md|lg|xl (preset sizes)
    "logoHeight": 44                        // Optional: Custom logo height (16-200px)
  }
}
```

**Logo Sizing Options:**
- **Preset Sizes**: `"logoSize": "xs|sm|md|lg|xl"` (20px to 48px)
  - `xs`: 20px, `sm`: 24px, `md`: 32px, `lg`: 40px, `xl`: 48px
- **Custom Height**: `"logoHeight": 44` (16-200px range)
- **Priority**: Custom height overrides preset size if both are provided

#### Social Media Configuration
```json
{
  "content": {
    "socialLinks": [
      {
        "platform": "facebook",                          // Any platform name you want
        "url": "https://facebook.com/mybrand",
        "label": "Like us on Facebook",                   // Optional custom label
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/174/174848.png"  // Required icon URL
      },
      {
        "platform": "discord",                          // Custom platform name
        "url": "https://discord.gg/mybrand", 
        "label": "Join our Discord",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/5968/5968756.png"
      },
      {
        "platform": "whatsapp",                         // Any platform name with any icon
        "url": "https://wa.me/1234567890",
        "label": "WhatsApp us",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/174/174879.png"
      }
    ]
  }
}
```

**Social Media Configuration System:**
- **Icon URL Required**: Every social link must include an `iconUrl` field to be displayed
- **Configuration-Only Display**: Only platforms in your config file will appear - no defaults
- **Any Platform Name**: Use any string as platform name (facebook, x, discord, telegram, signal, etc.)
- **Complete Icon Control**: All icons come from your URLs - no built-in icons
- **Flexible URLs**: Support any social media URL format and domain
- **Dynamic Display**: Add/remove platforms by editing config - no code changes needed
- **Brand Consistency**: Use matching icon sets for cohesive design
- **Performance Optimized**: No unused icon libraries - smaller bundle size
- **Accessibility**: Custom labels for screen readers and hover tooltips

**Popular Icon Sources:**
- **Flaticon**: https://www.flaticon.com/ (used in examples)
- **Font Awesome**: https://fontawesome.com/
- **Simple Icons**: https://simpleicons.org/
- **Custom Icons**: Upload your own branded social media icons

#### Footer Menu Configuration
```json
{
  "content": {
    "footerSections": [
      {
        "title": "Shop",                                   // Section title
        "links": [
          { "label": "Face Care", "url": "/face-care" },  // Links in this section
          { "label": "Body Care", "url": "/body-care" },
          { "label": "Serums", "url": "/serums" }
        ]
      },
      {
        "title": "Support", 
        "links": [
          { "label": "Help Center", "url": "/help" },
          { "label": "Live Chat", "url": "/chat" },
          { "label": "Contact", "url": "/contact" }
        ]
      },
      {
        "title": "Company",
        "links": [
          { "label": "About Us", "url": "/about" },
          { "label": "Careers", "url": "/careers" },
          { "label": "Press", "url": "/press" }
        ]
      }
    ],
    "footerLinks": [                                      // Optional legacy links
      { "label": "Privacy Policy", "url": "/privacy" },
      { "label": "Terms of Service", "url": "/terms" }
    ]
  }
}
```

**Footer Menu System:**
- **Complete Control**: Define any number of footer sections with custom titles
- **Flexible Links**: Each section can have unlimited links with custom labels and URLs
- **Professional Layout**: Sections display in responsive grid layout
- **Legacy Support**: `footerLinks` still supported for simple legal links
- **No Defaults**: Only configured sections will appear - complete customization
- **Easy Updates**: Add/remove sections and links via configuration only

#### Navigation Menu Configuration
```json
{
  "content": {
    "navigationLinks": [
      {
        "label": "Home",
        "url": "/"
      },
      {
        "label": "Products", 
        "url": "/products"
      },
      {
        "label": "About",
        "url": "/about"
      },
      {
        "label": "Blog",
        "url": "/blog"
      },
      {
        "label": "Community",
        "url": "https://discord.gg/mybrand",
        "external": true
      }
    ]
  }
}
```

**Navigation System:**
- **Complete Control**: Define exactly which links appear in the top navigation
- **Internal & External Links**: Support both site pages (`/about`) and external URLs (`https://...`)
- **Active State Detection**: Automatic highlighting of current page
- **Mobile Responsive**: Same links work in mobile hamburger menu
- **No Default Links**: Only configured navigation items will show
- **External Link Handling**: Links with `"external": true` open in new tabs
- **Custom Labels**: Use any text for navigation labels

#### Features Section Configuration
```json
{
  "content": {
    "features": [
      {
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/1828/1828506.png", // Custom icon URL
        "title": "NO NASTY\nCHEMICALS",                                        // Feature title (supports \n for line breaks)
        "delay": "0ms"                                                         // Animation delay (optional)
      },
      {
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/628/628283.png",
        "title": "VEGAN\nINGREDIENTS",
        "delay": "100ms"
      },
      {
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/1205/1205546.png",
        "title": "CRUELTY\nFREE",
        "delay": "200ms"
      },
      {
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/3003/3003543.png",
        "title": "FAST\nDELIVERY",
        "delay": "300ms"
      }
    ],
    "ctaButton": {
      "text": "SHOP NOW",                          // Custom button text
      "url": "/products",                 // Button destination (internal or external)
      "external": false                   // Set to true for external URLs
    }
  }
}
```

**Features Section System:**
- **Dual Icon Support**: Choose between custom image icons OR fallback to built-in vector icons
- **Custom Icons**: Include `features` array with `iconUrl` for each feature to use image-based icons
- **Fallback Icons**: Omit `features` array to use default Lucide React vector icons
- **Unlimited Features**: Add any number of feature items (responsive grid adapts automatically)
- **Line Break Support**: Use `\n` in titles for proper text formatting ("VEGAN\nINGREDIENTS")
- **Animation Control**: Optional `delay` field for staggered entrance animations
- **Custom CTA Button**: Configure button text and destination independently
- **Internal/External CTAs**: Support both site pages and external URLs
- **Complete Control**: Every aspect of features section is configurable

**Configuration Options:**
1. **Image Icons** (`default.tgd.json`): Include `features` array with custom icons
2. **Vector Icons** (`skincare-demo.tgd.json`): Omit `features` array for built-in icons
3. **Mixed Approach**: Configure CTA button independently of features icons

**Features Section Examples:**
- **Skincare**: "NO NASTY CHEMICALS", "VEGAN INGREDIENTS", "CRUELTY FREE", "DERMATOLOGIST TESTED"
- **Beauty**: "NATURAL BOTANICALS", "HANDCRAFTED", "LUXURY QUALITY", "FAST SHIPPING"  
- **Health**: "CLINICALLY TESTED", "FDA APPROVED", "ORGANIC", "MADE WITH LOVE"

#### Product Configuration
```json
{
  "productIds": [
    "product_4eb82d9586a2",    // Real product IDs from your Tagada store
    "product_2fa71c2fa11d",    // Order determines display order
    "product_fc1bd0cfe97a",    // Minimum: 1 product, Maximum: unlimited
    "product_5dee57124c5e",    // Must exist in your Tagada store
    "product_2447c222eb51"     // Will be filtered out if not found
  ],
  "heroProductId": "product_2fa71c2fa11d"  // Optional: Featured product for homepage
}
```

#### Content & Internationalization
```json
{
  "content": {
    "tagline": {
      "en": "Beautiful skincare, simplified",           // English tagline
      "es": "Belleza para la piel, simplificada",      // Spanish translation
      "fr": "Soins de beauté, simplifiés"              // French translation (optional)
    },
    "sections": {
      "en": {
        "heroSubtitle": "Premium Australian Skincare",
        "heroTitle": "Celebrating\nAustralian Nature",   // \n creates line breaks
        "heroDescription": "Discover our range of premium skincare products...",
        "primaryButton": "OUR PRODUCTS",                // Main CTA button text
        "secondaryButton": "TRY SAMPLE",                 // Secondary button text
        "trustText": "Trusted by 10,000+ customers",     // Social proof text
        "featuresTitle": "Natural skincare with scientifically proven results",
        "featuresSubtitle": "Harness the power of Australian botanicals...",
        "ctaButton": "SHOP NOW",                         // Call-to-action button
        "hero": "Unlock Your Skin's Natural Radiance",   // Alternative hero text
        "about": "Transform your skincare routine...",    // About section text
        "guarantee": "30-day money-back guarantee"       // Guarantee/warranty text
      },
      "es": {
        "heroSubtitle": "Cuidado de la Piel Premium Australiano",
        "heroTitle": "Celebrando la\nNaturaleza Australiana",
        "heroDescription": "Descubre nuestra gama de productos premium...",
        "primaryButton": "NUESTROS PRODUCTOS",
        "secondaryButton": "PROBAR MUESTRA",
        "trustText": "Confiado por más de 10,000 clientes",
        "featuresTitle": "Cuidado natural de la piel con resultados...",
        "featuresSubtitle": "Aprovecha el poder de los botánicos...",
        "ctaButton": "COMPRAR AHORA",
        "hero": "Desbloquea el Resplandor Natural de tu Piel",
        "about": "Transforma tu rutina de cuidado de la piel...",
        "guarantee": "Garantía de devolución de dinero de 30 días"
      }
    },
    "socialLinks": [
      {
        "platform": "facebook",                          // Any platform name (no restrictions)
        "url": "https://facebook.com/mybrand",
        "label": "Like us on Facebook",                   // Optional accessibility label
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/174/174848.png"  // Required icon URL
      },
      {
        "platform": "instagram", 
        "url": "https://instagram.com/mybrand",
        "label": "Follow us on Instagram",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/174/174855.png"
      },
      {
        "platform": "discord",                          // Any custom platform name
        "url": "https://discord.gg/mybrand",
        "label": "Join our Discord community",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/5968/5968756.png"
      },
      {
        "platform": "telegram",                         // Another custom platform example
        "url": "https://t.me/mybrand",
        "label": "Message us on Telegram",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/2111/2111646.png"
      }
    ],
    "footerSections": [
      {
        "title": "Shop",                                   // Footer section title
        "links": [
          { "label": "Face Care", "url": "/face-care" },  // Section links
          { "label": "Body Care", "url": "/body-care" },
          { "label": "Cleansers", "url": "/cleansers" },
          { "label": "Gift Sets", "url": "/gift-sets" }
        ]
      },
      {
        "title": "Support",
        "links": [
          { "label": "Contact Us", "url": "/contact" },
          { "label": "FAQ", "url": "/faq" },
          { "label": "Shipping Info", "url": "/shipping" }
        ]
      }
    ],
    "footerLinks": [                                      // Legacy footer links (optional)
      { "label": "Privacy Policy", "url": "/privacy" },
      { "label": "Terms of Service", "url": "/terms" }
    ],
    "features": [                                         // Features section (optional)
      {
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/1828/1828506.png", // Custom feature icon
        "title": "NO NASTY\nCHEMICALS",                 // Feature title (supports \n for line breaks)
        "delay": "0ms"                                   // Animation delay (optional)
      },
      {
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/628/628283.png",
        "title": "VEGAN\nINGREDIENTS",
        "delay": "100ms"
      },
      {
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/1205/1205546.png", 
        "title": "CRUELTY\nFREE",
        "delay": "200ms"
      }
    ],
    "ctaButton": {                                        // Call-to-Action button (optional)
      "text": "SHOP NOW",                                   // Custom button text
      "url": "/products",                                 // Button destination
      "external": false                                   // Internal (false) or external (true) link
    },
    "footerCopyright": "© 2024 Pure Glow Skincare. All rights reserved. Made with ❤️ in Australia.", // Custom footer copyright message (optional)
    "enableBogo": true                                    // Enable/disable BOGO promotions site-wide (optional, defaults to true)
  }
}
```

#### Assets & Images
```json
{
  "assets": {
    "heroImage": "https://fastly.picsum.photos/id/28/4928/3264.jpg",  // Main hero background
    "logoImage": "/images/logo.png",                                   // Brand logo (optional)
    "placeholderImage": "/images/placeholder.jpg"                     // Fallback for missing product images
  }
}
```

#### SEO & Meta Data
```json
{
  "seo": {
    "title": {
      "en": "My Brand - Premium Skincare Solutions",
      "es": "Mi Marca - Soluciones Premium para el Cuidado de la Piel"
    },
    "description": {
      "en": "Discover science-backed skincare products that deliver real results. Shop serums, moisturizers, and treatments for radiant, healthy skin.",
      "es": "Descubre productos premium y naturales para el cuidado de la piel que brindan resultados reales."
    },
    "socialImageUrl": "/images/og-image.jpg"    // Open Graph image for social sharing
  }
}
```

### Complete Configuration Example

```json
{
  "configName": "my-premium-store",
  "productIds": [
    "product_4eb82d9586a2",
    "product_2fa71c2fa11d", 
    "product_fc1bd0cfe97a",
    "product_5dee57124c5e",
    "product_2447c222eb51"
  ],
  "heroProductId": "product_2fa71c2fa11d",
  "branding": {
    "companyName": "Pure Glow Skincare",
    "logoText": "Pure Glow",
    "logoSize": "xl",
    "primaryColor": "#f6413b",
    "secondaryColor": "#763bf6",
    "logoUrl": "https://fastly.picsum.photos/id/29/4000/2670.jpg"
  },
  "content": {
    "tagline": {
      "en": "Celebrating Australian Nature",
      "es": "Celebrando la Naturaleza Australiana"
    },
    "sections": {
      "en": {
        "heroSubtitle": "Premium Australian Skincare",
        "heroTitle": "Celebrating\nAustralian Nature", 
        "heroDescription": "Discover our range of premium skincare products crafted with native Australian botanicals for radiant, healthy skin.",
        "primaryButton": "OUR PRODUCTS",
        "secondaryButton": "TRY SAMPLE",
        "trustText": "Trusted by 10,000+ customers",
        "featuresTitle": "Natural skincare with scientifically proven results",
        "featuresSubtitle": "Harness the power of Australian botanicals with our carefully formulated products.",
        "ctaButton": "SHOP NOW",
        "hero": "Unlock Your Skin's Natural Radiance",
        "about": "Transform your skincare routine with our curated collection of clean, effective products. Each formula is crafted with premium ingredients and backed by dermatological research.",
        "guarantee": "30-day money-back guarantee. Love your skin or get your money back."
      },
      "es": {
        "heroSubtitle": "Cuidado de la Piel Premium Australiano", 
        "heroTitle": "Celebrando la\nNaturaleza Australiana",
        "heroDescription": "Descubre nuestra gama de productos premium para el cuidado de la piel elaborados con botánicos nativos australianos.",
        "primaryButton": "NUESTROS PRODUCTOS",
        "secondaryButton": "PROBAR MUESTRA", 
        "trustText": "Confiado por más de 10,000 clientes",
        "featuresTitle": "Cuidado natural de la piel con resultados científicamente probados",
        "featuresSubtitle": "Aprovecha el poder de los botánicos australianos con nuestros productos cuidadosamente formulados.",
        "ctaButton": "COMPRAR AHORA",
        "hero": "Desbloquea el Resplandor Natural de tu Piel",
        "about": "Transforma tu rutina de cuidado de la piel con nuestra colección curada de productos limpios y efectivos.", 
        "guarantee": "Garantía de devolución de dinero de 30 días."
      }
    },
    "socialLinks": [
      {
        "platform": "facebook",
        "url": "https://facebook.com/pureglowskincare", 
        "label": "Like us on Facebook"
      },
      {
        "platform": "instagram",
        "url": "https://instagram.com/pureglowskincare",
        "label": "Follow us on Instagram"
      },
      {
        "platform": "x", 
        "url": "https://x.com/pureglow_skin",
        "label": "Follow us on X",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/5968/5968830.png"
      },
      {
        "platform": "linkedin",
        "url": "https://linkedin.com/company/pureglow-skincare",
        "label": "Connect on LinkedIn"
      }
    ],
    "footerSections": [
      {
        "title": "Shop",
        "links": [
          { "label": "Face Care", "url": "/face-care" },
          { "label": "Body Care", "url": "/body-care" },
          { "label": "Cleansers", "url": "/cleansers" },
          { "label": "Gift Sets", "url": "/gift-sets" }
        ]
      },
      {
        "title": "Support",
        "links": [
          { "label": "Contact Us", "url": "/contact" },
          { "label": "FAQ", "url": "/faq" },
          { "label": "Shipping", "url": "/shipping" },
          { "label": "Returns", "url": "/returns" }
        ]
      },
      {
        "title": "Legal",
        "links": [
          { "label": "Privacy Policy", "url": "/privacy" },
          { "label": "Terms of Service", "url": "/terms" },
          { "label": "Cookie Policy", "url": "/cookies" }
        ]
      }
    ]
  },
  "assets": {
    "heroImage": "https://fastly.picsum.photos/id/28/4928/3264.jpg",
    "logoImage": "/images/logo.png",
    "placeholderImage": "/images/placeholder.jpg"
  },
  "seo": {
    "title": {
      "en": "Pure Glow Skincare - Transform Your Skin Naturally", 
      "es": "Pure Glow Skincare - Transforma tu Piel Naturalmente"
    },
    "description": {
      "en": "Discover premium, natural skincare products that deliver real results. Shop serums, moisturizers, and treatments for radiant, healthy skin.",
      "es": "Descubre productos premium y naturales para el cuidado de la piel que brindan resultados reales."
    },
    "socialImageUrl": "/images/og-image.jpg"
  }
}
```

### Configuration Validation

All configuration files are automatically validated using TypeScript + Zod schemas:

- **Required Fields**: `configName`, `branding.companyName`, `branding.primaryColor`, `branding.secondaryColor`, `productIds`
- **Color Validation**: Colors must be valid hex codes (#RRGGBB format)
- **Logo Height Range**: Custom logo height must be between 16-200 pixels
- **Product IDs**: Must be valid strings; invalid IDs are automatically filtered out
- **URL Validation**: Social and footer links are validated for proper URL format

### Field Priorities & Defaults

- **Logo Sizing**: Custom `logoHeight` overrides `logoSize` preset if both provided
- **Language Fallback**: Missing translations fall back to English automatically
- **Color System**: Primary/secondary colors generate 50+ CSS color variations automatically
- **Asset Fallbacks**: Missing images use placeholder or default assets
- **Content Fallbacks**: Missing content fields use sensible defaults where possible

### How Configuration Works

1. **Loading**: Configurations are loaded at startup via the `useConfig` hook
2. **Validation**: All config files are validated against TypeScript schemas
3. **Theme Generation**: Colors are automatically converted to CSS custom properties
4. **Content Rendering**: Text content is pulled from the active configuration
5. **Product Filtering**: Only products listed in `productIds` are displayed
6. **Locale Handling**: Automatic fallback from user's language to English

### Switching Configurations

#### Development Mode

- **URL Parameter**: `http://localhost:5173/?config=skincare-demo`
- **Environment Variable**: Set `VITE_CONFIG_NAME=skincare-demo` in `.env`
- **Dev UI**: Click the gear icon (⚙️) in the top-left corner during development

#### Production Mode

- Set the default configuration in `src/contexts/ConfigProvider.tsx`
- Or build multiple versions with different environment variables

## � Cart & Checkout System (Persistent & Reliable)

The cart system is designed for reliability, persistence, and seamless integration with Tagada's checkout flow.

### Cart Features

- **Persistent Storage**: Cart survives page refreshes, browser restarts, and navigation
- **Stable Cart Token**: Each cart gets a unique, persistent identifier for tracking
- **Optimistic Updates**: Instant UI feedback while operations complete
- **Quantity Management**: Add, update, and remove items with validation
- **Total Calculation**: Real-time price calculations with currency formatting
- **Local State**: No server dependency - works entirely client-side until checkout

### Cart Implementation Details

#### State Management

```typescript
interface CartItem {
  id: string; // Product ID
  quantity: number; // Item quantity
  price: number; // Unit price in cents
  name: string; // Product name
  imageUrl?: string; // Product image
}

interface CartState {
  items: CartItem[];
  cartToken: string; // Stable identifier
  isInitialized: boolean; // Prevents race conditions
}
```

#### Persistence Strategy

The cart uses `localStorage` with a stability guarantee:

- **Load on Mount**: Cart is restored from localStorage immediately
- **Save on Change**: Every cart modification is persisted automatically
- **Race Condition Protection**: `isInitialized` flag prevents premature overwrites
- **Fallback Handling**: Graceful degradation if localStorage is unavailable

#### Cart Operations

```typescript
// Adding items
const { addItem } = useCartContext();
addItem({
  id: "product_123",
  name: "Vitamin C Serum",
  price: 2499, // Price in cents
  quantity: 1,
});

// Updating quantities
const { updateQuantity } = useCartContext();
updateQuantity("product_123", 3);

// Removing items
const { removeItem } = useCartContext();
removeItem("product_123");

// Clearing cart
const { clearCart } = useCartContext();
clearCart();
```

### Checkout Flow (Tagada SDK Integration)

The checkout process is designed to be minimal, reliable, and compliant with Tagada's requirements.

#### Checkout Steps

1. **Validation**: Ensure cart has items and required data
2. **Line Items**: Convert cart items to Tagada's expected format
3. **SDK Initialization**: Call `checkout.init()` with cart data and store configuration
4. **Redirect**: Navigate user to Tagada's secure checkout page
5. **Return Handling**: User returns after payment completion

#### Checkout Implementation

```typescript
const { initiateCheckout, isLoading, error } = useCheckout();

// Trigger checkout
const handleCheckout = async () => {
  try {
    await initiateCheckout();
    // User is redirected to Tagada checkout
  } catch (error) {
    console.error("Checkout failed:", error);
    // Handle error (show message to user)
  }
};
```

#### SDK Data Format

The checkout hook automatically formats cart data for the Tagada SDK:

```typescript
const lineItems = cartItems.map((item) => ({
  productId: item.id,
  quantity: item.quantity,
  unitPrice: item.price, // Already in cents
}));

await checkout.init({
  cartToken,
  lineItems,
  storeId: config.storeId,
  currency: "USD",
});
```

### Error Handling & Recovery

- **Network Issues**: Checkout gracefully handles connectivity problems
- **Invalid Items**: Cart validates product data before allowing additions
- **Storage Limits**: Fallback to memory-only mode if localStorage is full
- **SDK Errors**: Clear error messages with retry options for users

### Testing Cart Persistence

To verify cart persistence works:

1. Add items to cart
2. Refresh the page → Cart should remain intact
3. Close and reopen browser → Cart should persist
4. Navigate between pages → Cart should stay consistent

The cart system includes debug logging (visible in browser console) to help diagnose any persistence issues during development.

## �🔧 Development Features

## 🔧 Development Features & Debug Tools

The plugin includes comprehensive development tools for debugging, testing, and rapid iteration.

### Hot Configuration Switching

Switch between different store configurations instantly during development:

#### Available Methods

1. **URL Parameter**: Add `?config=skincare-demo` to any URL

   ```
   http://localhost:5173/?config=skincare-demo
   http://localhost:5173/products/product_123?config=default
   ```

2. **Environment Variable**: Set in `.env` file

   ```bash
   VITE_CONFIG_NAME=skincare-demo
   ```

3. **Dev UI**: Click the gear icon (⚙️) in the top-left corner
   - Only visible in development mode
   - Dropdown with all available configurations
   - Instant switching without page reload

### Debug Tools & Logging

#### Cart Debug Features

- **Cart Token Display**: Visible in cart drawer header during development
- **LocalStorage Inspector**: Check `tagada_cart` in browser DevTools
- **Console Logging**: Detailed cart operations logged to console
  ```
  🛒 Cart initialized with token: cart_1704123456789
  🛒 Adding item: Vitamin C Serum (quantity: 1)
  🛒 Cart saved to localStorage
  ```

#### SDK Integration Debugging

- **Product Loading**: Console logs for API calls and responses
- **Authentication Status**: Token validation and refresh logging
- **Checkout Flow**: Step-by-step checkout process logging
  ```
  🔌 SDK initializing with storeId: store_d2b5940d2555
  🛍️ Loading products...
  ✅ Products loaded: 5 items
  💳 Initiating checkout for cartToken: cart_1704123456789
  ```

#### Configuration Debugging

- **Config Loading**: Shows which configuration file is loaded
- **Schema Validation**: Logs any configuration validation errors
- **Theme Generation**: CSS custom property generation logging

### Development Workflow

#### Recommended Development Setup

1. **Start Dev Server**: `npm run dev`
2. **Open Multiple Configs**: Test different configurations simultaneously
   - Tab 1: `http://localhost:5173/?config=default`
   - Tab 2: `http://localhost:5173/?config=skincare-demo`
3. **Monitor Console**: Keep DevTools open for real-time debugging
4. **Test Cart Persistence**: Add items, refresh, verify persistence

#### Common Development Tasks

**Testing New Configurations**:

1. Create new `.tgd.json` file in `config/` directory
2. Add to configuration dropdown in `DevConfigSwitcher`
3. Use URL parameter to test: `?config=my-new-config`

**Debugging Cart Issues**:

1. Open browser console
2. Look for cart-related logs (🛒 prefix)
3. Check `localStorage` for `tagada_cart` key
4. Verify cart token stability across refreshes

**Testing Checkout Flow**:

1. Add items to cart
2. Click checkout button
3. Monitor console for SDK logs
4. Verify redirect to Tagada checkout URL

### Production vs Development Differences

#### Development Mode Features

- Configuration switcher UI (⚙️ icon)
- Debug logging to console
- Cart token visible in UI
- Hot configuration reloading
- Detailed error messages

#### Production Mode

- No debug UI elements
- Minimal console logging
- Optimized bundle size
- Single configuration only
- User-friendly error messages

### Performance Monitoring

The plugin includes performance markers for debugging:

- **Config Load Time**: Measures configuration loading speed
- **Product Fetch Time**: Tracks API response times
- **Cart Operations**: Monitors localStorage read/write performance
- **Checkout Initialization**: Measures SDK initialization time

Access these in DevTools Performance tab or via `performance.getEntriesByType('measure')`.

## �️ E-commerce Features & Real Product Integration

The plugin provides a complete e-commerce experience with real Tagada products and advanced shopping features.

### Product Management

#### Real Product Integration

- **Live Data**: Connected to `store_d2b5940d2555` with 5 active skincare products
- **Dynamic Pricing**: Prices extracted from `product.currencyOptions.USD.amount`
- **Product Variants**: Supports multiple variants per product with individual images
- **Inventory Tracking**: Real-time availability status from Tagada API
- **Product Images**: High-quality images with automatic fallback handling

#### Product Display Features

- **Grid Layout**: Responsive product grid with hover effects
- **Single Product Pages**: Detailed product views at `/products/<productId>`
- **Image Galleries**: Multiple product images with zoom and navigation
- **Price Formatting**: Automatic currency formatting (cents to dollars)
- **Product Filtering**: Configuration-based product selection via `productIds`

### Advanced Cart Features

#### Smart Cart Management

- **Persistent Storage**: Cart survives page refreshes and browser sessions
- **Stable Cart Token**: Unique identifier for backend session tracking
- **Optimistic Updates**: Instant UI feedback while operations complete
- **Quantity Validation**: Prevents invalid quantities and out-of-stock additions
- **Total Calculation**: Real-time price calculations with tax considerations

#### BOGO (Buy One Get One) Logic

```typescript
// Automatic BOGO discounts
const calculateBOGO = (items: CartItem[]) => {
  const eligibleItems = items.filter((item) => item.bogoEligible);
  const freeItems = Math.floor(eligibleItems.length / 2);
  return freeItems * eligibleItems[0]?.price || 0;
};
```

#### Cart Accessibility

- **Focus Management**: Proper focus trapping in cart drawer
- **Keyboard Navigation**: Full keyboard support (Enter, Escape, Tab)
- **Screen Reader Support**: ARIA labels and announcements
- **High Contrast**: Supports system high contrast modes

### Checkout Integration & Flow

#### Tagada SDK Integration

The plugin uses real Tagada SDK calls for checkout:

```typescript
// Real checkout implementation
const lineItems = cartItems.map((item) => ({
  productId: item.id,
  quantity: item.quantity,
  unitPrice: item.price, // Already in cents
  variantId: item.variantId, // Optional variant selection
}));

const result = await checkout.init({
  cartToken: stableCartToken,
  lineItems,
  storeId: config.storeId,
  currency: "USD",
  returnUrl: window.location.origin + "/checkout/success",
  cancelUrl: window.location.origin + "/checkout/cancel",
});

// Redirect to Tagada's secure checkout
window.location.href = result.checkoutUrl;
```

#### Checkout Flow Steps

1. **Pre-Checkout Validation**: Verify cart contents and user session
2. **Line Item Preparation**: Convert cart format to Tagada requirements
3. **SDK Initialization**: Call `checkout.init()` with complete cart data
4. **Secure Redirect**: Navigate to Tagada's hosted checkout page
5. **Payment Processing**: User completes payment on Tagada's secure platform
6. **Return Handling**: Process success/cancel returns from Tagada

#### Session & State Management

- **Cart Token Stability**: Same cart token used across entire session
- **Backend Session Reuse**: Tagada backend can track cart across requests
- **State Persistence**: Cart survives checkout cancellation and returns
- **Error Recovery**: Graceful handling of network issues and timeouts

### Product Data Structure

The plugin works with Tagada's complete product schema:

```typescript
interface TagadaProduct {
  id: string;
  name: string;
  description: string;
  currencyOptions: {
    USD: {
      amount: number; // Price in cents
      currency: "USD";
    };
  };
  variants: Array<{
    id: string;
    name: string;
    imageUrl: string;
    available: boolean;
  }>;
  categoryIds: string[];
  tags: string[];
  seoData: {
    title: string;
    description: string;
    imageUrl: string;
  };
}
```

### Inventory & Availability

- **Real-Time Stock**: Product availability checked via Tagada API
- **Out-of-Stock Handling**: Disabled add-to-cart for unavailable items
- **Variant Availability**: Per-variant stock tracking and display
- **Stock Warnings**: Low stock notifications (if configured)

### Performance Optimizations

- **Image Lazy Loading**: Products images load as they come into view
- **API Caching**: Product data cached to reduce API calls
- **Optimistic Cart Updates**: UI updates immediately, sync happens async
- **Bundle Splitting**: E-commerce features loaded only when needed

## 🎨 Theming & Styling System

The plugin features a comprehensive theming system that automatically generates cohesive designs from simple configuration values.

### Dynamic Theme Generation

Colors defined in configuration files are automatically converted to CSS custom properties and distributed throughout the application:

```json
// In configuration file
{
  "branding": {
    "primaryColor": "#f6413b",
    "secondaryColor": "#763bf6"
  }
}
```

```css
/* Auto-generated CSS custom properties */
:root {
  --primary-color: #f6413b;
  --secondary-color: #763bf6;
  --primary-light: #f86b62;
  --primary-dark: #e1391f;
  --gradient-primary: linear-gradient(135deg, #f6413b, #763bf6);
}
```

### Theme System Features

#### Color Palette Generation

- **Primary/Secondary Colors**: Base colors from configuration
- **Automatic Variations**: Light, dark, and muted variations generated
- **Gradient Creation**: Multi-stop gradients for buttons and accents
- **Contrast Validation**: Ensures WCAG compliance for text contrast
- **Brand Consistency**: Cohesive color usage across all components

#### Component Theming

- **Button Styles**: Primary, secondary, and ghost variants
- **Card Components**: Consistent borders, shadows, and backgrounds
- **Interactive Elements**: Hover, focus, and active states
- **Form Controls**: Input fields, selects, and checkboxes
- **Navigation**: Header, footer, and menu styling

#### Responsive Design

- **Mobile-First**: Designed for mobile with desktop enhancements
- **Breakpoint System**: Tailwind's responsive utilities
- **Touch-Friendly**: Adequate touch targets on mobile devices
- **Flexible Layouts**: Adapts to various screen sizes and orientations

### Tailwind CSS Integration

The plugin uses Tailwind CSS with custom configuration:

```typescript
// tailwind.config.ts
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "rgb(var(--primary-50) / <alpha-value>)",
          500: "rgb(var(--primary-500) / <alpha-value>)",
          900: "rgb(var(--primary-900) / <alpha-value>)",
        },
        secondary: {
          50: "rgb(var(--secondary-50) / <alpha-value>)",
          500: "rgb(var(--secondary-500) / <alpha-value>)",
          900: "rgb(var(--secondary-900) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
    },
  },
};
```

### Dark Mode Support

The plugin includes built-in dark mode support:

- **System Detection**: Respects user's system preference
- **Manual Toggle**: Optional dark mode switcher component
- **Theme Persistence**: Remembers user's choice across sessions
- **Component Adaptation**: All components work in both light and dark modes

### Accessibility Features

#### Visual Accessibility

- **High Contrast Mode**: Supports Windows/macOS high contrast
- **Color Blindness**: Patterns and icons supplement color information
- **Font Scaling**: Respects user's font size preferences
- **Motion Preferences**: Reduced motion for sensitive users

#### Interaction Accessibility

- **Focus Indicators**: Clear, visible focus states
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Touch Accessibility**: Adequate touch targets and gestures

### Custom Styling

#### CSS Custom Properties

All theme values are available as CSS custom properties:

```css
.my-custom-component {
  background: var(--primary-color);
  border: 1px solid var(--secondary-color);
  box-shadow: 0 4px 8px var(--primary-color-20);
}
```

#### Component Customization

Override component styles using Tailwind classes:

```tsx
<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
  Custom Gradient Button
</Button>
```

#### Brand Asset Integration

- **Logo Display**: Automatic logo sizing and positioning
- **Brand Colors**: Consistent color usage from configuration
- **Typography**: Custom font loading and application
- **Image Optimization**: Automatic image resizing and compression

### Dynamic Colors

All colors are configurable via CSS custom properties:

- `--color-primary` and `--color-secondary`
- Automatic generation of 50+ color variants
- Real-time updates when config changes
- Consistent across all components

### Color Classes

```css
.bg-primary, .text-primary, .border-primary
.bg-primary-50, .bg-primary-100, .bg-primary-200
.hover:bg-primary, .hover:text-primary
.from-primary, .to-secondary
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 19, TypeScript, Vite 7
- **Routing**: React Router DOM 7.8.2
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Radix UI v2+
- **Icons**: Lucide React
- **Validation**: Zod 4.1.5
- **SDK**: @tagadapay/plugin-sdk v2.3.3

### Project Structure

```
src/
├── components/           # UI components
│   ├── Cart/            # Cart drawer and items
│   ├── Layout/          # Navigation, footer
│   └── DevConfigSwitcher.tsx
├── contexts/            # React contexts
│   ├── CartProvider.tsx # Cart state management
│   └── ConfigProvider.tsx # Config and theming
├── hooks/               # Custom React hooks
│   ├── useCart.ts       # Cart management with cartToken
│   ├── useCheckout.ts   # Tagada checkout integration
│   ├── useConfig.ts     # Config loading with hot-switching
│   └── useConfigProducts.ts # SDK product filtering
├── pages/               # Route components
│   ├── Home.tsx         # Homepage with hero
│   ├── Products.tsx     # Product grid
│   └── ProductDetail.tsx # Single product view
├── types/               # TypeScript definitions
│   ├── cart.ts          # Cart and product types
│   └── config.ts        # Config schema with validation
└── lib/utils.ts         # Utility functions
```

## 🧪 API Integration

### useProducts Hook

```typescript
import { useProducts } from "@tagadapay/plugin-sdk/react";

const { products, isLoading, error } = useProducts({
  enabled: tagadaContext.isSessionInitialized,
  includeVariants: true,
  includePrices: true,
});
```

### useCheckout Hook

```typescript
import { useCheckout } from "@tagadapay/plugin-sdk/react";

const { init } = useCheckout();

await init({
  storeId: "store_d2b5940d2555",
  lineItems: [{ variantId: "variant_123", priceId: "price_123", quantity: 1 }],
  cartToken: "stable-cart-uuid",
});
```

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Proper touch targets and gestures
- **Accessibility**: WCAG 2.1 compliant

## 🔒 Data Structure

### Cart Items

```typescript
interface CartItem {
  productId: string;
  variantId: string;
  priceId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}
```

### Product Data (from SDK)

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  variants: Array<{
    id: string;
    imageUrl: string;
    prices: Array<{
      id: string;
      currencyOptions: {
        USD: { amount: number }; // Amount in cents
      };
    }>;
  }>;
}
```

## 🚦 Status & Compliance

### SPECIFICATIONS.md Compliance ✅

- ✅ **Migration**: Next.js → Vite complete
- ✅ **Cart Hook**: localStorage with stable cartToken
- ✅ **Cart UI**: Accessible drawer with A11y features
- ✅ **Checkout Flow**: Real `useCheckout().init()` with redirect
- ✅ **Store Setup**: Real store (store_d2b5940d2555) with 5 products
- ✅ **Configuration**: Complete schema with validation
- ✅ **Hot Switching**: Dev-time config switching implemented
- ✅ **Plugin Manifest**: Required plugin.manifest.json included

### Acceptance Criteria ✅

- ✅ Builds with Vite; no Next.js remnants
- ✅ Cart persists locally; drawer fully functional
- ✅ cartToken stable throughout lifecycle
- ✅ Checkout calls `init()` and redirects to `checkoutUrl`
- ✅ Uses real Tagada products via SDK
- ✅ Backend can reuse sessions via cartToken
- ✅ No console errors in production build
- ✅ Plugin manifest for Tagada deployment

**🎉 Ready to Ship!** This plugin is fully compliant with all specifications and ready for deployment.

## 🐛 Troubleshooting

### Common Issues

**Products not loading**:

- Check store_d2b5940d2555 has products
- Verify SDK authentication in console
- Check network requests for 401 errors

**Config not applying**:

- Verify JSON syntax in .tgd.json files
- Check browser console for validation errors
- Try reloading config via dev switcher

**Colors not updating**:

- Ensure hex colors are valid (#RRGGBB format)
- Check CSS custom properties in dev tools
- Clear browser cache if needed

### Debug Tools

1. **Dev Config Switcher**: Top-left settings icon
2. **Browser Console**: Detailed SDK and config logs
3. **Cart Debug**: cartToken visible in cart drawer
4. **Network Tab**: Check API calls to Tagada

## 🔄 Recent Updates

### v2.0 (2025-09-01) - Real Store Integration

- ✅ Connected to real Tagada store (store_d2b5940d2555)
- ✅ Fixed price extraction from `currencyOptions.USD.amount`
- ✅ Fixed image display from `variant.imageUrl`
- ✅ Implemented proper checkout redirect flow
- ✅ Added hot config switching for development
- ✅ Complete SPECIFICATIONS.md compliance

### v1.0 - Foundation

- ✅ Next.js to Vite migration
- ✅ Dynamic theming system

## 🤝 Contributing & Extending

This plugin is designed to be extensible and customizable for different use cases and requirements.

### Adding New Configurations

1. **Create Configuration File**

   ```bash
   # Create new configuration
   cp config/default.tgd.json config/my-new-store.tgd.json
   ```

2. **Customize Configuration**

   ```json
   {
     "configName": "my-new-store",
     "branding": {
       "companyName": "My New Store",
       "primaryColor": "#your-color",
       "secondaryColor": "#your-secondary"
     },
     "products": {
       "productIds": ["your_product_ids"]
     }
   }
   ```

3. **Test Configuration**
   ```bash
   # Test via URL parameter
   http://localhost:5173/?config=my-new-store
   ```

### Extending Components

#### Adding New Product Features

```typescript
// src/components/Product/ProductFeatures.tsx
export const ProductFeatures = ({ product }: { product: Product }) => {
  return (
    <div className="mt-4">
      <h3>Key Features</h3>
      {product.features?.map((feature) => (
        <div key={feature.id} className="feature-item">
          {feature.name}
        </div>
      ))}
    </div>
  );
};
```

#### Custom Cart Logic

```typescript
// src/hooks/useCustomCart.ts
export const useCustomCart = () => {
  const { addItem: baseAddItem, ...cart } = useCart();

  const addItemWithPromotion = (item: CartItem) => {
    // Add custom promotion logic
    const itemWithPromo = applyPromotion(item);
    return baseAddItem(itemWithPromo);
  };

  return {
    ...cart,
    addItem: addItemWithPromotion,
  };
};
```

### Customizing Themes

#### Adding Custom Colors

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#your-color-50",
          500: "#your-color-500",
          900: "#your-color-900",
        },
      },
    },
  },
};
```

#### Custom Component Styles

```css
/* src/styles/custom.css */
.product-card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow;
}

.checkout-button {
  @apply bg-gradient-to-r from-primary-500 to-secondary-500;
}
```

### Integration Guidelines

#### API Integration

```typescript
// src/utils/api.ts
export const customAPICall = async (endpoint: string) => {
  const response = await fetch(`/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
```

#### Third-Party Services

```typescript
// src/integrations/analytics.ts
export const trackEvent = (eventName: string, properties: any) => {
  // Google Analytics, Mixpanel, etc.
  gtag("event", eventName, properties);
};
```

### Development Best Practices

#### Code Style

- **TypeScript First**: Always use TypeScript, avoid `any`
- **Functional Components**: Use function components with hooks
- **Custom Hooks**: Extract logic into reusable hooks
- **Error Boundaries**: Wrap components that might fail

#### Testing Guidelines

```typescript
// src/components/__tests__/ProductCard.test.tsx
import { render, screen } from "@testing-library/react";
import { ProductCard } from "../ProductCard";

describe("ProductCard", () => {
  it("displays product information correctly", () => {
    const mockProduct = { name: "Test Product", price: 1999 };
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });
});
```

#### Performance Considerations

- **Lazy Load**: Use React.lazy for heavy components
- **Memoization**: Memoize expensive calculations
- **Debouncing**: Debounce API calls and user inputs
- **Image Optimization**: Use appropriate image formats and sizes

## 📋 Compliance & Standards

### Tagada Integration Compliance

This plugin fully complies with Tagada's integration requirements as specified in `SPECIFICATIONS.md`:

#### ✅ SDK Integration

- **Correct SDK Version**: Uses `@tagadapay/plugin-sdk@2.3.x`
- **Proper Authentication**: Implements `useTagadaContext` correctly
- **Session Management**: Handles session initialization and refresh
- **Error Handling**: Graceful degradation on SDK failures

#### ✅ Cart Management

- **Stable Cart Token**: Generates and maintains consistent cart identifiers
- **Proper Line Items**: Converts cart to Tagada's expected format
- **Persistence**: Cart survives page refreshes and browser sessions
- **Validation**: Prevents invalid cart states and operations

#### ✅ Checkout Flow

- **Real SDK Calls**: Uses actual `checkout.init()` method
- **Proper Redirect**: Redirects to `result.checkoutUrl` from SDK
- **Return Handling**: Handles success and cancellation flows
- **Session Reuse**: Maintains cart token for backend tracking

#### ✅ Configuration System

- **Schema Validation**: Uses Zod for runtime configuration validation
- **Type Safety**: Full TypeScript coverage for configuration
- **Hot Swapping**: Dynamic configuration switching in development
- **Default Fallbacks**: Graceful handling of missing configurations

### Web Standards Compliance

#### Accessibility (WCAG 2.1)

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA contrast ratios throughout
- **Focus Management**: Visible focus indicators and logical tab order

#### Performance Standards

- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Bundle Size**: Kept under reasonable limits with code splitting
- **Caching**: Proper HTTP caching headers for static assets
- **Lazy Loading**: Images and components loaded on demand

#### Security Best Practices

- **XSS Prevention**: Proper input sanitization and CSP headers
- **HTTPS Only**: All external requests use HTTPS
- **Data Validation**: Client and server-side validation
- **Dependency Security**: Regular security audits of dependencies

---

### Third-Party Libraries

- React 19: MIT License
- Vite 7: MIT License
- Tailwind CSS: MIT License
- TypeScript: Apache 2.0 License
- Tagada SDK: Proprietary (authorized use)

---

**Built with ❤️ for the Tagada ecosystem**

_This README provides comprehensive documentation for developers, covering everything from quick setup to advanced customization. The plugin demonstrates best practices for modern React development while maintaining full compliance with Tagada's integration requirements._
