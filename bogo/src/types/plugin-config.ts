import { TranslationText } from "@tagadapay/plugin-sdk/v2";

export interface Review {
  name: TranslationText;
  rating: number;
  text: TranslationText;
  image: string;
  verified: boolean;
}

export interface Testimonial {
  name: TranslationText;
  avatar: string;
  text: TranslationText;
  likes: number;
  time: TranslationText;
}

export interface AppContent {
  redirect: {
    redirectingMessage: TranslationText;
    loadingMessage: TranslationText;
  };
  suspense: {
    defaultLoading: TranslationText;
    checkoutLoading: TranslationText;
    orderLoading: TranslationText;
  };
  errors: {
    orderIdRequiredTitle: TranslationText;
    orderIdRequiredDescription: TranslationText;
  };
}

export interface CheckoutBannerContent {
  title: TranslationText;
  descriptionPrefix: TranslationText;
  freeShippingHighlight: TranslationText;
  descriptionSuffix: TranslationText;
  sellOutRisk: TranslationText;
}

export interface CheckoutNavigationContent {
  secureCheckoutLabel: TranslationText;
  supportLabel: TranslationText;
}

export interface CheckoutNoticeContent {
  freeShipping: TranslationText;
  cartTimer: TranslationText;
  limitedStock: TranslationText;
}

export interface CheckoutPackagesContent {
  title: TranslationText;
  subtitle: TranslationText;
  packageDetailsLabel: TranslationText;
  pricePerUnitLabel: TranslationText;
  loadingMessage: TranslationText;
  bestValueBadge: TranslationText;
  perUnitLabel: TranslationText;
  freeShippingLabel: TranslationText;
}

export interface CheckoutOrderBumpContent {
  badgeLabel: TranslationText;
  title: TranslationText;
  addedBadge: TranslationText;
  headline: TranslationText;
  description: TranslationText;
  priorityProcessing: TranslationText;
  fasterDelivery: TranslationText;
  trackingIncluded: TranslationText;
  dedicatedSupport: TranslationText;
}

export interface CheckoutCustomerInfoContent {
  title: TranslationText;
  firstNamePlaceholder: TranslationText;
  lastNamePlaceholder: TranslationText;
  emailPlaceholder: TranslationText;
  phonePlaceholder: TranslationText;
}

export interface CheckoutShippingInfoContent {
  title: TranslationText;
  countryLabel: TranslationText;
  countryPlaceholder: TranslationText;
  countryToast: TranslationText;
  helperMessage: TranslationText;
  streetLabel: TranslationText;
  streetPlaceholder: TranslationText;
  streetLockedPlaceholder: TranslationText;
  address2Label: TranslationText;
  address2Placeholder: TranslationText;
  cityLabel: TranslationText;
  cityPlaceholder: TranslationText;
  stateLabel: TranslationText;
  stateSelectPlaceholder: TranslationText;
  stateInputPlaceholder: TranslationText;
  stateLockedPlaceholder: TranslationText;
  stateOptionsSuffix: TranslationText;
  stateManualSuffix: TranslationText;
  postalLabel: TranslationText;
  postalPlaceholder: TranslationText;
  requiredFieldsNote: TranslationText;
}

export interface CheckoutPaymentContent {
  title: TranslationText;
  securityMessage: TranslationText;
  cardMethodLabel: TranslationText;
  cardNumberPlaceholder: TranslationText;
  expiryPlaceholder: TranslationText;
  cvcPlaceholder: TranslationText;
  processingLabel: TranslationText;
  buttonLabel: TranslationText;
  buttonProcessingLabel: TranslationText;
  guaranteeTitle: TranslationText;
  guaranteeSubtitle: TranslationText;
  guaranteeBadgeTitle: TranslationText;
  guaranteeBadgeDescription: TranslationText;
  sslBadge: TranslationText;
  encryptionBadge: TranslationText;
  nortonBadge: TranslationText;
  agreementText: TranslationText;
  secureFooter: TranslationText;
}

export interface CheckoutReviewsContent {
  topSectionTitle: TranslationText;
  gridSectionTitle: TranslationText;
  likeAction: TranslationText;
  replyAction: TranslationText;
  verifiedAlt: TranslationText;
  starsAlt: TranslationText;
}

export interface CheckoutStickyContent {
  freeShipping: TranslationText;
  guarantee: TranslationText;
  ssl: TranslationText;
  buttonLabel: TranslationText;
  buttonProcessingLabel: TranslationText;
}

export interface CheckoutFooterContent {
  termsLabel: TranslationText;
  privacyLabel: TranslationText;
  wirelessLabel: TranslationText;
  rightsReserved: TranslationText;
}

export interface CheckoutValidationContent {
  firstNameRequired: TranslationText;
  lastNameRequired: TranslationText;
  emailRequired: TranslationText;
  phoneRequired: TranslationText;
  addressRequired: TranslationText;
  countryRequired: TranslationText;
  cityRequired: TranslationText;
  stateRequired: TranslationText;
  postalRequired: TranslationText;
  cardNumberRequired: TranslationText;
  expiryRequired: TranslationText;
  cvcRequired: TranslationText;
}

export interface CheckoutFieldLabels {
  firstName: TranslationText;
  lastName: TranslationText;
  email: TranslationText;
  phone: TranslationText;
  address1: TranslationText;
  country: TranslationText;
  city: TranslationText;
  state: TranslationText;
  postal: TranslationText;
  cardNumber: TranslationText;
  expiryDate: TranslationText;
  cvc: TranslationText;
}

