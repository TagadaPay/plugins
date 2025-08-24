# White label Three Variants 2 Checkout - Vite React App

This is a React Vite application for the Three Variants 2 checkout process. It has been converted from a Next.js project to use Vite for faster development and building.

## Features

- Modern React 19 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Radix UI components
- TagadaPay plugin SDK integration
- Responsive checkout form
- Order bump functionality
- Thank you page with order summary

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

This will start the development server at `http://localhost:3000`

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
├── App.tsx              # Main app component with routing
├── CheckoutPage.tsx     # Main checkout page
├── main.tsx            # Entry point
├── globals.css         # Global styles
└── thankyou/
    └── ThankYouPage.tsx # Thank you page component
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
- **TagadaPay SDK**: Payment processing integration

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Browser Support

Modern browsers with ES2020+ support.

## Notes

- This project uses client-side routing instead of Next.js file-based routing
- Font loading has been simplified to use system fonts
- The build process is optimized for Vite
- All Next.js specific functionality has been removed
