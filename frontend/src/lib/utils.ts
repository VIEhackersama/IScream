import { type ClassValue, clsx } from "clsx";

/**
 * Utility to merge Tailwind classes safely.
 * Uses clsx for conditional class joining.
 * If you later add tailwind-merge, swap in `twMerge(clsx(inputs))`.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
