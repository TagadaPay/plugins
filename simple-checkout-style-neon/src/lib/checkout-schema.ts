
import { regexPhone } from '@/data/phone';
import { PluginConfigData } from '@/types/plugin-config';
import {
    TranslateFunction
} from '@tagadapay/plugin-sdk/v2';
import { z } from 'zod';

export const createCheckoutFormSchema = (t: TranslateFunction, config?: PluginConfigData, getRegions?: (countryCode: string) => { iso: string; name: string }[]) => {
    const isDigitalProduct = config?.addressSettings?.digitalProduct || false;

    return z
        .object({
            email: z.string().email(t(config?.checkout?.validation?.emailRequired, 'Valid email is required')),
            shippingAddress: z.object({
                firstName: z.string().optional(),
                lastName: z.string().optional(),
                address1: z.string().optional(),
                address2: z.string().optional(),
                city: z.string().optional(),
                country: z.string().optional(),
                state: z.string().optional(),
                postal: z.string().optional(),
                phone: z.string().optional(),
            }),
            isBillingDifferent: z.boolean().optional(),
            showBillingAddress: z.boolean().optional(),
            billingAddress: z
                .object({
                    firstName: z.string().optional(),
                    lastName: z.string().optional(),
                    address1: z.string().optional(),
                    address2: z.string().optional(),
                    city: z.string().optional(),
                    country: z.string().optional(),
                    state: z.string().optional(),
                    postal: z.string().optional(),
                    phone: z.string().optional(),
                })
                .optional(),
            paymentMethod: z
                .string()
                .nonempty(t(config?.checkout?.validation?.paymentMethodRequired, 'Payment method is required')),
            cardNumber: z.string().optional(),
            expirationDate: z.string().optional(),
            securityCode: z.string().optional(),
            acceptTerms: z.boolean().optional(),
            shippingRateId: z.string().optional(),
            emailForOffers: z.boolean().optional(),
        })
        .superRefine((data, ctx) => {
            // Check if terms acceptance is required
            if (config?.checkoutSettings?.requireTerms && !data.acceptTerms) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t(config?.checkout?.validation?.termsRequired, 'You must accept the terms and conditions'),
                    path: ['acceptTerms'],
                });
            }

            // Check if shipping rate is required (defaults to true) - Only for physical products
            // If shipping rate display is hidden, skip the requirement
            const displayShippingRate = config?.shippingRateSettings?.displayShippingRate ?? true;
            const requireShippingRate = displayShippingRate && (config?.shippingRateSettings?.requireShippingRate ?? true);
            if (!isDigitalProduct && requireShippingRate && !data.shippingRateId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t(config?.checkout?.validation?.shippingMethodRequired, 'Shipping method is required'),
                    path: ['shippingRateId'],
                });
            }

            // Validate shipping address fields - Only required for physical products
            if (!isDigitalProduct) {
                const shipping = data.shippingAddress;

                if (!shipping.firstName || shipping.firstName.trim() === '') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.firstNameRequired, 'First name is required'),
                        path: ['shippingAddress', 'firstName'],
                    });
                }

                if (!shipping.lastName || shipping.lastName.trim() === '') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.lastNameRequired, 'Last name is required'),
                        path: ['shippingAddress', 'lastName'],
                    });
                }

                if (!shipping.address1 || shipping.address1.trim() === '') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.addressRequired, 'Address is required'),
                        path: ['shippingAddress', 'address1'],
                    });
                }

                if (!shipping.city || shipping.city.trim() === '') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.cityRequired, 'City is required'),
                        path: ['shippingAddress', 'city'],
                    });
                }

                if (!shipping.country || shipping.country.length < 2) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.countryRequired, 'Country is required'),
                        path: ['shippingAddress', 'country'],
                    });
                }

                // Only require state when the selected country has states/regions
                const shippingCountryHasStates = shipping.country && getRegions ? getRegions(shipping.country).length > 0 : true;
                if (shippingCountryHasStates && (!shipping.state || shipping.state.trim() === '')) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.stateRequired, 'State is required'),
                        path: ['shippingAddress', 'state'],
                    });
                }

                if (!shipping.postal || shipping.postal.trim() === '') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.zipRequired, 'ZIP code is required'),
                        path: ['shippingAddress', 'postal'],
                    });
                }
            }

            if (data.paymentMethod === 'credit-card') {
                if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length < 15) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.cardNumberRequired, 'Valid card number is required'),
                        path: ['cardNumber'],
                    });
                }

                if (!data.expirationDate || !/^\d{2}\/\d{2}$/.test(data.expirationDate)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.expiryRequired, 'Valid expiry date (MM/YY) is required'),
                        path: ['expirationDate'],
                    });
                } else {
                    const [month, year] = data.expirationDate.split('/').map((v) => parseInt(v, 10));
                    const now = new Date();
                    const currentYear = now.getFullYear() % 100;
                    const currentMonth = now.getMonth() + 1;

                    if (
                        month < 1 ||
                        month > 12 ||
                        year < currentYear ||
                        (year === currentYear && month < currentMonth)
                    ) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(
                                (config?.checkout?.validation as any)?.expiryInvalid,
                                'Expiry date must be in the future',
                            ),
                            path: ['expirationDate'],
                        });
                    }
                }

                if (!data.securityCode || data.securityCode.length < 3) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.securityCodeRequired, 'Valid security code is required'),
                        path: ['securityCode'],
                    });
                }
            }
            // Phone validation
            const isPhoneRequired = config?.checkoutSettings?.requirePhone;
            const isValidPhoneRequired = config?.checkoutSettings?.requireValidPhoneNumber;

            // For physical products, validate shipping address phone
            if (!isDigitalProduct) {
                if (isPhoneRequired) {
                    if (!data.shippingAddress.phone || data.shippingAddress.phone.trim() === '') {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(config?.checkout?.validation?.phoneRequired, 'Phone is required'),
                            path: ['shippingAddress', 'phone'],
                        });
                    }
                }
                if (isValidPhoneRequired) {
                    const phone = data.shippingAddress.phone;

                    if (phone && !regexPhone.test(phone)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(config?.checkout?.validation?.validPhoneNumberRequired, 'Valid phone number is required'),
                            path: ['shippingAddress', 'phone'],
                        });
                    }
                }
            }

            // Validate billing address fields
            // For digital products, billing address is always shown and required
            // For physical products, billing address is only required if isBillingDifferent is true
            const shouldValidateBilling = isDigitalProduct || data.isBillingDifferent;

            if (shouldValidateBilling && data.billingAddress) {
                const billing = data.billingAddress;

                // First name and last name are always required for billing address
                if (!billing.firstName || billing.firstName.trim() === '') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.firstNameRequired, 'First name is required'),
                        path: ['billingAddress', 'firstName'],
                    });
                }

                if (!billing.lastName || billing.lastName.trim() === '') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t(config?.checkout?.validation?.lastNameRequired, 'Last name is required'),
                        path: ['billingAddress', 'lastName'],
                    });
                }

                // For digital products, address fields are only required if showBillingAddress is true
                if (isDigitalProduct) {
                    // Address fields only required if showBillingAddress is checked
                    if (data.showBillingAddress) {
                        if (!billing.country || billing.country.length < 2) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: t(config?.checkout?.validation?.countryRequired, 'Country is required'),
                                path: ['billingAddress', 'country'],
                            });
                        }

                        if (!billing.address1 || billing.address1.trim() === '') {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: t(config?.checkout?.validation?.addressRequired, 'Address is required'),
                                path: ['billingAddress', 'address1'],
                            });
                        }

                        if (!billing.city || billing.city.trim() === '') {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: t(config?.checkout?.validation?.cityRequired, 'City is required'),
                                path: ['billingAddress', 'city'],
                            });
                        }

                        if (!billing.postal || billing.postal.trim() === '') {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: t(config?.checkout?.validation?.zipRequired, 'ZIP code is required'),
                                path: ['billingAddress', 'postal'],
                            });
                        }

                        const billingDigitalCountryHasStates = billing.country && getRegions ? getRegions(billing.country).length > 0 : true;
                        if (billingDigitalCountryHasStates && (!billing.state || billing.state.trim() === '')) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: t(config?.checkout?.validation?.stateRequired, 'State is required'),
                                path: ['billingAddress', 'state'],
                            });
                        }
                    }
                } else {
                    // For physical products with different billing, all fields are required
                    if (!billing.address1 || billing.address1.trim() === '') {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(config?.checkout?.validation?.addressRequired, 'Address is required'),
                            path: ['billingAddress', 'address1'],
                        });
                    }

                    if (!billing.city || billing.city.trim() === '') {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(config?.checkout?.validation?.cityRequired, 'City is required'),
                            path: ['billingAddress', 'city'],
                        });
                    }

                    if (!billing.country || billing.country.length < 2) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(config?.checkout?.validation?.countryRequired, 'Country is required'),
                            path: ['billingAddress', 'country'],
                        });
                    }

                    if (!billing.postal || billing.postal.trim() === '') {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(config?.checkout?.validation?.zipRequired, 'ZIP code is required'),
                            path: ['billingAddress', 'postal'],
                        });
                    }

                    const billingCountryHasStates = billing.country && getRegions ? getRegions(billing.country).length > 0 : true;
                    if (billingCountryHasStates && (!billing.state || billing.state.trim() === '')) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(config?.checkout?.validation?.stateRequired, 'State is required'),
                            path: ['billingAddress', 'state'],
                        });
                    }
                }
                // Phone validation for billing address
                if (isPhoneRequired) {
                    if (!billing.phone || billing.phone.trim() === '') {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(config?.checkout?.validation?.phoneRequired, 'Phone is required'),
                            path: ['billingAddress', 'phone'],
                        });
                    }
                }
                if (isValidPhoneRequired) {
                    const phone = billing.phone;
                    if (phone && !regexPhone.test(phone)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t(
                                config?.checkout?.validation?.validPhoneNumberRequired,
                                'Valid phone number is required',
                            ),
                            path: ['billingAddress', 'phone'],
                        });
                    }
                }
            }
        });
};