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

export function TopBar({ onGoToShop, className = '', hideGoToShop = false }: TopBarProps) {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  const companyName = config?.header?.companyName || 'Your Store';
  const showLogo = config?.header?.showLogo ?? false;
  const logoUrl = config?.header?.logoUrl;
  const goToShopText = config?.header?.goToShopText;
  const goToShopTextColor = config?.header?.goToShopTextColor || '#000000';
  const borderColor = config?.header?.borderColor || '#e5e7eb';

  const handleGoToShop = () => {
    if (onGoToShop) {
      onGoToShop();
    } else {
      // Default behavior - go back or to shop
      window.history.back();
    }
  };

  return (
    <div
      className={`relative bg-[var(--surface)] ${className}`}
      style={{ borderBottom: `1px solid ${borderColor || 'var(--line)'}` }}
      editor-id="config.header.backgroundImage config.header.backgroundColor config.header.borderColor"
    >
      {config?.header?.backgroundImage && (
        <img
          className="z-1 absolute inset-0 h-full w-full object-cover"
          src={config?.header?.backgroundImage || ''}
          alt="Header Background"
        />
      )}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-[64px] grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: step marker — masthead issue/volume number feel */}
          <div className="flex items-center gap-2">
            <span
              className="money text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-secondary-color)]"
            >
              CHECKOUT · {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}
            </span>
          </div>

          {/* Center: wordmark (editorial masthead) */}
          <div
            className="flex items-center justify-center"
            editor-id="config.header.logoHeight config.header.companyName config.header.logoUrl config.header.showLogo"
          >
            {showLogo && logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-6 w-auto"
                style={{
                  height: config?.header?.logoHeight ? `${config?.header?.logoHeight}px` : undefined,
                }}
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
            ) : null}
            {(!showLogo || !logoUrl) && (
              <span
                className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--text-color)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {companyName}
              </span>
            )}
          </div>

          {/* Right: security indicator + back */}
          <div className="flex items-center justify-end gap-4">
            <span
              className="hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary-color)] sm:inline-flex"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
              </svg>
              Encrypted
            </span>

            {!hideGoToShop && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoToShop}
                className="text-[12px] font-medium uppercase tracking-[0.12em]"
                style={{ color: goToShopTextColor }}
                editor-id="config.header.goToShopTextColor"
              >
                <ArrowLeft className="mr-1.5 h-3 w-3" />
                <span className="hidden sm:inline" editor-id="config.header.goToShopText">
                  {t(goToShopText, 'Cancel')}
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
