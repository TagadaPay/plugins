type PluginConfigFooterLinks = {
  text: string;
  href: string;
};

export interface PluginConfig {
  configName: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  features: {
    enableAdvancedRouting: boolean;
    showConfigViewer: boolean;
    demoMode: boolean;
  };
  alert: {
    title: string;
    subtitle: string;
  };
  defaultCurrency: string;
  googleApiKey: string;
  routes: {
    basePath: string;
  };
  logo: string;
  texts: {
    header: {
      logoAlt: string;
    };
    orderSummary: {
      title: string;
      subtotal: string;
      shipping: string;
      shippingFree: string;
      total: string;
      discount: {
        placeholder: string;
        apply: string;
        applying: string;
        remove: string;
        removing: string;
        appliedLabelSuffix: string;
      };
    };
    contact: {
      title: string;
      emailPlaceholder: string;
    };
    delivery: {
      title: string;
      countryLabel: string;
      firstNameLabel: string;
      lastNameLabel: string;
      addressLabel: string;
      addressPlaceholder: string;
      addressSelectCountryFirst: string;
      address2Placeholder: string;
      cityPlaceholder: string;
      statePlaceholder: string;
      postalPlaceholder: string;
      phonePlaceholder: string;
      phoneTooltip: string;
    };
    shippingMethod: {
      title: string;
      subtitle: string;
    };
    payment: {
      title: string;
      cardNumberPlaceholder: string;
      expiryPlaceholder: string;
      cvcPlaceholder: string;
      cvcTooltip: string;
      useShippingAsBilling: string;
      billingTitle: string;
      billing: {
        countryLabel: string;
        firstNameLabel: string;
        lastNameLabel: string;
        addressLabel: string;
        addressPlaceholder: string;
        addressSelectCountryFirst: string;
        address2Placeholder: string;
        cityPlaceholder: string;
        statePlaceholder: string;
        postalPlaceholder: string;
        phonePlaceholder: string;
        phoneTooltip: string;
      };
    };
  };
  terms: {
    title: string;
    paragraphFirst: string;
    paragraphEnd: string;
    bullets: string[];
  };
  footerLinks: {
    refundPolicy: PluginConfigFooterLinks;
    shipping: PluginConfigFooterLinks;
    privacyPolicy: PluginConfigFooterLinks;
    termsOfService: PluginConfigFooterLinks;
    cancellations: PluginConfigFooterLinks;
    contact: PluginConfigFooterLinks;
  };
  customerReviews: {
    name: string;
    review: string;
  }[];
}
