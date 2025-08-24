import { pluginConfig } from '@/data/config';

function Footer() {
  return (
    <footer className="mt-8 bg-[#eae4da] py-8">
      <div className="container mx-auto px-12 md:px-24">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex h-10 w-48 items-center justify-center rounded bg-gray-200 text-lg font-bold text-gray-600">
              {pluginConfig.branding.storeName} Logo
            </div>
          </div>
          <div className="mb-6 flex flex-wrap justify-center gap-6 text-sm">
            <a href="#terms" className="text-[#23527c] hover:underline">
              Terms & Conditions
            </a>
            <a href="#privacy" className="text-[#23527c] hover:underline">
              Privacy Policy
            </a>
            <a href="#wireless" className="text-[#23527c] hover:underline">
              Wireless Policy
            </a>
          </div>
          <div className="text-center text-sm leading-relaxed text-gray-700">
            <p className="mb-2">© 2025 / {pluginConfig.branding.storeName} / All rights reserved.</p>
            <p className="text-base font-semibold">{pluginConfig.branding.supportEmail}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
