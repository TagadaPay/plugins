import { useTheme } from '@/hooks/useTheme';
import { getColorOpacityFromHex } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig } from '@tagadapay/plugin-sdk/v2';

/**
 * SOLAR STYLE — risograph form controls.
 * 2px charcoal borders on cream inputs, 2px radius, a crisp
 * tomato "stamp" shadow on focus (no blur, no glow). Radio and
 * checkbox selected states carry the tomato stamp. Merchant
 * primaryColor passes through but falls back to tomato.
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
        --border-color: ${borderColor || 'var(--char-900)'};

        --checkout-order-summary-bg: ${orderSummaryBgColor ? getColorOpacityFromHex(orderSummaryBgColor, orderSummaryOpacity) : 'var(--surface-alt)'};
        --background-color-hover: var(--surface-sunk);
        --offer-card-bg: ${offerCardBgColor ? getColorOpacityFromHex(offerCardBgColor, offerCardOpacity) : 'var(--surface)'};
      }

      /* ─────────  Inputs — 2px charcoal rule on cream, no shadow  ───────── */
      [data-slot='input'],
      [data-slot='select-trigger'] {
        background-color: var(--surface) !important;
        border: 2px solid var(--char-900) !important;
        border-radius: 2px !important;
        box-shadow: none !important;
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        color: var(--ink-900);
        transition: transform 100ms ease-out, box-shadow 100ms ease-out, border-color 100ms ease-out;
      }
      [data-slot='input']::placeholder { color: var(--char-400); }

      /* ─────────  Focus — tomato stamp shadow (crisp offset, no glow)  ───────── */
      input:focus-visible, textarea:focus-visible, select:focus-visible,
      [data-slot='input']:focus, [data-slot='input']:focus-visible,
      [data-slot='select-trigger']:focus, [data-slot='select-trigger']:focus-visible {
        border-color: var(--char-900) !important;
        box-shadow: 3px 3px 0 0 var(--brand) !important;
        transform: translate(-1px, -1px);
        outline: none !important;
      }

      /* ─────────  Labels  ───────── */
      label {
        font-family: var(--font-mono);
        color: var(--ink-900);
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      /* ─────────  Radio groups — tomato stamp on select  ───────── */
      [data-slot='radio-group-item'] {
        border-color: var(--char-900) !important;
        border-width: 2px !important;
      }
      [data-slot='radio-group-item'][data-state='checked'] {
        background-color: var(--tomato-500) !important;
        border-color: var(--char-900) !important;
      }
      [data-slot='radio-group-indicator'] svg {
        color: var(--cream-800) !important;
        fill: var(--cream-800) !important;
      }
      label:has([data-slot='radio-group-item'][data-state='checked']) {
        border-color: var(--char-900) !important;
        background-color: var(--tomato-100) !important;
        box-shadow: 3px 3px 0 0 var(--char-900) !important;
      }

      /* ─────────  Checkbox  ───────── */
      button[role='checkbox'] {
        border-radius: 2px !important;
        border-color: var(--char-900) !important;
        border-width: 2px !important;
      }
      button[role='checkbox'][data-state='checked'] {
        background-color: var(--cobalt-500) !important;
        border-color: var(--char-900) !important;
      }
      button[role='checkbox'][data-state='checked'] svg {
        color: var(--cream-800) !important;
        stroke: var(--cream-800) !important;
        stroke-width: 3 !important;
      }

      /* ─────────  Primary / brand utilities  ───────── */
      .border-primary { border-color: var(--brand) !important; }
      .text-primary { color: var(--brand) !important; }
      .border-primary-custom {
        border-color: var(--char-900) !important;
        border-style: solid !important;
        border-width: 2px !important;
      }

      /* ─────────  Scrollbar — charcoal  ───────── */
      .sticky-sidebar-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
      .sticky-sidebar-scroll::-webkit-scrollbar { width: 5px; }
      .sticky-sidebar-scroll::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 2px; }
      .sticky-sidebar-scroll:hover { scrollbar-color: var(--char-700) transparent; }
      .sticky-sidebar-scroll:hover::-webkit-scrollbar-thumb { background-color: var(--char-700); }
    `,
      }}
    />
  );
}
