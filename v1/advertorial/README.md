# Advertorial Template

A professional advertorial template that presents products through editorial-style content with embedded checkout functionality. Built with React, TypeScript, and the Tagadapay SDK.

## 🎯 Features

- **Editorial Design**: News article-style layout that builds trust and credibility
- **Seamless Checkout**: Embedded checkout form that feels natural within the content flow
- **Tagadapay Integration**: Full payment processing with the Tagadapay SDK
- **Responsive Design**: Mobile-first design optimized for all devices
- **Form Validation**: Robust form validation with Zod and React Hook Form
- **Auto-Save**: Automatic form data persistence during checkout
- **News Typography**: Professional typography that mimics real news websites
- **Social Proof**: Built-in testimonials and trust indicators
- **TypeScript**: Full type safety throughout the application

## 📁 Project Structure

```
src/
├── components/
│   ├── Providers.tsx        # Tagadapay SDK provider
│   ├── AdvertorialPage.tsx  # Main article page with embedded checkout
│   └── ThankYouPage.tsx     # Success/confirmation page
├── data/
│   └── config.ts           # Plugin configuration & content
├── App.tsx                 # Main application with routing
├── main.tsx               # Application entry point
├── index.css              # Global styles with editorial typography
└── vite-env.d.ts          # Vite type definitions
```

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Copy template to your project location
cp -r templates/advertorial your-advertorial-name
cd your-advertorial-name

# Install dependencies
npm install
```

### 2. Configure Your Store and Content

Edit `src/data/config.ts` with your store details and article content:

```typescript
export const pluginConfig = {
  // Store configuration
  storeId: "store_YOUR_STORE_ID", // Replace with your actual store ID
  
  // Product configuration
  product: {
    variantId: "variant_YOUR_VARIANT_ID", // Replace with your product variant ID
    quantity: 1,
  },

  // Brand configuration
  branding: {
    storeName: "Your Store Name",
    productName: "Your Product Name",
    supportEmail: "support@yourstore.com",
    companyName: "Your Company Name",
  },

  // Editorial content
  editorial: {
    siteName: "Health & Wellness News",
    headline: "Revolutionary Discovery Leaves Doctors Speechless",
    subheadline: "New breakthrough helps thousands reclaim their health naturally",
    author: "Dr. Sarah Johnson",
    authorTitle: "Health & Wellness Expert",
    // ... customize all content
  },
};
```

### 3. Update Account ID

In `src/App.tsx`, replace the account ID:

```typescript
const accountId = 'acc_YOUR_ACCOUNT_ID'; // Replace with your account ID
```

### 4. Customize Your Article Content

The advertorial template includes several content sections you can customize:

#### Headlines and Story Flow
- **Headline**: Main attention-grabbing headline
- **Subheadline**: Supporting headline that builds interest
- **Introduction**: Opening paragraph that hooks the reader
- **Problem**: Describes the challenge your product solves
- **Solution**: Introduces your product as the solution
- **Proof**: Social proof and testimonials
- **Urgency**: Creates urgency to purchase now

#### Visual Elements
- **Author Information**: Credible author with title and expertise
- **Publication Details**: Date, reading time, category
- **Testimonials**: Real customer quotes and stories
- **Trust Indicators**: Security badges, guarantees, certifications

## 🎨 Content Customization

### Writing Effective Advertorials

1. **Start with a Hook**: Use an attention-grabbing headline that sounds like real news
2. **Build Credibility**: Include author credentials, publication date, and professional formatting
3. **Tell a Story**: Use narrative structure to engage readers emotionally
4. **Include Social Proof**: Add testimonials, reviews, and expert quotes
5. **Create Urgency**: Use limited-time offers or scarcity to encourage action
6. **Natural Product Integration**: Introduce your product as part of the story, not as an obvious ad

### Editorial Style Guidelines

- **Typography**: Uses Georgia serif font for body text (editorial standard)
- **Headlines**: Sans-serif fonts for headlines (news website standard)
- **Color Scheme**: Professional news colors (red, blue, gray)
- **Layout**: Single-column layout with proper spacing
- **Quotes**: Styled quote blocks for testimonials and expert opinions

### Customizing Content Sections

#### Article Header
```typescript
editorial: {
  siteName: "Your News Site",
  category: "Health", // or "Business", "Technology", etc.
  publishDate: "December 15, 2024",
  author: "Your Expert Name",
  authorTitle: "Your Title/Credentials",
}
```

#### Story Content
```typescript
story: {
  introduction: "Your opening paragraph...",
  problem: "Description of the problem...",
  solution: "How your product solves it...",
  proof: "Evidence and testimonials...",
  urgency: "Why they need to act now...",
}
```

#### Testimonials
```typescript
testimonials: [
  {
    name: "Customer Name",
    age: 45,
    location: "City, State",
    quote: "Their testimonial quote...",
    image: "/path-to-image.jpg"
  }
]
```

## 🚦 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Deployment

### Using Tagadapay CLI

```bash
# Build and deploy to development
npm run deploy:dev

