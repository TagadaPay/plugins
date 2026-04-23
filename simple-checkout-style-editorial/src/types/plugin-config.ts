import { TranslationText } from "@tagadapay/plugin-sdk/v2";

interface BottomLink {
    label?: TranslationText;
    url?: string;
}

export interface Section {
    useIconUrl?: boolean;
    id?: string;
    iconUrl?: string;
    icon?: string;
    titleTrans?: TranslationText;
    descriptionTrans?: TranslationText;
    size?: number;
}

export interface PluginConfigData {
    // Checkout page scarcity timer
    checkoutScarcity?: {
        enabled?: boolean;
        seconds?: number;
        messageTrans?: TranslationText;
        color?: string;
    };

    // Offer page scarcity timer
    offerScarcity?: {
        enabled?: boolean;
        seconds?: number;
        messageTrans?: TranslationText;
        color?: string;
    };

    branding?: {
        primaryColor?: string;
        textColorOnPrimary?: string;
        textColor?: string;
        textSecondaryColor?: string;
        backgroundColor?: string;
        borderColor?: string;
        fontFamily?: string;
    };
    header?: {
        showLogo?: boolean;
        companyName?: string;
        logoUrl?: string;
        logoHeight?: number;
        backgroundColor?: string;
        backgroundImage?: string;
        goToShopText?: TranslationText;
        goToShopTextColor?: string;
        borderColor?: string;
    };
    layout?: {
        desktopMargin?: "small" | "medium" | "large";
        stickyOrderSummary?: boolean;
        stickyPaymentButtons?: boolean;
    };
    cardNetworks?: Array<{ id: string; name?: string; imageUrl?: string }>;

    checkoutSettings?: {
        showExpressCheckout?: boolean;
        hideRecurringPrices?: boolean;
        requireTerms?: boolean;
        requirePhone?: boolean;
        requireValidPhoneNumber?: boolean;
        requireAddressNumber?: boolean;
        precheckMarketing?: boolean;
        showMarketingCheckbox?: boolean;
        mergeContactAndDelivery?: boolean;
        displaySecureCheckoutText?: boolean;
        orderSummaryOpenByDefault?: boolean;
        showCartCustomAttributes?: boolean;
        showLineItemProperties?: boolean;
    };
    addressSettings?: {
        digitalProduct?: boolean;
        hideStateSelector?: boolean;
        forcedCountry?: string;
    };
    orderSummarySettings?: {
        backgroundColor?: string;
        opacity?: number;
    };
    offerSettings?: {
        cardBackgroundColor?: string;
        cardOpacity?: number;
    };
    shippingRateSettings?: {
        displayShippingRate?: boolean;
        countryRestrictionsFromShippingRates?: boolean;
        requireShippingRate?: boolean;
        availableShippingCountries?: string[];
    };

