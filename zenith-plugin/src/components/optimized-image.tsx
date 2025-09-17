import { useState } from 'react'

interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    priority?: boolean
    fill?: boolean
    sizes?: string
    quality?: number
    placeholder?: 'blur' | 'empty'
    blurDataURL?: string
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    fill = false,
    sizes,
    quality = 85,
    placeholder = 'empty',
    blurDataURL,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    // Generate a simple blur placeholder
    const shimmer = `
    <svg width="${width || 400}" height="${height || 300}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="20%" />
          <stop stop-color="#edeef1" offset="50%" />
          <stop stop-color="#f6f7f8" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${width || 400}" height="${height || 300}" fill="#f6f7f8" />
      <rect id="r" width="${width || 400}" height="${height || 300}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${width || 400}" to="${width || 400}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `

    const toBase64 = (str: string) =>
        typeof window === 'undefined'
            ? btoa(str)
            : window.btoa(str)

    const defaultBlurDataURL = `data:image/svg+xml;base64,${toBase64(shimmer)}`

    if (hasError) {
        return (
            <div
                className={`bg-gray-200 flex items-center justify-center ${className}`}
                style={{ width: width || '100%', height: height || 'auto' }}
            >
                <span className="text-gray-400 text-sm">Image not available</span>
            </div>
        )
    }

    return (
        <div 
            className={`relative ${className}`}
            style={{ width: width || '100%', height: height || 'auto' }}
        >
            {/* Blur placeholder background */}
            {isLoading && (
                <div
                    className="absolute inset-0 bg-cover bg-center filter blur-sm"
                    style={{
                        backgroundImage: `url(${blurDataURL || defaultBlurDataURL})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            )}
            
            {/* Main image */}
            <img
                src={src}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${
                    fill ? 'absolute inset-0 w-full h-full object-cover' : ''
                }`}
                onLoad={() => setIsLoading(false)}
                onError={() => setHasError(true)}
                loading={priority ? 'eager' : 'lazy'}
            />
        </div>
    )
}
