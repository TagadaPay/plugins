'use client';

import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

interface TopBarProps {
  onGoToShop?: () => void;
  className?: string;
  hideGoToShop?: boolean;
}

/**
 * ARCADE STYLE TopBar — Y2K jelly masthead.
 * Frosted lavender card floating over the holo-gradient page bg,
 * wordmark centered in display serif plum, "LIVE" candy chip on
 * the left, pill-shaped "Back" button on the right. The 2px-wide
 * holo gradient under-line is the one sparkle moment.
 */
export function TopBar({ onGoToShop, className = '', hideGoToShop = false }: TopBarProps) {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  const companyName = config?.header?.companyName || 'Your Store';
  const showLogo = config?.header?.showLogo ?? false;
  const logoUrl = config?.header?.logoUrl;
  const goToShopText = config?.header?.goToShopText;

  const handleGoToShop = () => {
    if (onGoToShop) {
      onGoToShop();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={{
        background: 'var(--lav-200)',
        borderBottom: '1px solid var(--lav-400)',
      }}
      editor-id="config.header.backgroundImage config.header.backgroundColor config.header.borderColor"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: LIVE chip with a pulsing dot */}
          <div className="flex items-center">
            <span className="candy-chip">
              <span
                aria-hidden
                className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: 'var(--peach-500)' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                LIVE · {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}
              </span>
            </span>
          </div>

          {/* Center: wordmark in display serif */}
          <div
            className="flex items-center justify-center"
            editor-id="config.header.logoHeight config.header.companyName config.header.logoUrl config.header.showLogo"
          >
            {showLogo && logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-7 w-auto"
                style={{
                  height: config?.header?.logoHeight ? `${config?.header?.logoHeight}px` : undefined,
                }}
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <span
                className="text-[22px] font-medium tracking-[-0.02em] text-[var(--plum-900)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {companyName}
              </span>
            )}
          </div>

          {/* Right: encrypted chip + pill back button */}
          <div className="flex items-center justify-end gap-3">
            <span
              className="candy-chip hidden sm:inline-flex"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-1.5 h-3 w-3 text-[var(--blue-500)]">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
              </svg>
              Encrypted
            </span>

            {!hideGoToShop && (
              <button
                type="button"
                onClick={handleGoToShop}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--lav-400)] bg-[var(--lav-100)] px-4 text-[12px] font-semibold text-[var(--plum-700)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] transition-all duration-[140ms] hover:-translate-y-[1px] hover:bg-white hover:text-[var(--plum-900)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_12px_rgba(42,31,77,0.1)]"
                style={{ fontFamily: 'var(--font-body)', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                editor-id="config.header.goToShopTextColor"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="hidden sm:inline" editor-id="config.header.goToShopText">
                  {t(goToShopText, 'Back')}
                </span>
                <ShoppingBag className="h-3.5 w-3.5 sm:hidden" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Holo gradient hairline — the one sparkle on the masthead */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px]"
        style={{ background: 'var(--holo-gradient)' }}
      />
    </div>
  );
}
