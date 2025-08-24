// Plugin Configuration
// Update these values with your actual store and variant IDs

export const pluginConfig = {
  // Store configuration
  storeId: "store_8ba94c4a1ddb", // Same as three-step-funnel
  accountId: "acc_828cfa1ba40d", // Same as three-step-funnel

  // Product configuration
  product: {
    variantId: "variant_c45f01c3253f", // Same as three-step-funnel
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

  // News/Editorial configuration
  editorial: {
    siteName: "Health & Wellness News",
    publishDate: "December 15, 2024",
    author: "Dr. Sarah Johnson",
    authorTitle: "Health & Wellness Expert",
    category: "Health",
    readTime: "5 min read",

    // Article content
    headline: "Revolutionary Discovery Leaves Doctors Speechless",
    subheadline:
      "New breakthrough helps thousands reclaim their health naturally",

    // Story sections
    story: {
      introduction:
        "In a groundbreaking study that has captured the attention of the medical community...",
      problem:
        "For years, millions have struggled with this common health challenge...",
      solution:
        "But now, researchers have discovered a remarkable natural solution...",
      proof: "The results speak for themselves. In clinical trials...",
      urgency: "However, due to limited supplies and growing demand...",
    },

    // Social proof
    testimonials: [
      {
        name: "Maria Rodriguez",
        age: 45,
        location: "Austin, TX",
        quote: "I couldn't believe the difference in just 30 days!",
        image: new URL("../../assets/maria-rodriguez.png", import.meta.url)
          .href,
      },
      {
        name: "James Peterson",
        age: 52,
        location: "Denver, CO",
        quote:
          "This completely changed my life. I wish I had found this sooner.",
        image: new URL("../../assets/james-peterson.png", import.meta.url).href,
      },
    ],
  },
};
