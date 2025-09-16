# Store Plugin

A modern, responsive e-commerce store plugin built with React and TypeScript for TagadaPay. This plugin provides a complete online shopping experience with multi-language support, customizable theming, and comprehensive product management capabilities.

## Features

- **Multi-language Support**: English and French configurations with extensible language system
- **Responsive Design**: Mobile-first approach with Tailwind CSS and modern UI components
- **Dynamic Theming**: Customizable color schemes, spacing, and typography
- **Product Management**: Complete product catalog with variants, filtering, and search
- **Shopping Cart**: Real-time cart management with persistent storage
- **SEO Optimized**: Dynamic metadata, structured data, and search engine friendly URLs
- **Modern UI Components**: Built with Radix UI primitives and custom components
- **Advanced Filtering**: Category, color, and price filtering with sort options
- **Image Galleries**: Mobile-optimized product image galleries with zoom functionality
- **Configurable Branding**: Custom logos, assets, and brand styling
- **Navigation System**: Flexible header and footer navigation with breadcrumbs

## Live Demos

### Default Theme (Light Mode)

```bash
pnpm run deploy:default
```

### Test Theme (Dark Mode)

```bash
pnpm run deploy:test
```

## Configuration

The plugin supports multiple configuration files for different themes and languages:

### Default Configuration (`config/default.tgd.json`)

- **Title**: "Home - Beautiful Products Store"
- **Description**: "Discover our curated collection of refined, minimal products."
- **Keywords**: furniture, home decor, minimal design, modern furniture
- **Theme**: Light mode with clean, minimal aesthetics

### Test Configuration (`config/theme-test.tgd.json`)

- **Title**: "Home - Beautiful Products Store"
- **Description**: "Discover our curated collection of refined, minimal products."
- **Keywords**: furniture, home decor, minimal design, modern furniture
- **Theme**: Dark mode with modern contrast colors

## Configuration Structure

The plugin uses a comprehensive configuration system defined in `src/configuration/schema.ts`:

```typescript
interface Config {
  configName: string;
  products?: {
    productIds?: string[];
  };
  content?: {
    assets?: Assets;
    text?: Record<string, TextContent>;
    seo?: Record<string, Record<string, SEOPage>>;
    navigation?: Navigation;
    links?: Links;
  };
  theme?: Theme;
}
```

### Key Configuration Sections

#### Content Management

- **Assets**: Logo, hero images, placeholders, and thumbnails
- **Text**: Multi-language content for all UI elements
- **SEO**: Page-specific metadata for search optimization
- **Navigation**: Header and footer navigation links
- **Links**: Contact information and social media links

#### Theme Customization

- **Colors**: Complete color palette with semantic naming
- **Spacing**: Layout spacing and margins
- **Typography**: Font families and size scales
- **Border Radius**: Consistent border radius values

## Key Components

### Pages

- **HomePage**: Landing page with hero section and featured products
- **ShopPage**: Product catalog with filtering and sorting
- **ProductPage**: Individual product details with variant selection
- **NotFoundPage**: Custom 404 error page

### Shopping Features

- **ProductGrid**: Responsive product listing with lazy loading
- **ProductCard**: Individual product preview with quick actions
- **VariantSelector**: Product variant selection (size, color, etc.)
- **AddToCart**: Cart management with quantity controls
- **ShopFilters**: Advanced filtering by category, color, and price
- **SortDropdown**: Product sorting options

### UI Components

- **Header**: Navigation with cart indicator and mobile menu
- **Footer**: Contact links and brand information
- **Breadcrumb**: Navigation breadcrumbs for better UX
- **LoadingStates**: Skeleton loaders for better perceived performance
- **MobileGallery**: Touch-optimized image galleries
- **DesktopGallery**: Desktop-optimized product image viewer

## Technology Stack

- **React 19** with TypeScript for type-safe development
- **Tailwind CSS 4** for utility-first styling
- **Radix UI** primitives for accessible components
- **React Router** for client-side navigation
- **TagadaPay Plugin SDK** for e-commerce functionality
- **Zustand** for state management
- **React Hook Form** for form handling
- **Zod** for schema validation
- **Vite** for fast build tooling
- **Motion** for smooth animations

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

### Deployment

```bash
# Deploy with default configuration
pnpm run deploy:default

# Deploy with test theme
pnpm run deploy:test

# Custom deployment
pnpm run deploy
```

## Plugin Architecture

### Direct Mode Configuration

The plugin operates in "direct-mode" with the following router configuration:

- **Base Path**: `/`
- **Matcher**: `.*` (catches all routes)
- **Excluder**: `/checkout` (excludes checkout routes)

### State Management

- **Cart Context**: Manages shopping cart state and persistence
- **Config Context**: Handles theme and content configuration
- **Products Provider**: Manages product data and filtering

### Routing Structure

```
/                     # Home page
/shop                 # Product catalog
/shop/:productId      # Individual product page
/product/:variantId   # Product variant page
/*                    # 404 Not Found
```

## Customization

### Theme Customization

Modify theme colors, spacing, and typography in configuration files:

```json
{
  "theme": {
    "colors": {
      "background": "#ffffff",
      "foreground": "#0a0a0b",
      "primary": "#18181b"
    },
    "spacing": {
      "sides": "1rem",
      "topSpacing": "5rem"
    },
    "typography": {
      "fontFamily": {
        "sans": "var(--font-geist-sans), sans-serif"
      }
    }
  }
}
```

### Content Customization

Update text content for different languages:

```json
{
  "content": {
    "text": {
      "en": {
        "tagline": "Beautiful products, simplified.",
        "heroQuote": "Refined. Minimal. Never boring."
      },
      "fr": {
        "tagline": "De beaux produits, simplifiés.",
        "heroQuote": "Raffiné. Minimal. Jamais ennuyeux."
      }
    }
  }
}
```

### Component Customization

- Override component styles using Tailwind CSS classes
- Extend configuration schema for new features
- Add new language support through configuration files
- Customize navigation and footer links

## SEO Features

The plugin automatically handles SEO optimization:

- **Dynamic Page Titles**: Based on configuration and page context
- **Meta Descriptions**: Customizable per page and language
- **Meta Keywords**: SEO-friendly keyword management
- **Structured Data**: JSON-LD markup for rich snippets
- **Open Graph**: Social media sharing optimization
- **Responsive Meta Tags**: Mobile and desktop optimization

## Performance Features

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Images and components load on demand
- **Optimized Images**: Automatic image optimization
- **Skeleton Loading**: Better perceived performance
- **Efficient State Management**: Minimal re-renders with Zustand
- **Tree Shaking**: Unused code elimination

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Support

For technical support, feature requests, or customization assistance:

1. Review the TagadaPay Plugin SDK documentation
2. Check the configuration schema for available options
3. Examine the component source code for customization examples
4. Contact the TagadaPay development team for advanced support

## License

This plugin is part of the TagadaPay ecosystem and follows the TagadaPay licensing terms.
