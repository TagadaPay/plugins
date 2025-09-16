import { useEffect } from "react";
import { useTagataConfig } from "./use-tagata-config";
import type { Theme } from "@/configuration/schema";

// Helper function to convert theme config to CSS variables
const applyCSSVariables = (theme: Theme) => {
  const root = document.documentElement;
  
  // Apply color variables
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value) {
        // Convert camelCase to kebab-case for CSS variables
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVarName}`, value);
      }
    });
  }
  
  // Apply spacing variables
  if (theme.spacing) {
    if (theme.spacing.sides) {
      root.style.setProperty('--sides', theme.spacing.sides);
    }
    if (theme.spacing.modalSides) {
      root.style.setProperty('--modal-sides', theme.spacing.modalSides);
    }
    if (theme.spacing.topSpacing) {
      root.style.setProperty('--top-spacing', theme.spacing.topSpacing);
    }
  }
  
  // Apply typography variables
  if (theme.typography) {
    if (theme.typography.fontFamily) {
      if (theme.typography.fontFamily.sans) {
        root.style.setProperty('--font-family-sans', theme.typography.fontFamily.sans);
      }
      if (theme.typography.fontFamily.mono) {
        root.style.setProperty('--font-family-mono', theme.typography.fontFamily.mono);
      }
    }
    
    if (theme.typography.fontSize) {
      Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
        if (value) {
          root.style.setProperty(`--text-${size}`, value);
        }
      });
    }
  }
  
  // Apply border radius
  if (theme.borderRadius) {
    root.style.setProperty('--radius', theme.borderRadius);
  }
};

export const useTheme = () => {
  const { theme } = useTagataConfig();
  
  // Apply theme variables to CSS when theme changes
  useEffect(() => {
    if (theme) {
      applyCSSVariables(theme);
    }
  }, [theme]);
  
  return {
    theme,
    applyCSSVariables: (customTheme: Theme) => applyCSSVariables(customTheme),
  };
};