export interface CheckoutToastContent {
  orderBumpAdded: TranslationText;
  orderBumpRemoved: TranslationText;
  orderBumpFailed: TranslationText;
  pricingUnavailable: TranslationText;
  subscriptionEnabled: TranslationText;
  subscriptionDisabled: TranslationText;
  subscriptionFailed: TranslationText;
  selectionFailed: TranslationText;
  validationField: TranslationText;
  validationGeneric: TranslationText;
  checkoutNotReady: TranslationText;
  stateMissing: TranslationText;
  paymentSuccess: TranslationText;
  paymentSuccessDetailed: TranslationText;
  paymentFailed: TranslationText;
  paymentFailedWithReason: TranslationText;
  paymentVerificationRequired: TranslationText;
  addressToast: TranslationText;
}

export interface CheckoutImagesContent {
  guaranteeBadge: string;
  guaranteeLightBadge: string;
  reviewVerifiedBadge: string;
  reviewStarsBadge: string;
  trustBadges: string;
}

export interface CheckoutContent {
  banner: CheckoutBannerContent;
  navigation: CheckoutNavigationContent;
  notices: CheckoutNoticeContent;
  packages: CheckoutPackagesContent;
  orderBump: CheckoutOrderBumpContent;
  customerInformation: CheckoutCustomerInfoContent;
  shippingInformation: CheckoutShippingInfoContent;
  payment: CheckoutPaymentContent;
  reviews: CheckoutReviewsContent;
  stickyBar: CheckoutStickyContent;
  footer: CheckoutFooterContent;
  validation: CheckoutValidationContent;
  fieldLabels: CheckoutFieldLabels;
  toasts: CheckoutToastContent;
  images: CheckoutImagesContent;
}

export interface ThankYouHeaderContent {
  badge: TranslationText;
  description: TranslationText;
  navConfirmation: TranslationText;
  navSupportLabel: TranslationText;
}

export interface ThankYouOrderContent {
  successAlert: TranslationText;
  title: TranslationText;
  orderNumberPrefix: TranslationText;
  placedOnPrefix: TranslationText;
  itemsTitle: TranslationText;
  noItemsMessage: TranslationText;
  quantityLabel: TranslationText;
  productFallbackAlt: TranslationText;
}

export interface ThankYouShippingContent {
  title: TranslationText;
  phoneLabel: TranslationText;
}

export interface ThankYouGuaranteeContent {
  imageUrl: string;
  imageAlt: TranslationText;
  title: TranslationText;
  description: TranslationText;
}

export interface ThankYouActionsContent {
  continueShopping: TranslationText;
  returnToCheckout: TranslationText;
}

export interface ThankYouFooterContent {
  termsLabel: TranslationText;
  privacyLabel: TranslationText;
  wirelessLabel: TranslationText;
  rightsReserved: TranslationText;
}

export interface ThankYouErrorContent {
  loadingMessage: TranslationText;
  errorTitle: TranslationText;
  errorMessage: TranslationText;
  errorButton: TranslationText;
}

export interface ThankYouContent {
  header: ThankYouHeaderContent;
  order: ThankYouOrderContent;
  shipping: ThankYouShippingContent;
  guarantee: ThankYouGuaranteeContent;
  actions: ThankYouActionsContent;
  footer: ThankYouFooterContent;
  errors: ThankYouErrorContent;
}

export interface PostPurchaseBannerContent {
  offerExpires: TranslationText;
  headline: TranslationText;
  persuasiveMessage: TranslationText;
}

export interface PostPurchaseProductContent {
  badgeLabel: TranslationText;
  priceLabel: TranslationText;
  fallbackProductName: TranslationText;
  fallbackFormula: TranslationText;
  fallbackSupplement: TranslationText;
  fallbackCount: TranslationText;
  sectionTitle: TranslationText;
  supportHeadline: TranslationText;
  powerfulHeadline: TranslationText;
  bulletOne: TranslationText;
  bulletTwo: TranslationText;
  bulletThree: TranslationText;
  claimToday: TranslationText;
  priceSuffix: TranslationText;
  scarcityMessage: TranslationText;
}

export interface PostPurchaseActionsContent {
  confirmLabel: TranslationText;
  processingLabel: TranslationText;
  declineLabel: TranslationText;
  thankYouButton: TranslationText;
}

export interface PostPurchaseFooterContent {
  copyright: TranslationText;
}

export interface PostPurchaseContent {
  bannerImages: {
    specialOffer: string;
    steps: string;
    product: string;
    priceBadge: string;
    trustBadges: string;
  };
  banner: PostPurchaseBannerContent;
  product: PostPurchaseProductContent;
  actions: PostPurchaseActionsContent;
  footer: PostPurchaseFooterContent;
  loadingMessage: TranslationText;
  errorTitle: TranslationText;
  errorButton: TranslationText;
}

export interface PluginContent {
  app: AppContent;
  checkout: CheckoutContent;
  thankYou: ThankYouContent;
  postPurchase: PostPurchaseContent;
}

export interface PluginConfig {
  configName: string;
  branding: {
    logoUrl: string;
    companyName: TranslationText;
    supportEmail: string;
    storeName: TranslationText;
  };
  variants: {
    regular: string;
    bogo: string;
    special: string;
  };
  prices: Record<
    string,
    {
      oneTime: string;
      recurring?: string;
    }
  >;
  orderBumpId: string;
  defaultCurrency: string;
  features: {
    enableAdvancedRouting: boolean;
    showConfigViewer: boolean;
    demoMode: boolean;
  };
  googleApiKey: string;
  routes: {
    basePath: string;
  };
  content: PluginContent;
  reviews: Review[];
  testimonials: Testimonial[];
}
