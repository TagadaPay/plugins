

import MobileMenu from './mobile-menu';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { LogoSvg } from './logo-svg';
import CartModal from '@/components/cart/modal';
import type { Product } from '@/storage/cart/types';
import { useTagataConfig } from '@/hooks/use-tagata-config';

interface HeaderProps {
  products: Array<Product>;
}

export function Header({ products }: HeaderProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { content } = useTagataConfig();
  
  const navItems = content.getNavigation('header');
  const logoUrl = content.getAsset('logo');

  return (
    <header className="grid fixed top-0 left-0 z-50 grid-cols-3 items-start w-full p-sides md:grid-cols-12 md:gap-sides">
      <div className="block flex-none md:hidden">
        <MobileMenu products={products} />
      </div>
      <Link to="/" className="md:col-span-3 xl:col-span-2">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="w-auto h-6 max-md:place-self-center md:w-full md:h-auto max-w-96" 
          />
        ) : (
          <LogoSvg className="w-auto h-6 max-md:place-self-center md:w-full md:h-auto max-w-96" />
        )}
      </Link>
      <nav className="flex gap-2 justify-end items-center md:col-span-9 xl:col-span-10">
        <ul className="items-center gap-5 py-0.5 px-3 bg-background/10 rounded-sm backdrop-blur-md hidden md:flex">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  'font-semibold text-base transition-colors duration-200 uppercase',
                  pathname === item.href ? 'text-foreground' : 'text-foreground/50'
                )}
              >
                {content.getAnyText(item.label) || item.label}
              </Link>
            </li>
          ))}
        </ul>
        <CartModal />
      </nav>
    </header>
  );
}
