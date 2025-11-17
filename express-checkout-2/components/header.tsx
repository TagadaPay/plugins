import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig, useTranslation } from "@tagadapay/plugin-sdk/v2";

function Header() {
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const texts = pluginConfig?.texts;
  const { t } = useTranslation();

  return (
    <header className="border-b border-[var(--checkout-border-color)] bg-[var(--checkout-page-bg)] px-[21px] py-[21px] sm:px-[38px]">
      <img
        src={pluginConfig.logo}
        alt={t(texts?.header?.logoAlt, "Tagada shop")}
        className="mx-auto h-[100px] w-auto"
      />
    </header>
  );
}

export default Header;
