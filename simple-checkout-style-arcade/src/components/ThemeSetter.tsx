import { useTheme } from '@/hooks/useTheme';
import { getColorOpacityFromHex } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig } from '@tagadapay/plugin-sdk/v2';

/**
 * ARCADE STYLE — Y2K form controls.
 * 12px radius on inputs (not pill — pills are for CTAs only),
 * soft lavender borders, a glossy white inner highlight on top,
 * an electric-blue outer ring on focus. Merchant primaryColor
 * passes through but falls back to hot peach.
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
        --border-color: ${borderColor || 'var(--lav-400)'};

        --checkout-order-summary-bg: ${orderSummaryBgColor ? getColorOpacityFromHex(orderSummaryBgColor, orderSummaryOpacity) : 'var(--lav-200)'};
        --background-color-hover: var(--lav-300);
        --offer-card-bg: ${offerCardBgColor ? getColorOpacityFromHex(offerCardBgColor, offerCardOpacity) : 'var(--lav-200)'};
      }

      /* ─────────  Inputs — rounded 12px with inner white highlight  ───────── */
      [data-slot='input'],
      [data-slot='select-trigger'] {
        background-color: var(--lav-100) !important;
        border: 1px solid var(--lav-400) !important;
        border-radius: 12px !important;
        box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.6) !important;
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        color: var(--ink-900);
        transition: transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 140ms ease-out, border-color 140ms ease-out;
      }
      [data-slot='input']:hover:not(:focus):not(:focus-visible),
      [data-slot='select-trigger']:hover:not([data-state='open']) {
        border-color: var(--plum-400) !important;
      }
      [data-slot='input']::placeholder { color: var(--plum-400); }

      /* ─────────  Focus — electric-blue outer ring + soft peach glow  ───────── */
      input:focus-visible, textarea:focus-visible, select:focus-visible,
      [data-slot='input']:focus, [data-slot='input']:focus-visible,
      [data-slot='select-trigger']:focus, [data-slot='select-trigger']:focus-visible {
        border-color: var(--blue-500) !important;
        box-shadow:
          inset 0 1px 0 0 rgba(255,255,255,0.6),
          0 0 0 3px rgba(58,91,255,0.2),
          0 4px 14px rgba(58,91,255,0.18) !important;
        outline: none !important;
      }

      /* ─────────  Labels  ───────── */
      label {
        font-family: var(--font-body);
        color: var(--ink-700);
        font-size: 12.5px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      /* ─────────  Radio groups — peach pill on select, plum border otherwise  ───────── */
      [data-slot='radio-group-item'] {
        border-color: var(--plum-300) !important;
      }
      [data-slot='radio-group-item'][data-state='checked'] {
        background-color: var(--peach-500) !important;
        border-color: var(--peach-500) !important;
        box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.6), 0 0 0 2px var(--peach-200) !important;
      }
      [data-slot='radio-group-indicator'] svg {
        color: white !important;
        fill: white !important;
      }
      label:has([data-slot='radio-group-item'][data-state='checked']) {
        border-color: var(--peach-500) !important;
        background-color: var(--peach-200) !important;
        box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.6), 0 4px 16px rgba(255,155,143,0.2) !important;
      }

      /* ─────────  Checkbox — rounded 6px, peach fill on check  ───────── */
      button[role='checkbox'] {
        border-radius: 6px !important;
        border-color: var(--plum-300) !important;
      }
      button[role='checkbox'][data-state='checked'] {
        background-color: var(--peach-500) !important;
        border-color: var(--peach-500) !important;
      }
      button[role='checkbox'][data-state='checked'] svg {
        color: white !important;
        stroke: white !important;
        stroke-width: 3 !important;
      }

      /* ─────────  Primary / brand utilities  ───────── */
      .border-primary { border-color: var(--peach-500) !important; }
      .text-primary { color: var(--peach-500) !important; }
      .border-primary-custom {
        border-color: var(--peach-500) !important;
        border-style: solid !important;
        border-width: 2px !important;
      }

      /* ─────────  Scrollbar — lavender candy  ───────── */
      .sticky-sidebar-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
      .sticky-sidebar-scroll::-webkit-scrollbar { width: 6px; }
      .sticky-sidebar-scroll::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 3px; }
      .sticky-sidebar-scroll:hover { scrollbar-color: var(--lav-500) transparent; }
      .sticky-sidebar-scroll:hover::-webkit-scrollbar-thumb { background-color: var(--lav-500); }
    `,
      }}
    />
  );
}
