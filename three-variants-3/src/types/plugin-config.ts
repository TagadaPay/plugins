export interface PluginConfig {
  configName: string;
  logoUrl: string;
  companyName: string;
  disclaimer: string;
  header?: {
    contactUsLabel: string;
    sslBadgeText?: string;
  };
  satisfactionGuarantee: {
    strong: string;
    text: string;
  };
  orderBump: {
    title: string;
    description: string;
    callToActionText: string;
  };
  discountPercentage: number;
  texts?: {
    discountApplied: string; // supports {discount}
    bulkDiscountNotice: string;
    countryHelp: string;
    paymentSecure: string;
  };
  steps?: {
    step1Title: string;
    step2Title: string;
    step3Title: string;
    step4Title: string;
    step5Title: string;
  };
  placeholders?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1WhenCountrySelected: string;
    address1WhenNoCountry: string;
    address2: string;
    city: string;
    stateSelect: string;
    stateInputWhenCountrySelected: string;
    stateInputWhenNoCountry: string;
    postal: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
  };
  labels?: {
    requiredFieldNote: string;
    bestSelling: string;
    bestValue: string;
    each: string;
    starterDoseOnly: string;
    cardMethod: string;
    faqSectionTitle: string;
    noItemsInCart: string;
    subtotal: string;
    total: string;
    product: string;
  };
  buttons?: {
    payCta: string;
    processingPayment: string;
  };
  variants: {
    regular: string;
    bogo: string;
    special: string;
  };
  prices: {
    [variantId: string]: string;
  };
  hero: {
    title: string;
    imageUrl: string;
    subtitles: {
      strong: string;
      text: string;
    }[];
  };
  faqTitle: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  testimonials: {
    name: string;
    text: string;
    imageUrl: string;
  }[];
  contactEmail: string;
  defaultCurrency: string;
  upsellId: string;
  footer?: {
    termsLabel: string;
    privacyLabel: string;
    returnsLabel: string;
    copyright?: string;
  };
  features: {
    enableAdvancedRouting: boolean;
    showConfigViewer: boolean;
    demoMode: boolean;
  };
  googleApiKey: string;
  routes: {
    basePath: string;
  };
  thankyou?: {
    errorTitle: string;
    errorDescription: string;
    backToCheckoutLabel: string;
    title: string;
    subtitle: string;
    itemsOrderedTitle: string;
    savePrefix: string; // e.g., "Save"
  };
}
