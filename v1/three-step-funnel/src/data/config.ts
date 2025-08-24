// Plugin Configuration
// Update these values with your actual store and variant IDs

export const pluginConfig = {
  // Store configuration
  storeId: "store_16b60f87a695", // Replace with your store ID

  // Product configuration
  product: {
    variantId: "variant_9ec95720c2d1", // Replace with your main product variant ID
    quantity: 1,
  },

  // Default currency (fallback if not provided by SDK)
  defaultCurrency: "USD",

  // Brand configuration
  branding: {
    storeName: "Your Store Name",
    productName: "Your Product Name",
    supportEmail: "support@yourstore.com",
    companyName: "Your Company Name",
  },

  // Funnel configuration
  funnel: {
    step1: {
      title: "Discover the Solution",
      subtitle: "Transform your life with our amazing product",
    },
    step2: {
      title: "Why Choose Us?",
      subtitle: "See what makes us different",
    },
    step3: {
      title: "Complete Your Order",
      subtitle: "Secure checkout in just a few clicks",
    },
  },
};
