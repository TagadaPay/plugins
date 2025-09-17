import { Environment, TagadaProvider } from '@tagadapay/plugin-sdk/react';
import { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider } from '@/src/context/config/context';
import { ThemeProvider } from '@/src/context/theme-context';
import { CartProvider } from '@/src/context/cart-context';
import { CheckoutSuccessProvider } from '@/src/context/checkout-success-context';
import { loadConfig, getCurrentConfigName } from '@/src/utils/config-loader';

const currentConfig = loadConfig(getCurrentConfigName());

export const Providers = ({ children }: PropsWithChildren<{}>) => {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <ConfigProvider config={currentConfig}>
                    <ThemeProvider theme={currentConfig.theme}>
                        <CartProvider>
                            <CheckoutSuccessProvider>
                                <TagadaProvider environment={import.meta.env.VITE_TAGADA_ENVIRONMENT as Environment}>
                                    {children}
                                </TagadaProvider>
                            </CheckoutSuccessProvider>
                        </CartProvider>
                    </ThemeProvider>
                </ConfigProvider>
            </BrowserRouter>
        </HelmetProvider>
    )
}