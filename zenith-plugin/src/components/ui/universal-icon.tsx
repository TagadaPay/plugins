import React from 'react';
import {
  User,
  Star,
  Zap,
  ShieldCheck,
  Brain,
  Sparkles,
  Leaf,
  Heart,
  Truck,
  Headset,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MenuIcon,
} from 'lucide-react';

// Icon mapping for string to React component
export const iconMap = {
  User,
  Star,
  Zap,
  ShieldCheck,
  Brain,
  Sparkles,
  Leaf,
  Heart,
  Truck,
  Headset,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MenuIcon,
} as const;

export type IconName = keyof typeof iconMap;

interface UniversalIconProps {
  name: IconName;
  className?: string;
  size?: number;
  color?: string;
}

export const UniversalIcon: React.FC<UniversalIconProps> = ({
  name,
  className = "h-5 w-5",
  size,
  color,
  ...props
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return <User className={className} {...props} />; // Fallback to User icon
  }

  const style = {
    ...(size && { width: size, height: size }),
    ...(color && { color }),
  };

  return (
    <IconComponent 
      className={className} 
      style={style}
      {...props} 
    />
  );
};

export default UniversalIcon;
