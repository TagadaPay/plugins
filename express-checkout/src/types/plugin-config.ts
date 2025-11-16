export interface OrderItemConfig {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  imageUrl?: string;
}

export interface CheckoutTextConfig {
  header?: {
    title?: string;
    subtitle?: string;
  };
  contact?: {
    title?: string;
    emailLabel?: string;
    emailPlaceholder?: string;
    phoneLabel?: string;
    phonePlaceholder?: string;
  };
  shipping?: {
    title?: string;
    countryLabel?: string;
    countryHint?: string;
    countryPlaceholder?: string;
    countryHelper?: string;
    countrySelectedToast?: string;
    addressLabel?: string;
    addressPlaceholder?: string;
    addressPlaceholderNoCountry?: string;
    address2Label?: string;
    address2Placeholder?: string;
    cityLabel?: string;
    cityPlaceholder?: string;
    postalLabel?: string;
    postalPlaceholder?: string;
    stateLabel?: string;
    statePlaceholder?: string;
    stateSelectPlaceholder?: string;
    stateInputLabel?: string;
  };
  shippingMethod?: {
    title?: string;
    badge?: string;
    noteTitle?: string;
    note?: string;
    freeLabel?: string;
  };
  payment?: {
    title?: string;
    cardNumberLabel?: string;
    cardNumberPlaceholder?: string;
    expiryLabel?: string;
    expiryPlaceholder?: string;
    cvcLabel?: string;
    cvcPlaceholder?: string;
  };
  orderSummary?: {
    title?: string;
    subtotalLabel?: string;
    shippingLabel?: string;
    shippingCalculatedText?: string;
    taxLabel?: string;
    discountLabel?: string;
    totalLabel?: string;
    quantityLabel?: string;
  };
  buttons?: {
    completeOrderLabel?: string;
    processingLabel?: string;
  };
  messages?: {
    initializing?: string;
    securityTitle?: string;
    securitySubtitle?: string;
  };
  errors?: {
    validation?: string;
    stateRequired?: string;
    checkoutNotReady?: string;
    initFailed?: string;
  };
  notifications?: {
    paymentSuccess?: string;
    paymentFailed?: string;
    paymentFailedWithReason?: string;
    paymentVerification?: string;
  };
}

export interface ExpressLiteTextConfig {
  headerTitle?: string;
  headerSubtitle?: string;
  cardTitle?: string;
  contactLabel?: string;
  emailPlaceholder?: string;
  nameLabel?: string;
  firstNamePlaceholder?: string;
  lastNamePlaceholder?: string;
  addressLabel?: string;
  addressPlaceholder?: string;
  cityPlaceholder?: string;
  postalPlaceholder?: string;
  paymentLabel?: string;
  cardPlaceholder?: string;
  expiryPlaceholder?: string;
  cvcPlaceholder?: string;
  buttonLabel?: string;
  processingLabel?: string;
  securityNote?: string;
  loadingText?: string;
}

export interface ThankYouNextStep {
  title?: string;
  description?: string;
}

export interface ThankYouActionsConfig {
  trackOrder?: string;
  contactSupport?: string;
  continueShopping?: string;
  helpTitle?: string;
  helpText?: string;
  helpLink?: string;
}

export interface ThankYouTextConfig {
  loadingText?: string;
  errorTitle?: string;
  errorMessage?: string;
  returnToCheckout?: string;
  successTitle?: string;
  successSubtitle?: string;
  orderDetailsTitle?: string;
  orderNumberLabel?: string;
  orderDateLabel?: string;
  itemsTitle?: string;
  itemsQuantityLabel?: string;
  noItemsText?: string;
  shippingInfoTitle?: string;
  deliveryAddressTitle?: string;
  estimatedDeliveryTitle?: string;
  estimatedDeliveryWindow?: string;
  phoneLabel?: string;
  nextStepsTitle?: string;
  nextSteps?: ThankYouNextStep[];
  orderSummaryTitle?: string;
  subtotalLabel?: string;
  discountLabel?: string;
  shippingLabel?: string;
  taxLabel?: string;
  totalPaidLabel?: string;
  freeLabel?: string;
  paymentConfirmedTitle?: string;
  paymentConfirmedText?: string;
  actions?: ThankYouActionsConfig;
}

export interface PostPurchaseTextConfig {
  orderIdRequiredTitle?: string;
  orderIdRequiredMessage?: string;
  loadingTitle?: string;
  loadingMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  errorRedirectMessage?: string;
  preparingTitle?: string;
  preparingMessage?: string;
  timerLabel?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  offerPositionLabel?: string;
  bannerBadge?: string;
  bannerSubtitle?: string;
  itemsTitle?: string;
  chooseVariantLabel?: string;
  summaryTitle?: string;
  summaryOriginalTotalLabel?: string;
  summaryYouSaveLabel?: string;
  summaryTotalWithUpgradeLabel?: string;
  primaryCtaLabel?: string;
  primaryCtaProcessingLabel?: string;
  secondaryCtaLabel?: string;
  toastOfferAccepted?: string;
  toastOfferFailedNext?: string;
  toastOfferFailedRedirect?: string;
  toastVariantFailed?: string;
}

export interface ExpressCheckoutTexts {
  checkout?: CheckoutTextConfig;
  expressLite?: ExpressLiteTextConfig;
  thankYou?: ThankYouTextConfig;
  postPurchase?: PostPurchaseTextConfig;
}

export interface BrandingConfig {
  companyName?: string;
  primaryColor?: string;
  textColorOnPrimary?: string;
  accentColor?: string;
  logoUrl?: string;
}

export interface LinksConfig {
  checkoutUrl?: string;
  continueShoppingUrl?: string;
  trackOrderUrl?: string;
  supportUrl?: string;
}

export interface ImagesConfig {
  placeholderProduct?: string;
}

export interface ExpressCheckoutConfig {
  configName?: string;
  branding?: BrandingConfig;
  products?: {
    variantId?: string;
  };
  googleApiKey?: string;
  links?: LinksConfig;
  images?: ImagesConfig;
  orderItems?: OrderItemConfig[];
  texts?: ExpressCheckoutTexts;
}
