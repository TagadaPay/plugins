import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-emerald-200 focus:dark:ring-emerald-700/30",
  // border color
  "focus:border-emerald-500 focus:dark:border-emerald-700",
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-emerald-500 dark:outline-emerald-500",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}
