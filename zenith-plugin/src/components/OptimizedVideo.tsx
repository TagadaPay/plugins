import { useState, useRef, useEffect } from 'react'

interface OptimizedVideoProps {
    src?: string
    poster: string
    alt: string
    className?: string
    fallbackText?: string
}

export function OptimizedVideo({
    src,
    poster,
    alt,
    className = "",
    fallbackText = "Video unavailable"
}: OptimizedVideoProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        // Test if video source is accessible
        if (src) {
            fetch(src, { method: 'HEAD' })
                .then(response => {
                    if (!response.ok) {
                        setHasError(true)
                    }
                })
                .catch(() => {
                    setHasError(true)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        } else {
            setHasError(true)
            setIsLoading(false)
        }
    }, [src])

    const handlePlayClick = () => {
        if (!hasError && src) {
            setShowVideo(true)
            if (videoRef.current) {
                videoRef.current.play()
            }
        }
    }

    if (isLoading) {
        return (
            <div className={`relative bg-gray-200 animate-pulse ${className}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        )
    }

    if (hasError || !src) {
        return (
            <div className={`relative bg-gradient-primary-reverse ${className}`}>
                <img
                    src={poster}
                    alt={alt}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                    <div>
                        <div className="text-4xl mb-2">📸</div>
                        <div className="font-semibold">{fallbackText}</div>
                        <div className="text-sm opacity-90 mt-1">Image preview available</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative ${className}`}>
            {!showVideo ? (
                <>
                    <img
                        src={poster}
                        alt={alt}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        loading="lazy"
                    />
                    <button
                        onClick={handlePlayClick}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors rounded-lg group"
                        aria-label="Play video"
                    >
                        <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-color">
                                <path d="M8 5v14l11-7z" fill="currentColor" />
                            </svg>
                        </div>
                    </button>
                </>
            ) : (
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    controls
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setHasError(true)}
                    preload="metadata"
                >
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    )
}
