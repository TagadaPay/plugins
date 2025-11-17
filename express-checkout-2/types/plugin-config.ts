import { TranslationText } from "@tagadapay/plugin-sdk/v2";

type PluginConfigFooterLink = {
  text?: TranslationText;
  href?: string;
};

export interface PluginConfig {
  configName?: string;
  metadata?: {
    title?: TranslationText;
    description?: TranslationText;
    keywords?: string[];
  };
  defaultCurrency?: string;
  googleApiKey?: string;
  features?: {
    enableAdvancedRouting?: boolean;
    showConfigViewer?: boolean;
    demoMode?: boolean;
  };
  routes?: {
    basePath?: string;
  };
  logo?: string;
  theme?: {
    colors?: {
      pageBackground?: string;
      panelBackground?: string;
      panelBackgroundSoft?: string;
      panelHoverBackground?: string;
      border?: string;
      mutedText?: string;
      badgeBackground?: string;
      chartAccent?: string;
      placeholder?: string;
    };
  };
  alert?: {
    title?: TranslationText;
    subtitle?: TranslationText;
  };
  texts?: {
    name?: TranslationText;
    app?: {
      loading?: TranslationText;
      checkoutTokenRequiredTitle?: TranslationText;
      checkoutTokenRequiredDescription?: TranslationText;
      orderIdRequiredTitle?: TranslationText;
      orderIdRequiredDescription?: TranslationText;
    };
    header?: {
      logoAlt?: TranslationText;
    };
    orderSummary?: {
      title?: TranslationText;
      subtotal?: TranslationText;
      shipping?: TranslationText;
      tax?: TranslationText;
      shippingFree?: TranslationText;
      total?: TranslationText;
      discount?: {
        placeholder?: TranslationText;
        apply?: TranslationText;
        applying?: TranslationText;
        remove?: TranslationText;
        removing?: TranslationText;
        appliedLabelSuffix?: TranslationText;
      };
    };
    contact?: {
      title?: TranslationText;
      emailPlaceholder?: TranslationText;
    };
    delivery?: {
      title?: TranslationText;
      countryLabel?: TranslationText;
      countrySelectedToast?: TranslationText;
      firstNameLabel?: TranslationText;
      lastNameLabel?: TranslationText;
      addressLabel?: TranslationText;
      addressPlaceholder?: TranslationText;
      addressSelectCountryFirst?: TranslationText;
      address2Placeholder?: TranslationText;
      cityPlaceholder?: TranslationText;
      statePlaceholder?: TranslationText;
      postalPlaceholder?: TranslationText;
      phonePlaceholder?: TranslationText;
      phoneTooltip?: TranslationText;
    };
    shippingMethod?: {
      title?: TranslationText;
      subtitle?: TranslationText;
    };
    payment?: {
      title?: TranslationText;
      cardNumberPlaceholder?: TranslationText;
      expiryPlaceholder?: TranslationText;
      cvcPlaceholder?: TranslationText;
      cvcTooltip?: TranslationText;
      useShippingAsBilling?: TranslationText;
      billingTitle?: TranslationText;
      billing?: {
        countryLabel?: TranslationText;
        firstNameLabel?: TranslationText;
        lastNameLabel?: TranslationText;
        addressLabel?: TranslationText;
        addressPlaceholder?: TranslationText;
        addressSelectCountryFirst?: TranslationText;
        address2Placeholder?: TranslationText;
        cityPlaceholder?: TranslationText;
        statePlaceholder?: TranslationText;
        postalPlaceholder?: TranslationText;
        phonePlaceholder?: TranslationText;
        phoneTooltip?: TranslationText;
      };
      applePay?: {
        buttonLabel?: TranslationText;
        processingLabel?: TranslationText;
      };
    };
    postPurchase?: {
      orderIdRequiredTitle?: TranslationText;
      orderIdRequiredDescription?: TranslationText;
      loadingTitle?: TranslationText;
      loadingMessage?: TranslationText;
      errorTitle?: TranslationText;
      errorMessage?: TranslationText;
      errorRedirectMessage?: TranslationText;
      preparingTitle?: TranslationText;
      preparingMessage?: TranslationText;
      timerLabel?: TranslationText;
      headerTitle?: TranslationText;
      headerSubtitle?: TranslationText;
      offerPositionLabel?: TranslationText;
      bannerBadge?: TranslationText;
      bannerSubtitle?: TranslationText;
      chooseVariantLabel?: TranslationText;
      summaryTitle?: TranslationText;
      summaryOriginalTotalLabel?: TranslationText;
      summaryYouSaveLabel?: TranslationText;
      summaryTotalWithUpgradeLabel?: TranslationText;
      primaryCtaLabel?: TranslationText;
      primaryCtaProcessingLabel?: TranslationText;
      secondaryCtaLabel?: TranslationText;
      toastOfferAccepted?: TranslationText;
      toastOfferFailedNext?: TranslationText;
      toastOfferFailedRedirect?: TranslationText;
      toastVariantFailed?: TranslationText;
    };
    thankYou?: {
      loadingText?: TranslationText;
      errorTitle?: TranslationText;
      errorDescription?: TranslationText;
      returnToCheckout?: TranslationText;
      title?: TranslationText;
      subtitle?: TranslationText;
      continueShopping?: TranslationText;
      orderDetails?: {
        title?: TranslationText;
        orderNumber?: TranslationText;
        orderDate?: TranslationText;
        paymentStatus?: TranslationText;
        fulfillmentStatus?: TranslationText;
        totalPaid?: TranslationText;
      };
      shipping?: {
        title?: TranslationText;
        shipTo?: TranslationText;
      };
      billing?: {
        title?: TranslationText;
        billTo?: TranslationText;
      };
      customer?: {
        title?: TranslationText;
        email?: TranslationText;
        phone?: TranslationText;
      };
      nextSteps?: {
        title?: TranslationText;
        step1?: {
          title?: TranslationText;
          description?: TranslationText;
        };
        step2?: {
          title?: TranslationText;
          description?: TranslationText;
        };
        step3?: {
          title?: TranslationText;
          description?: TranslationText;
        };
      };
      support?: {
        title?: TranslationText;
        description?: TranslationText;
        emailButton?: TranslationText;
        phoneButton?: TranslationText;
      };
    };
  };
  notifications?: {
    discount?: {
      enterCode?: TranslationText;
      applied?: TranslationText;
      invalid?: TranslationText;
      removed?: TranslationText;
      removeFailed?: TranslationText;
    };
    validation?: {
      fieldError?: TranslationText;
      genericError?: TranslationText;
      stateRequired?: TranslationText;
    };
    checkout?: {
      sessionNotReady?: TranslationText;
      fatalErrorTitle?: TranslationText;
      fatalErrorMessage?: TranslationText;
    };
    payment?: {
      success?: TranslationText;
      detailedSuccess?: TranslationText;
      failure?: TranslationText;
      verification?: TranslationText;
      genericError?: TranslationText;
    };
    applePay?: {
      success?: TranslationText;
      failure?: TranslationText;
      cancelled?: TranslationText;
    };
  };
  links?: {
    checkoutUrl?: string;
    continueShoppingUrl?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
  terms?: {
    title?: TranslationText;
    paragraphFirst?: TranslationText;
    paragraphEnd?: TranslationText;
    bullets?: TranslationText[];
  };
  footerLinks?: {
    refundPolicy?: PluginConfigFooterLink;
    shipping?: PluginConfigFooterLink;
    privacyPolicy?: PluginConfigFooterLink;
    termsOfService?: PluginConfigFooterLink;
    cancellations?: PluginConfigFooterLink;
    contact?: PluginConfigFooterLink;
  };
  customerReviews?: {
    name?: string;
    review?: string;
  }[];
}
