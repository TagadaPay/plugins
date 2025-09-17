## Features

- **Single Product Focus**: Optimized landing page design for individual product promotion
- **Dynamic Configuration**: JSON-based configuration system with comprehensive schema validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS and modern UI components
- **Advanced Theming**: Customizable color schemes, typography, and spacing
- **Product Promotions**: Bundle offers, quantity discounts, and promotional badges
- **Interactive Media**: Product image carousels, video galleries, and mobile-optimized galleries
- **Customer Reviews**: Real customer testimonials with ratings and verification badges
- **SEO Optimized**: Dynamic metadata, structured data, and search engine friendly content
- **Modern UI Components**: Built with Radix UI primitives and shadcn/ui components
- **Performance Focused**: Code splitting, lazy loading, and optimized bundle sizes
- **Analytics Integration**: Klaviyo tracking and e-commerce event monitoring
- **Configurable Content**: Multi-language support with extensible text management

## Live Demo

The plugin supports multiple configuration themes that can be deployed independently:

### Default Configuration
```bash
pnpm dev
```

## Technology Stack

- **React 19** with TypeScript for type-safe development
- **Tailwind CSS 3** for utility-first styling
- **Radix UI** primitives for accessible components
- **React Router DOM 7** for client-side navigation
- **TagadaPay Plugin SDK 2.3.6** for e-commerce functionality
- **Zod 3.25** for schema validation and type safety
- **React Hook Form 7** for form handling
- **Vite 5** for fast build tooling and development
- **React Swipeable** for mobile touch interactions
- **Lucide React** for consistent iconography
- **React Helmet Async** for SEO management

## Project Structure

```
src/
├── app.tsx                 # Main application entry point
├── main.tsx               # Application bootstrap
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui component library
│   ├── benefits-bar.tsx  # Scrolling benefits display
│   ├── logo-bar.tsx      # Featured logos carousel
│   ├── media-bar.tsx     # Media content display
│   ├── ProductCard.tsx   # Product selection cards
│   ├── seo.tsx          # SEO metadata management
│   └── sticky-add-to-cart.tsx # Persistent cart button
├── pages/
│   └── home/
│       └── Home.tsx      # Main landing page component
├── hooks/                # Custom React hooks
│   ├── use-controller.tsx    # Main page logic controller
│   ├── use-klaviyo-tracking.ts # Analytics tracking
│   ├── use-store-data.ts     # Product data management
│   ├── use-tagada-context.ts # Configuration context
│   └── use-theme.ts          # Theme management
├── context/              # React context providers
│   ├── cart-context.tsx      # Shopping cart state
│   ├── theme-context.tsx     # Theme configuration
│   └── config/
│       └── context.tsx       # Global configuration
├── configuration/
│   └── schema.ts         # Zod schemas and TypeScript types
├── lib/                  # Utility libraries
├── styles/
│   └── globals.css       # Global styles and CSS variables
└── utils/                # Helper functions
```

## Configuration System

The plugin uses a comprehensive configuration system defined in `src/configuration/schema.ts`. The configuration supports:

### Core Configuration Structure

```typescript
interface AppConfig {
  configName: string;
  productData: {
    productName: string;
    categories: string[];
  };
  content: {
    assets: Assets;
    text: Record<string, TextContent>;
    seo: Record<string, Record<string, SEOData>>;
    navigation: Navigation;
    klaviyo: KlaviyoConfig;
  };
  theme: Theme;
  storeData: StoreData;
}
```

### Content Management

- **Assets**: Logo, hero images, and media thumbnails
- **Text Content**: Multi-language content for all UI elements
- **SEO Data**: Page-specific metadata and structured data
- **Navigation**: Header navigation links and structure
- **Klaviyo Integration**: Analytics and tracking configuration

### Theme Customization

```json
{
  "theme": {
    "colors": {
      "primaryColor": "#DBB55B",
      "primaryDark": "#C5A047",
      "primaryLight": "#E8C470",
      "primary50": "#FAF8F2",
      "footerColor": "#e17100"
    },
    "fonts": {
      "body": "Geist, sans-serif",
      "heading": "Geist, sans-serif",
      "mono": "Geist Mono, monospace"
    }
  }
}
```

### Product Promotions

```json
{
  "storeData": {
    "productId": "product_a5501e30192f",
    "variantId": "variant_668ef705b0b8",
    "priceId": "price_987a90a82db8",
    "promotions": [
      {
        "name": "2 + 1 Free",
        "quantity": 3,
        "subtitle": "90-day Supply",
        "badge": "MOST POPULAR",
        "freeGift": "📚 Free Gift: Optimization E-Book"
      }
    ]
  }
}
```

## Key Components

### Landing Page Sections

