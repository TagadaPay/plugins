import { useTheme } from '@/hooks/useTheme';
import { getColorOpacityFromHex } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig } from '@tagadapay/plugin-sdk/v2';

/**
 * LUXE STYLE — boutique form controls.
 * 1px warm-bronze hairline borders, 2px radius, a gold inner ring
 * on focus (single hairline, not a soft shadow), selection tinted
 * with the gold-100 wash. Merchant primaryColor passes through
 * but falls back to aged gold.
 */
export function ThemeSetter() {
  const { primaryColor } = useTheme();
  const { config } = usePluginConfig<PluginConfigData>();
  const textColor = config?.branding?.textColor || '';
  const textSecondaryColor = config?.branding?.textSecondaryColor || '';
  const backgroundColor = config?.branding?.backgroundColor || '';
  const borderColor = config?.branding?.borderColor || '';
  const orderSummaryBgColor = config?.orderSummarySettings?.backgroundColor || '';
  const offerCardBgColor = config?.offerSettings?.cardBackgroundColor || '';

  const getOpacity = (opacity?: number) => {
    if (!opacity || opacity > 100 || opacity < 0) return 100;
    return opacity;
  };

  const orderSummaryOpacity = getOpacity(config?.orderSummarySettings?.opacity);
  const offerCardOpacity = getOpacity(config?.offerSettings?.cardOpacity);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      :root {
        --primary-color: ${primaryColor || 'var(--brand)'};
        --ring: ${primaryColor || 'var(--brand)'};
        --primary: ${primaryColor || 'var(--brand)'};

        --text-color: ${textColor || 'var(--ink-900)'};
        --text-secondary-color: ${textSecondaryColor || 'var(--ink-500)'};
        --background-color: ${backgroundColor || 'var(--surface)'};
        --border-color: ${borderColor || 'var(--line-strong)'};

        --checkout-order-summary-bg: ${orderSummaryBgColor ? getColorOpacityFromHex(orderSummaryBgColor, orderSummaryOpacity) : 'var(--surface-alt)'};
        --background-color-hover: var(--surface-sunk);
        --offer-card-bg: ${offerCardBgColor ? getColorOpacityFromHex(offerCardBgColor, offerCardOpacity) : 'var(--surface-alt)'};
      }

      /* ─────────  Inputs — hairline bronze, 2px radius  ───────── */
      [data-slot='input'],
      [data-slot='select-trigger'] {
        background-color: var(--surface) !important;
        border: 1px solid var(--line-strong) !important;
        border-radius: 2px !important;
        box-shadow: none !important;
        font-family: var(--font-body);
        font-size: 15px;
        color: var(--ink-900);
        transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
      }
      [data-slot='input']:hover:not(:focus):not(:focus-visible),
      [data-slot='select-trigger']:hover:not([data-state='open']) {
        border-color: var(--ink-500) !important;
      }
      [data-slot='input']::placeholder { color: var(--ink-400); }

      /* ─────────  Focus — single gold hairline, no glow  ───────── */
      input:focus-visible, textarea:focus-visible, select:focus-visible,
      [data-slot='input']:focus, [data-slot='input']:focus-visible,
      [data-slot='select-trigger']:focus, [data-slot='select-trigger']:focus-visible {
        border-color: var(--brand) !important;
        box-shadow: 0 0 0 1px var(--brand) !important;
        outline: none !important;
      }

      /* ─────────  Labels — body font, bronze  ───────── */
      label {
        font-family: var(--font-body);
        color: var(--ink-700);
        font-size: 12.5px;
        font-weight: 500;
        letter-spacing: 0.02em;
      }

      /* ─────────  Radio groups — gold selection tint  ───────── */
      [data-slot='radio-group-item'] {
        border-color: var(--line-strong) !important;
      }
      [data-slot='radio-group-item'][data-state='checked'] {
        background-color: var(--brand) !important;
        border-color: var(--brand) !important;
      }
      [data-slot='radio-group-indicator'] svg {
        color: var(--brand-ink, #1F2A22) !important;
        fill: var(--brand-ink, #1F2A22) !important;
      }
      label:has([data-slot='radio-group-item'][data-state='checked']) {
        border-color: var(--brand) !important;
        background-color: var(--brand-tint) !important;
      }

      /* ─────────  Checkbox  ───────── */
      button[role='checkbox'] {
        border-radius: 2px !important;
        border-color: var(--line-strong) !important;
      }
      button[role='checkbox'][data-state='checked'] {
        background-color: var(--brand) !important;
        border-color: var(--brand) !important;
      }
      button[role='checkbox'][data-state='checked'] svg {
        color: var(--brand-ink, #1F2A22) !important;
        stroke: var(--brand-ink, #1F2A22) !important;
      }

      /* ─────────  Primary / brand utilities  ───────── */
      .border-primary { border-color: var(--brand) !important; }
      .text-primary { color: var(--brand) !important; }
      .border-primary-custom {
        border-color: var(--brand) !important;
        border-style: solid !important;
        border-width: 1px !important;
      }

      /* ─────────  Scrollbar — bronze, quiet  ───────── */
      .sticky-sidebar-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
      .sticky-sidebar-scroll::-webkit-scrollbar { width: 4px; }
      .sticky-sidebar-scroll::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 2px; }
      .sticky-sidebar-scroll:hover { scrollbar-color: var(--bronze-400) transparent; }
      .sticky-sidebar-scroll:hover::-webkit-scrollbar-thumb { background-color: var(--bronze-400); }
    `,
      }}
    />
  );
}
