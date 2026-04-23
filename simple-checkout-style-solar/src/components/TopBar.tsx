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
 * SOLAR STYLE TopBar — risograph zine masthead.
 * Thick 3px tomato bar above, sun-bleached cream surface below.
 * Wordmark is left-aligned in chunky display with a cobalt dot,
 * "Issue · MM.YYYY" typeset right in mono. No drop shadows.
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

  const issueDate = new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }).replace('/', '.');

  return (
    <div
      className={`relative bg-[var(--surface)] ${className}`}
      style={{ borderBottom: '2px solid var(--char-900)' }}
      editor-id="config.header.backgroundImage config.header.backgroundColor config.header.borderColor"
    >
      {/* Top tomato stripe — zine masthead bar */}
      <div className="h-[3px] w-full bg-[var(--tomato-500)]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: wordmark with cobalt dot */}
          <div
            className="flex items-center gap-2.5"
            editor-id="config.header.logoHeight config.header.companyName config.header.logoUrl config.header.showLogo"
          >
            <span
              aria-hidden
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: 'var(--cobalt-500)' }}
            />
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
                className="text-[20px] font-bold tracking-[-0.02em] text-[var(--ink-900)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {companyName}
              </span>
            )}
          </div>

          {/* Center: small-caps ISSUE line */}
          <div className="hidden items-center sm:flex">
            <span className="stamp">ISSUE · {issueDate}</span>
          </div>

          {/* Right: encrypted chip + continue shopping */}
          <div className="flex items-center justify-end gap-4">
            <span
              className="hidden items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--char-500)] sm:inline-flex"
              style={{ fontFamily: 'var(--font-mono)' }}
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
                className="inline-flex h-9 items-center gap-1.5 rounded-[2px] border-2 border-[var(--char-900)] bg-[var(--cream-800)] px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--char-900)] transition-transform duration-100 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--char-900)]"
                style={{ fontFamily: 'var(--font-mono)' }}
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
    </div>
  );
}
