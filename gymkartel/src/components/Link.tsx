import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  prefetch?: boolean;
  [key: string]: any;
}

export default function Link({ href, children, className, target, rel, prefetch, ...props }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Handle internal links (starting with #)
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // For external links, let the browser handle them normally
  };

  return (
    <a href={href} className={className} target={target} rel={rel} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