    checkout?: {
        title?: TranslationText;
        expressCheckout?: {
            title?: TranslationText;
            description?: TranslationText;
            dividerText?: TranslationText;
        };
        contact?: {
            title?: TranslationText;
            description?: TranslationText;
            emailPlaceholder?: TranslationText;
            emailOffersLabel?: TranslationText;
        };
        delivery?: {
            title?: TranslationText;
            description?: TranslationText;
            countryPlaceholder?: TranslationText;
            countrySearchPlaceholder?: TranslationText;
            firstNamePlaceholder?: TranslationText;
            lastNamePlaceholder?: TranslationText;
            addressPlaceholder?: TranslationText;
            addressPlaceholderNoCountry?: TranslationText;
            apartmentPlaceholder?: TranslationText;
            cityPlaceholder?: TranslationText;
            statePlaceholder?: TranslationText;
            zipPlaceholder?: TranslationText;
            phonePlaceholder?: TranslationText;
            billingDifferentLabel?: TranslationText;
            billingTitle?: TranslationText;
            showBillingAddressText?: TranslationText;
        };
        shipping?: {
            title?: TranslationText;
            description?: TranslationText;
            freeText?: TranslationText;
            noRatesText?: TranslationText;
        };
        payment?: {
            title?: TranslationText;
            description?: TranslationText;
            cardNumberPlaceholder?: TranslationText;
            expiryPlaceholder?: TranslationText;
            securityCodePlaceholder?: TranslationText;
            creditCard?: TranslationText;
            creditCardSecureText?: TranslationText;
            completePaymentText?: TranslationText;
            paypalRedirectText?: TranslationText;
            applePayRedirectText?: TranslationText;
            cryptoRedirectText?: TranslationText;
            cryptoInfoTitle?: TranslationText;
            cryptoSteps?: Array<{ text: TranslationText }>;
            cryptoBadges?: Array<{ text: TranslationText; icon?: string }>;
            cryptoProviderLabel?: TranslationText;
            cryptoSelectProvider?: TranslationText;
            cryptoSearchProvider?: TranslationText;
            cryptoNoProvider?: TranslationText;
            cardNetworksTooltipText?: TranslationText;
            airwallexApm?: Record<string, {
                description?: TranslationText;
                redirectLabel?: TranslationText;
            }>;
            stripeApm?: Record<string, {
                description?: TranslationText;
                redirectLabel?: TranslationText;
            }>;
        };
        orderCompletion?: {
            klarnaText?: TranslationText;
            processingText?: TranslationText;
            completeOrderText?: TranslationText;
            secureCheckoutText?: TranslationText;
            loadingText?: TranslationText;
            payWithVipText?: TranslationText;
            selectVipOffer?: TranslationText;
            cancelVipOffer?: TranslationText;
            payWithoutVipText?: TranslationText;
            applePayText?: TranslationText;
            termsLabel?: TranslationText;
            navigatingText?: TranslationText;
            whopPayText?: TranslationText;
            verifyingIdentityText?: TranslationText;
            securePaymentText?: TranslationText;
        };
        orderBumps?: {
            title?: TranslationText;
            description?: TranslationText;
            secondaryTitle?: TranslationText;
            secondaryDescription?: TranslationText;
            vipTitle?: TranslationText;
            vipDescription?: TranslationText;
            vipType?: "default" | "branded";
            vipLogoUrl?: string;
            appliedText?: TranslationText;
            enjoyDiscountText?: TranslationText;
            youSaveText?: TranslationText;
            congratulationsText?: TranslationText;
            savedInstantlyText?: TranslationText;
            cancelText?: TranslationText;
        };
        orderSummary?: {
            title?: TranslationText;
            description?: TranslationText;
            subtotalText?: TranslationText;
            itemText?: TranslationText;
            itemsText?: TranslationText;
            totalSavingsText?: TranslationText;
            shippingText?: TranslationText;
            taxText?: TranslationText;
            totalText?: TranslationText;
            recurringTotalText?: TranslationText;
            everyText?: TranslationText;
            mobileToggleShowText?: TranslationText;
            mobileToggleHideText?: TranslationText;
            recurringEveryText?: TranslationText;
            membershipText?: TranslationText;
            trialThenEveryText?: TranslationText;
            renewsEveryText?: TranslationText;
        };
        validation?: {
            emailRequired?: TranslationText;
            firstNameRequired?: TranslationText;
            lastNameRequired?: TranslationText;
            addressRequired?: TranslationText;
            cityRequired?: TranslationText;
            countryRequired?: TranslationText;
            stateRequired?: TranslationText;
            zipRequired?: TranslationText;
            phoneRequired?: TranslationText;
            validPhoneNumberRequired?: TranslationText;
            cardNumberRequired?: TranslationText;
            expiryRequired?: TranslationText;
            securityCodeRequired?: TranslationText;
            shippingMethodRequired?: TranslationText;
            paymentMethodRequired?: TranslationText;
            termsRequired?: TranslationText;
        };
        errors?: {
            checkoutSessionNotInitialized?: TranslationText;
            checkoutSessionNotReady?: TranslationText;
            sessionTimeout?: TranslationText;
            initFailed?: TranslationText;
            noCheckoutSession?: TranslationText;
            paymentFailed?: TranslationText;
            paymentFailedSuggestion?: TranslationText;
            checkoutError?: TranslationText;
            failedToLoadAddressDetails?: TranslationText;
            errorLoadingOrderSummary?: TranslationText;
            unableToLoadOrderInfo?: TranslationText;
            applePayNotImplemented?: TranslationText;
            checkoutCompletedTitle?: TranslationText;
            checkoutAlreadyCompleted?: TranslationText;
        };
        loading?: {
            checkoutLoading?: TranslationText;
            defaultText?: TranslationText;
        };
        discountCodes?: {
            placeholder?: TranslationText;
            applyingText?: TranslationText;
            applyText?: TranslationText;
        };
    };
    links?: {
        termsOfServiceUrl?: string;
        generalConditionsUrl?: string;
        bottomLinks?: BottomLink[];
    };

