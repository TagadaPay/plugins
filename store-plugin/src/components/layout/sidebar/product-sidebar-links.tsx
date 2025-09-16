import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { useTagataConfig } from '@/hooks/use-tagata-config';

const linkVariants = cva('leading-tight transition-colors hover:underline ease-out duration-200 whitespace-nowrap', {
  variants: {
    invert: {
      true: 'text-background/50 hover:text-background',
      false: 'text-muted-foreground hover:text-foreground',
    },
    size: {
      sm: 'text-xs 2xl:text-sm',
      base: 'text-sm 2xl:text-base',
    },
  },
  defaultVariants: {
    invert: false,
    size: 'sm',
  },
});

interface SidebarLinksProps {
  className?: string;
  invert?: boolean;
  size?: 'sm' | 'base';
}

export function SidebarLinks({ className, invert, size }: SidebarLinksProps) {
  const { content } = useTagataConfig();
  const contactLinks = content.getContactLinks();

  return (
    <ul className={cn('flex flex-row gap-2 justify-between', className)}>
      {contactLinks.map(link => (
        <li key={link.href}>
          <a 
            href={link.href} 
            target={link.target || "_blank"} 
            className={linkVariants({ invert, size })}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
