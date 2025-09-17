import { useCallback } from 'react'

// Extend window interface for Klaviyo
declare global {
    interface Window {
        klaviyo?: {
            identify: (properties: any) => void
            track: (eventName: string, properties?: any) => void
            push: (args: any[]) => void
        }
    }
}

interface ProductTrackingData {
    productId: string
    productName: string
    variantId: string
    price: number
    currency: string
    quantity?: number
    bundleName?: string
    sku?: string
    categories?: string[]
    imageUrl?: string
    url?: string
}

interface CartTrackingData extends ProductTrackingData {
    quantity: number
    lineTotal: number
}

export const useKlaviyoTracking = () => {
    // Helper function to ensure Klaviyo is loaded
    const ensureKlaviyo = useCallback((): boolean => {
        if (typeof window === 'undefined') return false

        // Check if klaviyo is available
        if (!window.klaviyo) {
            console.warn('Klaviyo not loaded yet')
            return false
        }

        return true
    }, [])

    // Track Active on Site - fires when user visits the site
    const trackActiveOnSite = useCallback(() => {
        if (!ensureKlaviyo()) return

        try {
            window.klaviyo?.track('Active on Site', {
                $source: 'Zenith Website',
                page_title: document.title,
                page_url: window.location.href,
                timestamp: new Date().toISOString()
            })

            console.log('✅ Klaviyo: Active on Site tracked')
        } catch (error) {
            console.error('❌ Klaviyo: Error tracking Active on Site:', error)
        }
    }, [ensureKlaviyo])

    // Track Viewed Product - fires when user views a product
    const trackViewedProduct = useCallback((productData: ProductTrackingData) => {
        if (!ensureKlaviyo()) return

        try {
            const eventData = {
                $source: 'Zenith Website',
                ProductID: productData.productId,
                ProductName: productData.productName,
                SKU: productData.sku || productData.variantId,
                Categories: productData.categories || ['Supplements', 'Shilajit'],
                ImageURL: productData.imageUrl,
                URL: productData.url || window.location.href,
                Brand: 'Zenith',
                Price: productData.price,
                Currency: productData.currency,
                timestamp: new Date().toISOString()
            }

            window.klaviyo?.track('Viewed Product', eventData)

            console.log('✅ Klaviyo: Viewed Product tracked', eventData)
        } catch (error) {
            console.error('❌ Klaviyo: Error tracking Viewed Product:', error)
        }
    }, [ensureKlaviyo])

    // Track Added to Cart - fires when user adds product to cart
    const trackAddedToCart = useCallback((cartData: CartTrackingData) => {
        if (!ensureKlaviyo()) return

        try {
            const eventData = {
                $source: 'Zenith Website',
                $value: cartData.lineTotal,
                ProductID: cartData.productId,
                ProductName: cartData.productName,
                SKU: cartData.sku || cartData.variantId,
                Categories: cartData.categories || ['Supplements', 'Shilajit'],
                ImageURL: cartData.imageUrl,
                URL: cartData.url || window.location.href,
                Brand: 'Zenith',
                Price: cartData.price,
                Currency: cartData.currency,
                Quantity: cartData.quantity,
                ItemTotal: cartData.lineTotal,
                BundleName: cartData.bundleName,
                timestamp: new Date().toISOString()
            }

            window.klaviyo?.track('Added to Cart', eventData)

            console.log('✅ Klaviyo: Added to Cart tracked', eventData)
        } catch (error) {
            console.error('❌ Klaviyo: Error tracking Added to Cart:', error)
        }
    }, [ensureKlaviyo])

    // Utility function to identify a user (for future use)
    const identifyUser = useCallback((userProperties: { email?: string; firstName?: string; lastName?: string; phone?: string }) => {
        if (!ensureKlaviyo()) return

        try {
            window.klaviyo?.identify(userProperties)
            console.log('✅ Klaviyo: User identified', userProperties)
        } catch (error) {
            console.error('❌ Klaviyo: Error identifying user:', error)
        }
    }, [ensureKlaviyo])

    return {
        trackActiveOnSite,
        trackViewedProduct,
        trackAddedToCart,
        identifyUser,
        isKlaviyoLoaded: ensureKlaviyo
    }
}

export type { ProductTrackingData, CartTrackingData }
