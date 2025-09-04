import { useConfigContext } from "../../contexts/ConfigProvider";
import { SocialLinks } from "../SocialLinks";

export function Footer() {
  const { config } = useConfigContext();

  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="text-3xl font-light">{config?.branding?.logoText || config?.branding?.companyName || "Olea"}</div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium Australian skincare crafted with native botanicals for radiant, healthy skin.
            </p>
            <SocialLinks 
              socialLinks={config?.content?.socialLinks} 
              className="flex space-x-4 [&>a]:text-gray-400 [&>a:hover]:text-white"
            />
          </div>

          {/* Configurable Footer Sections */}
          {config?.content?.footerSections?.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-medium text-lg">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href={link.url} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Legacy Footer Links (Legal section) - only show if no footerSections configured */}
          {config?.content?.footerLinks && config.content.footerLinks.length > 0 && !config?.content?.footerSections && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Legal</h3>
              <ul className="space-y-2">
                {config.content.footerLinks.map((link, i) => (
                  <li key={i}>
                    <a href={link.url} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {config?.content?.footerCopyright || `© 2024 ${config?.branding?.companyName || "Olea"}. All rights reserved. Made with ❤️ in Australia.`}
          </p>
        </div>
      </div>
    </footer>
  )
}