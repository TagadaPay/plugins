import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/react";

function Header() {
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const texts = pluginConfig?.texts;

  return (
    <header className="border-b border-[rgb(222,222,222)] bg-white px-[21px] py-[21px] sm:px-[38px]">
      <img
        src={pluginConfig.logo}
        alt={texts?.header?.logoAlt || "Lavish Ivy"}
        className="mx-auto h-[100px] w-auto"
      />
    </header>
  );
}

export default Header;