- **Hero Section**: Product images, benefits, bundle selection, and quick FAQ
- **Featured Logos**: Brand credibility with company logos
- **Clinical Study Results**: Scientific backing and research data
- **Product Comparison**: Competitive advantage visualization
- **Product Details**: Specifications, ingredients, and certifications
- **Video Gallery**: Product demonstration videos
- **Customer Reviews**: Social proof with ratings and testimonials
- **Money-Back Guarantee**: Trust signals and policy information

### Interactive Features

- **Mobile Image Carousel**: Swipeable product gallery with thumbnails
- **Bundle Selection**: Interactive product variant selection
- **Sticky Add to Cart**: Persistent purchase button
- **Review Carousel**: Scrollable customer testimonials
- **Video Players**: Embedded product demonstration videos
- **Mobile Navigation**: Responsive hamburger menu

### Performance Optimizations

- **Code Splitting**: Automatic route-based and component-based splitting
- **Lazy Loading**: Components and images load on demand
- **Bundle Optimization**: Vendor chunks and tree shaking
- **Image Optimization**: Responsive images with proper sizing
- **Skeleton Loading**: Better perceived performance

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

Starts the development server at `http://localhost:3000`

### Build

```bash
pnpm build
```

Creates an optimized production build in the `dist/` directory.

### Linting

```bash
pnpm lint
```

Runs ESLint with TypeScript support and React-specific rules.

### Preview

```bash
pnpm preview
```

Serves the production build locally for testing.

## Plugin Architecture

### TagadaPay Integration

The plugin operates in "direct-mode" with the following configuration:

```json
{
  "pluginId": "zenith-plugin",
  "name": "Zenith Plugin",
  "version": "1.0.0",
  "mode": "direct-mode",
  "router": {
    "basePath": "/",
    "matcher": ".*",
    "excluder": "/checkout"
  }
}
```

### State Management

- **Configuration Context**: Global theme and content management
- **Cart Context**: Shopping cart state and persistence
- **Theme Context**: Dynamic theme switching and CSS variable management
- **Checkout Context**: Purchase flow state management

### Build Configuration

The Vite build is optimized for performance with manual chunk splitting:

- **react-vendor**: React core libraries
- **radix-ui**: UI component primitives
- **icons**: Lucide React icon library
- **tagada-sdk**: TagadaPay integration
- **heavy-libs**: Large third-party libraries
- **vendor**: Other node_modules

## Customization

### Adding New Themes

1. Create a new configuration file in `config/`
2. Define colors, fonts, and content in the schema format
3. Update assets and images as needed
4. Test the configuration with the development server

### Extending Content

```json
{
  "content": {
    "text": {
      "en": {
        "hero": {
          "title1": "Your Product Name",
          "title2": "Compelling Subtitle",
          "description": "Value proposition",
          "benefits": [
            {
              "title": "Key Benefit",
              "description": "Detailed explanation"
            }
          ]
        }
      }
    }
  }
}
```

### Custom Components

- Extend the UI component library in `src/components/ui/`
- Add new sections to the main `Home.tsx` component
- Create new hooks for complex state management
- Update the configuration schema for new features

## SEO Features

The plugin automatically handles comprehensive SEO optimization:

- **Dynamic Meta Tags**: Title, description, and keywords per page
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Enhanced Twitter sharing
- **Structured Data**: JSON-LD markup for rich snippets
- **Canonical URLs**: Duplicate content prevention
- **Mobile Optimization**: Responsive meta viewport tags

## Analytics Integration

### Klaviyo Tracking

The plugin includes comprehensive e-commerce tracking:

- **Active on Site**: User engagement tracking
- **Viewed Product**: Product page analytics
- **Add to Cart**: Cart interaction events
- **Purchase Events**: Conversion tracking

### Custom Events

Extend tracking by adding new events in `use-klaviyo-tracking.ts`:

```typescript
const trackCustomEvent = (eventName: string, properties: object) => {
  if (window._learnq) {
    window._learnq.push(['track', eventName, properties]);
  }
};
```

## Performance Metrics

The plugin is optimized for Core Web Vitals:

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

Performance features include:

- Lazy loading for below-the-fold content
- Image optimization with responsive sizing
- Code splitting for reduced initial bundle size
- Efficient re-rendering with React 19 features

## Browser Support

- Chrome (latest)
- Firefox (latest) 
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

The plugin builds to a static distribution that can be deployed to any CDN or hosting provider. The build process:

1. TypeScript compilation and type checking
2. Vite bundling with optimization
3. Asset processing and minification
4. Source map generation (configurable)

## Support

For technical support, customization assistance, or feature requests:

1. Review the configuration schema documentation
2. Check the component source code for implementation details
3. Examine the hooks for state management patterns
4. Contact the TagadaPay development team for advanced support

## License

This plugin is part of the TagadaPay ecosystem and follows the TagadaPay licensing terms.
