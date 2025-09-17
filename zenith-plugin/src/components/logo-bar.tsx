interface LogoItem {
    src: string
    alt: string
    href: string
}

import { useTagataConfig } from "../hooks/use-tagada-context";

interface LogoBarProps {
    logos: LogoItem[]
}

export function LogoBar({ logos }: LogoBarProps) {
    const { config } = useTagataConfig();
    const uiText = config?.content?.text?.en?.uiText;
    const featuredData = config?.content?.text?.en?.featured;
    // Triple the logos for smooth infinite scroll
    const tripleLogos = [...logos, ...logos, ...logos]

    return (
        <div className="w-full py-6 overflow-hidden relative">
            {/* Background with custom gold gradient - only on PC */}
            <div
                className="absolute inset-0 rounded-xl bg-gradient-primary-50 hidden md:block"
            />

            {/* Fade edges for smooth visual effect */}
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white/80 to-transparent z-10 rounded-l-xl" />
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white/80 to-transparent z-10 rounded-r-xl" />

            {/* Header text */}
            <div className="text-center mb-4 relative z-20">
                <p
                    className="text-sm font-semibold uppercase tracking-wider text-primary-dark"
                >
                    {featuredData?.title || 'As Featured In'}
                </p>
            </div>

            {/* Scrolling logos container */}
            <div className="relative flex items-center">
                <div className="flex animate-scroll-smooth">
                    {tripleLogos.map((logo, index) => (
                        <div
                            key={`${logo.src}-${index}`}
                            className="flex-shrink-0 mx-8 sm:mx-12 flex items-center justify-center"
                        >
                            <a
                                href={logo.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block transition-all duration-300 hover:scale-110 hover:opacity-80"
                            >
                                <div className="relative">
                                    <img
                                        src={logo.src}
                                        alt={logo.alt}
                                        width={100}
                                        height={40}
                                        className="h-8 sm:h-10 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                                        style={{
                                            maxWidth: '120px',
                                            opacity: 0.7
                                        }}
                                    />
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes scroll-smooth {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll-smooth {
          animation: scroll-smooth 40s linear infinite;
          will-change: transform;
        }

        .animate-scroll-smooth:hover {
          animation-play-state: paused;
        }

        @media (max-width: 640px) {
          .animate-scroll-smooth {
            animation-duration: 30s;
          }
        }
      `}</style>
        </div>
    )
}
