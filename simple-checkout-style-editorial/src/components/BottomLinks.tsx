import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';

export function BottomLinks() {
  const { config } = usePluginConfig<PluginConfigData>();
  const bottomLinks = config?.links?.bottomLinks;
  const { t } = useTranslation();

  if (!bottomLinks || bottomLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 border-t border-[var(--line)] pt-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {bottomLinks.map((link, index) => (
          <a
            className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--ink-500)] underline-offset-4 transition-colors hover:text-[var(--ink-900)] hover:underline"
            href={link.url}
            key={`${link.url}-${index}`}
            editor-id={`config.links.bottomLinks.${index}.url config.links.bottomLinks.${index}.label`}
          >
            {t(link.label)}
          </a>
        ))}
      </div>
    </div>
  );
}
