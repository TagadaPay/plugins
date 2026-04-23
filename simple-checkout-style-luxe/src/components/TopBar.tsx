'use client';

import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';

interface TopBarProps {
  onGoToShop?: () => void;
  className?: string;
  hideGoToShop?: boolean;
}

/**
 * LUXE STYLE TopBar — boutique masthead on cream.
 * Forest-green wordmark in display serif, centered. A single gold
 * hairline under the bar. "Encrypted" is small-caps in bronze, the
 * back link is underlined on hover. No dark top band, no ticker.
 */
export function TopBar({ onGoToShop, className = '', hideGoToShop = false }: TopBarProps) {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  const companyName = config?.header?.companyName || 'Your Store';
  const showLogo = config?.header?.showLogo ?? false;
  const logoUrl = config?.header?.logoUrl;
  const goToShopText = config?.header?.goToShopText;
  const goToShopTextColor = config?.header?.goToShopTextColor || 'var(--ink-500)';

  const handleGoToShop = () => {
    if (onGoToShop) {
      onGoToShop();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className={`relative bg-[var(--surface)] ${className}`}
      style={{
        borderBottom: `1px solid var(--line-strong)`,
        boxShadow: 'inset 0 -2px 0 0 var(--gold-500)',
      }}
      editor-id="config.header.backgroundImage config.header.backgroundColor config.header.borderColor"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: Atelier date/volume line (shortened on mobile) */}
          <div className="flex items-center gap-2">
            <span
              className="whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-500)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <span className="hidden sm:inline">Maison · </span>Vol.{' '}
              <span className="money">{new Date().getFullYear()}</span>
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
                className="text-[22px] font-normal tracking-[-0.01em] text-[var(--ink-900)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {companyName}
              </span>
            )}
          </div>

          {/* Right: encrypted tag + back link */}
          <div className="flex items-center justify-end gap-4">
            <span
              className="hidden items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--ink-500)] sm:inline-flex"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
              </svg>
              Encrypted
            </span>

            {!hideGoToShop && (
              <Button
                variant="link"
                size="sm"
                onClick={handleGoToShop}
                className="text-[12px] font-medium normal-case tracking-normal"
                style={{ color: goToShopTextColor }}
                editor-id="config.header.goToShopTextColor"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline" editor-id="config.header.goToShopText">
                  {t(goToShopText, 'Continue shopping')}
                </span>
                <ShoppingBag className="h-3.5 w-3.5 sm:hidden" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
