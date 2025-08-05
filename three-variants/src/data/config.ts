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
  prices: {
    variant_49e1aa3966eb: {
      oneTime: "price_63633c7a9064",
      recurring: "price_0323a652d661",
    },
    variant_d0ef85466f68: {
      oneTime: "price_1d52b0bcfb70",
      recurring: "price_8b5572f4c645",
    },
    variant_2435dd88eb23: {
      oneTime: "price_1127291f0d9e",
      recurring: "price_48bba3c6c086",
    },
  },
  orderBumpId: "up_sell_ob_offer_7c8ddf67a464",
  // Default currency (fallback if not provided by SDK)
  defaultCurrency: "USD",

  // Brand configuration
  branding: {
    storeLogo: "mystore.png",
    storeName: "My store",
    companyWebsite: "mystore.com",
    supportEmail: "mysupport@email.com",
  },
};
