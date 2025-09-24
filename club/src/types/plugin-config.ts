export interface PluginConfig {
  configName: string;
  branding: {
    companyName: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
  products: {
    variantId: string;
  };
  texts: {
    enter: {
      title: string;
      subtitle: string;
      poweredBy: string;
      enterButton: string;
      loginEmailPlaceholder: string;
      loginCodePlaceholder: string;
      sendCode: string;
      sendingCode: string;
      verifyCode: string;
      verifyingCode: string;
    };
    subscriptions: {
      mySubscriptions: string;
      subscriptionsLabel: string;
      noActiveSubscriptions: string;
      loadingSubscriptions: string;
      qty: string;
      id: string;
      billingPlan: string;
      customer: string;
      currentPeriod: string;
      trialPeriod: string;
      cancellationNotice: string;
      subscriptionCancellationEndPeriod: string;
      created: string;
      productId: string;
      resumeSubscription: string;
      resuming: string;
      cancelSubscription: string;
      canceling: string;
      cancelSubscriptionTitle: string;
      cancelSubscriptionNotice: string;
      confirmProceed: string;
      yesCancel: string;
      yesLoseBenefits: string;
      keepSubscription: string;
      cancelClubMembership: string;
      byCanceling: string;
      loseClubAdvantages: string;
      loseAccumulatedCredits: string;
      losePromotionCode: string;
      status: {
        active: string;
        trial: string;
        canceling: string;
      };
    };
  };
  meta: {
    title: string;
    description: string;
    tagline: string;
  };
  footer: {
    social: {
      title: string;
      items: Array<{
        icon: string;
        url: string;
        title: string;
      }>;
    };
    sections: Array<{
      title: string;
      items: Array<{
        title: string;
        url: string;
      }>;
    }>;
    poweredBy: string;
    copyright: string;
  };
  header: {
    navigation: {
      benefits: string;
      deals: string;
      faq: string;
      account: string;
    };
    hero: {
      badge: string;
      title: string;
      subtitle: string;
      image: string;
      cta: {
        primary: string;
        secondary: string;
      };
    };
    userStatus: {
      tier: string;
      points: number;
      nextTier: string;
      pointsToNextTier: number;
    };
  };
  benefits: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  offers: {
    badge: string;
    title: string;
    subtitle: string;
    categories: Array<{
      name: string;
      active?: boolean;
    }>;
    errorMessages: {
      loading: string;
      noOffers: string;
      checkBack: string;
    };
    labels: {
      vipOnly: string;
      products: string;
      bundleContents: string;
      addingToCart: string;
      getDealNow: string;
    };
    cta: {
      viewDeal: string;
    };
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{
      image: string;
      name: string;
      title: string;
      quote: string;
    }>;
  };
}
