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
 * TEALER STYLE TopBar — solid black masthead, neon-lime wordmark.
 * Streetwear energy: black bar, uppercase heavy wordmark, lime accent dot,
 * free-shipping ticker, ENCRYPTED trust tag, pilled "Cancel" button.
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
      className={`relative border-b-2 border-[var(--ink-900)] bg-[var(--ink-900)] text-white ${className}`}
      editor-id="config.header.backgroundImage config.header.backgroundColor config.header.borderColor"
    >
      {/* Free-shipping ticker (neon on top) */}
      <div className="border-b-2 border-[var(--ink-900)] bg-[var(--neon-lime)] py-[5px] text-center">
        <span
          className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-900)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          🔥 Free Shipping Over €69 · Discreet Packaging · Ships Same Day
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-[60px] grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* Left: wordmark (sticker-style lime chip + company name) */}
          <div
            className="flex items-center gap-2.5"
            editor-id="config.header.logoHeight config.header.companyName config.header.logoUrl config.header.showLogo"
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border-2 border-white bg-[var(--neon-lime)] text-[16px] text-[var(--ink-900)]"
              style={{ fontFamily: 'var(--font-display)' }}
              aria-hidden
            >
              ☰
            </span>
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
                className="text-[18px] uppercase tracking-[-0.01em] text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {companyName}
                <span className="text-[var(--neon-lime)]">®</span>
              </span>
            )}
          </div>

          {/* Center: step ticker */}
          <div className="hidden items-center justify-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-lime)]" />
            <span
              className="text-[10.5px] uppercase tracking-[0.2em] text-[#D9D9D9]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Checkout · {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-lime)]" />
          </div>

          {/* Right: encrypted + cancel */}
          <div className="flex items-center justify-end gap-3">
            <span
              className="hidden items-center gap-1.5 rounded-full border-2 border-white/20 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white sm:inline-flex"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
              </svg>
              Encrypted
            </span>

            {!hideGoToShop && (
              <button
                type="button"
                onClick={handleGoToShop}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border-2 border-white/30 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:border-[var(--neon-lime)] hover:text-[var(--neon-lime)]"
                style={{ fontFamily: 'var(--font-display)' }}
                editor-id="config.header.goToShopTextColor"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="hidden sm:inline" editor-id="config.header.goToShopText">
                  {t(goToShopText, 'Cancel')}
                </span>
                <ShoppingBag className="h-3.5 w-3.5 sm:hidden" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
