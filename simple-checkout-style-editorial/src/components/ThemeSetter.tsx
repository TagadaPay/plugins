import { useTheme } from '@/hooks/useTheme';
import { getColorOpacityFromHex } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig } from '@tagadapay/plugin-sdk/v2';

/**
 * Applies project-level design tokens at runtime.
 * Anything the merchant configured (primaryColor, borders) is fed into the
 * CSS-variable layer; downstream code keeps using var(--primary-color).
 *
 * Design note: we stay in the OKLCH-tinted palette defined in index.css for the
 * neutrals and only let the merchant recolor the brand accent. This prevents
 * merchants from accidentally re-introducing the AI-default blue/gray palette.
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
        /* Merchant brand — falls back to OKLCH olive-bronze defined in index.css */
        --primary-color: ${primaryColor || 'var(--brand)'};
        --ring: ${primaryColor || 'var(--brand)'};
        --primary: ${primaryColor || 'var(--brand)'};

        /* Body-level tokens (keeps <data-slot='input'> etc. working) */
        --text-color: ${textColor || 'var(--ink-900)'};
        --text-secondary-color: ${textSecondaryColor || 'var(--ink-500)'};
        --background-color: ${backgroundColor || 'var(--surface)'};
        --border-color: ${borderColor || 'var(--line)'};

        --checkout-order-summary-bg: ${orderSummaryBgColor ? getColorOpacityFromHex(orderSummaryBgColor, orderSummaryOpacity) : 'var(--surface-alt)'};
        --background-color-hover: var(--surface-sunk);
        --offer-card-bg: ${offerCardBgColor ? getColorOpacityFromHex(offerCardBgColor, offerCardOpacity) : 'var(--surface-alt)'};
      }

      /* ─────────  Focus: single crisp hairline, no soft glow  ───────── */
      input:focus-visible, textarea:focus-visible, select:focus-visible,
      [data-slot='input']:focus, [data-slot='input']:focus-visible,
      [data-slot='select-trigger']:focus, [data-slot='select-trigger']:focus-visible {
        border-color: var(--brand) !important;
        box-shadow: 0 0 0 1px var(--brand) !important;
        outline: none !important;
      }

      /* ─────────  Inputs — editorial, no soft shadows  ───────── */
      [data-slot='input'],
      [data-slot='select-trigger'] {
        background-color: var(--surface) !important;
        border: 1px solid var(--line-strong) !important;
        border-radius: 4px !important;
        box-shadow: none !important;
        font-family: var(--font-body);
        font-size: 15px;
        color: var(--ink-900);
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }
      [data-slot='input']:hover:not(:focus):not(:focus-visible),
      [data-slot='select-trigger']:hover:not([data-state='open']) {
        border-color: var(--ink-500) !important;
      }
      [data-slot='input']::placeholder { color: var(--ink-400); }

      /* ─────────  Labels / form text  ───────── */
      label { font-family: var(--font-body); color: var(--ink-700); }

      /* ─────────  Radio groups  ───────── */
      [data-slot='radio-group-item'] {
        border-color: var(--line-strong) !important;
      }
      [data-slot='radio-group-item'][data-state='checked'] {
        background-color: var(--brand) !important;
        border-color: var(--brand) !important;
      }
      [data-slot='radio-group-indicator'] svg {
        color: white !important;
        fill: white !important;
      }
      label:has([data-slot='radio-group-item'][data-state='checked']) {
        border-color: var(--brand) !important;
        background-color: var(--brand-tint) !important;
      }

      /* ─────────  Checkbox  ───────── */
      button[role='checkbox'] {
        border-radius: 3px !important;
        border-color: var(--line-strong) !important;
      }
      button[role='checkbox'][data-state='checked'] {
        background-color: var(--brand) !important;
        border-color: var(--brand) !important;
      }
      button[role='checkbox'][data-state='checked'] svg {
        color: white !important;
        stroke: white !important;
      }

      /* ─────────  Primary / brand utilities  ───────── */
      .border-primary { border-color: var(--brand) !important; }
      .text-primary { color: var(--brand) !important; }
      .border-primary-custom {
        border-color: var(--brand) !important;
        border-style: solid !important;
        border-width: 1px !important;
      }

      /* ─────────  Scrollbar (invisible until hover)  ───────── */
      .sticky-sidebar-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
      .sticky-sidebar-scroll::-webkit-scrollbar { width: 4px; }
      .sticky-sidebar-scroll::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 2px; }
      .sticky-sidebar-scroll:hover { scrollbar-color: var(--ink-400) transparent; }
      .sticky-sidebar-scroll:hover::-webkit-scrollbar-thumb { background-color: var(--ink-400); }
    `,
      }}
    />
  );
}
