import { useTheme } from '@/hooks/useTheme';
import { getColorOpacityFromHex } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig } from '@tagadapay/plugin-sdk/v2';

/**
 * TEALER STYLE — chunky/neobrutalist form controls.
 * 2px pure-black borders, bigger radius (10px), hard shadow on focus.
 * Merchant-configurable colors still pass through (primaryColor, etc.),
 * but the defaults fall back to the acid-lime / pure-black palette
 * defined in index.css so nothing accidentally drifts back to a
 * generic "shadcn-looking" form.
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
        /* Merchant brand — falls back to acid-lime neon defined in index.css */
        --primary-color: ${primaryColor || 'var(--brand)'};
        --ring: ${primaryColor || 'var(--brand)'};
        --primary: ${primaryColor || 'var(--brand)'};

        --text-color: ${textColor || 'var(--ink-900)'};
        --text-secondary-color: ${textSecondaryColor || 'var(--ink-500)'};
        --background-color: ${backgroundColor || 'var(--surface)'};
        --border-color: ${borderColor || 'var(--ink-900)'};

        --checkout-order-summary-bg: ${orderSummaryBgColor ? getColorOpacityFromHex(orderSummaryBgColor, orderSummaryOpacity) : 'var(--surface-alt)'};
        --background-color-hover: var(--surface-sunk);
        --offer-card-bg: ${offerCardBgColor ? getColorOpacityFromHex(offerCardBgColor, offerCardOpacity) : 'var(--surface)'};
      }

      /* ─────────  Inputs — chunky 2px black, 10px radius  ───────── */
      [data-slot='input'],
      [data-slot='select-trigger'] {
        background-color: var(--surface) !important;
        border: 2px solid var(--ink-900) !important;
        border-radius: 10px !important;
        box-shadow: none !important;
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        color: var(--ink-900);
        transition: transform 80ms linear, box-shadow 80ms linear, border-color 80ms linear;
      }
      [data-slot='input']:hover:not(:focus):not(:focus-visible),
      [data-slot='select-trigger']:hover:not([data-state='open']) {
        transform: translate(-1px, -1px);
        box-shadow: 2px 2px 0 0 var(--ink-900) !important;
      }
      [data-slot='input']::placeholder { color: var(--ink-400); font-weight: 400; }

      /* ─────────  Focus — hard shadow pop (no soft glow)  ───────── */
      input:focus-visible, textarea:focus-visible, select:focus-visible,
      [data-slot='input']:focus, [data-slot='input']:focus-visible,
      [data-slot='select-trigger']:focus, [data-slot='select-trigger']:focus-visible {
        border-color: var(--ink-900) !important;
        box-shadow: 3px 3px 0 0 var(--primary-color, var(--brand)) !important;
        transform: translate(-1px, -1px);
        outline: none !important;
      }

      /* ─────────  Labels  ───────── */
      label {
        font-family: var(--font-body);
        color: var(--ink-900);
        font-weight: 600;
      }

      /* ─────────  Radio groups  ───────── */
      [data-slot='radio-group-item'] {
        border-color: var(--ink-900) !important;
        border-width: 2px !important;
      }
      [data-slot='radio-group-item'][data-state='checked'] {
        background-color: var(--ink-900) !important;
        border-color: var(--ink-900) !important;
      }
      [data-slot='radio-group-indicator'] svg {
        color: var(--neon-lime, #C8FF00) !important;
        fill: var(--neon-lime, #C8FF00) !important;
      }
      label:has([data-slot='radio-group-item'][data-state='checked']) {
        border-color: var(--ink-900) !important;
        background-color: var(--brand-tint, #F5FFCC) !important;
        box-shadow: var(--shadow-hard-sm, 2px 2px 0 0 #000) !important;
      }

      /* ─────────  Checkbox  ───────── */
      button[role='checkbox'] {
        border-radius: 4px !important;
        border-color: var(--ink-900) !important;
        border-width: 2px !important;
      }
      button[role='checkbox'][data-state='checked'] {
        background-color: var(--neon-lime, #C8FF00) !important;
        border-color: var(--ink-900) !important;
      }
      button[role='checkbox'][data-state='checked'] svg {
        color: var(--ink-900) !important;
        stroke: var(--ink-900) !important;
        stroke-width: 3 !important;
      }

      /* ─────────  Primary / brand utilities  ───────── */
      .border-primary { border-color: var(--ink-900) !important; }
      .text-primary { color: var(--ink-900) !important; }
      .border-primary-custom {
        border-color: var(--ink-900) !important;
        border-style: solid !important;
        border-width: 2px !important;
      }

      /* ─────────  Scrollbar — chunky black  ───────── */
      .sticky-sidebar-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
      .sticky-sidebar-scroll::-webkit-scrollbar { width: 6px; }
      .sticky-sidebar-scroll::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 3px; }
      .sticky-sidebar-scroll:hover { scrollbar-color: var(--ink-900) transparent; }
      .sticky-sidebar-scroll:hover::-webkit-scrollbar-thumb { background-color: var(--ink-900); }
    `,
      }}
    />
  );
}
