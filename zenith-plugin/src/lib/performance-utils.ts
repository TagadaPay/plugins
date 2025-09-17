import { useState, useEffect, useRef } from 'react'

// Performance optimization utilities

// Intersection Observer for lazy loading
export function createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
) {
    if (typeof window === 'undefined') return null

    return new IntersectionObserver(callback, {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
    })
}

// Image preloading
export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = src
    })
}

// Critical resource hints
export function addResourceHints() {
    if (typeof document === 'undefined') return

    // Preconnect to external domains
    const hints = [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' },
        { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' }
    ]

    hints.forEach(hint => {
        const link = document.createElement('link')
        link.rel = hint.rel
        link.href = hint.href
        document.head.appendChild(link)
    })
}

// Lazy load components when they come into view
export function useLazyComponent(componentLoader: () => Promise<any>) {
    const [Component, setComponent] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = createIntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true)
                observer?.disconnect()
            }
        })

        if (ref.current && observer) {
            observer.observe(ref.current)
        }

        return () => observer?.disconnect()
    }, [])

    useEffect(() => {
        if (isVisible && !Component) {
            componentLoader().then(setComponent)
        }
    }, [isVisible, Component, componentLoader])

    return { Component, ref, isVisible }
}