    sections?: {
        title?: TranslationText;
        postText?: TranslationText;
        items?: Section[];
        noBorders?: boolean;
    };

    offers?: {
        loadingText?: TranslationText;
        errorTitle?: TranslationText;
        errorMessage?: TranslationText;
        redirectingText?: TranslationText;
        preparingOfferText?: TranslationText;
        specialOfferText?: TranslationText;
        offerCountText?: TranslationText;
        saveText?: TranslationText;
        chooseVariantText?: TranslationText;
        updatingText?: TranslationText;
        processingText?: TranslationText;
        updatingPricesText?: TranslationText;
        addToCartText?: TranslationText;
        previousText?: TranslationText;
        skipOfferText?: TranslationText;
        offerFailedText?: TranslationText;
        offerFailedRedirectText?: TranslationText;
        offerAcceptedText?: TranslationText;
        variantUpdateErrorText?: TranslationText;
        itemsInOfferText?: TranslationText;
    };

    thankYou?: {
        title?: TranslationText;
        membership?: TranslationText;
        renews?: TranslationText;
        free?: TranslationText;
        relatedOrders?: TranslationText;
        continueShopping?: TranslationText;
        orderNumber?: TranslationText;
        orderSummary?: TranslationText;
        loadingText?: TranslationText;
        subtitle?: TranslationText;
        confirmed?: TranslationText;
        address?: TranslationText;
        shippingAddress?: TranslationText;
        billingAddress?: TranslationText;
        customerDetails?: TranslationText;
        email?: TranslationText;
        firstName?: TranslationText;
        lastName?: TranslationText;
        orderDetails?: TranslationText;
        subtotal?: TranslationText;
        shipping?: TranslationText;
        tax?: TranslationText;
        total?: TranslationText;
        trialThenText?: TranslationText;
        everyText?: TranslationText;
        itemText?: TranslationText;
        itemsText?: TranslationText;
        naText?: TranslationText;
        productText?: TranslationText;
    };

    zelleThankYou?: {
        title?: TranslationText;
        subtitle?: TranslationText;
        pendingPayment?: TranslationText;
        importantTitle?: TranslationText;
        importantMessage?: TranslationText;
        howToPayTitle?: TranslationText;
        steps?: Array<{
            title?: TranslationText;
            description?: TranslationText;
        }>;
        securityNoteTitle?: TranslationText;
        securityNoteDescription?: TranslationText;
        emailSentTitle?: TranslationText;
        emailSentDescription?: TranslationText;
        awaitingPayment?: TranslationText;
    };

    pageMetadata?: {
        favicon?: string;
        checkout?: {
            title?: TranslationText;
            favicon?: string;
        };
        offer?: {
            title?: TranslationText;
            favicon?: string;
        };
        thankyou?: {
            title?: TranslationText;
            favicon?: string;
        };
        club?: {
            title?: TranslationText;
            favicon?: string;
        };
        portal?: {
            title?: TranslationText;
            favicon?: string;
        };
        notfound?: {
            title?: TranslationText;
            favicon?: string;
        };
    };

}