import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import type { Theme } from '@/src/configuration/schema';

// Helper function to convert theme config to CSS variables (colors and fonts)
const applyCSSVariables = (theme: Theme) => {
  const root = document.documentElement;
  
  // Apply color variables
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        // Convert camelCase to kebab-case for CSS variables
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVarName}`, value);
      }
    });
  }

  // Apply font variables
  if (theme.fonts) {
    Object.entries(theme.fonts).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        root.style.setProperty(`--font-${key}`, value);
      }
    });
  }
};

interface ThemeContextType {
  theme: Theme | undefined;
  applyCSSVariables: (customTheme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, theme }) => {
  // Apply theme variables to CSS when theme changes
  useEffect(() => {
    if (theme) {
      applyCSSVariables(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, applyCSSVariables }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
