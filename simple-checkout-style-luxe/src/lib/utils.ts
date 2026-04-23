import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getColorOpacityFromHex = (color: string, opacityPercentage: number) => {
  return `color-mix(in srgb, ${color} ${opacityPercentage}%, white)`
};

export const getColorOpacityFromCSSVar = (color: string, opacityPercentage: number) => {
  return `color-mix(in srgb, var(--${color}) ${opacityPercentage}%, var(--background-color))`
};

const FILTERED_CART_ATTRIBUTES = [
  '__kaching_bundles',
];

export function getLineItemProperties(
  item: any,
): { key: string; value: string }[] {
  const properties = item?.properties;
  if (!properties || typeof properties !== 'object') return [];
  return Object.entries(properties)
    .filter(([, value]) => value != null && String(value).trim() !== '')
    .map(([key, value]) => ({ key, value: String(value) }));
}

export function getCartCustomAttributes(
  metadata: { cartCustomAttributes?: { name?: string; value?: string }[] } | null | undefined,
): { name: string; value: string }[] {
  const attributes = metadata?.cartCustomAttributes;
  if (!Array.isArray(attributes)) return [];
  return attributes.filter(
    (attr): attr is { name: string; value: string } =>
      !!attr.name && !!attr.value && !FILTERED_CART_ATTRIBUTES.includes(String(attr.name)),
  );
}