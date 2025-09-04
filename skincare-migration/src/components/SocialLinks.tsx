import React from 'react';
import type { SocialLink } from '../types/config';

interface SocialLinksProps {
  socialLinks?: SocialLink[];
  className?: string;
}

const SocialIcon: React.FC<{ platform: string; iconUrl: string }> = ({ platform, iconUrl }) => {
  return <img src={iconUrl} alt={`${platform} icon`} className="w-5 h-5 object-contain" />;
};

export const SocialLinks: React.FC<SocialLinksProps> = ({ 
  socialLinks = [], 
  className = "" 
}) => {
  // Filter out links without iconUrl - only show configured platforms with icons
  const validLinks = socialLinks.filter(link => link.iconUrl);

  if (!validLinks.length) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {validLinks.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary transition-colors duration-300"
          aria-label={link.label || `Follow us on ${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}`}
        >
          <SocialIcon platform={link.platform} iconUrl={link.iconUrl} />
        </a>
      ))}
    </div>
  );
};