// Plugin Configuration
// Update these values with your actual store and variant IDs

export const pluginConfig = {
  // Store configuration
  storeId: "store_67cf1c56d860", // Replace with your store ID
  accountId: "acc_828cfa1ba40d",

  // Variant mappings for different bundle options
  variants: {
    regular: "variant_49e1aa3966eb",
    bogo: "variant_d0ef85466f68",
    special: "variant_2435dd88eb23",
  },
  orderBumpId: "upsell_a89d146fa76e",
  // Default currency (fallback if not provided by SDK)
  defaultCurrency: "USD",

  // Brand configuration
  branding: {
    storeName: "My store name",
    companyWebsite: "mystore.com",
    supportEmail: "mysupport@email.com",
  },
};