# Build and deploy to staging
npm run deploy:staging

# Build and deploy to production
npm run deploy:prod
```

### Manual Deployment

```bash
# Build the project
npm run build

# The built files will be in the `dist` folder
# Upload these files to your hosting provider
```

## 🔧 Technical Details

### Dependencies

**Core:**
- React 19 - UI library
- React Router DOM - Client-side routing
- TypeScript - Type safety

**Tagadapay:**
- @tagadapay/plugin-sdk - Payment processing and checkout management

**Forms & Validation:**
- React Hook Form - Form management
- Zod - Schema validation
- @hookform/resolvers - Form validation integration

**UI & Styling:**
- Tailwind CSS - Utility-first CSS framework
- Lucide React - Icon library
- React Hot Toast - Toast notifications

**Build Tools:**
- Vite - Fast build tool and dev server
- TypeScript - Type checking and compilation

### Editorial Typography

The template uses professional editorial typography:

- **Body Text**: Georgia serif font for readability
- **Headlines**: Helvetica/Arial sans-serif for impact
- **Line Height**: 1.7 for comfortable reading
- **Font Sizes**: 18px base for article content
- **Color Palette**: Professional news website colors

### Performance

- **Bundle Size**: ~180KB gzipped (including SDK)
- **First Load**: ~1.0s on 3G
- **Reading Experience**: Optimized for long-form content consumption

## 🎯 Best Practices

### Advertorial Writing

1. **Hook the Reader**: Start with compelling, news-worthy headline
2. **Build Trust**: Use credible author, professional formatting
3. **Tell a Story**: Engage emotionally before selling
4. **Provide Proof**: Include testimonials, studies, expert quotes
5. **Natural Integration**: Present product as solution, not advertisement
6. **Clear Call-to-Action**: Make ordering feel like logical next step

### Legal and Compliance

- **Disclosure**: Always include proper advertising disclosures
- **Claims**: Ensure all health/benefit claims are substantiated
- **Testimonials**: Use real, verified customer testimonials
- **Disclaimers**: Include appropriate disclaimers for your industry
- **FTC Guidelines**: Follow FTC guidelines for native advertising

### Conversion Optimization

- **Mobile-First**: Most readers will be on mobile devices
- **Scannable Content**: Use headers, bullets, and short paragraphs
- **Social Proof**: Include multiple forms of credibility
- **Urgency**: Create legitimate reasons to act now
- **Trust Signals**: Security badges, guarantees, contact info

## 🐛 Troubleshooting

### Common Issues

**Content Not Displaying:**
- Check that all config fields are properly filled out
- Verify testimonials array has valid structure

**Checkout Issues:**
- Verify store ID and account ID are correct
- Check that the product variant exists and is active
- Ensure payment processing is enabled for your account

**Styling Issues:**
- Clear browser cache
- Check that Tailwind CSS classes are properly applied
- Verify custom CSS doesn't conflict with Tailwind

### Getting Help

- Check the [Tagadapay Documentation](https://docs.tagadapay.com)
- Review the [Plugin SDK Guide](https://docs.tagadapay.com/plugin-sdk)
- Contact support: support@tagadapay.com

## 📄 Legal Considerations

When using this advertorial template:

1. **Disclosure Requirements**: Include clear advertising disclosures
2. **Truth in Advertising**: Ensure all claims are truthful and substantiated
3. **Industry Regulations**: Follow regulations specific to your industry
4. **Platform Policies**: Comply with advertising policies of platforms where you'll run traffic

## 📈 Analytics and Tracking

Consider implementing:

- **Scroll Tracking**: See how far people read
- **Conversion Tracking**: Track where readers convert
- **A/B Testing**: Test different headlines and content
- **Heatmaps**: Understand user behavior patterns

## 🤝 Contributing

To improve this template:

1. Make your changes
2. Test thoroughly with different content types
3. Update documentation
4. Submit for review

---

**Happy publishing! 📰** 