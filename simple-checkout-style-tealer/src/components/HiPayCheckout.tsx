import { useSetPaymentMethod } from '@/contexts/PaymentMethods';
import { useTagadaContext } from '@tagadapay/plugin-sdk/v2';
import {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { PAYMENT_TYPES } from './payment-types';

declare global {
    interface Window {
        HiPay?: (options: {
            username: string;
            password: string;
            environment: 'stage' | 'production';
            lang?: string;
        }) => HiPayInstance;
    }
}

interface HiPayInstance {
    create: (type: string, options: Record<string, unknown>) => HiPayCardInstance | HiPayApplePayInstance;
    canMakePaymentsWithActiveCard: (merchantId: string) => Promise<boolean>;
}

/** Apple Pay button instance (paymentRequestButton) — same token shape as card, different events */
interface HiPayApplePayInstance {
    on: (event: 'paymentAuthorized' | 'cancel' | 'paymentUnauthorized', callback: (data?: Record<string, unknown>) => void) => void;
    completePaymentWithSuccess: () => void;
    completePaymentWithFailure: () => void;
}

interface HiPayCardInstance {
    on: (event: string, callback: (data: Record<string, unknown>) => void) => void;
    getPaymentData: () => Promise<HiPayPaymentData>;
    destroy: () => void;
}

interface HiPayPaymentData {
    payment_product: string;
    token: string;
    card_id?: string;
    brand?: string;
    pan?: string;
    card_holder?: string;
    card_expiry_month?: string;
    card_expiry_year?: string;
    browser_info?: Record<string, unknown>;
    device_fingerprint?: string;
}

interface HiPayCredentials {
    publicUsername?: string;
    publicPassword?: string;
    sandboxed?: boolean;
    applePayMerchantId?: string;
}

export interface HiPayCheckoutHandle {
    submit: () => Promise<void>;
}

interface HiPayCheckoutProps {
    checkoutSessionId: string;
    storeId: string;
    onPaymentCompleted?: (payment: Record<string, unknown>) => void;
    onPaymentFailed?: (error: string) => void;
    /** When provided, Apple Pay button is shown (needs total/currency for sheet). You handle domain verification manually. */
    applePayConfig?: {
        storeName: string;
        currency: string;
        totalAmount: number;
        countryCode: string;
    };
}

const HIPAY_SDK_URL = 'https://libs.hipay.com/js/sdkjs.js';
const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 15;

export const HiPayCheckout = memo(
    forwardRef<HiPayCheckoutHandle, HiPayCheckoutProps>(
        ({ checkoutSessionId, storeId, onPaymentCompleted, onPaymentFailed, applePayConfig }, ref) => {
            const { apiService } = useTagadaContext();
            const setPaymentMethod = useSetPaymentMethod();

            const [isScriptLoaded, setIsScriptLoaded] = useState(false);
            const [isProcessing, setIsProcessing] = useState(false);
            const [error, setError] = useState<string | null>(null);
            const [credentials, setCredentials] = useState<HiPayCredentials | null>(null);
            const [isApplePayMounted, setIsApplePayMounted] = useState(false);
            const cardInstanceRef = useRef<HiPayCardInstance | null>(null);
            const applePayInstanceRef = useRef<HiPayApplePayInstance | null>(null);
            const isSubmittingRef = useRef(false);
            const orderIdRef = useRef<string | undefined>(undefined);

            // Create order when HiPay + Apple Pay are ready (so Apple Pay has orderId when user authorizes)
            useEffect(() => {
                if (!credentials?.publicUsername || !checkoutSessionId || !apiService || !applePayConfig) return;
                if (!orderIdRef.current) {
                    apiService
                        .fetch<{ orderId: string }>(`/api/v1/checkout-sessions/${checkoutSessionId}/create-order`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({}),
                        })
                        .then((res) => {
                            if (res?.orderId) orderIdRef.current = res.orderId;
                        })
                        .catch(() => { });
                }
            }, [credentials?.publicUsername, checkoutSessionId, apiService, applePayConfig]);

            // Clear stored order when checkout session changes (e.g. cart updated)
            useEffect(() => {
                orderIdRef.current = undefined;
            }, [checkoutSessionId]);

            // Fetch public credentials from the server
            useEffect(() => {
                const fetchCredentials = async () => {
                    try {
                        const data = await apiService.fetch<HiPayCredentials>('/api/v1/hipay/credentials', {
                            method: 'GET',
                            params: { storeId },
                        });

                        if (data?.publicUsername && data?.publicPassword) {
                            setCredentials(data);
                        }
                    } catch (err) {
                        console.error('[HiPay] Failed to fetch credentials:', err);
                    }
                };
                fetchCredentials();
            }, [apiService, storeId]);

            // Load the HiPay JS SDK
            useEffect(() => {
                if (!credentials?.publicUsername || isScriptLoaded) return;

                if (typeof window.HiPay === 'function') {
                    setIsScriptLoaded(true);
                    return;
                }

                const script = document.createElement('script');
                script.src = HIPAY_SDK_URL;
                script.onload = () => setIsScriptLoaded(true);
                script.onerror = () => console.error('[HiPay] Failed to load SDK');
                document.head.appendChild(script);

                return () => {
                    // Don't remove — other HiPay instances may need it
                };
            }, [credentials?.publicUsername, isScriptLoaded]);

            // Mount HiPay hosted fields
            useEffect(() => {
                if (!isScriptLoaded || !credentials || typeof window.HiPay !== 'function') return;

                const container = document.getElementById('hipay-card-container');
                if (!container) return;

                try {
                    const hipay = window.HiPay({
                        username: credentials.publicUsername!,
                        password: credentials.publicPassword!,
                        environment: credentials.sandboxed ? 'stage' : 'production',
                        lang: 'en',
                    });

                    const card = hipay.create('card', {
                        template: 'auto',
                        selector: 'hipay-card-container',
                        multi_use: true,
                        styles: {
                            base: {
                                color: 'var(--text-color)',
                                fontSize: '15px',
                                placeholderColor: '#9ca3af',
                            },
                            invalid: {
                                color: '#ef4444',
                            },
                        },
                    }) as HiPayCardInstance;

                    cardInstanceRef.current = card;

                    card.on('change', (response: Record<string, unknown>) => {
                        const isValid = response?.valid === true;
                        setPaymentMethod({
                            isValid,
                            type: PAYMENT_TYPES.HIPAY,
                            informations: null,
                        });
                    });

                    card.on('ready', () => {
                        console.log('[HiPay] Hosted fields ready');
                    });
                } catch (err) {
                    console.error('[HiPay] Failed to mount hosted fields:', err);
                }

                return () => {
                    if (cardInstanceRef.current) {
                        try {
                            cardInstanceRef.current.destroy();
                        } catch {
                            // ignore
                        }
                        cardInstanceRef.current = null;
                    }
                };
            }, [isScriptLoaded, credentials, setPaymentMethod]);

            // Poll for payment confirmation after submission
            const pollPaymentStatus = useCallback(
                async (transactionReference: string, orderId: string) => {
                    let attempts = 0;

                    const poll = setInterval(() => {
                        void (async () => {
                            try {
                                attempts++;
                                const payment = await apiService.fetch<Record<string, unknown>>(
                                    `/api/v1/checkout-sessions/${checkoutSessionId}/hipay-payment-status`,
                                    {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ transactionReference, orderId }),
                                    },
                                );

                                if (payment) {
                                    clearInterval(poll);
                                    setIsProcessing(false);
                                    if (payment.status === 'declined') {
                                        const metadata = payment.metadata as Record<string, unknown> | undefined;
                                        const reason = (metadata?.hipayMessage as string) || 'Payment declined';
                                        setError(reason);
                                        onPaymentFailed?.(reason);
                                    } else {
                                        onPaymentCompleted?.(payment);
                                    }
                                } else if (attempts >= MAX_POLL_ATTEMPTS) {
                                    clearInterval(poll);
                                    setIsProcessing(false);
                                    setError('Payment verification timeout. Please check your email for confirmation.');
                                    onPaymentFailed?.('Timeout');
                                }
                            } catch {
                                if (attempts >= MAX_POLL_ATTEMPTS) {
                                    clearInterval(poll);
                                    setIsProcessing(false);
                                    setError('Unable to verify payment status.');
                                    onPaymentFailed?.('Unable to verify payment status.');
                                }
                            }
                        })();
                    }, POLL_INTERVAL_MS);
                },
                [apiService, checkoutSessionId, onPaymentCompleted, onPaymentFailed],
            );

            // Mount HiPay Apple Pay button when SDK + credentials + summary are ready
            useEffect(() => {
                if (!isScriptLoaded || !credentials || !applePayConfig || typeof window.HiPay !== 'function') return;

                const container = document.getElementById('hipay-apple-pay-button');
                if (!container) return;

                try {
                    const hipay = window.HiPay({
                        username: credentials.publicUsername!,
                        password: credentials.publicPassword!,
                        environment: credentials.sandboxed ? 'stage' : 'production',
                        lang: 'en',
                    });

                    const mountButton = () => {
                        const amountMajor = (applePayConfig.totalAmount / 100).toFixed(2);
                        const request = {
                            countryCode: applePayConfig.countryCode,
                            currencyCode: applePayConfig.currency,
                            total: { label: applePayConfig.storeName, amount: amountMajor },
                            supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
                        };
                        const applePayStyle = { type: 'buy', color: 'black' };
                        const options = {
                            displayName: applePayConfig.storeName,
                            request,
                            applePayStyle,
                            selector: 'hipay-apple-pay-button',
                        };

                        const instance = hipay.create('paymentRequestButton', options) as HiPayApplePayInstance | null;
                        if (!instance) {
                            // Browser/device doesn't support Apple Pay
                            container.style.display = 'none';
                            return;
                        }

                        applePayInstanceRef.current = instance;

                        instance.on('paymentAuthorized', (hipayToken?: Record<string, unknown>) => {
                            void (async () => {
                                if (!hipayToken) {
                                    instance.completePaymentWithFailure();
                                    return;
                                }
                                try {
                                    setIsProcessing(true);
                                    setError(null);

                                    let orderId = orderIdRef.current;
                                    if (!orderId) {
                                        const orderResult = await apiService.fetch<{ orderId: string }>(
                                            `/api/v1/checkout-sessions/${checkoutSessionId}/create-order`,
                                            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
                                        );
                                        if (!orderResult?.orderId) {
                                            instance.completePaymentWithFailure();
                                            setError('Failed to create order');
                                            onPaymentFailed?.('Failed to create order');
                                            setIsProcessing(false);
                                            return;
                                        }
                                        orderId = orderResult.orderId;
                                        orderIdRef.current = orderId;
                                    }

                                    const paymentResult = await apiService.fetch<{ id: string; status: string; forwardUrl?: string }>(
                                        `/api/v1/checkout-sessions/${checkoutSessionId}/hipay-card-payment`,
                                        {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                checkoutSessionId,
                                                orderId,
                                                paymentData: JSON.stringify(hipayToken),
                                            }),
                                        },
                                    );

                                    if (!paymentResult) {
                                        instance.completePaymentWithFailure();
                                        setError('No response from payment');
                                        onPaymentFailed?.('No response from payment');
                                        setIsProcessing(false);
                                        return;
                                    }

                                    const isSuccess = paymentResult.status !== 'declined' && paymentResult.status !== 'error';
                                    if (isSuccess) {
                                        instance.completePaymentWithSuccess();
                                    } else {
                                        instance.completePaymentWithFailure();
                                        setError('Payment was not approved');
                                        onPaymentFailed?.('Payment was not approved');
                                        setIsProcessing(false);
                                        return;
                                    }

                                    if (paymentResult.forwardUrl) {
                                        window.location.href = paymentResult.forwardUrl;
                                        return;
                                    }

                                    await pollPaymentStatus(paymentResult.id, orderId);
                                } catch (err) {
                                    console.error('[HiPay] Apple Pay payment error:', err);
                                    instance.completePaymentWithFailure();
                                    setIsProcessing(false);
                                    const message = err instanceof Error ? err.message : 'Payment failed';
                                    setError(message);
                                    onPaymentFailed?.(message);
                                }
                            })();
                        });

                        instance.on('cancel', () => {
                            instance.completePaymentWithFailure();
                        });

                        instance.on('paymentUnauthorized', () => {
                            instance.completePaymentWithFailure();
                            setError('Apple Pay authorization failed');
                            onPaymentFailed?.('Apple Pay authorization failed');
                        });
                    }; // end mountButton

                    // Only mount the button if the device has an active card in Wallet
                    hipay.canMakePaymentsWithActiveCard(credentials.applePayMerchantId ?? '').then((canMakePayments) => {
                        if (canMakePayments) {
                            mountButton();
                            setIsApplePayMounted(true);
                        } else {
                            container.style.display = 'none';
                        }
                    }).catch(() => {
                        // If check fails, try to mount anyway — the SDK will handle incompatible browsers
                        mountButton();
                        setIsApplePayMounted(true);
                    });
                } catch (err) {
                    console.error('[HiPay] Failed to mount Apple Pay button:', err);
                }

                return () => {
                    applePayInstanceRef.current = null;
                };
            }, [isScriptLoaded, credentials, applePayConfig, apiService, checkoutSessionId, pollPaymentStatus, onPaymentFailed]);

            // Main submit handler — called from parent via ref
            const handleSubmit = useCallback(async () => {
                if (isSubmittingRef.current) return;

                if (!cardInstanceRef.current) {
                    setError('Payment form is not ready. Please refresh and try again.');
                    onPaymentFailed?.('HiPay not ready');
                    return;
                }

                isSubmittingRef.current = true;
                setError(null);
                setIsProcessing(true);

                try {
                    // 1. Get tokenized payment data from HiPay JS SDK
                    const paymentData = await cardInstanceRef.current.getPaymentData();

                    // 2. Create an order only if we don't have one (reuse for retries / multiple Pay clicks)
                    let orderId = orderIdRef.current;
                    if (!orderId) {
                        const orderResult = await apiService.fetch<{ orderId: string }>(
                            `/api/v1/checkout-sessions/${checkoutSessionId}/create-order`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({}),
                            },
                        );

                        if (!orderResult?.orderId) {
                            throw new Error('Failed to create order');
                        }

                        orderId = orderResult.orderId;
                        orderIdRef.current = orderId;
                    }

                    // 3. Submit payment to server
                    const paymentResult = await apiService.fetch<{
                        id: string;
                        status: string;
                        forwardUrl?: string;
                    }>(
                        `/api/v1/checkout-sessions/${checkoutSessionId}/hipay-card-payment`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                checkoutSessionId,
                                orderId,
                                paymentData: JSON.stringify(paymentData),
                            }),
                        },
                    );

                    if (!paymentResult) {
                        throw new Error('No response from payment API');
                    }

                    // 4. Handle 3DS redirect if required
                    if (paymentResult.forwardUrl) {
                        window.location.href = paymentResult.forwardUrl;
                        return;
                    }

                    // 5. Poll for webhook confirmation
                    await pollPaymentStatus(paymentResult.id, orderId);
                } catch (err: unknown) {
                    console.error('[HiPay] Payment submission error:', err);
                    isSubmittingRef.current = false;
                    setIsProcessing(false);
                    const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
                    setError(message);
                    onPaymentFailed?.(message);
                }
            }, [apiService, checkoutSessionId, pollPaymentStatus, onPaymentFailed]);

            useImperativeHandle(ref, () => ({
                submit: handleSubmit,
            }));

            if (!credentials?.publicUsername) {
                return null;
            }

            return (
                <div className="space-y-3">
                    {isProcessing && (
                        <div className="flex items-center gap-3 rounded-lg border-2 border-[var(--border-color)] bg-[var(--background-color)] p-4">
                            <div className="h-5 w-5 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--primary-color)]" />
                            <p className="text-sm text-[var(--text-secondary-color)]">Processing payment...</p>
                        </div>
                    )}

                    {applePayConfig && (
                        <div className={isApplePayMounted ? '' : 'hidden'}>
                            <div
                                id="hipay-apple-pay-button"
                                style={{ height: '48px', display: 'block', width: '100%' }}
                            />
                            <div className="relative my-4 flex items-center">
                                <div className="flex-1 border-t border-[var(--border-color)]" />
                                <span className="mx-3 text-xs text-[var(--text-secondary-color)]">or pay with card</span>
                                <div className="flex-1 border-t border-[var(--border-color)]" />
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--background-color)] transition-all duration-300 ease-in-out">
                        {!isScriptLoaded && (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--primary-color)]" />
                            </div>
                        )}
                        <div id="hipay-card-container" className="min-h-[200px] p-4" />
                    </div>

                    {error && (
                        <p className="text-[12px] font-medium text-[var(--danger)]">{error}</p>
                    )}
                </div>
            );
        },
    ),
);

HiPayCheckout.displayName = 'HiPayCheckout';
