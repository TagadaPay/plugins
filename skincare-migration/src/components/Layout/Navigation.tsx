import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { useCartContext } from '../../contexts/CartProvider'
import { useConfigContext } from '../../contexts/ConfigProvider'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { itemCount, toggleCart } = useCartContext()
  const { config } = useConfigContext()

  // Calculate logo size based on config
  const getLogoHeight = () => {
    if (config?.branding?.logoHeight) {
      return config.branding.logoHeight;
    }
    
    switch (config?.branding?.logoSize) {
      case 'xs': return 20;
      case 'sm': return 24;
      case 'md': return 32;
      case 'lg': return 40;
      case 'xl': return 48;
      default: return 32; // Default medium size
    }
  };

  const logoHeight = getLogoHeight();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-primary-100 transition-all duration-300">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-light text-gray-800 hover:text-primary transition-colors duration-300"
          >
            {config?.branding?.logoUrl ? (
              <img 
                src={config.branding.logoUrl} 
                alt={config.branding.logoText || config.branding.companyName || "Logo"}
                className="w-auto"
                style={{ height: `${logoHeight}px` }}
              />
            ) : (
              <span 
                className="font-light text-gray-800"
                style={{ fontSize: `${Math.max(logoHeight * 0.75, 16)}px` }}
              >
                {config?.branding?.logoText || config?.branding?.companyName || "Olea"}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm text-gray-600">
            {config?.content?.navigationLinks?.map((navLink, index) => {
              const isActive = navLink.external 
                ? false 
                : location.pathname === navLink.url || 
                  (navLink.url !== '/' && location.pathname.startsWith(navLink.url));

              if (navLink.external) {
                return (
                  <a
                    key={index}
                    href={navLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors duration-300 relative group"
                  >
                    {navLink.label.toUpperCase()}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </a>
                );
              }

              return (
                <Link
                  key={index}
                  to={navLink.url}
                  className={`hover:text-primary transition-colors duration-300 relative group ${
                    isActive ? 'text-primary' : ''
                  }`}
                >
                  {navLink.label.toUpperCase()}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <a href="#search" className="hover:text-primary transition-colors duration-300 hidden sm:block">
              SEARCH
            </a>
            <button 
              onClick={toggleCart}
              className="hover:text-primary transition-colors duration-300 relative flex items-center space-x-1"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>CART ({itemCount})</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              )}
            </button>

            <button
              className="md:hidden text-gray-600 hover:text-primary transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-100 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-4 text-sm text-gray-600">
              {config?.content?.navigationLinks?.map((navLink, index) => {
                if (navLink.external) {
                  return (
                    <a
                      key={index}
                      href={navLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors duration-300 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {navLink.label.toUpperCase()}
                    </a>
                  );
                }

                return (
                  <Link
                    key={index}
                    to={navLink.url}
                    className="hover:text-primary transition-colors duration-300 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {navLink.label.toUpperCase()}
                  </Link>
                );
              })}
              <a href="#search" className="hover:text-primary transition-colors duration-300 py-2">
                SEARCH
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}